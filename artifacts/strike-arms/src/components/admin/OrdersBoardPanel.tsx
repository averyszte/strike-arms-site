import { OrdersBoard } from '@/components/admin/OrdersBoard';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * The board, plus a line under it when it is not showing every order. The
 * board is never paged (see BOARD_PAGE_SIZE in OrdersView), so that line is
 * the only sign that older orders exist.
 */

type OrdersBoardPanelProps = {
  orders: Order[];
  total: number;
  isMoving: boolean;
  isTableForced: boolean;
  onSelect: (orderId: string) => void;
  onAdvance: (order: Order, status: FulfillmentStatus) => void;
  onOpenTable: () => void;
};

export function OrdersBoardPanel({
  orders,
  total,
  isMoving,
  isTableForced,
  onSelect,
  onAdvance,
  onOpenTable,
}: OrdersBoardPanelProps) {
  return (
    <>
      <OrdersBoard orders={orders} isMoving={isMoving} onSelect={onSelect} onAdvance={onAdvance} />
      {total > orders.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing the {orders.length} most recent of {total}.{' '}
          {!isTableForced && (
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-2"
              onClick={onOpenTable}
            >
              Open the table to see the rest.
            </button>
          )}
        </p>
      )}
    </>
  );
}
