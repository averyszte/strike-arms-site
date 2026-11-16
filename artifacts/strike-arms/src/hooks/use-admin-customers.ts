import { useQuery } from '@tanstack/react-query';

import { listCustomers } from '@/data/admin-customers-repository';
import { ADMIN_KEYS, STALE_TIME_FIVE_MINUTES } from '@/lib/query-keys';

/**
 * Every customer in one read. Unlike the other admin lists it does not
 * refetch on every tab switch: the read scans every account, and nothing on
 * this page changes from minute to minute. Order writes invalidate it
 * (use-invalidate-orders.ts), and the Refresh button reloads it on demand.
 */
export function useAdminCustomers() {
  return useQuery({
    queryKey: ADMIN_KEYS.customers,
    queryFn: listCustomers,
    staleTime: STALE_TIME_FIVE_MINUTES,
    refetchOnWindowFocus: false,
  });
}
