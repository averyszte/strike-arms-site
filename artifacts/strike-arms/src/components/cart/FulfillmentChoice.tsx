import { Store, Truck } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DELIVERY_PAUSED_LINE, IS_DELIVERY_ENABLED } from '@/lib/delivery-availability';
import { ADDRESS_LINES, openingHoursLines } from '@/lib/shop-location';
import { DELIVERY_TIME_LINE, SHIPPING_LINE_POSTABLE } from '@/lib/site-config';
import { CARD_TITLE, PANEL } from '@/lib/storefront-styles';

type FulfillmentChoiceProps = {
  wantsDelivery: boolean;
  hasShippableItems: boolean;
  hasPickupItems: boolean;
  onChange: (wantsDelivery: boolean) => void;
};

/**
 * Every product can be posted unless Alan marks one collection-only in the
 * admin, so a basket holding one of those is always at least partly a
 * collection. Saying so here, before the customer enters an address, is the
 * whole point of the control.
 */
export function FulfillmentChoice({
  wantsDelivery,
  hasShippableItems,
  hasPickupItems,
  onChange,
}: FulfillmentChoiceProps) {
  const canDeliver = IS_DELIVERY_ENABLED && hasShippableItems;
  const hours = openingHoursLines()
    .map((line) => `${line.days} ${line.hours}`)
    .join(', ');

  return (
    <div className={`${PANEL} p-5`}>
      <h2 id="fulfilment-heading" className={`${CARD_TITLE} text-lg`}>How would you like it?</h2>
      {!IS_DELIVERY_ENABLED && (
        <p className="mt-2 text-sm font-semibold text-accent">{DELIVERY_PAUSED_LINE}</p>
      )}

      <RadioGroup
        aria-labelledby="fulfilment-heading"
        className="mt-4 space-y-3"
        value={wantsDelivery && canDeliver ? 'delivery' : 'pickup'}
        onValueChange={(value) => onChange(value === 'delivery')}
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem value="pickup" id="fulfilment-pickup" className="mt-1" />
          <Label htmlFor="fulfilment-pickup" className="cursor-pointer font-normal">
            <span className="flex items-center gap-2 font-bold text-foreground">
              <Store className="h-4 w-4 text-accent" aria-hidden="true" />
              Collect in store
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Pick everything up at {ADDRESS_LINES.join(', ')}. We will email you when it is ready.
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">Open {hours}</span>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <RadioGroupItem
            value="delivery"
            id="fulfilment-delivery"
            className="mt-1"
            disabled={!canDeliver}
          />
          <Label
            htmlFor="fulfilment-delivery"
            className={`cursor-pointer font-normal ${canDeliver ? '' : 'cursor-not-allowed opacity-60'}`}
          >
            <span className="flex items-center gap-2 font-bold text-foreground">
              <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
              Deliver to me
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {!IS_DELIVERY_ENABLED
                ? 'Coming soon.'
                : hasShippableItems
                  ? `${SHIPPING_LINE_POSTABLE}, ${DELIVERY_TIME_LINE}.`
                  : 'Nothing in your cart can be posted.'}
            </span>
          </Label>
        </div>
      </RadioGroup>

      {wantsDelivery && canDeliver && hasPickupItems && (
        <p className="mt-4 border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
          Some items in your cart are collect-in-store only and will be held for you at the shop.
          The rest will be posted to the address you give below.
        </p>
      )}
    </div>
  );
}
