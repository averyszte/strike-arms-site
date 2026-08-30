import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { listByTarget } from '@/data/products-repository';
import { crossSellTargets } from '@/lib/cross-sell';
import { pickCrossSell, rankSimilar } from '@/lib/rank-related';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product';

/**
 * The two rows under a product: things like it, and things that go with it.
 *
 * Similar products are drawn from two pools rather than one. A category ordered
 * by featured-then-newest can easily run to more rows than we would ever fetch,
 * and the products on the same shelf as this one -- the best matches there are
 * -- would not be among them. Asking for the shelf and the category separately
 * guarantees the shelf is represented, and both queries are ones the shop pages
 * already make, so they come back from cache more often than not.
 */

/** How many candidates to consider before ranking. */
const POOL = 12;
/** Per shelf, not in total -- enough to fill the row if other shelves are bare. */
const PER_SHELF = 6;

const HALF_HOUR = 30 * 60 * 1000;

export function useSimilarProducts(product: Product, limit: number): Product[] {
  const shelf = useProducts({
    category: product.category,
    subcategory: product.subcategory,
    pageSize: POOL,
  });
  const wider = useProducts({ category: product.category, pageSize: POOL });

  const shelfItems = shelf.data?.items;
  const widerItems = wider.data?.items;

  return useMemo(() => {
    const seen = new Set<string>();
    const pool: Product[] = [];
    for (const candidate of [...(shelfItems ?? []), ...(widerItems ?? [])]) {
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      pool.push(candidate);
    }
    return rankSimilar(product, pool, limit);
  }, [product, shelfItems, widerItems, limit]);
}

export function useCrossSellProducts(product: Product, limit: number): Product[] {
  const targets = useMemo(() => crossSellTargets(product), [product]);

  // One query per shelf rather than one covering all of them. A pooled query
  // has a single limit, and the cheapest shelf would happily fill it -- a rifle
  // offered six kinds of BB and no battery. Each key names the shelf and
  // nothing else, so every product pointing at that shelf shares one answer.
  const results = useQueries({
    queries: targets.map((target) => ({
      queryKey: ['shelf', target.category, target.subcategory, PER_SHELF],
      queryFn: () => listByTarget(target, PER_SHELF),
      // Add-ons change far more slowly than the page is read.
      staleTime: HALF_HOUR,
    })),
  });

  // Not memoised: useQueries hands back a fresh array every render, so a memo
  // here would need a key built from the pool to be worth anything, and the
  // sort it guards runs over a few dozen items.
  const pool = results.flatMap((result) => result.data ?? []);
  return pickCrossSell(product, pool, targets, limit);
}
