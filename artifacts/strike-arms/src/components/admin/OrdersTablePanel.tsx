import { AdminPager } from '@/components/admin/AdminPager';
import { OrdersBulkBar } from '@/components/admin/OrdersBulkBar';
import { OrdersTable } from '@/components/admin/OrdersTable';
import type { useOrdersActions } from '@/hooks/use-orders-actions';
import type { useRowSelection } from '@/hooks/use-row-selection';
import { ADMIN_PAGE_SIZE } from '@/lib/page-bounds';
import type { Order } from '@/types/order';

/** The table view of orders: the bulk bar when rows are ticked, the table, the pager. */

type OrdersTablePanelProps = {
  orders: Order[];
  total: number;
  page: number;
  showArchived: boolean;
  isFetching: boolean;
  selection: ReturnType<typeof useRowSelection<Order>>;
  actions: ReturnType<typeof useOrdersActions>;
  onSelect: (orderId: string) => void;
  onPageChange: (page: number) => void;
};

export function OrdersTablePanel({
  orders,
  total,
  page,
  showArchived,
  isFetching,
  selection,
  actions,
  onSelect,
  onPageChange,
}: OrdersTablePanelProps) {
  const selectedCount = selection.selectedIds.length;

  return (
    <>
      {selectedCount > 0 && (
        <OrdersBulkBar
          selectedCount={selectedCount}
          isArchivedView={showArchived}
          isPending={actions.isBulkPending}
          onClear={selection.clear}
          onStatusChange={actions.bulkChangeStatus}
          onToggleArchive={actions.bulkToggleArchive}
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
        onSelect={onSelect}
        onStatusChange={actions.changeStatus}
        onToggleArchive={actions.toggleArchive}
      />
      <AdminPager
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        total={total}
        noun="orders"
        isFetching={isFetching}
        onPageChange={onPageChange}
      />
    </>
  );
}
