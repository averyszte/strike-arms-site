import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import { getCheckoutAttemptId } from '@/data/checkout-attempt-repository';
import { sendEcommerceEvent } from '@/data/google-tag-manager-client';
import {
  createCheckoutSession,
  CheckoutError,
  type AlreadyPaidOrder,
} from '@/data/checkout-repository';
import { buildEcommercePayload } from '@/lib/analytics-ecommerce';
import { CART_FULL_MESSAGE, isCartOverLimit } from '@/lib/cart-limits';
import type { CartLine, CheckoutDetails } from '@/types/cart';

const UNAVAILABLE = 'Checkout is temporarily unavailable. Please try again.';

/** The success page for an order, when the server named both of its ids. */
function successPath(order: AlreadyPaidOrder): string | null {
  if (!order.orderId || !order.sessionId) return null;
  const params = new URLSearchParams({ order: order.orderId, session: order.sessionId });
  return `/checkout/success?${params.toString()}`;
}

function alreadyPaidMessage(message: string, order: AlreadyPaidOrder): string {
  return order.orderNumber ? `${message} Your order number is ${order.orderNumber}.` : message;
}

/**
 * Starts a Stripe Checkout session and sends the browser to it.
 *
 * Every try in this tab shares one attempt id, including a try after coming
 * back from Stripe's cancel link, until an order is paid. The server uses it
 * to abandon the pending order from the previous try, which releases the
 * stock that order was holding. If that earlier order turns out to be paid,
 * the server refuses the new one (409) and the shopper is shown that order.
 */
export function useCheckout() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Back from Stripe can restore this page from the browser's cache with the
  // button still saying "Redirecting", so a restored page starts afresh.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsSubmitting(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleFailure = useCallback(
    (cause: unknown) => {
      setIsSubmitting(false);
      if (!(cause instanceof CheckoutError)) {
        setError(UNAVAILABLE);
        return;
      }
      const paid = cause.alreadyPaid;
      const path = paid ? successPath(paid) : null;
      if (path) {
        setLocation(path);
        return;
      }
      setError(paid ? alreadyPaidMessage(cause.message, paid) : cause.message);
    },
    [setLocation],
  );

  const startCheckout = useCallback(
    async (lines: CartLine[], details: CheckoutDetails, turnstileToken: string | null) => {
      if (isCartOverLimit(lines)) {
        setError(CART_FULL_MESSAGE);
        return;
      }
      setIsSubmitting(true);
      setError(null);
      sendEcommerceEvent('begin_checkout', buildEcommercePayload(lines));

      try {
        const session = await createCheckoutSession(
          lines,
          details,
          getCheckoutAttemptId(),
          turnstileToken,
        );
        // A full navigation, not a router push: Stripe Checkout is hosted.
        window.location.href = session.url;
      } catch (cause) {
        handleFailure(cause);
      }
    },
    [handleFailure],
  );

  return { startCheckout, isSubmitting, error };
}
