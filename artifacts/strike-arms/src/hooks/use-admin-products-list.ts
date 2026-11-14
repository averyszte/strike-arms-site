import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listProducts } from '@/data/admin-products-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';
import type { AdminProductListFilters } from '@/types/product';

/** One page of the products list, filtered on the server. */
export function useAdminProductsList(filters: AdminProductListFilters) {
  return useQuery({
    queryKey: ADMIN_KEYS.productsList(filters),
    queryFn: () => listProducts(filters),
    // Keeps the current page on screen while the next one or a new search
    // loads, instead of dropping to a spinner on every keystroke.
    placeholderData: keepPreviousData,
  });
}
