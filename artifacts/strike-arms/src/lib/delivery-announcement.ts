import { formatPrice, formatWholeEuros } from './format-price.ts';
import type { StoreRates } from '@/types/store-settings';

/** Shown until the live rates load, so the strip never quotes a guessed figure. */
export const DELIVERY_ANNOUNCEMENT_FALLBACK = 'Delivery anywhere in the Republic of Ireland';
const DELIVERY_ANNOUNCEMENT_FALLBACK_SHORT = 'Delivery anywhere in Ireland';

export type DeliveryAnnouncement = { full: string; short: string };

/** "€120" for a round amount, "€99.50" otherwise. */
function formatThreshold(cents: number): string {
  return cents % 100 === 0 ? formatWholeEuros(cents) : formatPrice(cents);
}

/**
 * The announcement strip's line, in a full and a phone-width form, built from the same store_settings row the
 * basket and the checkout function charge from. "or more" because the
 * threshold is inclusive: an order of exactly the threshold goes free.
 */
export function deliveryAnnouncement(rates: StoreRates | undefined): DeliveryAnnouncement {
  if (!rates) {
    return { full: DELIVERY_ANNOUNCEMENT_FALLBACK, short: DELIVERY_ANNOUNCEMENT_FALLBACK_SHORT };
  }
  if (rates.freeShippingThresholdCents <= 0) {
    return { full: 'Free delivery anywhere in the Republic of Ireland', short: 'Free delivery in Ireland' };
  }
  const threshold = formatThreshold(rates.freeShippingThresholdCents);
  return {
    full: `Free delivery in Ireland on orders of ${threshold} or more`,
    short: `Free delivery on orders of ${threshold}+`,
  };
}
