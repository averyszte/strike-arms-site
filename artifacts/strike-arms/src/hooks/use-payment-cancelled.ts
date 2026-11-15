import { useSearch } from 'wouter';

/** True when Stripe's cancel link brought the shopper back (`/cart?cancelled=1`). */
export function usePaymentCancelled(): boolean {
  const search = useSearch();
  return new URLSearchParams(search).get('cancelled') === '1';
}
