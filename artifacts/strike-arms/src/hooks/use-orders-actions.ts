import { useSetOrderArchived } from '@/hooks/use-set-order-archived';
import { useFulfilmentChange } from '@/hooks/use-fulfilment-change';
import { useOrdersBulkActions } from '@/hooks/use-orders-bulk-actions';
import { useOrdersExport } from '@/hooks/use-orders-export';
import { useToast } from '@/hooks/use-toast';
import { adminErrorMessage } from '@/lib/admin-error-message';
import type { Order, OrderListFilters } from '@/types/order';

/**
 * The writes the orders screen makes, with their toasts. `selectedIds` and
 * `onDone` are the table's row selection; the board never selects rows.
 */

type OrdersActionsInput = {
  filters: OrderListFilters;
  showArchived: boolean;
  selectedIds: string[];
  /** The orders on screen, so a bulk failure can name the ones that did not change (M-040). */
  orders: Order[];
  onDone: () => void;
};

export function useOrdersActions({ filters, showArchived, selectedIds, orders, onDone }: OrdersActionsInput) {
  const statusChange = useFulfilmentChange();
  const setArchived = useSetOrderArchived();
  const bulk = useOrdersBulkActions({ showArchived, selectedIds, orders, onDone });
  const { exportOrders, isExporting } = useOrdersExport();
  const { toast } = useToast();

  function failed(description: string, error?: unknown) {
    const reason = error === undefined ? '' : ` ${adminErrorMessage(error)}`;
    toast({ title: 'Error', description: `${description}.${reason}`, variant: 'destructive' });
  }

  async function toggleArchive(order: Order) {
    const isArchived = !order.isArchived;
    try {
      await setArchived.mutateAsync({ orderId: order.id, isArchived });
      toast({
        title: isArchived ? 'Order archived' : 'Order restored',
        description: isArchived
          ? 'It still counts towards revenue.'
          : 'It is back in the working list.',
      });
    } catch {
      failed(isArchived ? 'Failed to archive order' : 'Failed to restore order');
    }
  }

  async function exportCsv() {
    try {
      const count = await exportOrders(filters, selectedIds);
      toast({ title: 'Export ready', description: `${count} orders written to a CSV file.` });
    } catch {
      failed('Failed to build the export');
    }
  }

  return {
    isMoving: statusChange.isMoving,
    isBulkPending: bulk.isBulkPending,
    isExporting,
    changeStatus: statusChange.change,
    toggleArchive: (order: Order) => void toggleArchive(order),
    bulkToggleArchive: bulk.bulkToggleArchive,
    bulkChangeStatus: bulk.bulkChangeStatus,
    exportCsv: () => void exportCsv(),
  };
}
