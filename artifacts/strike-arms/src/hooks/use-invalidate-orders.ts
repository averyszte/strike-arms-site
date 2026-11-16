import { useQueryClient } from '@tanstack/react-query';

import { ADMIN_KEYS } from '@/lib/query-keys';

/**
 * Every order write refreshes the order lists, any open order sheet and the
 * Customers page totals (a refund changes what a customer has spent).
 */
export function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.ordersRoot });
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.orderRoot });
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.customers });
  };
}
