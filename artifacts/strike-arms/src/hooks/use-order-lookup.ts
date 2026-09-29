import { useMutation } from '@tanstack/react-query';

import { lookUpOrder } from '@/data/order-lookup-repository';
import type { OrderLookupInput } from '@/types/order-lookup';

/**
 * A mutation rather than a query: a lookup happens when the form is sent,
 * and the email in it should not sit in the query cache as a key.
 */
export function useOrderLookup() {
  return useMutation({
    mutationFn: (input: OrderLookupInput) => lookUpOrder(input),
  });
}
