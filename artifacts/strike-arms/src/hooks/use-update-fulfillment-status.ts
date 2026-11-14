import { useMutation } from '@tanstack/react-query';

import { updateOrderFulfillment } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';
import type { FulfillmentStatus } from '@/types/order';

export function useUpdateFulfillmentStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: FulfillmentStatus }) =>
      updateOrderFulfillment(orderId, status),
    onSuccess: invalidate,
  });
}
