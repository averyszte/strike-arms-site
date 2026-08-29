import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { calculateCartBasics } from '@/lib/cart-totals';
import { loadCart, saveCart } from '@/lib/cart-storage';
import type { CartBasics, CartLine } from '@/types/cart';

/**
 * The basket, held in the browser and persisted to localStorage.
 *
 * This is the same deliberate exception as auth-context.tsx: a React context
 * lives in lib/ because it is app-wide state rather than a component or a
 * data-fetching hook.
 */

const MAX_QUANTITY_PER_LINE = 20;

export interface CartContextValue {
  lines: CartLine[];
  basics: CartBasics;
  wantsDelivery: boolean;
  setWantsDelivery: (wants: boolean) => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(MAX_QUANTITY_PER_LINE, Math.floor(quantity)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [wantsDelivery, setWantsDelivery] = useState(false);

  useEffect(() => {
    saveCart(lines);
  }, [lines]);

  const addLine = useCallback(
    (line: Omit<CartLine, 'quantity'>, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((entry) => entry.productId === line.productId);
        if (!existing) return [...current, { ...line, quantity: clampQuantity(quantity) }];

        return current.map((entry) =>
          entry.productId === line.productId
            ? { ...entry, ...line, quantity: clampQuantity(entry.quantity + quantity) }
            : entry,
        );
      });
    },
    [],
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

  const basics = useMemo(
    () => calculateCartBasics(lines, wantsDelivery),
    [lines, wantsDelivery],
  );

  const value = useMemo(
    () => ({
      lines,
      basics,
      wantsDelivery,
      setWantsDelivery,
      addLine,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, basics, wantsDelivery, addLine, setQuantity, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
