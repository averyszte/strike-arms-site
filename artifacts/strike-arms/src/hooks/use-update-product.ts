import { useMutation } from '@tanstack/react-query';

import { updateProduct } from '@/data/admin-products-repository';
import { useInvalidateProducts } from '@/hooks/use-invalidate-products';
import { StaleProductError } from '@/lib/stale-product-error';
import type { ProductPatch } from '@/types/product';

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    // expectedUpdatedAt: the save is refused if the row moved on since (M-032).
    mutationFn: ({ id, patch, expectedUpdatedAt }: { id: string; patch: ProductPatch; expectedUpdatedAt?: string }) =>
      updateProduct(id, patch, expectedUpdatedAt),
    onSuccess: invalidate,
    // A conflict means the lists hold an old copy too; refresh them.
    onError: (error) => {
      if (error instanceof StaleProductError) invalidate();
    },
  });
}
