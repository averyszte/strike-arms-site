import { useState } from 'react';
import { Clock, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OrderRefundDialog } from '@/components/admin/OrderRefundDialog';
import { formatPrice } from '@/lib/format-price';
import {
  isRefundAwaitingOrder,
  refundEligibility,
  sentRefundMessage,
  type SentRefund,
} from '@/lib/order-refund';
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
  const [sent, setSent] = useState<SentRefund | null>(null);
  const eligibility = refundEligibility(order);
  const isAwaiting = isRefundAwaitingOrder(order, sent);

  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Refund
      </h3>

      {sent && isAwaiting && (
        <p className="mb-2 flex items-start gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-foreground">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
          <span>{sentRefundMessage(sent)}</span>
        </p>
      )}

      {!eligibility.canRefund ? (
        <p className="text-xs text-muted-foreground">{eligibility.reason}</p>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isAwaiting}
            title={isAwaiting ? 'Wait for the last refund to show on the order' : undefined}
            onClick={() => setIsOpen(true)}
          >
            <Undo2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Refund up to {formatPrice(eligibility.refundableCents)}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Sends the money back through Stripe.
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
              onSent={result =>
                setSent({
                  amountCents: result.amountCents,
                  isRecorded: result.isRecorded,
                  refundCentsBefore: order.refundCents,
                })
              }
            />
          )}
        </>
      )}
    </section>
  );
}
