import {
  calculateShippingCents,
  deriveFulfillmentMethod,
  vatIncludedCents,
} from '@/lib/shipping';
import type { CounterOrderLine, FulfillmentMethod } from '@/types/order';
import type { Product } from '@/types/product';
import type { StoreRates } from '@/types/store-settings';

/**
 * What a counter sale is going to cost, worked out in the browser.
 *
 * Every number here is a preview. create_counter_order recomputes all of them
 * from the products table and store_settings before anything is written, using
 * the same rules — so this can be briefly stale, but it can never be what the
 * customer is charged. Its job is to let Alan read a total out loud before he
 * commits the sale, and to refuse a line the database would refuse anyway.
 */

export type ResolvedCounterLine = CounterOrderLine & {
  product: Product;
  unitPriceCents: number;
  subtotalCents: number;
  /** The rejection this line would earn from the database, or null. */
  problem: string | null;
};

export type CounterOrderTotals = {
  itemsSubtotalCents: number;
  deliverableSubtotalCents: number;
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  fulfillmentMethod: FulfillmentMethod;
  hasDeliveryLines: boolean;
  /** False while the rates are loading, so shipping and VAT are not yet known. */
  isPriced: boolean;
};

/** The sale price when there is one and it is genuinely lower. Mirrors pricedLine(). */
export function counterUnitPriceCents(product: Product): number {
  const sale = product.salePrice;
  return sale != null && sale < product.price ? sale : product.price;
}

/**
 * What can still be sold. Stock held by a checkout in flight has already been
 * promised to somebody, so counting it here would let the counter sell it a
 * second time.
 */
export function availableStock(product: Product): number {
  return (product.stockCount ?? 0) - (product.reservedCount ?? 0);
}

function lineProblem(product: Product, line: CounterOrderLine): string | null {
  if (line.fulfillmentMethod === 'delivery' && !product.isShippable) {
    return 'Collection only — cannot be posted.';
  }

  const available = availableStock(product);
  if (line.quantity > available) {
    return available > 0 ? `Only ${available} available.` : 'None available.';
  }

  return null;
}

/**
 * Joins the draft lines to the catalogue.
 *
 * A line whose product has gone is dropped rather than rendered blank. This
 * list is both what the sheet displays and what it submits, so a product
 * deleted while the sheet was open cannot be shown at one price and sold at
 * another.
 */
export function resolveCounterLines(
  lines: CounterOrderLine[],
  products: Product[],
): ResolvedCounterLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));

  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return [];

    const unitPriceCents = counterUnitPriceCents(product);

    return [
      {
        ...line,
        product,
        unitPriceCents,
        subtotalCents: unitPriceCents * line.quantity,
        problem: lineProblem(product, line),
      },
    ];
  });
}

export function calculateCounterTotals(
  lines: ResolvedCounterLine[],
  rates: StoreRates | undefined,
): CounterOrderTotals {
  const itemsSubtotalCents = lines.reduce((sum, line) => sum + line.subtotalCents, 0);

  // Delivery is per line here, not a basket-wide toggle as it is in the cart:
  // the admin says which items are being posted and which are walking out of
  // the shop. Shipping is still charged once, on the posted lines only.
  const deliverable = lines.filter((line) => line.fulfillmentMethod === 'delivery');
  const deliverableSubtotalCents = deliverable.reduce((sum, line) => sum + line.subtotalCents, 0);
  const hasDeliveryLines = deliverable.length > 0;
  const hasPickupLines = lines.some((line) => line.fulfillmentMethod === 'pickup');

  // No rates, no shipping figure. Inventing one is exactly what moving these
  // numbers into the database was meant to stop, so the sheet says the rest is
  // worked out on save rather than showing a plausible wrong total.
  const shippingCents = rates ? calculateShippingCents(deliverableSubtotalCents, rates) : 0;
  const totalCents = itemsSubtotalCents + shippingCents;

  return {
    itemsSubtotalCents,
    deliverableSubtotalCents,
    shippingCents,
    totalCents,
    vatCents: rates ? vatIncludedCents(totalCents, rates) : 0,
    fulfillmentMethod: deriveFulfillmentMethod(hasPickupLines, hasDeliveryLines),
    hasDeliveryLines,
    isPriced: rates != null,
  };
}
