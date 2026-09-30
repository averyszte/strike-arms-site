import { FULFILLMENT_OPTIONS } from '@/lib/order-display';
import type { FulfillmentMethod, FulfillmentStatus, Order } from '@/types/order';

/**
 * Which fulfilment statuses an order can move to.
 *
 * This mirrors guard_fulfillment_status() in migration 025, which is what
 * actually enforces it. The admin uses this copy only to stop offering moves
 * the database would refuse. Change the two together.
 */

/** The statuses each kind of order passes through, in order. */
export const FULFILLMENT_LANES: Record<FulfillmentMethod, FulfillmentStatus[]> = {
  pickup: ['pending', 'ready_for_pickup', 'collected'],
  delivery: ['pending', 'packed', 'shipped', 'delivered'],
  mixed: ['pending', 'packed', 'ready_for_pickup', 'shipped', 'collected', 'delivered'],
};

const WAS_PAID: Order['paymentStatus'][] = ['paid', 'partially_refunded', 'refunded'];

/** Nothing has left the shop yet, so cancelling can put the stock back. */
const CANCELLABLE: FulfillmentStatus[] = ['pending', 'ready_for_pickup', 'packed'];

type TransitionOrder = Pick<Order, 'fulfillmentMethod' | 'fulfillmentStatus' | 'paymentStatus'>;
type EmailOrder = TransitionOrder & Pick<Order, 'channel' | 'customerEmail'>;

export function canMoveFulfillment(order: TransitionOrder, to: FulfillmentStatus): boolean {
  const from = order.fulfillmentStatus;
  if (to === from) return true;
  if (from === 'cancelled') return false;
  if (to === 'cancelled') return CANCELLABLE.includes(from);
  if (!FULFILLMENT_LANES[order.fulfillmentMethod].includes(to)) return false;
  if (to === 'pending') return true;
  return order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded';
}

/**
 * Whether moving to this status emails the customer. Mirrors
 * is_status_email_due() in migration 033, which decides for real: forward
 * steps on a paid order, or cancelling a paid one, never a counter sale.
 * (033 also skips a status already emailed once; the admin label does not.)
 */
export function isStatusEmailDue(order: EmailOrder, to: FulfillmentStatus): boolean {
  const from = order.fulfillmentStatus;
  if (to === from || to === 'pending' || !order.customerEmail || order.channel === 'counter') {
    return false;
  }
  if (to === 'cancelled') return WAS_PAID.includes(order.paymentStatus);
  const lane = FULFILLMENT_LANES[order.fulfillmentMethod];
  const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded';
  return isPaid && lane.indexOf(to) > lane.indexOf(from);
}

export type FulfillmentChoice = {
  value: FulfillmentStatus;
  label: string;
  isAllowed: boolean;
  isEmailed: boolean;
};

/** Every status, in display order, marked with whether this order can take it. */
export function fulfillmentChoices(order: EmailOrder): FulfillmentChoice[] {
  return FULFILLMENT_OPTIONS.map((option) => ({
    ...option,
    isAllowed: canMoveFulfillment(order, option.value),
    isEmailed: isStatusEmailDue(order, option.value),
  }));
}
