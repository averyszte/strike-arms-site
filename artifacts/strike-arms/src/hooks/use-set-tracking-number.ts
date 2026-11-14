import { useMutation } from '@tanstack/react-query';

import { setOrderTrackingNumber } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';

export function useSetTrackingNumber() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, trackingNumber }: { orderId: string; trackingNumber: string | null }) =>
      setOrderTrackingNumber(orderId, trackingNumber),
    onSuccess: invalidate,
  });
}
