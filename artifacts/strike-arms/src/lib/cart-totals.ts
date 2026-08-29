import {
  calculateShippingCents,
  vatIncludedCents,
} from '@/lib/shipping';
import type { CartLine, CartTotals } from '@/types/cart';

/**
 * What the cart shows. These numbers are a preview: the checkout function
 * recalculates all of them from the database before charging anything, using
 * the same rules from shipping.ts.
 */
export function calculateCartTotals(lines: CartLine[], wantsDelivery: boolean): CartTotals {
  const itemsSubtotalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  // Guns are collect-in-store only, so asking for delivery does not make a
  // rifle deliverable, and its value must not count towards free delivery.
  const deliverableSubtotalCents = wantsDelivery
    ? lines
        .filter((line) => line.isShippable)
        .reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0)
    : 0;

  const hasShippableItems = lines.some((line) => line.isShippable);
  const hasPickupItems = lines.some((line) => !line.isShippable);
  const isDelivering = wantsDelivery && hasShippableItems;

  const shippingCents = isDelivering
    ? calculateShippingCents(deliverableSubtotalCents)
    : 0;

  const totalCents = itemsSubtotalCents + shippingCents;

  return {
    itemsSubtotalCents,
    deliverableSubtotalCents,
    shippingCents,
    totalCents,
    vatCents: vatIncludedCents(totalCents),
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    hasPickupItems,
    hasShippableItems,
  };
}

/** True when the order would be part collected and part posted. */
export function isMixedBasket(lines: CartLine[], wantsDelivery: boolean): boolean {
  if (!wantsDelivery) return false;
  return lines.some((line) => line.isShippable) && lines.some((line) => !line.isShippable);
}
