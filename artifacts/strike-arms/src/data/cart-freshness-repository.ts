import { supabase } from '@/lib/supabase';
import type { FreshCartDetails } from '@/types/cart-freshness';

/**
 * The current price and postability of the products in a basket.
 *
 * A basket lives in localStorage for as long as the shopper likes, so what it
 * remembers can be days out of date. A product missing from the result is no
 * longer for sale (unpublished or archived); the published filter is explicit
 * for the same reason as in products-repository.ts.
 */
export async function fetchFreshCartDetails(
  productIds: string[],
): Promise<Map<string, FreshCartDetails>> {
  const fresh = new Map<string, FreshCartDetails>();
  if (productIds.length === 0) return fresh;

  const { data, error } = await supabase
    .from('products')
    .select('id, name, effective_price_cents, is_shippable')
    .in('id', productIds)
    .eq('is_published', true);

  if (error) throw error;

  for (const row of data ?? []) {
    fresh.set(row.id, {
      productId: row.id,
      name: row.name,
      unitPriceCents: row.effective_price_cents,
      isShippable: row.is_shippable,
    });
  }
  return fresh;
}
