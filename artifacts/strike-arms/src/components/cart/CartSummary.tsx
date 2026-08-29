import { Info } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/format-price';
import { FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/shipping';
import type { CartTotals } from '@/types/cart';

type CartSummaryProps = {
  totals: CartTotals;
  wantsDelivery: boolean;
};

export function CartSummary({ totals, wantsDelivery }: CartSummaryProps) {
  const isDelivering = wantsDelivery && totals.hasShippableItems;
  const shortfall = FREE_SHIPPING_THRESHOLD_CENTS - totals.deliverableSubtotalCents;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">Order summary</h2>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Items</dt>
          <dd className="tabular-nums text-foreground">
            {formatPrice(totals.itemsSubtotalCents)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="tabular-nums text-foreground">
            {isDelivering
              ? totals.shippingCents === 0
                ? 'Free'
                : formatPrice(totals.shippingCents)
              : 'Collection'}
          </dd>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between text-base font-semibold">
          <dt className="text-foreground">Total</dt>
          <dd className="tabular-nums text-foreground">{formatPrice(totals.totalCents)}</dd>
        </div>

        <div className="flex justify-between text-xs">
          <dt className="text-muted-foreground">Includes VAT</dt>
          <dd className="tabular-nums text-muted-foreground">{formatPrice(totals.vatCents)}</dd>
        </div>
      </dl>

      {isDelivering && totals.shippingCents > 0 && shortfall > 0 && (
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Add {formatPrice(shortfall)} more of deliverable items for free delivery.
        </p>
      )}
    </div>
  );
}
