import { useQuery } from '@tanstack/react-query';

import { listAllProducts } from '@/data/admin-products-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

/**
 * The whole catalogue, archived included. `enabled` lets a dialog ask for it
 * only once it is open, rather than every visit to the products page paying
 * for a read of everything.
 */
export function useAdminProducts({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ADMIN_KEYS.productsAll,
    queryFn: listAllProducts,
    enabled,
  });
}
