import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchStoreRates, updateStoreRates } from '@/data/settings-repository';
import type { StoreRates } from '@/types/store-settings';

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

/**
 * Saving a rate has to reach the cart immediately, so the hard cache above is
 * replaced with the row that came back rather than merely invalidated -- an
 * admin who saves and then looks at the shop should not see the old price for
 * the next ten minutes.
 */
export function useUpdateStoreRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rates: StoreRates) => updateStoreRates(rates),
    onSuccess: (saved) => qc.setQueryData(['store-rates'], saved),
  });
}
