import { useMutation } from '@tanstack/react-query';

import { voidCounterOrder } from '@/data/order-admin-actions-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';

export function useVoidCounterOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      voidCounterOrder(orderId, reason),
    onSuccess: invalidate,
  });
}
