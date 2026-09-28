import type { Order } from '@/types/order';

function fmtEuros(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * The read-only middle of the order sheet: what was bought, what it came to,
 * and any note. Split out of OrderDetailSheet so the sheet keeps the actions.
 */
export function OrderLinesSummary({ order }: { order: Order }) {
  return (
    <>
      {(order.items?.length ?? 0) > 0 && (
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Items
          </h3>
          <div className="space-y-2">
            {order.items!.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtEuros(item.unitPriceCents)} × {item.quantity}
                    {' · '}
                    {item.fulfillmentMethod === 'delivery' ? 'Post' : 'Collect'}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">
                  {fmtEuros(item.subtotalCents)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-border pt-4 space-y-1.5">
        {order.shippingCents > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Delivery</span>
            <span>{fmtEuros(order.shippingCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>VAT</span>
          <span>{fmtEuros(order.vatCents)}</span>
        </div>
        {order.refundCents > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Refunded</span>
            <span>−{fmtEuros(order.refundCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>Total</span>
          <span>{fmtEuros(order.totalCents)}</span>
        </div>
      </section>

      {order.notes && (
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Notes
          </h3>
          <p className="text-sm text-muted-foreground">{order.notes}</p>
        </section>
      )}
    </>
  );
}
