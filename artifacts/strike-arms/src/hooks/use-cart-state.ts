import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadCart, saveCart } from '@/data/cart-storage-repository';
import { canAddToCart, MAX_QUANTITY_PER_LINE } from '@/lib/cart-limits';
import { calculateCartBasics } from '@/lib/cart-totals';
import type { CartContextValue, CartLine } from '@/types/cart';

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, Math.floor(quantity)));
}

/**
 * The basket, held in the browser and persisted to localStorage. Called once,
 * by CartProvider; everything else reads it through useCart().
 */
export function useCartState(): CartContextValue {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [wantsDelivery, setWantsDelivery] = useState(false);

  useEffect(() => {
    saveCart(lines);
  }, [lines]);

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity = 1) => {
      if (!canAddToCart(lines, line.productId)) return false;
      setLines((current) => {
        const existing = current.find((entry) => entry.productId === line.productId);
        if (!existing) return [...current, { ...line, quantity: clampQuantity(quantity) }];

        return current.map((entry) =>
          entry.productId === line.productId
            ? { ...entry, ...line, quantity: clampQuantity(entry.quantity + quantity) }
            : entry,
        );
      });
      return true;
    },
    [lines],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity < 1
        ? current.filter((entry) => entry.productId !== productId)
        : current.map((entry) =>
            entry.productId === productId
              ? { ...entry, quantity: clampQuantity(quantity) }
              : entry,
          ),
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((current) => current.filter((entry) => entry.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);
  const updateLines = useCallback(
    (update: (current: CartLine[]) => CartLine[]) => setLines(update),
    [],
  );

  const basics = useMemo(
    () => calculateCartBasics(lines, wantsDelivery),
    [lines, wantsDelivery],
  );

  return useMemo(
    () => ({
      lines,
      basics,
      wantsDelivery,
      setWantsDelivery,
      addLine,
      setQuantity,
      removeLine,
      clearCart,
      updateLines,
    }),
    [lines, basics, wantsDelivery, addLine, setQuantity, removeLine, clearCart, updateLines],
  );
}
