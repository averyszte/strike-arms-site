import { useMutation } from '@tanstack/react-query';

import { createProduct } from '@/data/admin-products-repository';
import { useInvalidateProducts } from '@/hooks/use-invalidate-products';
import type { NewProduct } from '@/types/product';

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: NewProduct) => createProduct(input),
    onSuccess: invalidate,
  });
}
