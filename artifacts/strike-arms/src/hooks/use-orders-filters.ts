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
];

function readPayment(params: URLSearchParams): PaymentFilter {
  const value = params.get('payment');
  return PAYMENT_STATUSES.find((status) => status === value) ?? 'all';
}

function readFulfillment(params: URLSearchParams): FulfillmentFilter {
  const value = params.get('fulfillment');
  return FULFILLMENT_OPTIONS.find((option) => option.value === value)?.value ?? 'all';
}

export function useOrdersFilters() {
  const { params, setParam } = useUrlParams();

  // Archived is not in the URL: nothing links to it, and it reads as a mode
  // you are in rather than a view you would send someone.
  const [showArchived, setShowArchived] = useState(false);

  const payment = readPayment(params);
  const fulfillment = readFulfillment(params);
  const query = params.get('q') ?? '';
  const page = readPageParam(params.get('page'));

  const filters: OrderListFilters = useMemo(
    () => ({
      paymentStatus: payment === 'all' ? undefined : payment,
      fulfillmentStatus: fulfillment === 'all' ? undefined : fulfillment,
      search: query || undefined,
      isArchived: showArchived,
    }),
    [payment, fulfillment, query, showArchived],
  );

  return {
    payment,
    fulfillment,
    query,
    page,
    showArchived,
    filters,
    setPayment: useCallback((value: PaymentFilter) => setParam('payment', value), [setParam]),
    setFulfillment: useCallback(
      (value: FulfillmentFilter) => setParam('fulfillment', value),
      [setParam],
    ),
    setQuery: useCallback((value: string) => setParam('q', value), [setParam]),
    setPage: useCallback((value: number) => setParam('page', String(value)), [setParam]),
    toggleArchived: () => {
      setShowArchived((current) => !current);
      setParam('page', '1');
    },
  };
}
