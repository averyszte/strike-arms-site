import { createContext, useContext } from 'react';

import type { CartContextValue } from '@/types/cart';

/** Provided by components/cart/cart-provider.tsx, filled by useCartState. */
export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
