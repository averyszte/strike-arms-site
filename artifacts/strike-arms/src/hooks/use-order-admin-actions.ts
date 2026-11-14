import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  previewStatusEmails,
  recordManualRefund,
  voidCounterOrder,
} from '@/data/order-admin-actions-repository';
import type { FulfillmentStatus } from '@/types/order';

function useInvalidateOrders() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
    qc.invalidateQueries({ queryKey: ['admin', 'order'] });
  };
}

export function useRecordManualRefund() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, amountCents, note }: { orderId: string; amountCents: number; note: string }) =>
      recordManualRefund(orderId, amountCents, note),
    onSuccess: invalidate,
  });
}

export function useVoidCounterOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      voidCounterOrder(orderId, reason),
    onSuccess: invalidate,
  });
}

/** Asked only while the bulk confirm is open. */
export function useStatusEmailPreview(orderIds: string[], status: FulfillmentStatus | null) {
  return useQuery({
    queryKey: ['admin', 'status-email-preview', status, orderIds],
    queryFn: () => previewStatusEmails(orderIds, status as FulfillmentStatus),
    enabled: status !== null && orderIds.length > 0,
  });
}
