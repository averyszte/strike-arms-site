/**
 * Query builders shared by the storefront product reads in
 * products-repository.ts: the column list, the published-only base query,
 * the sort orders and the tag-shelf filters.
 */

import { publicCatalogue } from '@/data/public-catalogue-client';
import type { ProductFilters } from '@/types/product';

/**
 * Exactly what rowToProduct reads (MappedProductRow), rather than `*`. One
 * literal, not a concatenation, so supabase-js can type the rows from it.
 */
export const PRODUCT_COLUMNS =
  'id,slug,name,category,subcategory,brand,condition,price_cents,sale_price_cents,images,short_description,description,in_stock,is_shippable,is_published,is_new,is_featured,is_archived,tags,created_at';

export type ProductQuery = ReturnType<typeof buildBaseQuery>;

/**
 * With `withCount`, PostgREST also returns the exact number of matching rows,
 * which costs a second scan of the filtered table. A "load more" grid needs
 * that total once, on its first page; later pages pass false and reuse it
 * (N-037).
 */
export function buildBaseQuery(withCount = true) {
  return publicCatalogue
    .from('products')
    .select(PRODUCT_COLUMNS, withCount ? { count: 'exact' } : undefined)
    .eq('is_published', true);
}

/**
 * Every sort puts in-stock products first, so sold-out ones sink to the end
 * of a listing whatever order the shopper picked (N-053).
 *
 * Postgres does not guarantee row order for equal sort keys, so every sort
 * ends with `id` as a tiebreaker. Without it, "load more" pagination can
 * show the same product twice and skip another, because the second page is
 * a fresh query that is free to order the ties differently.
 */
export function applySort(query: ProductQuery, sort: NonNullable<ProductFilters['sort']>) {
  const inStockFirst = query.order('in_stock', { ascending: false });
  switch (sort) {
    case 'featured':
      return inStockFirst
        .order('is_featured', { ascending: false })
        .order('type_rank', { ascending: true })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true });
    case 'newest':
      return inStockFirst.order('created_at', { ascending: false }).order('id', { ascending: true });
    case 'price-asc':
      return inStockFirst
        .order('effective_price_cents', { ascending: true })
        .order('id', { ascending: true });
    case 'price-desc':
      return inStockFirst
        .order('effective_price_cents', { ascending: false })
        .order('id', { ascending: true });
    case 'name-asc':
      return inStockFirst.order('name', { ascending: true }).order('id', { ascending: true });
  }
}

/**
 * Shelves such as Jumble and Safety Equipment are tags rather than
 * subcategories, so a product can sit on one and in its normal aisle too.
 */
export function applyTagFilters(query: ProductQuery, filters: ProductFilters) {
  let next = query;
  if (filters.tag) next = next.contains('tags', [filters.tag]);
  if (filters.excludeTags?.length) {
    next = next.not('tags', 'ov', `{${filters.excludeTags.join(',')}}`);
  }
  return next;
}
