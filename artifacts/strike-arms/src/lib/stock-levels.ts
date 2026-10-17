import type { Product, ProductStockFilter } from '@/types/product';

/**
 * The products list's stock filter. In stock is a switch the admin sets by
 * hand (migration 038): nothing is counted.
 */

/** Whether a product belongs under a stock filter. */
export function matchesStockFilter(product: Product, filter: ProductStockFilter): boolean {
  if (filter === 'all') return true;
  return filter === 'in' ? product.inStock : !product.inStock;
}

export const STOCK_FILTERS: ProductStockFilter[] = ['all', 'in', 'out'];

export const STOCK_FILTER_LABELS: Record<ProductStockFilter, string> = {
  all: 'Any stock',
  in: 'In stock',
  out: 'Out of stock',
};
