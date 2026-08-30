import { ORDER_CHANNEL_LABELS } from '@/lib/order-display';
import type { Order, OrderChannel } from '@/types/order';

export type ChannelRevenueRow = {
  channel: OrderChannel;
  label: string;
  cents: number;
  orderCount: number;
  /** 0-1 of the period's net total, for the bar widths. */
  share: number;
};

type Bucket = { cents: number; orderCount: number };

/**
 * Splits paid revenue by how the order was taken.
 *
 * A blended figure flatters the website: if most of the month's money was rung
 * up at the counter, the shop is doing well and the website is doing nothing,
 * and one number cannot tell Alan which. Every figure here is net of refunds,
 * matching the headline revenue, and archived orders still count -- tidying up
 * is not a refund.
 *
 * Channels with no orders in the period are left out rather than shown as a
 * zero row, so a shop that never takes phone orders is not asked to read one.
 * The rows that remain always sum to the period's total.
 */
export function buildChannelRevenue(orders: Order[], since: Date | null): ChannelRevenueRow[] {
  const buckets = new Map<OrderChannel, Bucket>();
  let total = 0;

  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue;
    if (since && new Date(order.createdAt) < since) continue;

    const net = order.totalCents - order.refundCents;
    const bucket = buckets.get(order.channel) ?? { cents: 0, orderCount: 0 };
    buckets.set(order.channel, { cents: bucket.cents + net, orderCount: bucket.orderCount + 1 });
    total += net;
  }

  return [...buckets.entries()]
    .map(([channel, bucket]) => ({
      channel,
      label: ORDER_CHANNEL_LABELS[channel],
      cents: bucket.cents,
      orderCount: bucket.orderCount,
      // A channel refunded further than it sold would give a negative width.
      // The euro figure below still reports the loss honestly; only the bar
      // is floored, because a bar cannot be shorter than empty.
      share: total > 0 ? Math.max(0, bucket.cents / total) : 0,
    }))
    .sort((a, b) => b.cents - a.cents);
}
