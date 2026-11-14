import { useQuery } from '@tanstack/react-query';
import { listBrands } from '@/data/products-repository';
import { CATALOGUE_KEYS, STALE_TIME_FIVE_MINUTES } from '@/lib/query-keys';
import type { Category } from '@/types/product';

export function useBrands(category?: Category) {
  return useQuery({
    queryKey: CATALOGUE_KEYS.brands(category),
    queryFn: () => listBrands(category),
    staleTime: STALE_TIME_FIVE_MINUTES,
  });
}
