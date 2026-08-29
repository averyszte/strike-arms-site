import { useQuery } from '@tanstack/react-query';

import { fetchStoreRates } from '@/data/settings-repository';

/**
 * Delivery and VAT rates, read from the database.
 *
 * Cached hard: these change when Alan changes them, which is roughly never,
 * and every cart render would otherwise hit the network. The checkout function
 * re-reads the same row server-side before charging anything, so a stale cache
 * can only make the preview briefly wrong, never the amount charged.
 */
export function useStoreRates() {
  return useQuery({
    queryKey: ['store-rates'],
    queryFn: fetchStoreRates,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
