import { useQuery } from '@tanstack/react-query';
import { listProducts, listBrands, listBrandCategories } from '@/data/products-repository';
import type { Category, ProductFilters } from '@/types/product';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => listProducts(filters),
    placeholderData: (prev) => prev,
  });
}

export function useBrands(category?: Category) {
  return useQuery({
    queryKey: ['brands', category],
    queryFn: () => listBrands(category),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandCategories(brand: string) {
  return useQuery({
    queryKey: ['brand-categories', brand],
    queryFn: () => listBrandCategories(brand),
    staleTime: 5 * 60 * 1000,
  });
}
