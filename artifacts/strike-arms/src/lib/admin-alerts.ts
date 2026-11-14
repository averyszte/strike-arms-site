import { needsAttention } from '@/lib/order-attention';
import { migrationAlerts, type MigrationAlertInput } from '@/lib/migration-alerts';
import { failedEmailAlerts, inquiryAlerts, plural } from '@/lib/admin-alerts-messaging';
import { matchesStockFilter } from '@/lib/stock-levels';
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

/**
 * A Stripe session that has not confirmed in 45 minutes (M-002). Checkout
 * sessions expire after 30, so by now the webhook should have said one way or
 * the other. Either it never arrived or it failed after the customer paid.
 */
const STUCK_PAYMENT_MS = 45 * 60 * 1000;

/** Packed means boxed and waiting for the courier, not sitting on the bench. */
const PACKED_STALE_MS = 2 * DAY_MS;

/** A week is long enough that the customer probably is not coming this week. */
const UNCOLLECTED_STALE_MS = 7 * DAY_MS;

function ageOf(order: Order, now: number): number {
  return now - new Date(order.createdAt).getTime();
}

/**
 * A paid order flagged for a human (028), such as a payment that did not
 * match its order (029). The customer may be out of pocket until Alan sorts
 * it, so this is critical.
 */
function attentionAlerts(orders: Order[]): OperationalAlert[] {
  const flagged = orders.filter(needsAttention);
  if (flagged.length === 0) return [];

  return [
    {
      id: 'paid-needs-attention',
      severity: 'critical',
      count: flagged.length,
      title: `${flagged.length} paid ${plural(flagged.length, 'order needs', 'orders need')} attention`,
      action: 'Check the order and refund if needed',
      href: '/admin/orders?attention=1',
    },
  ];
}

/** Money the shop is holding or has not seen confirmed. */
function paymentAlerts(orders: Order[], now: number): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  // Money taken, order cancelled, not all of it given back (M-030). A
  // partial refund on a cancelled order is still money the shop is holding.
  const owedRefund = orders.filter(
    (o) =>
      o.fulfillmentStatus === 'cancelled' &&
      ((o.paymentStatus === 'paid' && o.refundCents === 0) || o.paymentStatus === 'partially_refunded'),
  );
  if (owedRefund.length > 0) {
    alerts.push({
      id: 'cancelled-not-refunded',
      severity: 'critical',
      count: owedRefund.length,
      title: `${owedRefund.length} cancelled ${plural(owedRefund.length, 'order', 'orders')} not fully refunded`,
      action: 'Open the order and refund the rest',
      href: '/admin/orders?fulfillment=cancelled',
    });
  }

  const stuckPayment = orders.filter(
    (o) => o.paymentStatus === 'pending' && o.stripeSessionId !== null && ageOf(o, now) > STUCK_PAYMENT_MS,
  );
  if (stuckPayment.length > 0) {
    alerts.push({
      id: 'payment-stuck-pending',
      severity: 'critical',
      count: stuckPayment.length,
      title: `${stuckPayment.length} ${plural(stuckPayment.length, 'payment has', 'payments have')} not confirmed in 45 minutes`,
      action: 'Check the payment in Stripe before the customer rings',
      href: '/admin/orders?payment=pending',
    });
  }

  return alerts;
}

/** Orders sitting at one fulfilment step for longer than they should. */
function fulfilmentAlerts(orders: Order[], now: number): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

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

function orderAlerts(orders: Order[], now: number): OperationalAlert[] {
  // No "failed payments" alert: 'failed' only ever meant a shopper who walked
  // away from Stripe, and since 029 that is recorded as 'expired'. Nothing
  // about it needs Alan.
  return [...paymentAlerts(orders, now), ...fulfilmentAlerts(orders, now)];
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
      action: 'Mark back in stock or unpublish',
      href: '/admin/products?stock=out',
    });
  }

  return alerts;
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
  /** Emails that gave up or never queued (M-010). Undefined while loading. */
  failedEmailCount?: number;
};

export function buildOperationalAlerts({
  orders,
  products,
  newInquiryCount,
  now,
  migrations,
  failedEmailCount = 0,
}: AlertInput): OperationalAlert[] {
  return [
    ...migrationAlerts(migrations),
    ...attentionAlerts(orders),
    ...orderAlerts(orders, now),
    ...stockAlerts(products),
    ...inquiryAlerts(newInquiryCount),
    ...failedEmailAlerts(failedEmailCount),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.count - a.count);
}
