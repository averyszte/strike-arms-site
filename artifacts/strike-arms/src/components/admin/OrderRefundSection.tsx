import { useState } from 'react';
import { Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrderRefundDialog } from '@/components/admin/OrderRefundDialog';
import { refundEligibility } from '@/lib/order-refund';
import type { Order } from '@/types/order';

/**
 * The refund control on the order sheet.
 *
 * When an order cannot be refunded the reason is shown rather than the button
 * being quietly absent -- "there is nothing at Stripe to reverse" is a useful
 * sentence, and a missing button is not.
 */

export function OrderRefundSection({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);
  const eligibility = refundEligibility(order);

  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Refund
      </h3>

      {!eligibility.canRefund ? (
        <p className="text-xs text-muted-foreground">{eligibility.reason}</p>
      ) : (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <Undo2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Refund up to €{(eligibility.refundableCents / 100).toFixed(2)}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Sends the money back through Stripe. Stock is not returned.
          </p>
          {/* Keyed on the amount so closing and reopening builds a fresh
              dialog -- and therefore a fresh idempotency key, which is what
              makes a second, deliberate refund possible. */}
          {isOpen && (
            <OrderRefundDialog
              key={eligibility.refundableCents}
              orderId={order.id}
              refundableCents={eligibility.refundableCents}
              open={isOpen}
              onClose={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </section>
  );
}
