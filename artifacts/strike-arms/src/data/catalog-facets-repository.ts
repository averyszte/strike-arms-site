/**
 * Reads behind the shop's filter sidebar.
 *
 * PostgREST cannot group, so the narrow columns of every published product
 * are fetched once and counted in the browser (lib/catalog-facets.ts). At a
 * few hundred products that is one small request, cached by React Query, and
 * it lets every count respond instantly to every filter.
 */

import { supabase } from '@/lib/supabase';
import { escapeSearchTerm } from '@/lib/escape-search-term';
import { toProductCondition } from '@/lib/product-condition';
import type { FacetRow } from '@/types/catalog-facets';

/** The hosted API returns at most 1000 rows a request, so read in pages. */
const PAGE_ROWS = 1000;

const FACET_COLUMNS =
  'id, category, subcategory, brand, condition, price_cents, sale_price_cents, in_stock';

type FacetDbRow = {
  id: string;
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  price_cents: number;
  sale_price_cents: number | null;
  in_stock: boolean;
};

function toFacetRow(row: FacetDbRow): FacetRow {
  return {
    id: row.id,
    category: row.category,
    subcategory: row.subcategory,
    brand: row.brand,
    condition: toProductCondition(row.condition) ?? 'new',
    priceCents: row.price_cents,
    inStock: row.in_stock,
    isOnSale: row.sale_price_cents !== null,
  };
}

export async function listFacetRows(): Promise<FacetRow[]> {
  const rows: FacetRow[] = [];
  for (let from = 0; ; from += PAGE_ROWS) {
    const { data, error } = await supabase
      .from('products')
      .select(FACET_COLUMNS)
      .eq('is_published', true)
      .order('id', { ascending: true })
      .range(from, from + PAGE_ROWS - 1);
    if (error) throw error;
    const page = (data ?? []) as FacetDbRow[];
    rows.push(...page.map(toFacetRow));
    if (page.length < PAGE_ROWS) return rows;
  }
}

/**
 * Ids of the published products a search term matches, using the same
 * search_text filter as listProducts so the counts agree with the grid.
 */
export async function listSearchMatchIds(q: string): Promise<string[]> {
  const term = escapeSearchTerm(q);
  if (!term) return [];
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('is_published', true)
    .ilike('search_text', `%${term}%`);
  if (error) throw error;
  return (data ?? []).map((row: { id: string }) => row.id);
}
