import { IdCard } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatOrderNumber } from '@/lib/order-display';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  open: boolean;
  onClose: () => void;
  /** Moves the order to collected and records the check. */
  onConfirm: () => void;
}

/**
 * The photo-ID step at handover (N-084, PD10).
 *
 * The checkout tick is the customer saying they are 18 or over; Terms,
 * Delivery and the collection email say ID is checked when the order is
 * collected. This is where that happens, and confirming records who checked
 * and when (migration 050). "Go back" leaves the order as it was.
 */
export function OrderIdCheckDialog({ order, open, onClose, onConfirm }: Props) {
  const number = formatOrderNumber(order.orderNumber);

  return (
    <AlertDialog open={open} onOpenChange={next => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 shrink-0" aria-hidden="true" />
            Photo ID checked for {number}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The customer only ticked "18 or over" online. Before handing the order over, check
            photo ID for the person collecting it. Confirming records your name and the time on
            the order.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            ID checked, mark collected
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
