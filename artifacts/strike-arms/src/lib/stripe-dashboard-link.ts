/**
 * Where a payment lives in the Stripe dashboard. Live mode: a test-mode
 * payment opens under /test/ instead, and Stripe offers the switch.
 */
export function stripePaymentUrl(paymentIntentId: string): string {
  return `https://dashboard.stripe.com/payments/${encodeURIComponent(paymentIntentId)}`;
}
