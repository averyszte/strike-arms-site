import { useMutation } from '@tanstack/react-query';

import { setOrdersArchived } from '@/data/orders-repository';
import { useInvalidateOrders } from '@/hooks/use-invalidate-orders';

/**
 * Archives or restores a whole selection.
 *
 * Separate from useSetOrderArchived rather than a loop over it so the table
 * refreshes once at the end instead of flickering through twenty refetches.
 */
export function useBulkSetArchived() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderIds, isArchived }: { orderIds: string[]; isArchived: boolean }) =>
      setOrdersArchived(orderIds, isArchived),
    onSuccess: invalidate,
  });
}
