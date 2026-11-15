import { useEffect, useState } from 'react';

import { loadCheckoutDraft, saveCheckoutDraft } from '@/data/checkout-draft-repository';
import { EMPTY_CHECKOUT_DETAILS } from '@/lib/checkout-validation';
import type { CheckoutDetails } from '@/types/cart';

/**
 * The checkout form's details, started from the draft this tab kept (if any)
 * and saved back as they change, so a cancelled Stripe payment comes back to
 * a filled form (N-054). The age tick always starts unticked.
 */
export function useCheckoutDraft() {
  const [details, setDetails] = useState<CheckoutDetails>(() => ({
    ...EMPTY_CHECKOUT_DETAILS,
    ...loadCheckoutDraft(),
    ageConfirmed: false,
  }));

  useEffect(() => {
    saveCheckoutDraft(details);
  }, [details]);

  return [details, setDetails] as const;
}
