import { useCallback, useMemo, useState } from 'react';

import { useUrlParams } from '@/hooks/use-url-params';
import { ADMIN_PAGE_SIZE, readPageParam } from '@/lib/page-bounds';
import type { AdminProductListFilters, ProductStockFilter } from '@/types/product';

/**
 * What the products list is showing, kept in the query string like the orders
 * list, so the dashboard's stock alerts can link straight to
 * /admin/products?stock=low and a reload lands on the same page.
 *
 * Archived is not in the URL, for the same reason as on orders: it is a mode
 * you are in, not a view anyone links to.
 */

const STOCK_FILTERS: ProductStockFilter[] = ['all', 'low', 'out'];

function readStock(params: URLSearchParams): ProductStockFilter {
  const value = params.get('stock');
  return STOCK_FILTERS.find((filter) => filter === value) ?? 'all';
}

export function useProductsFilters() {
  const { params, setParam } = useUrlParams();
  const [showArchived, setShowArchived] = useState(false);

  const stock = readStock(params);
  const query = params.get('q') ?? '';
  const page = readPageParam(params.get('page'));

  const filters: AdminProductListFilters = useMemo(
    () => ({
      search: query || undefined,
      stock,
      isArchived: showArchived,
      page,
      pageSize: ADMIN_PAGE_SIZE,
    }),
    [query, stock, showArchived, page],
  );

  return {
    stock,
    query,
    page,
    showArchived,
    filters,
    setStock: useCallback((value: ProductStockFilter) => setParam('stock', value), [setParam]),
    setQuery: useCallback((value: string) => setParam('q', value), [setParam]),
    setPage: useCallback((value: number) => setParam('page', String(value)), [setParam]),
    toggleArchived: () => {
      setShowArchived((current) => !current);
      setParam('page', '1');
    },
  };
}
