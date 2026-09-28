import type { FulfillmentStatus, Order, PaymentStatus } from '@/types/order';

/**
 * Whether a flagged order still needs someone.
 *
 * confirm_order_paid (migration 028) sets attention_reason when a customer
 * paid for stock that had already gone. Nothing clears it: the flag is the
 * record of what happened. What settles it is the money or the goods, so the
 * flag counts as open only while the customer is still out of pocket and
 * nothing has been handed over.
 *
 * - Refunded in full: settled.
 * - Shipped, collected or delivered: Alan sourced the item, settled.
 * - Cancelled: the "cancelled but still paid for" alert takes over.
 *
 * The orders query filters on the same two lists, so the dashboard count and
 * the list it links to cannot disagree.
 */

export const ATTENTION_OPEN_PAYMENT: PaymentStatus[] = ['paid', 'partially_refunded'];

export const ATTENTION_CLOSED_FULFILMENT: FulfillmentStatus[] = [
  'shipped',
  'collected',
  'delivered',
  'cancelled',
];

type AttentionFields = Pick<Order, 'attentionReason' | 'paymentStatus' | 'fulfillmentStatus'>;

export function needsAttention(order: AttentionFields): boolean {
  return (
    order.attentionReason !== null &&
    ATTENTION_OPEN_PAYMENT.includes(order.paymentStatus) &&
    !ATTENTION_CLOSED_FULFILMENT.includes(order.fulfillmentStatus)
  );
}
