import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/data/products-repository';
import { PRODUCT_KEYS } from '@/lib/query-keys';
import type { ProductFilters } from '@/types/product';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => listProducts(filters),
    placeholderData: (prev) => prev,
  });
}
