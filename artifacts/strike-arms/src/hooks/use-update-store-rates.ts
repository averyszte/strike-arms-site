import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateStoreRates } from '@/data/settings-repository';
import { ADMIN_KEYS, CART_KEYS } from '@/lib/query-keys';
import type { StoreRates } from '@/types/store-settings';

/**
 * Saving a rate has to reach the cart immediately, so the useStoreRates cache
 * is replaced with the row that came back rather than merely invalidated -- an
 * admin who saves and then looks at the shop should not see the old price for
 * the next ten minutes.
 */
export function useUpdateStoreRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rates: StoreRates) => updateStoreRates(rates),
    onSuccess: (saved) => {
      qc.setQueryData(CART_KEYS.storeRates, saved);
      void qc.invalidateQueries({ queryKey: ADMIN_KEYS.storeRatesHistory });
    },
  });
}
