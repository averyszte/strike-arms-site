import { useCallback, useState } from 'react';

import { getCheckoutAttemptId } from '@/data/checkout-attempt-repository';
import { createCheckoutSession, CheckoutError } from '@/data/checkout-repository';
import type { CartLine, CheckoutDetails } from '@/types/cart';

/**
 * Starts a Stripe Checkout session and sends the browser to it.
 *
 * Every try in this tab shares one attempt id, including a try after coming
 * back from Stripe's cancel link, until an order is paid. The server uses it
 * to abandon the pending order from the previous try, which releases the
 * stock that order was holding.
 */
export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (lines: CartLine[], details: CheckoutDetails) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const session = await createCheckoutSession(lines, details, getCheckoutAttemptId());
        // A full navigation, not a router push: Stripe Checkout is hosted.
        window.location.href = session.url;
      } catch (cause) {
        setError(
          cause instanceof CheckoutError
            ? cause.message
            : 'Checkout is temporarily unavailable. Please try again.',
        );
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { startCheckout, isSubmitting, error };
}
