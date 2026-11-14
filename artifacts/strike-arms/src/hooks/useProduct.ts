import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/data/products-repository';
import { PRODUCT_KEYS } from '@/lib/query-keys';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(slug),
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  });
}
