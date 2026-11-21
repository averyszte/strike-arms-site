import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { loadCart, saveCart } from '@/data/cart-storage-repository';
import { sendEcommerceEvent } from '@/data/google-tag-manager-client';
import { buildEcommercePayload } from '@/lib/analytics-ecommerce';
import { canAddToCart, MAX_QUANTITY_PER_LINE } from '@/lib/cart-limits';
import { calculateCartBasics } from '@/lib/cart-totals';
import type { CartContextValue, CartLine } from '@/types/cart';

const noSubscription = () => () => {};

/** False while hydrating a prerendered page, true from the next render on. */
function useIsHydrated(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, Math.floor(quantity)));
}

/**
 * The basket, held in the browser and persisted to localStorage. Called once,
 * by CartProvider; everything else reads it through useCart().
 * `isHydrating`: see App's prop of the same name.
 */
export function useCartState(isHydrating = false): CartContextValue {
  // A prerendered page was built with an empty basket, so while hydrating it
  // the first render must be empty too; the stored basket loads on the render
  // straight after. Otherwise it is read up front, so the cart page never
  // flashes empty.
  const [lines, setLines] = useState<CartLine[]>(() => (isHydrating ? [] : loadCart()));
  const [hasLoaded, setHasLoaded] = useState(!isHydrating);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const isHydrated = useIsHydrated();

  // Set during render, not in an effect: React re-renders at once, before
  // anything is painted with the empty basket.
  if (isHydrated && !hasLoaded) {
    setHasLoaded(true);
    setLines(loadCart());
  }

  useEffect(() => {
    // Never save the placeholder empty basket over the stored one.
    if (hasLoaded) saveCart(lines);
  }, [lines, hasLoaded]);

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity = 1) => {
      if (!canAddToCart(lines, line.productId)) return false;
      sendEcommerceEvent('add_to_cart', buildEcommercePayload([{ ...line, quantity }]));
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
