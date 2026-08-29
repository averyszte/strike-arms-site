import { useCallback, useRef, useState } from 'react';

import { createCheckoutSession, CheckoutError } from '@/data/checkout-repository';
import type { CartLine, CheckoutDetails } from '@/types/cart';

/**
 * Starts a Stripe Checkout session and sends the browser to it.
 *
 * The attempt id is stable for as long as this component is mounted, so a
 * shopper who fails a card and tries again reuses it. The server uses it to
 * clean up the abandoned pending order from the previous try, which releases
 * the stock that order was holding.
 */
export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptId = useRef(crypto.randomUUID());

  const startCheckout = useCallback(
    async (lines: CartLine[], details: CheckoutDetails) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const session = await createCheckoutSession(lines, details, attemptId.current);
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
