import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { needsAttention } from '@/lib/order-attention';
import type { Order } from '@/types/order';

/**
 * The top of the order sheet when the customer paid for stock that had gone.
 *
 * While the flag is open it is a destructive alert, because handing this order
 * over as if nothing happened is the mistake it exists to prevent. Once the
 * refund or the handover settles it, the reason stays visible as a quiet note:
 * it is the only record of why this order took no stock.
 */
export function OrderAttentionNotice({ order }: { order: Order }) {
  if (!order.attentionReason) return null;

  const isOpen = needsAttention(order);
  const raised = order.attentionRaisedAt
    ? format(new Date(order.attentionRaisedAt), 'dd MMM yyyy, HH:mm')
    : null;

  return (
    <Alert variant={isOpen ? 'destructive' : 'default'}>
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{isOpen ? 'Needs attention' : 'Flagged, since settled'}</AlertTitle>
      <AlertDescription>
        <p>{order.attentionReason}</p>
        {raised && <p className="mt-1 text-xs opacity-80">Raised {raised}</p>}
      </AlertDescription>
    </Alert>
  );
}
