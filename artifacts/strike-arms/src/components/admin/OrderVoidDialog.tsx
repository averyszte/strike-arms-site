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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useVoidCounterOrder } from '@/hooks/use-void-counter-order';
import { useToast } from '@/hooks/use-toast';
import { formatOrderNumber } from '@/lib/order-display';
import { formatPrice } from '@/lib/format-price';
import type { Order } from '@/types/order';

/** Undoes today's counter sale: refunds it in the books and cancels it (M-033). */
export function OrderVoidDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const voidSale = useVoidCounterOrder();
  const { toast } = useToast();
  const trimmed = reason.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!trimmed || voidSale.isPending) return;
    setError(null);
    voidSale.mutate(
      { orderId: order.id, reason: trimmed },
      {
        onSuccess: result => {
          toast({
            title: `Sale ${formatOrderNumber(result.orderNumber)} voided`,
            description: `${formatPrice(result.refundedCents)} taken off the takings. Put any stock back by hand.`,
          });
          onClose();
        },
        onError: e => setError(e.message),
      },
    );
  }

  return (
    <Dialog open onOpenChange={open => !open && !voidSale.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Void sale {formatOrderNumber(order.orderNumber)}?</DialogTitle>
            <DialogDescription>
              For a sale rung up by mistake. It is marked refunded in full and cancelled, and comes
              off the takings. Give back any cash by hand.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-4">
            <Label htmlFor="void-reason">Why is it being voided?</Label>
            <Textarea
              id="void-reason"
              value={reason}
              maxLength={500}
              onChange={e => setReason(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={voidSale.isPending}>
              Go back
            </Button>
            <Button type="submit" variant="destructive" disabled={!trimmed || voidSale.isPending}>
              {voidSale.isPending ? 'Voiding...' : 'Void sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
