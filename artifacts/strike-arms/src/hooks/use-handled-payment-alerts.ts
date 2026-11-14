import { useQuery } from '@tanstack/react-query';

import { listHandledPaymentAlerts } from '@/data/payment-alerts-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useHandledPaymentAlerts(isEnabled: boolean) {
  return useQuery({
    queryKey: ADMIN_KEYS.paymentAlerts('handled'),
    queryFn: listHandledPaymentAlerts,
    enabled: isEnabled,
  });
}
