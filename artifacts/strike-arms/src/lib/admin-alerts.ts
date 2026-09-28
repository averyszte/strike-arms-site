import { needsAttention } from '@/lib/order-attention';
import { migrationAlerts, type MigrationAlertInput } from '@/lib/migration-alerts';
import { LOW_STOCK_THRESHOLD, matchesStockFilter } from '@/lib/stock-levels';
import type { AlertSeverity, OperationalAlert } from '@/types/admin-alert';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';

/**
 * The things that need someone to do something about them.
 *
 * Two rules govern what belongs here. It must be a state a human has to
 * resolve — not a number that is merely interesting — and it must carry a
 * link to the place the resolving happens. An alert that reports a problem
 * and then makes you go looking for it has done half a job.
 *
 * Every threshold below is a guess at what "too long" means in a shop. They
 * are named so they can be argued with once Alan has run on this for a month.
 */

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** A paid order nobody has touched by the next day. */
const PENDING_STALE_MS = 24 * HOUR_MS;

/** Packed means boxed and waiting for the courier, not sitting on the bench. */
const PACKED_STALE_MS = 2 * DAY_MS;

/** A week is long enough that the customer probably is not coming this week. */
const UNCOLLECTED_STALE_MS = 7 * DAY_MS;

function ageOf(order: Order, now: number): number {
  return now - new Date(order.createdAt).getTime();
}


function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/**
 * Paid for stock that had gone (028). The customer is out of pocket until
 * Alan refunds or sources the item, so this is critical.
 */
function attentionAlerts(orders: Order[]): OperationalAlert[] {
  const flagged = orders.filter(needsAttention);
  if (flagged.length === 0) return [];

  return [
    {
      id: 'paid-stock-gone',
      severity: 'critical',
      count: flagged.length,
      title: `${flagged.length} paid ${plural(flagged.length, 'order', 'orders')} for stock that had already gone`,
      action: 'Refund or source the item',
      href: '/admin/orders?attention=1',
    },
  ];
}

function orderAlerts(orders: Order[], now: number): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  const failed = orders.filter((o) => o.paymentStatus === 'failed');
  if (failed.length > 0) {
    alerts.push({
      id: 'failed-payments',
      severity: 'critical',
      count: failed.length,
      title: `${failed.length} failed ${plural(failed.length, 'payment', 'payments')}`,
      action: 'Review in Orders',
      href: '/admin/orders?payment=failed',
    });
  }

  // Money taken, order cancelled, nothing given back. There is no refund UI
  // yet (D5.1), so this needs a person in the Stripe dashboard or the till.
  const owedRefund = orders.filter(
    (o) => o.paymentStatus === 'paid' && o.fulfillmentStatus === 'cancelled' && o.refundCents === 0,
  );
  if (owedRefund.length > 0) {
    alerts.push({
      id: 'cancelled-not-refunded',
      severity: 'critical',
      count: owedRefund.length,
      title: `${owedRefund.length} cancelled ${plural(owedRefund.length, 'order', 'orders')} still paid for`,
      action: 'Refund by hand — the admin cannot do it yet',
      href: '/admin/orders?fulfillment=cancelled',
    });
  }

  const stalePending = orders.filter(
    (o) =>
      o.paymentStatus === 'paid' &&
      o.fulfillmentStatus === 'pending' &&
      ageOf(o, now) > PENDING_STALE_MS,
  );
  if (stalePending.length > 0) {
    alerts.push({
      id: 'pending-over-24h',
      severity: 'warning',
      count: stalePending.length,
      title: `${stalePending.length} paid ${plural(stalePending.length, 'order', 'orders')} untouched for over 24 hours`,
      action: 'Start fulfilling',
      href: '/admin/orders?payment=paid&fulfillment=pending',
    });
  }

  // The customer has a shipping confirmation and a parcel that has not moved.
  const stalePacked = orders.filter(
    (o) => o.fulfillmentStatus === 'packed' && ageOf(o, now) > PACKED_STALE_MS,
  );
  if (stalePacked.length > 0) {
    alerts.push({
      id: 'packed-not-shipped',
      severity: 'warning',
      count: stalePacked.length,
      title: `${stalePacked.length} packed ${plural(stalePacked.length, 'parcel has', 'parcels have')} not shipped`,
      action: 'Hand to the courier or mark shipped',
      href: '/admin/orders?fulfillment=packed',
    });
  }

  // Stock on a shelf with someone's name on it is stock the website cannot sell.
  const uncollected = orders.filter(
    (o) => o.fulfillmentStatus === 'ready_for_pickup' && ageOf(o, now) > UNCOLLECTED_STALE_MS,
  );
  if (uncollected.length > 0) {
    alerts.push({
      id: 'uncollected',
      severity: 'warning',
      count: uncollected.length,
      title: `${uncollected.length} ${plural(uncollected.length, 'order has', 'orders have')} waited over a week for collection`,
      action: 'Ring the customer',
      href: '/admin/orders?fulfillment=ready_for_pickup',
    });
  }

  return alerts;
}

function stockAlerts(products: Product[]): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];
  const soldOut = products.filter((p) => matchesStockFilter(p, 'out'));
  if (soldOut.length > 0) {
    alerts.push({
      id: 'published-out-of-stock',
      severity: 'warning',
      count: soldOut.length,
      title: `${soldOut.length} live ${plural(soldOut.length, 'product is', 'products are')} out of stock`,
      action: 'Restock or unpublish',
      href: '/admin/products?stock=out',
    });
  }

  const low = products.filter((p) => matchesStockFilter(p, 'low'));
  if (low.length > 0) {
    alerts.push({
      id: 'low-stock',
      severity: 'warning',
      count: low.length,
      title: `${low.length} live ${plural(low.length, 'product is', 'products are')} down to ${LOW_STOCK_THRESHOLD} or fewer`,
      action: 'Reorder',
      href: '/admin/products?stock=low',
    });
  }

  return alerts;
}

/**
 * Nothing emails Alan when a contact form is filled in (E3 is deferred), so
 * without this the enquiries screen is a room nobody has a reason to walk into.
 */
function inquiryAlerts(newInquiryCount: number): OperationalAlert[] {
  if (newInquiryCount <= 0) return [];

  return [
    {
      id: 'new-inquiries',
      severity: 'warning',
      count: newInquiryCount,
      title: `${newInquiryCount} unanswered ${plural(newInquiryCount, 'enquiry', 'enquiries')}`,
      action: 'Read and reply',
      href: '/admin/inquiries',
    },
  ];
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1 };

type AlertInput = {
  /**
   * Already the working queue — an archived order is one the admin has said
   * they are finished with, and finishing with something is a perfectly good
   * way of resolving it.
   */
  orders: Order[];
  products: Product[];
  newInquiryCount: number;
  now: number;
  /**
   * Undefined while the migration check is loading. Left out entirely by
   * anything that has no reason to ask -- it is deployment state, not shop
   * state, and the rest of this file works without it.
   */
  migrations?: MigrationAlertInput;
};

export function buildOperationalAlerts({
  orders,
  products,
  newInquiryCount,
  now,
  migrations,
}: AlertInput): OperationalAlert[] {
  return [
    ...migrationAlerts(migrations),
    ...attentionAlerts(orders),
    ...orderAlerts(orders, now),
    ...stockAlerts(products),
    ...inquiryAlerts(newInquiryCount),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.count - a.count);
}
