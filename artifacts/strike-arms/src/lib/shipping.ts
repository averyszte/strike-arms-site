/**
 * Shipping and VAT arithmetic for the Strike Arms store.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ DUPLICATED in supabase/functions/_shared/shipping.ts.                    │
 * │ Deno cannot import from the Vite src/ tree, so this file exists twice.   │
 * │                                                                          │
 * │ It no longer holds any rates. Both copies read the numbers from the      │
 * │ store_settings row (migration 010), so the two sides can no longer       │
 * │ disagree about what to charge — only about how to divide, which is a     │
 * │ typecheck away from being caught rather than a billing bug the customer  │
 * │ finds first.                                                             │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import type { StoreRates } from '@/types/store-settings';

export type FulfillmentMethod = 'pickup' | 'delivery' | 'mixed';

/**
 * Delivery is charged once per order, on the value of the shippable lines
 * only — a rifle sitting in the same basket is collected in store and must
 * not push the order over the free-delivery threshold.
 */
export function calculateShippingCents(
  deliverableSubtotalCents: number,
  rates: StoreRates,
): number {
  if (deliverableSubtotalCents <= 0) return 0;
  if (deliverableSubtotalCents >= rates.freeShippingThresholdCents) return 0;
  return rates.shippingFlatCents;
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

/**
 * The VAT already contained in a VAT-inclusive gross amount, in cents.
 * Displayed prices are gross, which is what Irish consumers expect, so this
 * extracts rather than adds.
 */
export function vatIncludedCents(grossCents: number, rates: StoreRates): number {
  const rate = rates.vatRateBasisPoints;
  return Math.round((grossCents * rate) / (10_000 + rate));
}
