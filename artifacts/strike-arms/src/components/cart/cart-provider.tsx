import type { ReactNode } from 'react';

import { CartContext } from '@/hooks/use-cart';
import { useCartState } from '@/hooks/use-cart-state';

export function CartProvider({
  children,
  isHydrating = false,
}: {
  children: ReactNode;
  isHydrating?: boolean;
}) {
  const value = useCartState(isHydrating);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
