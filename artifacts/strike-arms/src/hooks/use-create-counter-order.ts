import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCounterOrder } from '@/data/orders-repository';
import type { CounterOrderInput } from '@/types/order';

/**
 * Rings up a counter or phone sale.
 *
 * The sale takes stock the moment it succeeds, so the catalogue caches are
 * invalidated alongside the orders list. Without that, the next line the admin
 * adds is priced and stock-checked against a count the sale has already spent.
 */
export function useCreateCounterOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CounterOrderInput) => createCounterOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
