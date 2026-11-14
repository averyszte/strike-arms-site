import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { listByTarget } from '@/data/products-repository';
import { crossSellTargets } from '@/lib/cross-sell';
import { PRODUCT_KEYS, STALE_TIME_HALF_HOUR } from '@/lib/query-keys';
import { pickCrossSell } from '@/lib/rank-related';
import type { Product } from '@/types/product';

/** The "things that go with it" row under a product. */

/** Per shelf, not in total -- enough to fill the row if other shelves are bare. */
const PER_SHELF = 6;

export function useCrossSellProducts(product: Product, limit: number): Product[] {
  const targets = useMemo(() => crossSellTargets(product), [product]);

  // One query per shelf rather than one covering all of them. A pooled query
  // has a single limit, and the cheapest shelf would happily fill it -- a rifle
  // offered six kinds of BB and no battery. Each key names the shelf and
  // nothing else, so every product pointing at that shelf shares one answer.
  const results = useQueries({
    queries: targets.map((target) => ({
      queryKey: PRODUCT_KEYS.shelf(target, PER_SHELF),
      queryFn: () => listByTarget(target, PER_SHELF),
      // Add-ons change far more slowly than the page is read.
      staleTime: STALE_TIME_HALF_HOUR,
    })),
  });

  // Not memoised: useQueries hands back a fresh array every render, so a memo
  // here would need a key built from the pool to be worth anything, and the
  // sort it guards runs over a few dozen items.
  const pool = results.flatMap((result) => result.data ?? []);
  return pickCrossSell(product, pool, targets, limit);
}
