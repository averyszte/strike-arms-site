/**
 * Storefront product reads — backed by Supabase.
 *
 * Every query here is anonymous-facing and pins `is_published = true`.
 * RLS already restricts anonymous callers to published rows, but an admin
 * browsing the public shop passes the "admin read all products" policy and
 * would otherwise see drafts. The explicit filter makes the storefront show
 * the same catalogue to everyone.
 *
 * Admin reads and writes live in admin-products-repository.ts.
 */

import { supabase } from '@/lib/supabase';
import { rowToProduct } from '@/lib/product-mappers';
import { escapeSearchTerm } from '@/lib/escape-search-term';
import { BRAND_NAMES, isListedBrand } from '@/lib/brands';
import type { CrossSellTarget } from '@/lib/cross-sell';
import type { Product, ProductFilters, ProductListResult, Category } from '@/types/product';
import { PRODUCT_COLUMNS, applySort, applyTagFilters, buildBaseQuery } from '@/data/product-query';

/** Rows the header dropdown asks for. It has room to show six. */
const SEARCH_RESULT_LIMIT = 6;

// ─── Read operations ──────────────────────────────────────────────────────────

export async function listProducts(filters: ProductFilters): Promise<ProductListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;

  let query = buildBaseQuery();

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);
  if (filters.brands?.length) query = query.in('brand', filters.brands);
  // Price filters compare against the price a shopper pays (the sale price
  // when there is one), the same price the cards show and the sidebar's
  // range is built from (catalog-facets-repository.ts).
  if (filters.minPrice !== undefined) query = query.gte('effective_price_cents', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('effective_price_cents', filters.maxPrice);
  if (filters.inStockOnly) query = query.eq('in_stock', true);
  if (filters.onSaleOnly) query = query.not('sale_price_cents', 'is', null);
  if (filters.isNewOnly) query = query.eq('is_new', true);
  if (filters.condition) query = query.eq('condition', filters.condition);
  query = applyTagFilters(query, filters);

  if (filters.q) {
    const term = escapeSearchTerm(filters.q);
    // One filter against the generated search_text column (migration 015),
    // which is name, brand, blurb and tags in one string. It used to be a
    // three-column `.or()` that could not reach tags -- so the header dropdown
    // could offer a product that "View all results" then failed to list.
    if (term) query = query.ilike('search_text', `%${term}%`);
  }

  query = applySort(query, filters.sort ?? 'featured');

  // "Load more" pagination: always fetch from index 0 up to page * pageSize,
  // so incrementing page in the URL appends without a separate accumulator.
  const { data, error, count } = await query.range(0, page * pageSize - 1);
  if (error) throw error;

  return {
    items: (data ?? []).map(rowToProduct),
    total: count ?? 0,
    page,
    pageSize,
  };
}

/**
 * Ranked results for the header search dropdown.
 *
 * This used to download the published catalogue -- capped at 500 rows -- and
 * score it in the browser. That is fine at 56 products and breaks quietly at
 * 501: the dropdown stops being able to see the tail of the catalogue and
 * nothing says so. The ranking now happens in the database, over all of it.
 *
 * Two characters is checked here as well as in the function. The point is not
 * belt and braces -- it is that a one-character query would otherwise cost a
 * round trip to be told nothing.
 */
export async function searchCatalogue(
  query: string,
  limit = SEARCH_RESULT_LIMIT,
): Promise<Product[]> {
  const term = escapeSearchTerm(query);
  if (term.length < 2) return [];

  const { data, error } = await supabase.rpc('search_products', {
    p_query: term,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

/**
 * The top few products on one named shelf -- the add-ons offered beside the
 * product being viewed.
 *
 * One shelf per call rather than all of them at once. A single pooled query
 * ordered by price would happily come back as twenty-four packets of BBs and
 * nothing else, leaving a rifle with no battery to suggest. Asking per shelf
 * also means the answer is cached per shelf, so it is shared by every product
 * that offers it rather than being refetched for each one.
 *
 * The category and subcategory come from the cross-sell map, never from a URL.
 */
export async function listByTarget(target: CrossSellTarget, limit: number): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_published', true)
    .eq('category', target.category)
    .eq('subcategory', target.subcategory)
    .order('in_stock', { ascending: false })
    .order('effective_price_cents', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

/** Published products for a hand-picked list of slugs, in no particular order. */
export async function listProductsBySlugs(slugs: string[]): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .in('slug', slugs)
    .eq('is_published', true);

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

/**
 * Brand facet counts. PostgREST cannot group, so the brand column alone is
 * fetched and tallied here — one narrow column, not the whole catalogue.
 */
export async function listBrands(
  category?: Category,
): Promise<{ slug: string; name: string; count: number }[]> {
  let query = supabase.from('products').select('brand').eq('is_published', true);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!isListedBrand(row.brand)) continue;
    counts.set(row.brand, (counts.get(row.brand) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([slug, count]) => ({ slug, name: BRAND_NAMES[slug] ?? slug, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Which shelves one brand appears on, and how many products on each.
 *
 * Counted server-side across the whole brand rather than derived from the page
 * of products already on screen: a brand with more products than fit on one
 * page would otherwise show a category list that quietly omits the rest.
 */
export async function listBrandCategories(
  brand: string,
): Promise<{ category: Category; count: number }[]> {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_published', true)
    .eq('brand', brand);

  if (error) throw error;

  const counts = new Map<Category, number>();
  for (const row of data ?? []) {
    const category = row.category as Category;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
