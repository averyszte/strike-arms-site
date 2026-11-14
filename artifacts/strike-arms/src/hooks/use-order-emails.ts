import { useQuery } from '@tanstack/react-query';

import { listOrderEmails } from '@/data/order-emails-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

export function useOrderEmails(orderId: string | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.orderEmails(orderId),
    queryFn: () => listOrderEmails(orderId as string),
    enabled: orderId !== null,
  });
}
