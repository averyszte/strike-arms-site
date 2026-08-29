import { useMemo } from 'react';

import { useCart } from '@/hooks/use-cart';
import { useStoreRates } from '@/hooks/use-store-rates';
import { calculateCartPricing } from '@/lib/cart-totals';
import type { CartPricing } from '@/types/cart';

/**
 * The basket's money, once the store's rates are known.
 *
 * Returns null while the rates are loading and if they fail to load. The cart
 * shows "calculated at checkout" in that case rather than inventing a delivery
 * charge — see data/settings-repository.ts for why there is no fallback.
 */
export function useCartPricing(): CartPricing | null {
  const { basics, wantsDelivery } = useCart();
  const { data: rates } = useStoreRates();

  return useMemo(
    () => (rates ? calculateCartPricing(basics, wantsDelivery, rates) : null),
    [basics, wantsDelivery, rates],
  );
}
