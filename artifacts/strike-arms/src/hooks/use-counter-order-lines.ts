import { useMemo, useState } from 'react';

import { resolveCounterLines } from '@/lib/counter-order-totals';
import type { CounterOrderLine } from '@/types/order';
import type { Product } from '@/types/product';

/** The products on a counter sale being rung up, resolved against the catalogue. */
export function useCounterOrderLines(products: Product[]) {
  const [lines, setLines] = useState<CounterOrderLine[]>([]);

  const resolved = useMemo(() => resolveCounterLines(lines, products), [lines, products]);
  const addedIds = useMemo(
    () => new Set(resolved.map((line) => line.productId)),
    [resolved],
  );

  function addProduct(product: Product) {
    setLines((current) => [
      ...current,
      {
        productId: product.id,
        quantity: 1,
        // Collection is the safe default: it is the only method every product
        // supports, and it is what actually happens at a counter.
        fulfillmentMethod: 'pickup',
      },
    ]);
  }

  function patchLine(productId: string, update: Partial<CounterOrderLine>) {
    setLines((current) =>
      current.map((line) => (line.productId === productId ? { ...line, ...update } : line)),
    );
  }

  function removeLine(productId: string) {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }

  return { resolved, addedIds, addProduct, patchLine, removeLine, clearLines: () => setLines([]) };
}
