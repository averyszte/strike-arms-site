import {
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  isAfter,
} from 'date-fns';
import type { Order } from '@/types/order';

export type DashboardMetrics = {
  revenueThisMonth: number;
  revenueAllTime: number;
  pendingPickups: number;
  ordersToday: number;
  ordersThisMonth: number;
};

export type PeriodKey = '7d' | '30d' | '90d' | 'all';

export type RevenueRow = { label: string; revenue: number };

export type ProductSalesRow = { name: string; quantity: number; revenue: number };

/**
 * The orders still being worked.
 *
 * Archiving is the admin saying they are finished with an order, so it leaves
 * the queues and the alerts. It never leaves the money: every revenue figure
 * below counts archived orders, because tidying up is not a refund.
 */
export function workQueue(orders: Order[]): Order[] {
  return orders.filter(o => !o.isArchived);
}

export function computeDashboardMetrics(orders: Order[]): DashboardMetrics {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const dayStart = startOfDay(now);
  const paid = orders.filter(o => o.paymentStatus === 'paid');

  return {
    revenueAllTime: paid.reduce((s, o) => s + o.totalCents - o.refundCents, 0),
    revenueThisMonth: paid
      .filter(o => isAfter(new Date(o.createdAt), monthStart))
      .reduce((s, o) => s + o.totalCents - o.refundCents, 0),
    // A queue, so archived orders drop out of it. The revenue and volume
    // figures either side of this deliberately do not.
    pendingPickups: workQueue(orders).filter(
      o => o.fulfillmentStatus === 'pending' && o.paymentStatus === 'paid',
    ).length,
    ordersToday: orders.filter(o => isAfter(new Date(o.createdAt), dayStart)).length,
    ordersThisMonth: orders.filter(o => isAfter(new Date(o.createdAt), monthStart)).length,
  };
}

/** How far back each fixed period reaches. 'all' has no lower bound. */
const PERIOD_DAYS: Record<Exclude<PeriodKey, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

/**
 * The first day the period covers, or null for 'all'.
 *
 * Exported so the channel split beneath the revenue chart windows on exactly
 * the same dates the chart does. Two nearly-identical date calculations sitting
 * beside each other would eventually disagree, and a split that does not add up
 * to the total above it reads as a bug in the money.
 */
export function periodStart(period: PeriodKey, now: Date = new Date()): Date | null {
  if (period === 'all') return null;
  return startOfDay(subDays(now, PERIOD_DAYS[period] - 1));
}

export function buildRevenueRows(orders: Order[], period: PeriodKey): RevenueRow[] {
  const paid = orders.filter(o => o.paymentStatus === 'paid');
  const now = new Date();

  function sumBucket(start: Date, end: Date): number {
    return paid
      .filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      })
      .reduce((s, o) => s + o.totalCents - o.refundCents, 0);
  }

  if (period === '7d') {
    return eachDayOfInterval({ start: subDays(now, PERIOD_DAYS['7d'] - 1), end: now }).map(day => ({
      label: format(day, 'EEE'),
      revenue: sumBucket(startOfDay(day), endOfDay(day)),
    }));
  }

  if (period === '30d') {
    return eachDayOfInterval({ start: subDays(now, PERIOD_DAYS['30d'] - 1), end: now }).map(day => ({
      label: format(day, 'MMM d'),
      revenue: sumBucket(startOfDay(day), endOfDay(day)),
    }));
  }

  if (period === '90d') {
    const days = eachDayOfInterval({ start: subDays(now, PERIOD_DAYS['90d'] - 1), end: now });
    const chunks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks.map(chunk => ({
      label: format(chunk[0], 'MMM d'),
      revenue: sumBucket(startOfDay(chunk[0]), endOfDay(chunk[chunk.length - 1])),
    }));
  }

  if (paid.length === 0) return [];
  const oldest = paid.reduce(
    (min, o) => {
      const d = new Date(o.createdAt);
      return d < min ? d : min;
    },
    new Date(),
  );

  return eachMonthOfInterval({ start: startOfMonth(oldest), end: now })
    .slice(-24)
    .map(month => ({
      label: format(month, 'MMM yy'),
      revenue: sumBucket(startOfMonth(month), endOfMonth(month)),
    }));
}

export function buildProductSales(orders: Order[]): ProductSalesRow[] {
  const map = new Map<string, ProductSalesRow>();

  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue;
    for (const item of order.items ?? []) {
      const existing = map.get(item.productSlug) ?? {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      map.set(item.productSlug, {
        name: item.productName,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.subtotalCents,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
}
