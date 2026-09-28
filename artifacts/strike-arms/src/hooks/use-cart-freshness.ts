import { useQuery } from '@tanstack/react-query';

import { fetchFreshCartDetails } from '@/data/cart-freshness-repository';
import { useCart } from '@/hooks/use-cart';
import { NO_CART_CHANGES, refreshCartLines } from '@/lib/cart-refresh';
import type { CartRefreshChanges } from '@/types/cart-freshness';

/**
 * Re-reads price and postability for every basket line when the cart opens,
 * updates the saved lines, and returns what changed so the page can say so.
 *
 * One read per visit: the key does not include the lines, so a line removed
 * here does not trigger another read that would wipe the notice. The checkout
 * function prices from the database regardless, so this is about the shopper
 * seeing the right total before they pay, not what they are charged. A failed
 * read leaves the basket as it was.
 */
export function useCartFreshness(): CartRefreshChanges {
  const { lines, updateLines } = useCart();

  const { data } = useQuery({
    queryKey: ['cart-freshness'],
    queryFn: async () => {
      const fresh = await fetchFreshCartDetails(lines.map((line) => line.productId));
      // Applied to the lines as they are now, in case a quantity changed
      // while the read was out; the notice comes from the lines it read.
      updateLines((current) => refreshCartLines(current, fresh).lines);
      return refreshCartLines(lines, fresh).changes;
    },
    enabled: lines.length > 0,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return data ?? NO_CART_CHANGES;
}
