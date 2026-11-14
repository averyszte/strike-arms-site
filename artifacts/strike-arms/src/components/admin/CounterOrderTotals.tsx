import type { CounterOrderTotals as Totals } from '@/lib/counter-order-totals';
import { formatPrice } from '@/lib/format-price';
import { FULFILLMENT_METHOD_LABELS } from '@/lib/order-display';

/** The preview of what create_counter_order will charge. */
export function CounterOrderTotals({ totals }: { totals: Totals }) {
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Items</dt>
        <dd className="text-foreground">{formatPrice(totals.itemsSubtotalCents)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Delivery</dt>
        <dd className="text-foreground">
          {totals.isPriced ? formatPrice(totals.shippingCents) : 'Worked out on save'}
        </dd>
      </div>
      <div className="flex justify-between font-semibold">
        <dt className="text-foreground">Total</dt>
        <dd className="text-foreground">{formatPrice(totals.totalCents)}</dd>
      </div>
      {totals.isPriced && (
        <div className="flex justify-between text-xs">
          <dt className="text-muted-foreground">Includes VAT</dt>
          <dd className="text-muted-foreground">{formatPrice(totals.vatCents)}</dd>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <dt className="text-muted-foreground">Handover</dt>
        <dd className="text-muted-foreground">{FULFILLMENT_METHOD_LABELS[totals.fulfillmentMethod]}</dd>
      </div>
    </dl>
  );
}
