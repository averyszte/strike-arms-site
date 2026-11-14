import { useQuery } from "@tanstack/react-query";

import { listProducts } from "@/data/products-repository";
import { EVOLUTION_TAG } from "@/lib/evolution-band";
import { PRODUCT_KEYS, STALE_TIME_HALF_HOUR } from "@/lib/query-keys";
import type { Product } from "@/types/product";

const BAND_LIMIT = 12;

/**
 * Published Evolution rifles for the homepage band, cheapest first. Driven by
 * the shelf tag rather than a slug list, so a rifle joins the band as soon as
 * it is tagged and published. An empty list means the band stays hidden.
 */
export function useEvolutionProducts(): { products: Product[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: PRODUCT_KEYS.evolutionBand,
    queryFn: () => listProducts({ tag: EVOLUTION_TAG, sort: "price-asc", pageSize: BAND_LIMIT }),
    staleTime: STALE_TIME_HALF_HOUR,
  });
  return { products: query.data?.items ?? [], isLoading: query.isLoading };
}
