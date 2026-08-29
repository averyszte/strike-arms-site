import { Store, Truck } from 'lucide-react';

import { FULFILLMENT_METHOD_LABELS } from '@/lib/order-display';
import type { Order } from '@/types/order';

/**
 * How this order is handed over, and where it is going.
 *
 * A mixed order is the case worth being explicit about: part of it is posted
 * and part is held at the shop, so packing from the address alone would send
 * the wrong things.
 */
export function OrderDeliveryDetails({ order }: { order: Order }) {
  const address = order.shippingAddress;

  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Fulfilment
      </h3>

      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        {order.fulfillmentMethod === 'pickup' ? (
          <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        {FULFILLMENT_METHOD_LABELS[order.fulfillmentMethod]}
      </p>

      {order.fulfillmentMethod === 'mixed' && (
        <p className="mt-1 text-xs text-muted-foreground">
          Post the delivery lines below and hold the collect-in-store lines at the shop.
        </p>
      )}

      {address && (
        <address className="mt-2 text-sm not-italic text-muted-foreground leading-relaxed">
          {[
            address.name,
            address.line1,
            address.line2,
            address.city,
            address.county,
            address.eircode,
          ]
            .filter(Boolean)
            .map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
        </address>
      )}
    </section>
  );
}
