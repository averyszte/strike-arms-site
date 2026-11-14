import { useQuery } from '@tanstack/react-query';

import { previewStatusEmails } from '@/data/order-admin-actions-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';
import type { FulfillmentStatus } from '@/types/order';

/** Asked only while the bulk confirm is open. */
export function useStatusEmailPreview(orderIds: string[], status: FulfillmentStatus | null) {
  return useQuery({
    queryKey: ADMIN_KEYS.statusEmailPreview(status, orderIds),
    queryFn: () => previewStatusEmails(orderIds, status as FulfillmentStatus),
    enabled: status !== null && orderIds.length > 0,
  });
}
