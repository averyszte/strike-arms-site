import { useMutation } from '@tanstack/react-query';

import { bulkUpdateProducts } from '@/data/admin-products-repository';
import { useInvalidateProducts } from '@/hooks/use-invalidate-products';
import type { ProductBulkPatch } from '@/types/product';

export function useBulkUpdateProducts() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ ids, patch }: { ids: string[]; patch: ProductBulkPatch }) =>
      bulkUpdateProducts(ids, patch),
    onSuccess: invalidate,
  });
}
