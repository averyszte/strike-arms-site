/**
 * Published product counts per shelf, from the catalogue_counts view
 * (migration 047). The header menus need only these totals, so they read
 * the grouped view rather than every product row. The shop's filter sidebar
 * still reads the rows (catalog-facets-repository.ts), because its counts
 * change with each ticked filter.
 */

import { supabase } from '@/data/supabase-client';

/** Keyed `rifles` and `rifles/aeg-rifles`, the same keys countShelves uses. */
export async function listShelfCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('catalogue_counts')
    .select('facet, category, subcategory, product_count')
    .in('facet', ['category', 'subcategory']);
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (!row.category) continue;
    const key = row.facet === 'category' ? row.category : `${row.category}/${row.subcategory}`;
    counts[key] = row.product_count;
  }
  return counts;
}
