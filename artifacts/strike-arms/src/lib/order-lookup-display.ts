import type { LookedUpOrder } from '@/types/order-lookup';

/**
 * Customer wording for a looked-up order. The admin labels are written for
 * the shop ("Ready for pickup", "Packed"); these answer the shopper's
 * question, which is "where is my order?".
 */

const PAID = new Set(['paid', 'partially_refunded', 'refunded']);

export type OrderProgress = { label: string; detail: string };

function fulfilmentProgress(order: LookedUpOrder): OrderProgress {
  const isCollection = order.fulfillmentMethod === 'pickup';
  switch (order.fulfillmentStatus) {
    case 'pending':
      return isCollection
        ? { label: 'Being prepared', detail: 'We will email you when it is ready to collect.' }
        : { label: 'Being prepared', detail: 'We will email you when it is on its way.' };
    case 'ready_for_pickup':
      return {
        label: 'Ready to collect',
        detail: 'Bring photo ID and your order number when you collect.',
      };
    case 'collected':
      return { label: 'Collected', detail: 'This order has been collected.' };
    case 'packed':
      return { label: 'Packed', detail: 'Packed and waiting to be posted.' };
    case 'shipped':
      return { label: 'Posted', detail: 'This order is on its way.' };
    case 'delivered':
      return { label: 'Delivered', detail: 'This order has been delivered.' };
    case 'cancelled':
      return { label: 'Cancelled', detail: 'This order was cancelled.' };
  }
}

export function orderProgress(order: LookedUpOrder): OrderProgress {
  if (order.paymentStatus === 'refunded') {
    return { label: 'Refunded', detail: 'This order was refunded in full.' };
  }
  if (!PAID.has(order.paymentStatus)) {
    return { label: 'Not paid', detail: 'The payment for this order was not completed.' };
  }
  return fulfilmentProgress(order);
}

/** A partial refund is shown alongside progress rather than replacing it. */
export function hasPartialRefund(order: LookedUpOrder): boolean {
  return order.paymentStatus === 'partially_refunded' && order.refundCents > 0;
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
}
