import { useEffect } from 'react';

import { clearCheckoutDraft } from '@/data/checkout-draft-repository';

/**
 * Drops the kept checkout details once the basket is empty: after a paid
 * order (the confirmation empties the cart) or when the shopper removes
 * everything, so the next basket does not start from an old order's form.
 */
export function useClearCheckoutDraft(isCartEmpty: boolean) {
  useEffect(() => {
    if (isCartEmpty) clearCheckoutDraft();
  }, [isCartEmpty]);
}
