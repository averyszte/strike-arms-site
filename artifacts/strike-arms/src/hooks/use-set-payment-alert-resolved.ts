import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setPaymentAlertResolved } from '@/data/payment-alerts-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

/** Mark handled, or open again for the undo toast. */
export function useSetPaymentAlertResolved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      setPaymentAlertResolved(id, isResolved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.paymentAlertsRoot });
    },
  });
}
