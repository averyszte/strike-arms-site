import { statusLabel } from '@/lib/order-board';
import { isStatusEmailDue } from '@/lib/order-transitions';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * What the admin is told after a status change (N-082, N-084).
 *
 * A change that worked used to say nothing, so a click on the board that
 * also emailed the customer looked the same as one that did nothing.
 */

type FeedbackOrder = Pick<
  Order,
  'fulfillmentMethod' | 'fulfillmentStatus' | 'paymentStatus' | 'channel' | 'customerEmail'
>;

export type StatusFeedback = { title: string; description: string };

export function statusChangeFeedback(
  order: FeedbackOrder,
  to: FulfillmentStatus,
  isIdChecked: boolean,
): StatusFeedback {
  const parts: string[] = [];
  if (isIdChecked) parts.push('Photo ID check recorded.');
  parts.push(
    isStatusEmailDue(order, to)
      ? 'Email to the customer queued.'
      : 'No email goes to the customer for this step.',
  );
  return { title: `Marked ${statusLabel(to)}`, description: parts.join(' ') };
}
