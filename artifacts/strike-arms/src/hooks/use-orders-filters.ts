import { useCallback, useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';

import { FULFILLMENT_OPTIONS } from '@/lib/order-display';
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
 * Changes replace rather than push: nobody wants six back-presses to undo
 * flicking through the payment tabs.
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
  const search = useSearch();
  const [path, navigate] = useLocation();

  // Archived is not in the URL: nothing links to it, and it reads as a mode
  // you are in rather than a view you would send someone.
  const [showArchived, setShowArchived] = useState(false);

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const payment = readPayment(params);
  const fulfillment = readFulfillment(params);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(search);
      if (value === 'all') next.delete(key);
      else next.set(key, value);

      const query = next.toString();
      navigate(query ? `${path}?${query}` : path, { replace: true });
    },
    [search, path, navigate],
  );

  const filters: OrderListFilters = useMemo(
    () => ({
      paymentStatus: payment === 'all' ? undefined : payment,
      fulfillmentStatus: fulfillment === 'all' ? undefined : fulfillment,
      isArchived: showArchived,
    }),
    [payment, fulfillment, showArchived],
  );

  return {
    payment,
    fulfillment,
    showArchived,
    filters,
    setPayment: useCallback((value: PaymentFilter) => setParam('payment', value), [setParam]),
    setFulfillment: useCallback(
      (value: FulfillmentFilter) => setParam('fulfillment', value),
      [setParam],
    ),
    toggleArchived: () => setShowArchived((current) => !current),
  };
}
