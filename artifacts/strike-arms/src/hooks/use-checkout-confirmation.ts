import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearch } from 'wouter';

import { clearCheckoutAttemptId } from '@/data/checkout-attempt-repository';
import { clearCheckoutDraft } from '@/data/checkout-draft-repository';
import { fetchCheckoutStatus } from '@/data/checkout-status-repository';
import { sendEcommerceEvent } from '@/data/google-tag-manager-client';
import { useCart } from '@/hooks/use-cart';
import { buildEcommercePayload } from '@/lib/analytics-ecommerce';
import {
  confirmationState,
  nextPollDelay,
  type ConfirmationState,
} from '@/lib/checkout-confirmation';
import { CHECKOUT_KEYS } from '@/lib/query-keys';

/**
 * The success page's view of its order: asks checkout-status every couple of
 * seconds until the webhook has confirmed the payment, then more slowly while
 * it is "delayed", and clears the cart and the checkout attempt only once the
 * payment is confirmed. A shopper whose payment did not go through still has
 * their basket, and one whose webhook is late is never told to pay again.
 */
export function useCheckoutConfirmation(): {
  state: ConfirmationState;
  orderNumber: string | null;
  checkAgain: () => void;
  isChecking: boolean;
} {
  const params = new URLSearchParams(useSearch());
  const orderId = params.get('order') ?? '';
  const sessionId = params.get('session') ?? '';
  const hasIds = orderId !== '' && sessionId !== '';
  const queryKey = CHECKOUT_KEYS.status(orderId, sessionId);
  const queryClient = useQueryClient();
  const { lines, clearCart } = useCart();
  // Read inside the paid effect without re-running it when clearCart empties the basket.
  const linesRef = useRef(lines);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCheckoutStatus(orderId, sessionId),
    enabled: hasIds,
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchInterval: (q) =>
      nextPollDelay(
        confirmationState(q.state.data, q.state.dataUpdateCount, q.state.status === 'error'),
        q.state.dataUpdateCount + q.state.errorUpdateCount,
      ),
  });

  const polls = queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0;
  const state: ConfirmationState = hasIds
    ? confirmationState(query.data, polls, query.isError)
    : 'unconfirmed';

  const transactionId = query.data?.orderNumber ?? orderId;
  useEffect(() => {
    if (state !== 'paid') return;
    // The basket survives the trip to Stripe, so it is what was bought. It is
    // cleared just below, so a reload of this page sends no second purchase.
    if (linesRef.current.length > 0) {
      sendEcommerceEvent('purchase', buildEcommercePayload(linesRef.current, transactionId));
    }
    clearCart();
    clearCheckoutAttemptId();
    // The saved name, email and address go with the order (N-054), so the
    // next basket on a shared device does not open pre-filled.
    clearCheckoutDraft();
  }, [state, clearCart, transactionId]);

  const { refetch } = query;
  const checkAgain = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    state,
    orderNumber: query.data?.orderNumber ?? null,
    checkAgain,
    isChecking: query.isFetching,
  };
}
