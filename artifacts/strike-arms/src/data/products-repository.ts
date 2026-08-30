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
import { BRAND_NAMES } from '@/lib/brands';
import type { CrossSellTarget } from '@/lib/cross-sell';
import type { Product, ProductFilters, ProductListResult, Category } from '@/types/product';

/** Ceiling on the header search-dropdown pool. See fetchAllForSearch. */
const SEARCH_POOL_LIMIT = 500;

type ProductQuery = ReturnType<typeof buildBaseQuery>;

function buildBaseQuery() {
  return supabase.from('products').select('*', { count: 'exact' }).eq('is_published', true);
}

/**
 * Postgres does not guarantee row order for equal sort keys, so every sort
 * ends with `id` as a tiebreaker. Without it, "load more" pagination can
 * show the same product twice and skip another, because the second page is
 * a fresh query that is free to order the ties differently.
 */
function applySort(query: ProductQuery, sort: NonNullable<ProductFilters['sort']>) {
  switch (sort) {
    case 'featured':
      return query
        .order('is_featured', { ascending: false })
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

// ─── Read operations ──────────────────────────────────────────────────────────

export async function listProducts(filters: ProductFilters): Promise<ProductListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;

  let query = buildBaseQuery();

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);
  if (filters.brand) query = query.eq('brand', filters.brand);
  // Price filters compare against the list price, matching the price shown on
  // the filter control itself.
  if (filters.minPrice !== undefined) query = query.gte('price_cents', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('price_cents', filters.maxPrice);
  if (filters.inStockOnly) query = query.eq('in_stock', true);
  if (filters.onSaleOnly) query = query.not('sale_price_cents', 'is', null);
  if (filters.isNewOnly) query = query.eq('is_new', true);

  if (filters.q) {
    const term = escapeSearchTerm(filters.q);
    if (term) {
      // Tags are excluded: matching inside a text[] needs a different operator
      // and the array is not indexed for it. Name, brand and blurb cover the
      // cases the store search page is actually used for.
      query = query.or(
        `name.ilike.%${term}%,brand.ilike.%${term}%,short_description.ilike.%${term}%`,
      );
    }
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
 * Pool for the header's live search dropdown, which scores and ranks in the
 * browser. Capped, because this is a whole-catalogue download: past the cap
 * the dropdown silently stops seeing the tail of the catalogue, and search
 * needs to move to a server-side query before the catalogue gets that big.
 */
export async function fetchAllForSearch(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('name', { ascending: true })
    .limit(SEARCH_POOL_LIMIT);

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
    .select('*')
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
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
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
