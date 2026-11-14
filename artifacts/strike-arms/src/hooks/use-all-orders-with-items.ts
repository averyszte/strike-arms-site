import { useQuery } from '@tanstack/react-query';

import { listAllOrdersWithItems } from '@/data/orders-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useAllOrdersWithItems() {
  return useQuery({
    queryKey: ADMIN_KEYS.ordersWithItems,
    queryFn: listAllOrdersWithItems,
  });
}
