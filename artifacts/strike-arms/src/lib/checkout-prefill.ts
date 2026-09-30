import type { CheckoutDetails, CheckoutPrefill } from '@/types/cart';

/**
 * Fills the customer's details from their account, but only fields that are
 * still empty: anything already typed wins.
 */
export function applyCheckoutPrefill(
  details: CheckoutDetails,
  prefill: CheckoutPrefill,
): CheckoutDetails {
  return {
    ...details,
    customerName: details.customerName || prefill.customerName,
    customerEmail: details.customerEmail || prefill.customerEmail,
    customerPhone: details.customerPhone || prefill.customerPhone,
  };
}
