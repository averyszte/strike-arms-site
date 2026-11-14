import { PAYMENT_METHOD_LABELS } from '@/lib/order-display';
import type { Order } from '@/types/order';

/**
 * Whether an order can be refunded, and for how much.
 *
 * This is the browser's copy of the rule. The Edge Function checks the same
 * things against the order row before it calls Stripe, and that copy is the
 * one that matters -- this one exists so the admin is told why the button is
 * disabled instead of finding out by pressing it.
 */

export type RefundEligibility =
  | { canRefund: true; refundableCents: number }
  | { canRefund: false; reason: string };

/** Stripe's vocabulary, in the shop's words. */
export const REFUND_REASONS = [
  { value: 'requested_by_customer', label: 'Customer asked for it' },
  { value: 'duplicate', label: 'Duplicate charge' },
  { value: 'fraudulent', label: 'Fraudulent' },
] as const;

export type RefundReason = (typeof REFUND_REASONS)[number]['value'];

export function refundEligibility(order: Order): RefundEligibility {
  if (order.paymentMethod !== 'stripe') {
    return {
      canRefund: false,
      reason:
        `This was taken as ${PAYMENT_METHOD_LABELS[order.paymentMethod].toLowerCase()}, ` +
        'so there is nothing at Stripe to reverse. Hand it back the way it was taken.',
    };
  }

  if (!order.stripePaymentIntent) {
    return { canRefund: false, reason: 'No Stripe payment is recorded against this order.' };
  }

  if (order.paymentStatus === 'refunded') {
    return { canRefund: false, reason: 'Already refunded in full.' };
  }

  if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'partially_refunded') {
    return { canRefund: false, reason: 'Nothing has been paid on this order.' };
  }

  const refundableCents = Math.max(0, order.totalCents - order.refundCents);
  if (refundableCents <= 0) {
    return { canRefund: false, reason: 'There is nothing left to refund.' };
  }

  return { canRefund: true, refundableCents };
}

// Euros with at most two decimals. Number() alone accepts "1e3", which here
// would be a four-figure refund typed as three characters.
const EUROS = /^\d+(\.\d{1,2})?$/;

export type ParsedRefundAmount = { ok: true; cents: number } | { ok: false; error: string };

/**
 * Rounds the scaled value: 6.50 is 649.9999... in binary, and truncating would
 * refund a cent less than the admin typed, every time, silently.
 */
export function parseRefundAmount(input: string, maxCents: number): ParsedRefundAmount {
  const text = input.trim();
  if (!EUROS.test(text)) return { ok: false, error: 'Enter an amount in euro, e.g. 24.99' };

  const cents = Math.round(Number(text) * 100);
  if (cents <= 0) return { ok: false, error: 'Enter an amount greater than zero.' };
  if (cents > maxCents) {
    return { ok: false, error: `Only €${(maxCents / 100).toFixed(2)} is still refundable.` };
  }

  return { ok: true, cents };
}

/**
 * A refund this screen sent that the order does not show yet (M-006). Kept
 * until the order's refunded total moves past what it was when it was sent,
 * so the admin is not tempted to send the same money twice.
 */
export type SentRefund = {
  amountCents: number;
  isRecorded: boolean;
  refundCentsBefore: number;
};

export function isRefundAwaitingOrder(order: Order, sent: SentRefund | null): boolean {
  return sent !== null && order.refundCents <= sent.refundCentsBefore;
}

export function sentRefundMessage(sent: SentRefund): string {
  const euros = `€${(sent.amountCents / 100).toFixed(2)}`;
  return sent.isRecorded
    ? `Refund of ${euros} sent. Waiting for the order to update.`
    : `Refund of ${euros} sent, recording pending. Stripe has the refund; the order updates when Stripe confirms it.`;
}
