import { useCallback, useMemo, useState } from 'react';

import { useUrlParams } from '@/hooks/use-url-params';
import { FULFILLMENT_OPTIONS } from '@/lib/order-display';
import { readPageParam } from '@/lib/page-bounds';
import type { FulfillmentStatus, OrderListFilters, PaymentStatus } from '@/types/order';

/**
 * What the orders list is filtered to.
 *
 * The query string is the state, not a copy of it. The dashboard alerts link
 * straight here — "3 parcels have not shipped" goes to
 * /admin/orders?fulfillment=packed — and mirroring the URL into useState would
 * mean two sources of truth and an effect to keep them in step. Reading it
 * where it lives means the filter is addressable, bookmarkable, and cannot
 * disagree with the address bar.
 *
 * The search term and the page live there too, so a reload, or coming back
 * from a printed order, lands on the same rows. How the URL is written is
 * useUrlParams.
 *
 * The query string is typed by whoever is holding the keyboard, so both values
 * are checked against the statuses that exist rather than cast into place.
 */

export type PaymentFilter = PaymentStatus | 'all';
export type FulfillmentFilter = FulfillmentStatus | 'all';

const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'paid',
  'refunded',
  'partially_refunded',
  'failed',
  'expired',
  'abandoned',
];

/** How "All" is written in the URL, since the bare address now means Paid. */
const ALL_PAYMENTS_PARAM = 'any';

/** Filters a dashboard alert can link with; each one picks its own payment rule. */
const LINKED_FILTER_KEYS = ['fulfillment', 'attention', 'q'];

/**
 * The payment tab (N-083). A Stripe checkout writes an order row before any
 * money moves, so "All" by default filled the list with abandoned checkouts.
 * The bare /admin/orders now lands on Paid. A link that carries another
 * filter (the dashboard alerts, a search from the failed-emails card) keeps
 * the old "any payment" default, so the list it opens still matches the
 * count that sent you there.
 */
function readPayment(params: URLSearchParams): PaymentFilter {
  const value = params.get('payment');
  if (value === ALL_PAYMENTS_PARAM) return 'all';
  const status = PAYMENT_STATUSES.find((candidate) => candidate === value);
  if (status) return status;
  return LINKED_FILTER_KEYS.some((key) => params.has(key)) ? 'all' : 'paid';
}

/**
 * Two statuses mean "nobody paid and the checkout is closed" (028, 040).
 * Paid includes partly refunded orders: money was taken and the goods may
 * still need packing or collecting, and countsAsRevenue (lib/order-revenue.ts)
 * and the dashboard treat them as paid too.
 */
function paymentStatusFor(value: PaymentFilter): OrderListFilters['paymentStatus'] {
  if (value === 'all') return undefined;
  if (value === 'paid') return ['paid', 'partially_refunded'];
  if (value === 'expired' || value === 'abandoned') return ['expired', 'abandoned'];
  return value;
}

function writePayment(value: PaymentFilter): string {
  return value === 'all' ? ALL_PAYMENTS_PARAM : value;
}

function readFulfillment(params: URLSearchParams): FulfillmentFilter {
  const value = params.get('fulfillment');
  return FULFILLMENT_OPTIONS.find((option) => option.value === value)?.value ?? 'all';
}

export function useOrdersFilters() {
  const { params, setParam, setParams } = useUrlParams();

  // Archived is not in the URL: nothing links to it, and it reads as a mode
  // you are in rather than a view you would send someone.
  const [showArchived, setShowArchived] = useState(false);

  const payment = readPayment(params);
  const fulfillment = readFulfillment(params);
  const needsAttention = params.get('attention') === '1';
  const query = params.get('q') ?? '';
  const page = readPageParam(params.get('page'));

  // The toolbar's own filters also pin the current tab into the URL. Without
  // it, picking a fulfilment filter on the default Paid tab would read as a
  // dashboard link and jump the list to All (readPayment).
  const hasPaymentParam = params.has('payment');
  const setToolbarParam = useCallback(
    (key: string, value: string) =>
      setParams(hasPaymentParam ? { [key]: value } : { [key]: value, payment: writePayment(payment) }),
    [setParams, hasPaymentParam, payment],
  );

  const filters: OrderListFilters = useMemo(
    () => ({
      paymentStatus: paymentStatusFor(payment),
      fulfillmentStatus: fulfillment === 'all' ? undefined : fulfillment,
      needsAttention: needsAttention || undefined,
      search: query || undefined,
      isArchived: showArchived,
    }),
    [payment, fulfillment, needsAttention, query, showArchived],
  );

  return {
    payment,
    fulfillment,
    needsAttention,
    query,
    page,
    showArchived,
    filters,
    setPayment: useCallback(
      (value: PaymentFilter) => setParam('payment', writePayment(value)),
      [setParam],
    ),
    setFulfillment: useCallback(
      (value: FulfillmentFilter) => setToolbarParam('fulfillment', value),
      [setToolbarParam],
    ),
    setNeedsAttention: useCallback(
      (value: boolean) => setToolbarParam('attention', value ? '1' : ''),
      [setToolbarParam],
    ),
    setQuery: useCallback((value: string) => setToolbarParam('q', value), [setToolbarParam]),
    setPage: useCallback((value: number) => setParam('page', String(value)), [setParam]),
    toggleArchived: () => {
      setShowArchived((current) => !current);
      setParam('page', '1');
    },
  };
}
