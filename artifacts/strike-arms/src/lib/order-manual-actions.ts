import type { Order } from '@/types/order';

/**
 * The browser's copy of the rules in void_counter_order and
 * record_manual_refund (041). The database checks them again; these exist so
 * the buttons are shown only when they can work (M-033).
 */

const IRISH_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Dublin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

type MoneyFields = Pick<Order, 'channel' | 'paymentStatus' | 'createdAt' | 'totalCents' | 'refundCents'>;

function isPaid(order: MoneyFields): boolean {
  return order.paymentStatus === 'paid' || order.paymentStatus === 'partially_refunded';
}

export function isSameIrishDay(a: Date, b: Date): boolean {
  return IRISH_DAY.format(a) === IRISH_DAY.format(b);
}

/** A counter sale, still paid for, rung up today in Irish time. */
export function canVoidCounterOrder(order: MoneyFields, now: Date): boolean {
  return order.channel === 'counter' && isPaid(order) && isSameIrishDay(new Date(order.createdAt), now);
}

/** What is left to hand back, or 0 when nothing can be recorded. */
export function manualRefundableCents(order: MoneyFields): number {
  if (!isPaid(order)) return 0;
  return Math.max(0, order.totalCents - order.refundCents);
}
