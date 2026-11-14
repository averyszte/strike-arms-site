import type { ReactNode } from 'react';

import { CartContext } from '@/hooks/use-cart';
import { useCartState } from '@/hooks/use-cart-state';

export function CartProvider({ children }: { children: ReactNode }) {
  const value = useCartState();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
