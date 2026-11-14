import { useQuery } from '@tanstack/react-query';
import { listShelfCounts } from '@/data/catalogue-counts-repository';

/**
 * Published products per shelf, keyed `rifles` and `rifles/aeg-rifles`, for
 * the header menus. One small grouped read (catalogue_counts, migration 047)
 * instead of the whole catalogue. Undefined until it arrives.
 */
export function useShelfCounts(): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: ['shelf-counts'],
    queryFn: listShelfCounts,
    staleTime: 5 * 60 * 1000,
  });
  return data;
}
