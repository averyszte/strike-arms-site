import { useMemo } from 'react';

import { rankSimilar } from '@/lib/rank-related';
import type { RelatedRow } from '@/types/related-row';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product';

/**
 * The "things like it" row under a product.
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

export function useSimilarProducts(product: Product, limit: number): RelatedRow {
  const shelf = useProducts({
    category: product.category,
    subcategory: product.subcategory,
    pageSize: POOL,
  });
  const wider = useProducts({ category: product.category, pageSize: POOL });

  const shelfItems = shelf.data?.items;
  const widerItems = wider.data?.items;

  const isLoading = shelf.isPending || wider.isPending;
  const products = useMemo(() => {
    const seen = new Set<string>();
    const pool: Product[] = [];
    for (const candidate of [...(shelfItems ?? []), ...(widerItems ?? [])]) {
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      pool.push(candidate);
    }
    return rankSimilar(product, pool, limit);
  }, [product, shelfItems, widerItems, limit]);

  return { products, isLoading };
}
