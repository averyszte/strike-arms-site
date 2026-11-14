import { useQuery } from '@tanstack/react-query';

import { listOpenPaymentAlerts } from '@/data/payment-alerts-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useOpenPaymentAlerts() {
  return useQuery({
    queryKey: ADMIN_KEYS.paymentAlerts('open'),
    queryFn: listOpenPaymentAlerts,
  });
}
