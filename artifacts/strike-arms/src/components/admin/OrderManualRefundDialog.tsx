import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRecordManualRefund } from '@/hooks/use-record-manual-refund';
import { useToast } from '@/hooks/use-toast';
import { formatCentsPlain, formatPrice } from '@/lib/format-price';
import { parseRefundAmount } from '@/lib/order-refund';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  refundableCents: number;
  onClose: () => void;
}

/** Records money handed back outside Stripe. Moves no money itself (M-033). */
export function OrderManualRefundDialog({ order, refundableCents, onClose }: Props) {
  const [amount, setAmount] = useState(() => formatCentsPlain(refundableCents));
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const record = useRecordManualRefund();
  const { toast } = useToast();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (record.isPending) return;
    const parsed = parseRefundAmount(amount, refundableCents);
    if (!parsed.ok) return setError(parsed.error);
    const trimmed = note.trim();
    if (!trimmed) return setError('Say why the money was handed back.');
    setError(null);
    record.mutate(
      { orderId: order.id, amountCents: parsed.cents, note: trimmed },
      {
        onSuccess: result => {
          toast({
            title: 'Refund recorded',
            description: `${formatPrice(result.refundCents)} refunded on this order in total.`,
          });
          onClose();
        },
        onError: e => setError(e.message),
      },
    );
  }

  return (
    <Dialog open onOpenChange={open => !open && !record.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record a manual refund</DialogTitle>
            <DialogDescription>
              For cash or goodwill already handed back. Nothing is sent to Stripe. Up to{' '}
              {formatPrice(refundableCents)} can be recorded.
              {order.paymentMethod === 'stripe' &&
                ' This order was paid by card online: use Refund above to send money back to the card.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="manual-refund-amount">Amount (€)</Label>
              <Input
                id="manual-refund-amount"
                value={amount}
                inputMode="decimal"
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-refund-note">Note</Label>
              <Textarea
                id="manual-refund-note"
                value={note}
                maxLength={500}
                placeholder="For example, cash back at the till, item returned"
                onChange={e => setNote(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={record.isPending}>
              Go back
            </Button>
            <Button type="submit" disabled={record.isPending}>
              {record.isPending ? 'Recording...' : 'Record refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
