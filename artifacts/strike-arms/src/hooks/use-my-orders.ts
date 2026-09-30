import { useQuery } from '@tanstack/react-query';

import { claimGuestOrders, fetchMyOrders } from '@/data/customer-account-repository';
import { CUSTOMER_QUERY_ROOT } from '@/hooks/use-customer-session';

/**
 * The signed-in customer's orders. Guest orders placed with the same email
 * are claimed first, so an order placed before the account existed shows up
 * the first time they sign in.
 */
export function useMyOrders(userId: string | null) {
  return useQuery({
    queryKey: [CUSTOMER_QUERY_ROOT, 'orders', userId],
    enabled: userId !== null,
    queryFn: async () => {
      await claimGuestOrders();
      return fetchMyOrders();
    },
  });
}
