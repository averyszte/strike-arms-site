import { useQuery } from '@tanstack/react-query';
import { listShelfCounts } from '@/data/catalogue-counts-repository';
import { CATALOGUE_KEYS, STALE_TIME_FIVE_MINUTES } from '@/lib/query-keys';

/**
 * Published products per shelf, keyed `rifles` and `rifles/aeg-rifles`, for
 * the header menus. One small grouped read (catalogue_counts, migration 047)
 * instead of the whole catalogue. Undefined until it arrives.
 */
export function useShelfCounts(): Record<string, number> | undefined {
  const { data } = useQuery({
    queryKey: CATALOGUE_KEYS.shelfCounts,
    queryFn: listShelfCounts,
    staleTime: STALE_TIME_FIVE_MINUTES,
  });
  return data;
}
