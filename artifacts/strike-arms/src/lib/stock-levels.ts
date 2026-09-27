import type { Product, ProductStockFilter } from '@/types/product';

/**
 * What "low" and "sold out" mean, in one place.
 *
 * The dashboard alerts count with these, and the products list filters with
 * them, so the alert that says "3 live products are down to 2 or fewer" links
 * to a list of exactly those 3. The database side is products.sellable_count
 * (migration 026), the same sum as sellableCount below.
 */

/** Sellable units at which it is worth ordering more. */
export const LOW_STOCK_THRESHOLD = 2;

/** What can actually be sold: the rest is promised to checkouts in flight. */
export function sellableCount(product: Product): number {
  return (product.stockCount ?? 0) - (product.reservedCount ?? 0);
}

/** Whether a product belongs under a stock filter. Only live products count. */
export function matchesStockFilter(product: Product, filter: ProductStockFilter): boolean {
  if (filter === 'all') return true;
  if (!product.isPublished) return false;
  const sellable = sellableCount(product);
  return filter === 'out' ? sellable <= 0 : sellable > 0 && sellable <= LOW_STOCK_THRESHOLD;
}

export const STOCK_FILTER_LABELS: Record<ProductStockFilter, string> = {
  all: 'Any stock',
  low: `Live, ${LOW_STOCK_THRESHOLD} or fewer left`,
  out: 'Live, sold out',
};

export type StockLevel = 'out' | 'low' | 'ok';

/** For colouring a stock count. Drafts are judged the same as live products here. */
export function stockLevel(product: Product): StockLevel {
  const sellable = sellableCount(product);
  if (sellable <= 0) return 'out';
  return sellable <= LOW_STOCK_THRESHOLD ? 'low' : 'ok';
}
