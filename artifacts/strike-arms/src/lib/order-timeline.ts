import { FULFILLMENT_LANES } from '@/lib/order-transitions';
import type { FulfillmentStatus } from '@/types/database-rows';
import type { LookedUpOrder } from '@/types/order-lookup';

/**
 * The customer's order tracker: one step per status in the order's lane
 * (025 fulfillment_lanes, mirrored in lib/order-transitions.ts), each marked
 * done, current or still to come, with the date it happened when the status
 * log has one.
 *
 * Only for a paid order that is moving. Not paid, cancelled and fully
 * refunded orders get a notice instead (orderProgress), not a line of steps.
 */

export type TimelineStepState = 'done' | 'current' | 'upcoming';

export type TimelineStep = {
  status: FulfillmentStatus;
  label: string;
  state: TimelineStepState;
  /** ISO time the order reached this step, if known. */
  at: string | null;
};

const STEP_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'Order received',
  packed: 'Packing',
  shipped: 'Posted',
  delivered: 'Delivered',
  ready_for_pickup: 'Ready to collect',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

// A mixed order walks both lanes on one line, so say which half each step is.
const MIXED_LABELS: Partial<Record<FulfillmentStatus, string>> = {
  packed: 'Packing posted items',
  shipped: 'Posted items sent',
  delivered: 'Posted items delivered',
  ready_for_pickup: 'Shop items ready',
  collected: 'Shop items collected',
};

const MOVING_PAYMENTS = new Set(['paid', 'partially_refunded']);

/** The latest time the log shows the order arriving at this status. */
function reachedAt(order: LookedUpOrder, status: FulfillmentStatus): string | null {
  if (status === 'pending') return order.placedAt;
  const events = order.history.filter((event) => event.status === status);
  return events.length > 0 ? events[events.length - 1].at : null;
}

function stepState(index: number, currentIndex: number, isLast: boolean): TimelineStepState {
  if (index < currentIndex) return 'done';
  if (index > currentIndex) return 'upcoming';
  return isLast ? 'done' : 'current';
}

export function orderTimeline(order: LookedUpOrder): TimelineStep[] | null {
  if (!MOVING_PAYMENTS.has(order.paymentStatus)) return null;
  if (order.fulfillmentStatus === 'cancelled') return null;

  const lane = FULFILLMENT_LANES[order.fulfillmentMethod];
  const currentIndex = Math.max(0, lane.indexOf(order.fulfillmentStatus));
  const isMixed = order.fulfillmentMethod === 'mixed';

  return lane.map((status, index) => {
    const state = stepState(index, currentIndex, index === lane.length - 1);
    return {
      status,
      label: (isMixed && MIXED_LABELS[status]) || STEP_LABELS[status],
      state,
      at: state === 'upcoming' ? null : reachedAt(order, status),
    };
  });
}

const ORDER_NUMBER_PATTERN = /^SA-\d{4}-\d{4,8}$/;

/** The order number from a "See your order" email link (?order=SA-...), if valid. */
export function orderNumberFromSearch(search: string): string {
  const value = new URLSearchParams(search).get('order')?.trim().toUpperCase() ?? '';
  return ORDER_NUMBER_PATTERN.test(value) ? value : '';
}
