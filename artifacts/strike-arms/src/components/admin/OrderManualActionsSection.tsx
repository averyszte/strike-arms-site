import { useState } from 'react';
import { Ban, HandCoins } from 'lucide-react';

import { OrderManualRefundDialog } from '@/components/admin/OrderManualRefundDialog';
import { OrderVoidDialog } from '@/components/admin/OrderVoidDialog';
import { Button } from '@/components/ui/button';
import { canVoidCounterOrder, manualRefundableCents } from '@/lib/order-manual-actions';
import type { Order } from '@/types/order';

/**
 * Money handed back outside Stripe, and a counter sale rung up by mistake
 * (M-033). Both go through audited RPCs so revenue stays true.
 */
export function OrderManualActionsSection({ order }: { order: Order }) {
  const [now] = useState(() => new Date());
  const [dialog, setDialog] = useState<'void' | 'refund' | null>(null);
  const canVoid = canVoidCounterOrder(order, now);
  const refundableCents = manualRefundableCents(order);

  if (!canVoid && refundableCents === 0) return null;

  return (
    <section className="border-t border-border pt-4">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Outside Stripe
      </h3>
      <div className="flex flex-wrap gap-2">
        {canVoid && (
          <Button type="button" variant="outline" size="sm" onClick={() => setDialog('void')}>
            <Ban className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Void this sale
          </Button>
        )}
        {refundableCents > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setDialog('refund')}>
            <HandCoins className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Record a manual refund
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {canVoid
          ? 'Voiding undoes a sale rung up by mistake today. A manual refund records cash or goodwill handed back.'
          : 'For cash or goodwill handed back in the shop. It does not move any money.'}
      </p>

      {dialog === 'void' && <OrderVoidDialog order={order} onClose={() => setDialog(null)} />}
      {dialog === 'refund' && (
        <OrderManualRefundDialog
          order={order}
          refundableCents={refundableCents}
          onClose={() => setDialog(null)}
        />
      )}
    </section>
  );
}
