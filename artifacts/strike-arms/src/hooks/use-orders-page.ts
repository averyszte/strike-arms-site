import { useEffect, useMemo } from 'react';

import { useOrders } from '@/hooks/use-orders';
import { ADMIN_PAGE_SIZE, pageBounds } from '@/lib/page-bounds';
import type { OrderListFilters } from '@/types/order';

/**
 * A board split across pages would be a lie about how much work is waiting, so
 * it asks for far more rows than the table page. Alan will not approach this;
 * if he ever does, the count below the board says so.
 */
const BOARD_PAGE_SIZE = 200;

/** The orders the screen shows: one table page, or the whole board. */
type OrdersPageInput = {
  filters: OrderListFilters;
  page: number;
  setPage: (page: number) => void;
};

export function useOrdersPage({ filters, page, setPage }: OrdersPageInput, isBoard: boolean) {
  const query = useOrders({
    ...filters,
    page: isBoard ? 1 : page,
    pageSize: isBoard ? BOARD_PAGE_SIZE : ADMIN_PAGE_SIZE,
  });
  const { data, isFetching } = query;

  const orders = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  // Archiving the last rows of the last page, or a link to ?page=40, would
  // otherwise leave an empty table that reads as "no orders".
  const lastPage = pageBounds(page, ADMIN_PAGE_SIZE, total).pageCount;
  useEffect(() => {
    if (!isBoard && data && !isFetching && page > lastPage) setPage(lastPage);
  }, [isBoard, data, isFetching, page, lastPage, setPage]);

  return { ...query, orders, total };
}
