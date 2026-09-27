import {
  useBulkFulfillmentStatus,
  useBulkSetArchived,
  useSetOrderArchived,
  useUpdateFulfillmentStatus,
} from '@/hooks/use-orders';
import { useOrdersExport } from '@/hooks/use-orders-export';
import { useToast } from '@/hooks/use-toast';
import { loadErrorMessage } from '@/lib/load-error-message';
import type { FulfillmentStatus, Order, OrderListFilters } from '@/types/order';

/**
 * The writes the orders screen makes, with their toasts. `selectedIds` and
 * `onDone` are the table's row selection; the board never selects rows.
 */

type OrdersActionsInput = {
  filters: OrderListFilters;
  showArchived: boolean;
  selectedIds: string[];
  onDone: () => void;
};

export function useOrdersActions({ filters, showArchived, selectedIds, onDone }: OrdersActionsInput) {
  const updateStatus = useUpdateFulfillmentStatus();
  const setArchived = useSetOrderArchived();
  const bulkArchive = useBulkSetArchived();
  const bulkStatus = useBulkFulfillmentStatus();
  const { exportOrders, isExporting } = useOrdersExport();
  const { toast } = useToast();

  function failed(description: string, error?: unknown) {
    const reason = error === undefined ? '' : ` ${loadErrorMessage(error)}`;
    toast({ title: 'Error', description: `${description}.${reason}`, variant: 'destructive' });
  }

  async function changeStatus(orderId: string, status: FulfillmentStatus) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch (error) {
      failed('Status not changed', error);
    }
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

  async function bulkToggleArchive() {
    const orderIds = selectedIds;
    try {
      await bulkArchive.mutateAsync({ orderIds, isArchived: !showArchived });
      onDone();
      toast({
        title: showArchived ? 'Orders restored' : 'Orders archived',
        description: `${orderIds.length} updated. Archived orders still count towards revenue.`,
      });
    } catch {
      failed('Failed to update the selected orders');
    }
  }

  async function bulkChangeStatus(status: FulfillmentStatus) {
    const orderIds = selectedIds;
    try {
      await bulkStatus.mutateAsync({ orderIds, status });
      onDone();
      toast({ title: 'Orders updated', description: `${orderIds.length} changed.` });
    } catch (error) {
      // Chunked, so orders before the refused one may already have moved.
      failed('Not every selected order was changed', error);
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
    isMoving: updateStatus.isPending,
    isBulkPending: bulkArchive.isPending || bulkStatus.isPending,
    isExporting,
    changeStatus: (orderId: string, status: FulfillmentStatus) =>
      void changeStatus(orderId, status),
    toggleArchive: (order: Order) => void toggleArchive(order),
    bulkToggleArchive: () => void bulkToggleArchive(),
    bulkChangeStatus: (status: FulfillmentStatus) => void bulkChangeStatus(status),
    exportCsv: () => void exportCsv(),
  };
}
