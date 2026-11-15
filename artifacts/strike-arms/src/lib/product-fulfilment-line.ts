import { IS_DELIVERY_ENABLED } from '@/lib/delivery-availability';
import { SHIPPING_LINE_GUNS, SHIPPING_LINE_POSTABLE } from '@/lib/site-config';

/**
 * The one line a product page shows about how the item reaches the buyer
 * (N-058), built from the site-config constants so it matches checkout.
 * While delivery is paused, a postable item says so rather than promising
 * a delivery the basket cannot offer.
 */
export function productFulfilmentLine(isShippable: boolean): string {
  if (!isShippable) return `${SHIPPING_LINE_GUNS} only. We do not post this item.`;
  if (!IS_DELIVERY_ENABLED) return 'Collect in store in Swords, Co. Dublin. Delivery is coming soon.';
  return `${SHIPPING_LINE_POSTABLE}, or collect in store`;
}
