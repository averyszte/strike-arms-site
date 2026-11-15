import { useToast } from '@/hooks/use-toast';
import { useUpdateFulfillmentStatus } from '@/hooks/use-update-fulfillment-status';
import { adminErrorMessage } from '@/lib/admin-error-message';
import { statusChangeFeedback } from '@/lib/fulfilment-feedback';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * Moves one order's fulfilment status, with the toasts for every outcome.
 *
 * Shared by the table, the board and the detail sheet so the three say the
 * same thing (N-082): what it was marked, and whether the customer is being
 * emailed. A recorded photo-ID check is confirmed too, and one that failed to
 * record after the move says so rather than vanishing (N-084).
 */
export function useFulfilmentChange() {
  const update = useUpdateFulfillmentStatus();
  const { toast } = useToast();

  async function change(order: Order, status: FulfillmentStatus, isIdChecked = false) {
    try {
      const { idCheckError } = await update.mutateAsync({
        orderId: order.id,
        status,
        isIdChecked,
      });
      if (idCheckError) {
        toast({
          title: 'Marked collected, ID check not recorded',
          description: `${adminErrorMessage(idCheckError)} Add a note on the order that ID was checked.`,
          variant: 'destructive',
        });
        return;
      }
      toast(statusChangeFeedback(order, status, isIdChecked));
    } catch (error) {
      toast({
        title: 'Status not changed',
        description: adminErrorMessage(error),
        variant: 'destructive',
      });
    }
  }

  return {
    isMoving: update.isPending,
    change: (order: Order, status: FulfillmentStatus, isIdChecked?: boolean) =>
      void change(order, status, isIdChecked),
  };
}
