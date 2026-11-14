import { useQuery } from '@tanstack/react-query';

import { fetchStoreRates } from '@/data/settings-repository';
import { CART_KEYS, GC_TIME_ONE_HOUR, STALE_TIME_ONE_MINUTE } from '@/lib/query-keys';

/**
 * Delivery and VAT rates, read from the database.
 *
 * Cached for a minute: they change rarely, and every cart render would
 * otherwise hit the network, but a change should reach shoppers quickly. The checkout function
 * re-reads the same row server-side before charging anything, so a stale cache
 * can only make the preview briefly wrong, never the amount charged.
 */
export function useStoreRates() {
  return useQuery({
    queryKey: CART_KEYS.storeRates,
    queryFn: fetchStoreRates,
    staleTime: STALE_TIME_ONE_MINUTE,
    gcTime: GC_TIME_ONE_HOUR,
  });
}
