import type { Category, ProductFilters } from '@/types/product';

const VALID_SORTS = ['featured', 'newest', 'price-asc', 'price-desc', 'name-asc'] as const;

/**
 * Parse URL search string into ProductFilters.
 * `category` and `subcategory` come from the route path params (not the search
 * string) so they are passed in separately and merged into the result.
 */
export function parseFiltersFromSearch(
  search: string,
  category?: Category,
  subcategory?: string,
): ProductFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const sort = params.get('sort');
  const page = params.get('page');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  return {
    category,
    subcategory,
    brand: params.get('brand') ?? undefined,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    inStockOnly: params.get('inStockOnly') === '1',
    onSaleOnly: params.get('onSaleOnly') === '1',
    sort: sort && (VALID_SORTS as readonly string[]).includes(sort)
      ? (sort as ProductFilters['sort'])
      : undefined,
    page: page ? Math.max(1, parseInt(page, 10)) : 1,
    pageSize: 24,
  };
}

/**
 * Convert ProductFilters back to URLSearchParams for writing to the URL.
 * `category` and `subcategory` are encoded in the route path, not the search string.
 */
export function filtersToSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.brand) params.set('brand', filters.brand);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.inStockOnly) params.set('inStockOnly', '1');
  if (filters.onSaleOnly) params.set('onSaleOnly', '1');
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));

  return params;
}

/**
 * Returns true when any non-navigation filter is active (brand, price, stock, sale).
 * Category and subcategory are URL-path navigation — not counted as "filters".
 */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return !!(
    filters.brand ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStockOnly ||
    filters.onSaleOnly
  );
}
