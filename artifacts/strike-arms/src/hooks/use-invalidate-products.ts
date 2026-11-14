import { useQueryClient } from '@tanstack/react-query';

import { ADMIN_KEYS, CATALOGUE_ROOT_KEYS } from '@/lib/query-keys';

/**
 * Every product write refreshes the admin's product lists and every catalogue
 * prefix the storefront reads (A3-06), so the shop does not go on showing the
 * old product until its stale time runs out.
 */
export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.productsRoot });
    for (const queryKey of CATALOGUE_ROOT_KEYS) {
      void qc.invalidateQueries({ queryKey });
    }
  };
}
