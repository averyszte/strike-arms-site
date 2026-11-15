import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listProducts } from '@/data/products-repository';
import { flattenProductPages, nextProductPage } from '@/lib/product-pages';
import { PRODUCT_KEYS } from '@/lib/query-keys';
import type { ProductFilters } from '@/types/product';

/** Which page to fetch, and the listing's total once page 1 has counted it. */
type PageParam = { page: number; total?: number };

const FIRST_PAGE: PageParam = { page: 1 };

/**
 * A "load more" product grid (M-050). `filters.page` is how many pages the
 * grid should show; each page is fetched once and kept, so raising it fetches
 * only the new page. A link that opens on page 3 loads pages 1 to 3 in turn.
 */
export function useProductPages(filters: ProductFilters) {
  const { page = 1, ...rest } = filters;
  const targetPage = Math.max(1, page);

  const query = useInfiniteQuery({
    queryKey: PRODUCT_KEYS.pages(rest),
    queryFn: ({ pageParam }) => listProducts({ ...rest, page: pageParam.page }, pageParam.total),
    initialPageParam: FIRST_PAGE,
    // Later pages carry the first page's total, so only page 1 asks the
    // database to count (N-037). A refetch starts again from page 1.
    getNextPageParam: (lastPage, allPages): PageParam | undefined => {
      const next = nextProductPage(lastPage, allPages);
      return next === undefined ? undefined : { page: next, total: lastPage.total };
    },
    placeholderData: (prev) => prev,
  });

  const { data, hasNextPage, isFetchingNextPage, isPlaceholderData, fetchNextPage } = query;
  const loadedPages = data?.pages.length ?? 0;
  const shouldFetchMore =
    loadedPages > 0 && loadedPages < targetPage && hasNextPage && !isFetchingNextPage;

  useEffect(() => {
    if (shouldFetchMore && !isPlaceholderData) void fetchNextPage();
  }, [shouldFetchMore, isPlaceholderData, fetchNextPage]);

  const shown = useMemo(
    () => flattenProductPages(data?.pages ?? [], targetPage),
    [data, targetPage],
  );

  return {
    items: shown.items,
    total: shown.total,
    hasData: data !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
