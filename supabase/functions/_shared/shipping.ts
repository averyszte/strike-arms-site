/**
 * Shipping and VAT rules for the Strike Arms store.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ DUPLICATED in artifacts/strike-arms/src/lib/shipping.ts.                 │
 * │ Deno cannot import from the Vite src/ tree, so this file exists twice.   │
 * │ CHANGE BOTH COPIES IN THE SAME COMMIT. If they drift, the price quoted   │
 * │ in the cart stops matching the amount charged by Stripe, which is a      │
 * │ billing bug the customer sees before we do.                             │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/**
 * PLACEHOLDER RATES — not yet confirmed by Alan.
 * The checkout cannot function without a number, so these are deliberate,
 * visible defaults rather than a guess buried in a component. Confirm the
 * courier rate and the free-delivery threshold before the store goes live,
 * and update both copies of this file.
 */
export const SHIPPING_FLAT_CENTS = 650;
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

/**
 * Irish standard-rate VAT, in basis points. Displayed prices are VAT
 * inclusive, which is what Irish consumers expect and what the store shows,
 * so this rate extracts the VAT already contained in a gross amount rather
 * than adding to it. Confirm the applicable rate with the client's accountant.
 */
export const VAT_RATE_BASIS_POINTS = 2300;

export type FulfillmentMethod = 'pickup' | 'delivery' | 'mixed';

/**
 * Delivery is charged once per order, on the value of the shippable lines
 * only — a rifle sitting in the same basket is collected in store and must
 * not push the order over the free-delivery threshold.
 */
export function calculateShippingCents(deliverableSubtotalCents: number): number {
  if (deliverableSubtotalCents <= 0) return 0;
  if (deliverableSubtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return SHIPPING_FLAT_CENTS;
}

/**
 * An order is mixed when it contains both something that may be posted and
 * something that may only be collected. Guns are collect-only, so a basket
 * with a rifle and a bag of BBs is a genuinely mixed order, not a delivery.
 */
export function deriveFulfillmentMethod(
  hasPickupItems: boolean,
  hasDeliveryItems: boolean,
): FulfillmentMethod {
  if (hasPickupItems && hasDeliveryItems) return 'mixed';
  if (hasDeliveryItems) return 'delivery';
  return 'pickup';
}

/** The VAT already contained in a VAT-inclusive gross amount, in cents. */
export function vatIncludedCents(grossCents: number): number {
  const rate = VAT_RATE_BASIS_POINTS;
  return Math.round((grossCents * rate) / (10_000 + rate));
}
