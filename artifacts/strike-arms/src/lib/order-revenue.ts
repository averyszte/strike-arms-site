import type { Order } from '@/types/order';

/**
 * What an order contributes to revenue (M-027).
 *
 * A partially refunded order still brought money in, so it counts, net of
 * its refund. A fully refunded order nets to zero and is left out, as is
 * anything never paid. Money is dated by when it was paid, not when the
 * order was opened: a checkout started at 23:55 and paid at 00:05 is the
 * next day's money. Older rows with no paid_at fall back to created_at.
 */

type RevenueFields = Pick<Order, 'paymentStatus' | 'totalCents' | 'refundCents' | 'paidAt' | 'createdAt'>;

export function countsAsRevenue(order: RevenueFields): boolean {
  return order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded';
}

export function netRevenueCents(order: RevenueFields): number {
  return order.totalCents - order.refundCents;
}

export function revenueDate(order: RevenueFields): Date {
  return new Date(order.paidAt ?? order.createdAt);
}
