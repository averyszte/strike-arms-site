import { BRAND_NAMES, isListedBrand } from '@/lib/brands';
import { PRODUCT_CONDITIONS } from '@/lib/product-condition';
import type { CatalogFacets, FacetRow } from '@/types/catalog-facets';
import type { ProductCondition, ProductFilters } from '@/types/product';

const CEILING_STEP_CENTS = 10_000; // EUR 100

/** A facet left out when counting itself, so its own options stay visible. */
type Facet = 'brand' | 'condition';

/** Most expensive price rounded up to the next EUR 100, never below EUR 100. */
export function roundPriceCeiling(maxCents: number): number {
  return Math.max(
    CEILING_STEP_CENTS,
    Math.ceil(maxCents / CEILING_STEP_CENTS) * CEILING_STEP_CENTS,
  );
}

/**
 * Mirrors listProducts in products-repository.ts. Price compares the list
 * price there too, so a count never disagrees with the grid it leads to.
 */
function matches(row: FacetRow, filters: ProductFilters, except?: Facet): boolean {
  if (filters.category && row.category !== filters.category) return false;
  if (filters.subcategory && row.subcategory !== filters.subcategory) return false;
  if (except !== 'brand' && filters.brands?.length && !filters.brands.includes(row.brand)) {
    return false;
  }
  if (except !== 'condition' && filters.condition && row.condition !== filters.condition) {
    return false;
  }
  if (filters.minPrice !== undefined && row.priceCents < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && row.priceCents > filters.maxPrice) return false;
  if (filters.inStockOnly && !row.inStock) return false;
  if (filters.onSaleOnly && !row.isOnSale) return false;
  return true;
}

export function countShelves(rows: FacetRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
    const key = `${row.category}/${row.subcategory}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function countBrands(rows: FacetRow[], filters: ProductFilters): CatalogFacets['brands'] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (isListedBrand(row.brand) && matches(row, filters, 'brand'))
      counts.set(row.brand, (counts.get(row.brand) ?? 0) + 1);
  }
  return Array.from(counts, ([slug, count]) => ({
    slug,
    name: BRAND_NAMES[slug] ?? slug,
    count,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function countConditions(rows: FacetRow[], filters: ProductFilters) {
  const counts = Object.fromEntries(PRODUCT_CONDITIONS.map((c) => [c, 0])) as Record<
    ProductCondition,
    number
  >;
  for (const row of rows) {
    if (matches(row, filters, 'condition')) counts[row.condition] += 1;
  }
  return counts;
}

/**
 * Everything the filter sidebar counts, from one list of rows.
 *
 * `searchIds` narrows to a search's matches when the shop is showing search
 * results. Shelf counts ignore it and every filter: they label navigation
 * links, which lead to the bare shelf.
 */
export function buildCatalogFacets(
  rows: FacetRow[],
  filters: ProductFilters,
  searchIds?: ReadonlySet<string>,
): CatalogFacets {
  const scoped = searchIds ? rows.filter((row) => searchIds.has(row.id)) : rows;
  const shelf = scoped.filter(
    (row) =>
      (!filters.category || row.category === filters.category) &&
      (!filters.subcategory || row.subcategory === filters.subcategory),
  );
  const maxCents = shelf.reduce((max, row) => Math.max(max, row.priceCents), 0);

  return {
    priceCeilingCents: roundPriceCeiling(maxCents),
    shelfCounts: countShelves(rows),
    brands: countBrands(scoped, filters),
    conditionCounts: countConditions(scoped, filters),
  };
}
