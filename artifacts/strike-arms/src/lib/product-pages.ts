import type { Product, ProductListResult } from '@/types/product';

/**
 * Paging rules for the "load more" product grids (M-050). Each page is one
 * fetch of `pageSize` rows; the infinite query keeps the pages already loaded,
 * so asking for the next one never refetches the earlier ones.
 */

/** The page after `lastPage`, or undefined once every product is loaded. */
export function nextProductPage(
  lastPage: ProductListResult,
  allPages: readonly ProductListResult[],
): number | undefined {
  if (lastPage.items.length === 0) return undefined;
  const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
  return loaded < lastPage.total ? lastPage.page + 1 : undefined;
}

/**
 * The products to show: the loaded pages up to `targetPage`, in order, and the
 * catalogue total from the most recent page.
 */
export function flattenProductPages(
  pages: readonly ProductListResult[],
  targetPage: number,
): { items: Product[]; total: number } {
  const shown = pages.slice(0, Math.max(1, targetPage));
  const last = pages[pages.length - 1];
  return { items: shown.flatMap((page) => page.items), total: last?.total ?? 0 };
}
