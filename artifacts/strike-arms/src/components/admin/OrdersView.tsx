import { useMemo, useState } from 'react';

import { CounterOrderSheet } from '@/components/admin/CounterOrderSheet';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { OrdersBoard } from '@/components/admin/OrdersBoard';
import { OrdersBulkBar } from '@/components/admin/OrdersBulkBar';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrdersToolbar } from '@/components/admin/OrdersToolbar';
import {
  useBulkFulfillmentStatus,
  useBulkSetArchived,
  useOrders,
  useSetOrderArchived,
  useUpdateFulfillmentStatus,
} from '@/hooks/use-orders';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import { useOrdersExport } from '@/hooks/use-orders-export';
import { useOrdersView } from '@/hooks/use-orders-view';
import { useToast } from '@/hooks/use-toast';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * The orders screen: filters, the table or the board, and the sheets both open.
 *
 * The two views share one set of filters and one selected order on purpose —
 * switching view should not lose your place or quietly change what you are
 * looking at. Ticking rows for a bulk action is the table's job only; the
 * board is for moving one order at a time.
 */

/**
 * A board split across pages would be a lie about how much work is waiting, so
 * it asks for far more rows than the table page. Alan will not approach this;
 * if he ever does, the count below the board says so.
 */
const BOARD_PAGE_SIZE = 200;

export function OrdersView() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

  const { view, setView, isTableForced } = useOrdersView();
  const {
    payment,
    fulfillment,
    showArchived,
    filters,
    setPayment,
    setFulfillment,
    toggleArchived,
  } = useOrdersFilters();

  const { data, isLoading } = useOrders({
    ...filters,
    pageSize: view === 'board' ? BOARD_PAGE_SIZE : undefined,
  });

  const orders = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const updateStatus = useUpdateFulfillmentStatus();
  const setArchived = useSetOrderArchived();
  const bulkArchive = useBulkSetArchived();
  const bulkStatus = useBulkFulfillmentStatus();
  const selection = useRowSelection(orders);
  const { exportOrders, isExporting } = useOrdersExport();
  const { toast } = useToast();

  const selectedCount = selection.selectedIds.length;

  function failed(description: string) {
    toast({ title: 'Error', description, variant: 'destructive' });
  }

  async function handleStatusChange(orderId: string, status: FulfillmentStatus) {
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } catch {
      failed('Failed to update status');
    }
  }

  async function handleToggleArchive(order: Order) {
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

  async function handleBulkArchive() {
    const orderIds = selection.selectedIds;
    try {
      await bulkArchive.mutateAsync({ orderIds, isArchived: !showArchived });
      selection.clear();
      toast({
        title: showArchived ? 'Orders restored' : 'Orders archived',
        description: `${orderIds.length} updated. Archived orders still count towards revenue.`,
      });
    } catch {
      failed('Failed to update the selected orders');
    }
  }

  async function handleBulkStatus(status: FulfillmentStatus) {
    const orderIds = selection.selectedIds;
    try {
      await bulkStatus.mutateAsync({ orderIds, status });
      selection.clear();
      toast({ title: 'Orders updated', description: `${orderIds.length} changed.` });
    } catch {
      failed('Failed to update the selected orders');
    }
  }

  async function handleExport() {
    try {
      const count = await exportOrders(filters, selection.selectedIds);
      toast({ title: 'Export ready', description: `${count} orders written to a CSV file.` });
    } catch {
      failed('Failed to build the export');
    }
  }

  return (
    <>
      <OrdersToolbar
        view={view}
        isTableForced={isTableForced}
        showArchived={showArchived}
        paymentFilter={payment}
        fulfillmentFilter={fulfillment}
        selectedCount={selectedCount}
        isExporting={isExporting}
        onViewChange={setView}
        onToggleArchived={toggleArchived}
        onPaymentFilterChange={setPayment}
        onFulfillmentFilterChange={setFulfillment}
        onNewCounterSale={() => setIsCounterSaleOpen(true)}
        onExport={() => void handleExport()}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      ) : view === 'board' ? (
        <>
          <OrdersBoard
            orders={orders}
            isMoving={updateStatus.isPending}
            onSelect={setSelectedOrderId}
            onAdvance={(order, status) => void handleStatusChange(order.id, status)}
          />
          {total > orders.length && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing the {orders.length} most recent of {total}. Use the table to see the rest.
            </p>
          )}
        </>
      ) : (
        <>
          {selectedCount > 0 && (
            <OrdersBulkBar
              selectedCount={selectedCount}
              isArchivedView={showArchived}
              isPending={bulkArchive.isPending || bulkStatus.isPending}
              onClear={selection.clear}
              onStatusChange={(status) => void handleBulkStatus(status)}
              onToggleArchive={() => void handleBulkArchive()}
            />
          )}
          <OrdersTable
            orders={orders}
            showArchived={showArchived}
            areAllSelected={selection.areAllSelected}
            areSomeSelected={selection.areSomeSelected}
            isSelected={selection.isSelected}
            onToggleSelect={selection.toggle}
            onToggleAll={selection.toggleAll}
            onSelect={setSelectedOrderId}
            onStatusChange={(orderId, status) => void handleStatusChange(orderId, status)}
            onToggleArchive={(order) => void handleToggleArchive(order)}
          />
        </>
      )}

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />

      <CounterOrderSheet open={isCounterSaleOpen} onClose={() => setIsCounterSaleOpen(false)} />
    </>
  );
}
