import { useCallback } from 'react';

import { useCart } from '@/hooks/use-cart';
import { addProductsToLines } from '@/lib/add-products-to-cart';
import type { AddProductsResult } from '@/lib/add-products-to-cart';
import type { Product } from '@/types/product';

/**
 * Adds one of each in-stock product to the basket in one go, for the play
 * style showcase. Returns what happened so the caller can say so.
 */
export function useAddAllToCart(): (products: readonly Product[]) => AddProductsResult {
  const { lines, updateLines } = useCart();

  return useCallback(
    (products: readonly Product[]) => {
      const result = addProductsToLines(lines, products);
      updateLines((current) => addProductsToLines(current, products).lines);
      return result;
    },
    [lines, updateLines],
  );
}
