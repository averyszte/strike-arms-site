import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyProductImport } from '@/data/products-import-repository';
import type { ImportPlan } from '@/lib/product-import';

/**
 * Writes an import plan the admin has already approved.
 *
 * Every product cache is refreshed afterwards -- including the storefront's,
 * because a price the shop is still quoting from a stale cache is the whole
 * reason someone imported a new price list.
 */
export function useProductImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: ImportPlan) => applyProductImport(plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
}
