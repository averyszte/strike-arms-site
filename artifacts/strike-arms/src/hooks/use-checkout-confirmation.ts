import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearch } from 'wouter';

import { clearCheckoutAttemptId } from '@/data/checkout-attempt-repository';
import { fetchCheckoutStatus } from '@/data/checkout-status-repository';
import { useCart } from '@/hooks/use-cart';
import {
  CONFIRMATION_POLL_MS,
  confirmationState,
  shouldPollAgain,
  type ConfirmationState,
} from '@/lib/checkout-confirmation';

/**
 * The success page's view of its order: asks checkout-status every couple of
 * seconds until the webhook has confirmed the payment, then clears the cart
 * and the checkout attempt. Nothing is cleared before that, so a shopper
 * whose payment did not go through still has their basket.
 */
export function useCheckoutConfirmation(): {
  state: ConfirmationState;
  orderNumber: string | null;
} {
  const params = new URLSearchParams(useSearch());
  const orderId = params.get('order') ?? '';
  const sessionId = params.get('session') ?? '';
  const hasIds = orderId !== '' && sessionId !== '';
  const queryKey = ['checkout-status', orderId, sessionId];
  const queryClient = useQueryClient();
  const { clearCart } = useCart();

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCheckoutStatus(orderId, sessionId),
    enabled: hasIds,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: (q) =>
      shouldPollAgain(
        confirmationState(q.state.data, q.state.dataUpdateCount, q.state.status === 'error'),
      )
        ? CONFIRMATION_POLL_MS
        : false,
  });

  const polls = queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0;
  const state: ConfirmationState = hasIds
    ? confirmationState(query.data, polls, query.isError)
    : 'unconfirmed';

  useEffect(() => {
    if (state !== 'paid') return;
    clearCart();
    clearCheckoutAttemptId();
  }, [state, clearCart]);

  return { state, orderNumber: query.data?.orderNumber ?? null };
}
