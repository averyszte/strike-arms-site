import { calculateShippingCents, vatIncludedCents } from '@/lib/shipping';
import type { CartBasics, CartLine, CartPricing } from '@/types/cart';
import type { StoreRates } from '@/types/store-settings';

/**
 * What the cart shows. These numbers are a preview: the checkout function
 * recalculates all of them from the database before charging anything, using
 * the same arithmetic and the same store_settings row.
 */
export function calculateCartBasics(lines: CartLine[], wantsDelivery: boolean): CartBasics {
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

  return {
    itemsSubtotalCents,
    deliverableSubtotalCents,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    hasPickupItems: lines.some((line) => !line.isShippable),
    hasShippableItems: lines.some((line) => line.isShippable),
  };
}

/** The money that cannot be known until the store's rates have been read. */
export function calculateCartPricing(
  basics: CartBasics,
  wantsDelivery: boolean,
  rates: StoreRates,
): CartPricing {
  const isDelivering = wantsDelivery && basics.hasShippableItems;

  const shippingCents = isDelivering
    ? calculateShippingCents(basics.deliverableSubtotalCents, rates)
    : 0;

  const totalCents = basics.itemsSubtotalCents + shippingCents;

  return {
    shippingCents,
    totalCents,
    vatCents: vatIncludedCents(totalCents, rates),
    freeShippingThresholdCents: rates.freeShippingThresholdCents,
  };
}

/** True when the order would be part collected and part posted. */
export function isMixedBasket(lines: CartLine[], wantsDelivery: boolean): boolean {
  if (!wantsDelivery) return false;
  return lines.some((line) => line.isShippable) && lines.some((line) => !line.isShippable);
}
