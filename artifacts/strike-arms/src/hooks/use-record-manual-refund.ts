import { useMutation } from '@tanstack/react-query';

import { recordManualRefund } from '@/data/order-admin-actions-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';

export function useRecordManualRefund() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, amountCents, note }: { orderId: string; amountCents: number; note: string }) =>
      recordManualRefund(orderId, amountCents, note),
    onSuccess: invalidate,
  });
}
