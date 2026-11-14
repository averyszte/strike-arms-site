import { supabase } from '@/data/supabase-client';
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

/**
 * Writes the single store_settings row.
 *
 * The update policy is `is_admin_aal2()`, so a session that has not passed
 * TOTP matches no row and PostgREST returns success with nothing updated --
 * the admin would watch a "Saved" toast while the rates stayed exactly as they
 * were. Reading the row back is what turns that silence into an error. The
 * read is safe: the select policy on this table is `using (true)`.
 */
export async function updateStoreRates(rates: StoreRates): Promise<StoreRates> {
  const { data, error } = await supabase
    .from('store_settings')
    .update({
      shipping_flat_cents: rates.shippingFlatCents,
      free_shipping_threshold_cents: rates.freeShippingThresholdCents,
      vat_rate_basis_points: rates.vatRateBasisPoints,
    })
    .eq('id', 1)
    .select('shipping_flat_cents, free_shipping_threshold_cents, vat_rate_basis_points')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      'The rates were not saved. Updating them needs an admin session that has ' +
        'passed two-factor verification.',
    );
  }

  return {
    shippingFlatCents: data.shipping_flat_cents,
    freeShippingThresholdCents: data.free_shipping_threshold_cents,
    vatRateBasisPoints: data.vat_rate_basis_points,
  };
}

export type StoreRatesChange = {
  id: number;
  changedAt: string;
  before: StoreRates;
  after: StoreRates;
};

/**
 * The last rate changes, newest first (043 writes them by trigger). The
 * select policy is AAL2 admin, so an aal1 session reads an empty list.
 */
export async function fetchStoreRatesHistory(limit = 20): Promise<StoreRatesChange[]> {
  const { data, error } = await supabase
    .from('store_settings_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id,
    changedAt: row.changed_at,
    before: {
      shippingFlatCents: row.old_shipping_flat_cents,
      freeShippingThresholdCents: row.old_free_shipping_threshold_cents,
      vatRateBasisPoints: row.old_vat_rate_basis_points,
    },
    after: {
      shippingFlatCents: row.new_shipping_flat_cents,
      freeShippingThresholdCents: row.new_free_shipping_threshold_cents,
      vatRateBasisPoints: row.new_vat_rate_basis_points,
    },
  }));
}
