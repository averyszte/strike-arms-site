import { useQuery } from "@tanstack/react-query";

import { listProducts } from "@/data/products-repository";
import { EVOLUTION_TAG } from "@/lib/evolution-band";
import type { Product } from "@/types/product";

const HALF_HOUR = 30 * 60 * 1000;
const BAND_LIMIT = 12;

/**
 * Published Evolution rifles for the homepage band, cheapest first. Driven by
 * the shelf tag rather than a slug list, so a rifle joins the band as soon as
 * it is tagged and published. An empty list means the band stays hidden.
 */
export function useEvolutionProducts(): { products: Product[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ["evolution-band-products"],
    queryFn: () => listProducts({ tag: EVOLUTION_TAG, sort: "price-asc", pageSize: BAND_LIMIT }),
    staleTime: HALF_HOUR,
  });
  return { products: query.data?.items ?? [], isLoading: query.isLoading };
}
