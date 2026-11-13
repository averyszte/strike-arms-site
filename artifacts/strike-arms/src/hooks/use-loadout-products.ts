import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { listProductsBySlugs } from '@/data/products-repository';
import { LOADOUT_SLUGS } from '@/lib/loadouts';
import type { Product } from '@/types/product';

const HALF_HOUR = 30 * 60 * 1000;

/**
 * The catalogue rows behind every play style, keyed by slug. One query covers
 * all tabs so switching tabs never waits. A slug that is missing from the map
 * is unpublished or renamed, and the showcase leaves that card out.
 */
export function useLoadoutProducts(): { bySlug: Map<string, Product>; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['loadout-products', LOADOUT_SLUGS],
    queryFn: () => listProductsBySlugs(LOADOUT_SLUGS),
    staleTime: HALF_HOUR,
  });

  const bySlug = useMemo(
    () => new Map((query.data ?? []).map((product) => [product.slug, product])),
    [query.data],
  );

  return { bySlug, isLoading: query.isLoading };
}
