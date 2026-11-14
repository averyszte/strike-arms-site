import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listHandledPaymentAlerts,
  listOpenPaymentAlerts,
  setPaymentAlertResolved,
} from '@/data/payment-alerts-repository';

const PAYMENT_ALERTS_KEY = ['admin', 'payment-alerts'] as const;

export function useOpenPaymentAlerts() {
  return useQuery({
    queryKey: [...PAYMENT_ALERTS_KEY, 'open'],
    queryFn: listOpenPaymentAlerts,
  });
}

export function useHandledPaymentAlerts(isEnabled: boolean) {
  return useQuery({
    queryKey: [...PAYMENT_ALERTS_KEY, 'handled'],
    queryFn: listHandledPaymentAlerts,
    enabled: isEnabled,
  });
}

/** Mark handled, or open again for the undo toast. */
export function useSetPaymentAlertResolved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      setPaymentAlertResolved(id, isResolved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_ALERTS_KEY });
    },
  });
}
