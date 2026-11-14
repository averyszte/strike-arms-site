import { useQueryClient } from '@tanstack/react-query';

import { ADMIN_KEYS } from '@/lib/query-keys';

/** Every order write refreshes the order lists and any open order sheet. */
export function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.ordersRoot });
    void qc.invalidateQueries({ queryKey: ADMIN_KEYS.orderRoot });
  };
}
