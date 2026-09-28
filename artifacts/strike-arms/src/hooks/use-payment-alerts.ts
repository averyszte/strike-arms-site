import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listOpenPaymentAlerts, resolvePaymentAlert } from '@/data/payment-alerts-repository';

const PAYMENT_ALERTS_KEY = ['admin', 'payment-alerts'] as const;

export function useOpenPaymentAlerts() {
  return useQuery({
    queryKey: PAYMENT_ALERTS_KEY,
    queryFn: listOpenPaymentAlerts,
  });
}

export function useResolvePaymentAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolvePaymentAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PAYMENT_ALERTS_KEY });
    },
  });
}
