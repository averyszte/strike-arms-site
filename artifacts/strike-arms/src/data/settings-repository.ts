import { supabase } from '@/lib/supabase';
import type { StoreRates } from '@/types/store-settings';

/**
 * Reads the single store_settings row.
 *
 * Deliberately has no fallback. If the rates cannot be read the cart shows
 * "calculated at checkout" rather than a guess — a hardcoded default here
 * would reintroduce exactly the cart-says-one-thing, Stripe-charges-another
 * bug that moving these numbers into the database was meant to remove.
 */
export async function fetchStoreRates(): Promise<StoreRates> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('shipping_flat_cents, free_shipping_threshold_cents, vat_rate_basis_points')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('store_settings row 1 is missing.');

  return {
    shippingFlatCents: data.shipping_flat_cents,
    freeShippingThresholdCents: data.free_shipping_threshold_cents,
    vatRateBasisPoints: data.vat_rate_basis_points,
  };
}
