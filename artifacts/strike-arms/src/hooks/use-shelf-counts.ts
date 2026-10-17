import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listFacetRows } from '@/data/catalog-facets-repository';
import { countShelves } from '@/lib/catalog-facets';

/**
 * Published products per shelf, keyed `rifles` and `rifles/aeg-rifles`, for
 * the header menus. Shares the filter sidebar's cached read (same query key),
 * so the shop page does not fetch it twice. Undefined until it arrives.
 */
export function useShelfCounts(): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: ['facet-rows'],
    queryFn: listFacetRows,
    staleTime: 5 * 60 * 1000,
  });
  return useMemo(() => (data ? countShelves(data) : undefined), [data]);
}
