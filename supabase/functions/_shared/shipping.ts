/**
 * Shipping and VAT arithmetic for the Strike Arms store.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ DUPLICATED in artifacts/strike-arms/src/lib/shipping.ts.                 │
 * │ Deno cannot import from the Vite src/ tree, so this file exists twice.   │
 * │                                                                          │
 * │ It no longer holds any rates. Both copies read the numbers from the      │
 * │ store_settings row (migration 010), so the two sides can no longer       │
 * │ disagree about what to charge — only about how to divide, which is a     │
 * │ typecheck away from being caught rather than a billing bug the customer  │
 * │ finds first.                                                             │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * The rates that decide what a customer is charged. Mirrors StoreRates in
 * artifacts/strike-arms/src/types/store-settings.ts. Duplicating a type is
 * safe in a way duplicating a rate is not: a mismatch here is a compile error,
 * not a wrong number on an invoice.
 */
export type StoreRates = {
  shippingFlatCents: number;
  freeShippingThresholdCents: number;
  vatRateBasisPoints: number;
};

export type FulfillmentMethod = "pickup" | "delivery" | "mixed";

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
  if (hasPickupItems && hasDeliveryItems) return "mixed";
  if (hasDeliveryItems) return "delivery";
  return "pickup";
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

/**
 * Reads the single settings row. Throws rather than falling back to a default:
 * a hardcoded fallback here is exactly the drift this table was created to
 * remove, and failing a checkout loudly is better than charging a number
 * nobody chose.
 */
export async function fetchStoreRates(admin: SupabaseClient): Promise<StoreRates> {
  const { data, error } = await admin
    .from("store_settings")
    .select("shipping_flat_cents, free_shipping_threshold_cents, vat_rate_basis_points")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error(`Could not read store settings: ${error.message}`);
  if (!data) throw new Error("store_settings row 1 is missing; cannot price an order.");

  return {
    shippingFlatCents: data.shipping_flat_cents,
    freeShippingThresholdCents: data.free_shipping_threshold_cents,
    vatRateBasisPoints: data.vat_rate_basis_points,
  };
}
