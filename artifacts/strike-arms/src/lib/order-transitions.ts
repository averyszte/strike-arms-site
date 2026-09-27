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

/** Nothing has left the shop yet, so cancelling can put the stock back. */
const CANCELLABLE: FulfillmentStatus[] = ['pending', 'ready_for_pickup', 'packed'];

type TransitionOrder = Pick<Order, 'fulfillmentMethod' | 'fulfillmentStatus' | 'paymentStatus'>;

export function canMoveFulfillment(order: TransitionOrder, to: FulfillmentStatus): boolean {
  const from = order.fulfillmentStatus;
  if (to === from) return true;
  if (from === 'cancelled') return false;
  if (to === 'cancelled') return CANCELLABLE.includes(from);
  if (!FULFILLMENT_LANES[order.fulfillmentMethod].includes(to)) return false;
  if (to === 'pending') return true;
  return order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded';
}

export type FulfillmentChoice = { value: FulfillmentStatus; label: string; isAllowed: boolean };

/** Every status, in display order, marked with whether this order can take it. */
export function fulfillmentChoices(order: TransitionOrder): FulfillmentChoice[] {
  return FULFILLMENT_OPTIONS.map((option) => ({
    ...option,
    isAllowed: canMoveFulfillment(order, option.value),
  }));
}
