import { OrdersTableRow } from '@/components/admin/OrdersTableRow';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * The orders table — the view for querying, as opposed to the board, which is
 * the view for working a shift. Filtering and fetching belong to OrdersView;
 * this renders what it is given.
 */

type OrdersTableProps = {
  orders: Order[];
  showArchived: boolean;
  onSelect: (orderId: string) => void;
  onStatusChange: (orderId: string, status: FulfillmentStatus) => void;
  onToggleArchive: (order: Order) => void;
};

export function OrdersTable({
  orders,
  showArchived,
  onSelect,
  onStatusChange,
  onToggleArchive,
}: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order #</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Payment</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fulfillment</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="sr-only">Archive</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrdersTableRow
                key={order.id}
                order={order}
                onSelect={onSelect}
                onStatusChange={onStatusChange}
                onToggleArchive={onToggleArchive}
              />
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {showArchived ? 'Nothing archived' : 'No orders found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
