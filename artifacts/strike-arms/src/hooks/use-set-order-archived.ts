import { useMutation } from '@tanstack/react-query';

import { setOrderArchived } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';

/**
 * Archives an order or brings it back.
 *
 * Invalidates the whole orders key rather than one view: the row has to leave
 * the list it is in and appear in the other one, and the dashboard counts it
 * either way.
 */
export function useSetOrderArchived() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, isArchived }: { orderId: string; isArchived: boolean }) =>
      setOrderArchived(orderId, isArchived),
    onSuccess: invalidate,
  });
}
