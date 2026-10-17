import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listFacetRows, listSearchMatchIds } from '@/data/catalog-facets-repository';
import { buildCatalogFacets } from '@/lib/catalog-facets';
import type { CatalogFacets } from '@/types/catalog-facets';
import type { ProductFilters } from '@/types/product';

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Counts for every control in the filter sidebar. One cached read of the
 * catalogue's narrow columns, then counted in the browser on each change, so
 * ticking a box updates every number without another request.
 *
 * Undefined until the rows arrive; the sidebar renders its controls without
 * counts meanwhile.
 */
export function useCatalogFacets(filters: ProductFilters): CatalogFacets | undefined {
  const rows = useQuery({
    queryKey: ['facet-rows'],
    queryFn: listFacetRows,
    staleTime: FIVE_MINUTES,
  });
  const q = filters.q;
  const searchIds = useQuery({
    queryKey: ['facet-search-ids', q],
    queryFn: () => listSearchMatchIds(q ?? ''),
    enabled: !!q,
    staleTime: FIVE_MINUTES,
  });

  return useMemo(() => {
    if (!rows.data) return undefined;
    if (q && !searchIds.data) return undefined;
    const ids = q && searchIds.data ? new Set(searchIds.data) : undefined;
    return buildCatalogFacets(rows.data, filters, ids);
  }, [rows.data, searchIds.data, q, filters]);
}
