import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  calculateShippingCents,
  deriveFulfillmentMethod,
  fetchStoreRates,
  type FulfillmentMethod,
  vatIncludedCents,
} from "../_shared/shipping.ts";
import { CheckoutRequestError, type CheckoutLine } from "./parse-request.ts";

/**
 * Turns the basket the browser sent into priced order lines.
 *
 * Every price, every name and every shippability decision comes from the
 * database here. The request supplied only product ids and quantities, so the
 * amount Stripe charges is provably the amount this function calculated.
 */

export type PricedLine = {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string | null;
  brand: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  fulfillmentMethod: "pickup" | "delivery";
};

export type PricedBasket = {
  lines: PricedLine[];
  itemsSubtotalCents: number;
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  fulfillmentMethod: FulfillmentMethod;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  images: string[];
  price_cents: number;
  sale_price_cents: number | null;
  is_published: boolean;
  is_shippable: boolean;
};

const PRODUCT_COLUMNS =
  "id, slug, name, brand, images, price_cents, sale_price_cents, is_published, is_shippable";

/** Sale price when one is set, otherwise the list price. Always cents. */
function effectivePriceCents(product: ProductRow): number {
  const sale = product.sale_price_cents;
  return sale !== null && sale < product.price_cents ? sale : product.price_cents;
}

export async function priceBasket(
  admin: SupabaseClient,
  lines: CheckoutLine[],
  wantsDelivery: boolean,
): Promise<PricedBasket> {
  const ids = [...new Set(lines.map((line) => line.productId))];

  // The same row the browser priced the cart from, re-read here. This is the
  // only copy of these numbers that decides what Stripe charges.
  const rates = await fetchStoreRates(admin);

  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", ids);

  if (error) throw new Error(`Could not read products: ${error.message}`);

  const byId = new Map<string, ProductRow>(
    (data as ProductRow[]).map((row) => [row.id, row]),
  );

  const priced: PricedLine[] = lines.map((line) => {
    const product = byId.get(line.productId);

    // An unpublished or deleted product reaching here means the basket is
    // stale, which the shopper can fix — so say which item is the problem.
    if (!product || !product.is_published) {
      throw new CheckoutRequestError(
        "One of the items in your basket is no longer available. " +
          "Please remove it and try again.",
      );
    }

    const unitPriceCents = effectivePriceCents(product);

    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.images[0] ?? null,
      brand: product.brand,
      unitPriceCents,
      quantity: line.quantity,
      subtotalCents: unitPriceCents * line.quantity,
      // Guns are collect-in-store only, so a product that is not shippable
      // stays a pickup line even when the shopper asked for delivery.
      fulfillmentMethod: wantsDelivery && product.is_shippable ? "delivery" : "pickup",
    };
  });

  const itemsSubtotalCents = priced.reduce((sum, line) => sum + line.subtotalCents, 0);

  const deliverableSubtotalCents = priced
    .filter((line) => line.fulfillmentMethod === "delivery")
    .reduce((sum, line) => sum + line.subtotalCents, 0);

  const hasDeliveryItems = priced.some((line) => line.fulfillmentMethod === "delivery");
  const hasPickupItems = priced.some((line) => line.fulfillmentMethod === "pickup");

  const shippingCents = hasDeliveryItems
    ? calculateShippingCents(deliverableSubtotalCents, rates)
    : 0;

  const totalCents = itemsSubtotalCents + shippingCents;

  return {
    lines: priced,
    itemsSubtotalCents,
    shippingCents,
    totalCents,
    vatCents: vatIncludedCents(totalCents, rates),
    fulfillmentMethod: deriveFulfillmentMethod(hasPickupItems, hasDeliveryItems),
  };
}
