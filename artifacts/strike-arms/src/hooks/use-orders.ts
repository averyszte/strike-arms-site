import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listOrders } from '@/data/orders-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';
import type { OrderListFilters } from '@/types/order';

export function useOrders(filters: OrderListFilters = {}) {
  return useQuery({
    queryKey: ADMIN_KEYS.orders(filters),
    queryFn: () => listOrders(filters),
    // Keeps the current page on screen while the next one or a new search
    // loads, instead of dropping to a spinner on every click.
    placeholderData: keepPreviousData,
  });
}
