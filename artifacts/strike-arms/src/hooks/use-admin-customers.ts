import { useQuery } from '@tanstack/react-query';

import { listCustomers } from '@/data/admin-customers-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useAdminCustomers() {
  return useQuery({
    queryKey: ADMIN_KEYS.customers,
    queryFn: listCustomers,
  });
}
