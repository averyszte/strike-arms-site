import { useMutation } from '@tanstack/react-query';

import { applyProductImport } from '@/data/products-import-repository';
import { useInvalidateProducts } from '@/hooks/use-invalidate-products';
import type { ImportPlan } from '@/lib/product-import';

/**
 * Writes an import plan the admin has already approved.
 *
 * Every product cache is refreshed afterwards -- including the storefront's,
 * because a price the shop is still quoting from a stale cache is the whole
 * reason someone imported a new price list.
 */
export function useProductImport() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (plan: ImportPlan) => applyProductImport(plan),
    onSuccess: invalidate,
  });
}
