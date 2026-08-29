import { Info } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/format-price';
import type { CartBasics, CartPricing } from '@/types/cart';

type CartSummaryProps = {
  basics: CartBasics;
  /** Null until the store's delivery and VAT rates have been read. */
  pricing: CartPricing | null;
  wantsDelivery: boolean;
};

export function CartSummary({ basics, pricing, wantsDelivery }: CartSummaryProps) {
  const isDelivering = wantsDelivery && basics.hasShippableItems;

  const shortfall = pricing
    ? pricing.freeShippingThresholdCents - basics.deliverableSubtotalCents
    : 0;

  function renderDelivery() {
    if (!isDelivering) return 'Collection';
    if (!pricing) return 'Calculated at checkout';
    return pricing.shippingCents === 0 ? 'Free' : formatPrice(pricing.shippingCents);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">Order summary</h2>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Items</dt>
          <dd className="tabular-nums text-foreground">
            {formatPrice(basics.itemsSubtotalCents)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="tabular-nums text-foreground">{renderDelivery()}</dd>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="tabular-nums text-foreground">
            {pricing ? formatPrice(pricing.totalCents) : formatPrice(basics.itemsSubtotalCents)}
          </dd>
        </div>

        {pricing && (
          <div className="flex justify-between text-xs">
            <dt className="text-muted-foreground">Includes VAT</dt>
            <dd className="tabular-nums text-muted-foreground">
              {formatPrice(pricing.vatCents)}
            </dd>
          </div>
        )}
      </dl>

      {/* Never show a total that silently excludes a delivery charge we could
          not read. Saying so is better than a number the customer would find
          out was wrong at the payment page. */}
      {isDelivering && !pricing && (
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Delivery is added at checkout. You will see the full total before you pay.
        </p>
      )}

      {isDelivering && pricing && pricing.shippingCents > 0 && shortfall > 0 && (
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Add {formatPrice(shortfall)} more of deliverable items for free delivery.
        </p>
      )}
    </div>
  );
}
