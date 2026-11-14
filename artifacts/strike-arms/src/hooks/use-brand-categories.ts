import { useQuery } from '@tanstack/react-query';
import { listBrandCategories } from '@/data/products-repository';
import { CATALOGUE_KEYS, STALE_TIME_FIVE_MINUTES } from '@/lib/query-keys';

export function useBrandCategories(brand: string) {
  return useQuery({
    queryKey: CATALOGUE_KEYS.brandCategories(brand),
    queryFn: () => listBrandCategories(brand),
    staleTime: STALE_TIME_FIVE_MINUTES,
  });
}
