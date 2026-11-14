/**
 * Query builders shared by the storefront product reads in
 * products-repository.ts: the column list, the published-only base query,
 * the sort orders and the tag-shelf filters.
 */

import { supabase } from '@/data/supabase-client';
import type { ProductFilters } from '@/types/product';

/**
 * Exactly what rowToProduct reads (MappedProductRow), rather than `*`. One
 * literal, not a concatenation, so supabase-js can type the rows from it.
 */
export const PRODUCT_COLUMNS =
  'id,slug,name,category,subcategory,brand,condition,price_cents,sale_price_cents,images,short_description,description,in_stock,is_shippable,is_published,is_new,is_featured,is_archived,tags,created_at';

export type ProductQuery = ReturnType<typeof buildBaseQuery>;

export function buildBaseQuery() {
  return supabase.from('products').select(PRODUCT_COLUMNS, { count: 'exact' }).eq('is_published', true);
}

/**
 * Postgres does not guarantee row order for equal sort keys, so every sort
 * ends with `id` as a tiebreaker. Without it, "load more" pagination can
 * show the same product twice and skip another, because the second page is
 * a fresh query that is free to order the ties differently.
 */
export function applySort(query: ProductQuery, sort: NonNullable<ProductFilters['sort']>) {
  switch (sort) {
    case 'featured':
      return query
        .order('is_featured', { ascending: false })
        .order('type_rank', { ascending: true })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true });
    case 'newest':
      return query.order('created_at', { ascending: false }).order('id', { ascending: true });
    case 'price-asc':
      return query
        .order('effective_price_cents', { ascending: true })
        .order('id', { ascending: true });
    case 'price-desc':
      return query
        .order('effective_price_cents', { ascending: false })
        .order('id', { ascending: true });
    case 'name-asc':
      return query.order('name', { ascending: true }).order('id', { ascending: true });
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
