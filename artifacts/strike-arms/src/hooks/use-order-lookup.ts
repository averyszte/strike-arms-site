import { useMutation } from '@tanstack/react-query';

import { lookUpOrder, OrderLookupError } from '@/data/order-lookup-repository';
import type { OrderLookupInput } from '@/types/order-lookup';

/**
 * A mutation rather than a query: a lookup happens when the form is sent,
 * and the email in it should not sit in the query cache as a key.
 */
export function useOrderLookup() {
  const mutation = useMutation({
    mutationFn: (input: OrderLookupInput) => lookUpOrder(input),
  });

  const { error } = mutation;
  const errorMessage =
    error instanceof OrderLookupError && error.message
      ? error.message
      : 'Something went wrong looking up your order. Check your connection and try again.';

  return { ...mutation, errorMessage };
}
