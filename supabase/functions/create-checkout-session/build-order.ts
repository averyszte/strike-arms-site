import type Stripe from "npm:stripe@17.3.1";
import type { PricedBasket } from "./order-lines.ts";
import type { CheckoutRequest } from "./parse-request.ts";

/**
 * Shapes the two records built from a priced basket: the order row we store,
 * and the Stripe line items we charge. Both are derived from the same
 * PricedBasket, so the stored total and the charged total cannot disagree.
 */

/**
 * A delivery address is stored only on an order that is actually being
 * delivered. A basket of collect-only guns is a pickup order even if the
 * shopper filled in the address form, and the schema rejects shipping data on
 * a pickup order.
 */
export function buildOrderInsert(request: CheckoutRequest, basket: PricedBasket) {
  const isDelivered = basket.fulfillmentMethod !== "pickup";
  const address = isDelivered ? request.shipping : null;

  return {
    customer_name: request.customerName,
    customer_email: request.customerEmail,
    customer_phone: request.customerPhone,
    payment_status: "pending" as const,
    fulfillment_status: "pending" as const,
    fulfillment_method: basket.fulfillmentMethod,
    total_cents: basket.totalCents,
    vat_cents: basket.vatCents,
    shipping_cents: isDelivered ? basket.shippingCents : 0,
    shipping_name: address?.name ?? null,
    shipping_line1: address?.line1 ?? null,
    shipping_line2: address?.line2 ?? null,
    shipping_city: address?.city ?? null,
    shipping_county: address?.county ?? null,
    shipping_eircode: address?.eircode ?? null,
    age_verified: request.ageConfirmed,
    checkout_attempt_id: request.attemptId,
  };
}

/**
 * Dynamic price_data rather than pre-made Stripe Price objects, so the
 * catalogue stays the single source of truth for what things cost.
 */
export function buildStripeLineItems(
  basket: PricedBasket,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = basket.lines.map(
    (line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "eur",
        unit_amount: line.unitPriceCents,
        product_data: {
          name: line.productName,
          description: line.fulfillmentMethod === "pickup"
            ? "Collect in store"
            : "Delivered",
        },
      },
    }),
  );

  if (basket.shippingCents > 0) {
    items.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: basket.shippingCents,
        product_data: { name: "Delivery" },
      },
    });
  }

  return items;
}
