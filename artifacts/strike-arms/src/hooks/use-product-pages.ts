import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listProducts } from '@/data/products-repository';
import { flattenProductPages, nextProductPage } from '@/lib/product-pages';
import { PRODUCT_KEYS } from '@/lib/query-keys';
import type { ProductFilters } from '@/types/product';

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
    queryFn: ({ pageParam }) => listProducts({ ...rest, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextProductPage,
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
