import { useMutation } from '@tanstack/react-query';

import { updateOrdersFulfillment } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';
import type { FulfillmentStatus } from '@/types/order';

export function useBulkFulfillmentStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: FulfillmentStatus }) =>
      updateOrdersFulfillment(orderIds, status),
    onSuccess: invalidate,
  });
}
