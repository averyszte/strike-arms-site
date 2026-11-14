import { useBulkFulfillmentStatus } from '@/hooks/use-bulk-fulfillment-status';
import { useBulkSetArchived } from '@/hooks/use-bulk-set-archived';
import { useToast } from '@/hooks/use-toast';
import { failedItemsMessage } from '@/lib/admin-error-message';
import { loadErrorMessage } from '@/lib/load-error-message';
import { formatOrderNumber } from '@/lib/order-display';
import type { FulfillmentStatus, Order } from '@/types/order';

type OrdersBulkActionsInput = {
  showArchived: boolean;
  selectedIds: string[];
  /** The orders on screen, so a bulk failure can name the ones that did not change (M-040). */
  orders: Order[];
  onDone: () => void;
};

/** Names the orders a chunked write refused, by order number (M-040). */
function bulkFailedDescription(orders: Order[], description: string, error: unknown): string {
  const numbers = new Map(orders.map(o => [o.id, formatOrderNumber(o.orderNumber)]));
  return failedItemsMessage(error, id => numbers.get(id), `${description}. ${loadErrorMessage(error)}`);
}

/** The orders table's writes to a whole selection, with their toasts. */
export function useOrdersBulkActions({ showArchived, selectedIds, orders, onDone }: OrdersBulkActionsInput) {
  const bulkArchive = useBulkSetArchived();
  const bulkStatus = useBulkFulfillmentStatus();
  const { toast } = useToast();

  function bulkFailed(description: string, error: unknown) {
    toast({ title: 'Error', description: bulkFailedDescription(orders, description, error), variant: 'destructive' });
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
    } catch (error) {
      bulkFailed('Failed to update the selected orders', error);
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
      bulkFailed('Not every selected order was changed', error);
    }
  }

  return {
    isBulkPending: bulkArchive.isPending || bulkStatus.isPending,
    bulkToggleArchive: () => void bulkToggleArchive(),
    bulkChangeStatus: (status: FulfillmentStatus) => void bulkChangeStatus(status),
  };
}
