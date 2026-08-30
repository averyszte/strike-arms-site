import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRefundOrder } from '@/hooks/use-refund-order';
import { useToast } from '@/hooks/use-toast';
import { REFUND_REASONS, parseRefundAmount, type RefundReason } from '@/lib/order-refund';

/**
 * Sends money back out, so nothing here is a one-click action: the amount is
 * typed, the confirmation names it, and the result is reported as what Stripe
 * said rather than as a generic success.
 */

interface Props {
  orderId: string;
  refundableCents: number;
  open: boolean;
  onClose: () => void;
}

export function OrderRefundDialog({ orderId, refundableCents, open, onClose }: Props) {
  const [amount, setAmount] = useState(() => (refundableCents / 100).toFixed(2));
  const [reason, setReason] = useState<RefundReason>('requested_by_customer');
  const [error, setError] = useState<string | null>(null);
  // One id per dialog, so a double-click is the same refund to Stripe. A
  // deliberate second refund means opening the dialog again, which is a new id
  // and a genuinely new refund.
  const [attemptId] = useState(() => crypto.randomUUID());
  const refund = useRefundOrder();
  const { toast } = useToast();

  // Live, only so the "full balance" hint can appear as it is typed.
  const preview = parseRefundAmount(amount, refundableCents);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = parseRefundAmount(amount, refundableCents);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);

    refund.mutate(
      {
        orderId,
        // Null when it is the whole outstanding balance: the server then works
        // the figure out itself from the row it just read, so a refund cannot
        // be a cent short because the browser was looking at a stale total.
        amountCents: parsed.cents === refundableCents ? null : parsed.cents,
        attemptId,
        reason,
      },
      {
        onSuccess: (result) => {
          toast({
            title: 'Refund sent to Stripe',
            description:
              `€${(result.amountCents / 100).toFixed(2)} — Stripe says ${result.status}. ` +
              'The order updates when Stripe confirms it, usually within a few seconds.',
          });
          onClose();
        },
        onError: (mutationError) => {
          setError(
            mutationError instanceof Error
              ? mutationError.message
              : 'The refund could not be sent.',
          );
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Refund this order</DialogTitle>
            <DialogDescription>
              Up to €{(refundableCents / 100).toFixed(2)} can still be refunded. The money goes back
              to the card it was taken from. Stock is not returned — do that separately if the item
              came back saleable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="refund-amount">Amount (€)</Label>
              <Input
                id="refund-amount"
                value={amount}
                inputMode="decimal"
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={!!error}
              />
              {preview.ok && preview.cents === refundableCents && (
                <p className="text-xs text-muted-foreground">
                  The full outstanding balance on this order.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">Reason</Label>
              <Select value={reason} onValueChange={(next) => setReason(next as RefundReason)}>
                <SelectTrigger id="refund-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="flex items-start gap-1.5 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={refund.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={refund.isPending}>
              {refund.isPending ? 'Sending…' : `Refund €${amount || '0.00'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
