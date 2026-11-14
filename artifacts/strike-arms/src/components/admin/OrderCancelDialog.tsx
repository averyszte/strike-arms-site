import { useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useRefundOrder } from '@/hooks/use-refund-order';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/format-price';
import { formatOrderNumber } from '@/lib/order-display';
import { refundEligibility } from '@/lib/order-refund';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  open: boolean;
  onClose: () => void;
  /** Moves the order to cancelled. Called after the refund, when there is one. */
  onCancel: () => void;
}

const WAS_PAID = new Set(['paid', 'partially_refunded']);

/**
 * Cancelling is never one click (M-030). A paid order offers the refund in
 * the same step, refunded first so the cancellation email can say the money
 * is on its way. A cash sale cannot be refunded here, so it says how instead.
 */
export function OrderCancelDialog({ order, open, onClose, onCancel }: Props) {
  const refund = useRefundOrder();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [attemptId] = useState(() => crypto.randomUUID());
  const isInFlight = useRef(false);
  const isPaid = WAS_PAID.has(order.paymentStatus);
  const eligibility = refundEligibility(order);
  const number = formatOrderNumber(order.orderNumber);

  function cancelOnly() {
    onCancel();
    onClose();
  }

  function cancelAndRefund() {
    if (isInFlight.current) return;
    isInFlight.current = true;
    setError(null);
    refund.mutate(
      { orderId: order.id, amountCents: null, attemptId, reason: 'requested_by_customer' },
      {
        onSuccess: result => {
          toast({
            title: result.isRecorded ? 'Refunded and cancelled' : 'Refund sent, recording pending',
            description: `${formatPrice(result.amountCents)} is going back to the customer.`,
          });
          cancelOnly();
        },
        onError: e => setError(e instanceof Error ? e.message : 'The refund could not be sent.'),
        onSettled: () => {
          isInFlight.current = false;
        },
      },
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={next => !next && !refund.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order {number}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isPaid
              ? 'This order has been paid for. Cancelling does not give the money back by itself.'
              : 'The customer is emailed that the order is cancelled. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isPaid && !eligibility.canRefund && (
          <p className="text-sm text-muted-foreground">
            {eligibility.reason} Then record it with "Record a manual refund" on the order.
          </p>
        )}

        {error && (
          <p className="flex items-start gap-1.5 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error} The order has not been cancelled.</span>
          </p>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={refund.isPending}>Go back</AlertDialogCancel>
          <Button
            type="button"
            variant={isPaid && eligibility.canRefund ? 'outline' : 'destructive'}
            disabled={refund.isPending}
            onClick={cancelOnly}
          >
            {isPaid ? 'Cancel only' : 'Cancel order'}
          </Button>
          {isPaid && eligibility.canRefund && (
            <Button type="button" variant="destructive" disabled={refund.isPending} onClick={cancelAndRefund}>
              {refund.isPending
                ? 'Refunding...'
                : `Cancel and refund ${formatPrice(eligibility.refundableCents)}`}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
