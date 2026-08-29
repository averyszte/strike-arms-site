import { Store, Truck } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BUSINESS } from '@/lib/site-config';

type FulfillmentChoiceProps = {
  wantsDelivery: boolean;
  hasShippableItems: boolean;
  hasPickupItems: boolean;
  onChange: (wantsDelivery: boolean) => void;
};

/**
 * Guns are collect-in-store only under our shop policy, so a basket
 * containing one is always at least partly a collection. Saying so here,
 * before the customer enters an address, is the whole point of the control.
 */
export function FulfillmentChoice({
  wantsDelivery,
  hasShippableItems,
  hasPickupItems,
  onChange,
}: FulfillmentChoiceProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">How would you like it?</h2>

      <RadioGroup
        className="mt-4 space-y-3"
        value={wantsDelivery ? 'delivery' : 'pickup'}
        onValueChange={(value) => onChange(value === 'delivery')}
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem value="pickup" id="fulfilment-pickup" className="mt-1" />
          <Label htmlFor="fulfilment-pickup" className="cursor-pointer font-normal">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Store className="h-4 w-4" aria-hidden="true" />
              Collect in store
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Pick everything up at {BUSINESS.addressLocality}. We will email you when it is ready.
            </span>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <RadioGroupItem
            value="delivery"
            id="fulfilment-delivery"
            className="mt-1"
            disabled={!hasShippableItems}
          />
          <Label
            htmlFor="fulfilment-delivery"
            className={`cursor-pointer font-normal ${hasShippableItems ? '' : 'opacity-60'}`}
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Truck className="h-4 w-4" aria-hidden="true" />
              Deliver to me
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {hasShippableItems
                ? 'Delivery across Ireland.'
                : 'Nothing in your cart can be posted.'}
            </span>
          </Label>
        </div>
      </RadioGroup>

      {wantsDelivery && hasShippableItems && hasPickupItems && (
        <p className="mt-4 rounded border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          Some items in your cart are collect-in-store only and will be held for you at the shop.
          The rest will be posted to the address you give below.
        </p>
      )}
    </div>
  );
}
