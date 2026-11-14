import { useQuery } from '@tanstack/react-query';

import { getOrder } from '@/data/orders-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.order(id),
    queryFn: () => (id ? getOrder(id) : null),
    enabled: !!id,
  });
}
