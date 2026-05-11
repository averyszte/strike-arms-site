import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/data/products-repository';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
}
