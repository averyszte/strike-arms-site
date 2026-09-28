import { useState } from 'react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { CounterOrderSheet } from '@/components/admin/CounterOrderSheet';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { OrdersBoardPanel } from '@/components/admin/OrdersBoardPanel';
import { OrdersTablePanel } from '@/components/admin/OrdersTablePanel';
import { OrdersToolbar } from '@/components/admin/OrdersToolbar';
import { useOrdersActions } from '@/hooks/use-orders-actions';
import { useOrdersFilters } from '@/hooks/use-orders-filters';
import { useOrdersPage } from '@/hooks/use-orders-page';
import { useOrdersView } from '@/hooks/use-orders-view';
import { useRowSelection } from '@/hooks/use-row-selection';

/**
 * The orders screen: filters, the table or the board, and the sheets both open.
 *
 * The two views share one set of filters and one selected order on purpose —
 * switching view should not lose your place or quietly change what you are
 * looking at. Ticking rows for a bulk action is the table's job only; the
 * board is for moving one order at a time.
 */

export function OrdersView() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

  const { view, setView, isTableForced } = useOrdersView();
  const filterState = useOrdersFilters();
  const { page, showArchived, filters, setPage } = filterState;

  const isBoard = view === 'board';
  const list = useOrdersPage(filterState, isBoard);
  const { orders, total, isFetching } = list;

  const selection = useRowSelection(orders);
  const actions = useOrdersActions({
    filters,
    showArchived,
    selectedIds: selection.selectedIds,
    onDone: selection.clear,
  });

  return (
    <>
      <OrdersToolbar
        view={view}
        isTableForced={isTableForced}
        showArchived={showArchived}
        paymentFilter={filterState.payment}
        fulfillmentFilter={filterState.fulfillment}
        needsAttention={filterState.needsAttention}
        query={filterState.query}
        selectedCount={selection.selectedIds.length}
        isExporting={actions.isExporting}
        onViewChange={setView}
        onToggleArchived={filterState.toggleArchived}
        onPaymentFilterChange={filterState.setPayment}
        onFulfillmentFilterChange={filterState.setFulfillment}
        onNeedsAttentionChange={filterState.setNeedsAttention}
        onQueryChange={filterState.setQuery}
        onNewCounterSale={() => setIsCounterSaleOpen(true)}
        onExport={actions.exportCsv}
      />

      {list.isError ? (
        <AdminLoadError
          what="the orders"
          error={list.error}
          isRetrying={isFetching}
          onRetry={() => void list.refetch()}
        />
      ) : list.isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      ) : isBoard ? (
        <OrdersBoardPanel
          orders={orders}
          total={total}
          isMoving={actions.isMoving}
          isTableForced={isTableForced}
          onSelect={setSelectedOrderId}
          onAdvance={(order, status) => actions.changeStatus(order.id, status)}
          onOpenTable={() => setView('table')}
        />
      ) : (
        <OrdersTablePanel
          orders={orders}
          total={total}
          page={page}
          showArchived={showArchived}
          isFetching={isFetching}
          selection={selection}
          actions={actions}
          onSelect={setSelectedOrderId}
          onPageChange={setPage}
        />
      )}

      <OrderDetailSheet orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      <CounterOrderSheet open={isCounterSaleOpen} onClose={() => setIsCounterSaleOpen(false)} />
    </>
  );
}
