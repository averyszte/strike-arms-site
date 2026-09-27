import { format } from 'date-fns';
import { Archive, ArchiveRestore } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderFulfilmentSelect } from '@/components/admin/OrderFulfilmentSelect';
import { ORDER_CHANNEL_LABELS, formatOrderNumber } from '@/lib/order-display';
import { formatPrice } from '@/lib/format-price';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * One line of the orders table.
 *
 * Split out of OrdersTable when the archive column arrived — the table was
 * already close to the file limit and the row is the half that keeps growing.
 */

type OrdersTableRowProps = {
  order: Order;
  isSelected: boolean;
  onToggleSelect: (orderId: string) => void;
  onSelect: (orderId: string) => void;
  onStatusChange: (orderId: string, status: FulfillmentStatus) => void;
  onToggleArchive: (order: Order) => void;
};

export function OrdersTableRow({
  order,
  isSelected,
  onToggleSelect,
  onSelect,
  onStatusChange,
  onToggleArchive,
}: OrdersTableRowProps) {
  return (
    <tr
      className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
      onClick={() => onSelect(order.id)}
    >
      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(order.id)}
          aria-label={`Select order ${formatOrderNumber(order.orderNumber)}`}
        />
      </td>

      <td className="px-4 py-3">
        <p className="font-mono font-medium text-foreground">
          {formatOrderNumber(order.orderNumber)}
        </p>
        {order.channel !== 'web' && (
          <p className="text-xs text-muted-foreground">{ORDER_CHANNEL_LABELS[order.channel]}</p>
        )}
      </td>

      <td className="px-4 py-3">
        <p className="text-foreground">{order.customerName}</p>
        {/* A cash walk-in may have given neither. */}
        <p className="text-xs text-muted-foreground">
          {order.customerEmail ?? order.customerPhone ?? 'No contact details'}
        </p>
      </td>

      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
        {format(new Date(order.createdAt), 'dd MMM yyyy')}
      </td>

      <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.totalCents)}</td>

      <td className="px-4 py-3 text-center">
        <Badge
          variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}
          className="text-[10px] capitalize"
        >
          {order.paymentStatus.replace(/_/g, ' ')}
        </Badge>
      </td>

      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <OrderFulfilmentSelect
          order={order}
          onChange={(status) => onStatusChange(order.id, status)}
        />
      </td>

      <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={
            order.isArchived
              ? `Restore order ${formatOrderNumber(order.orderNumber)}`
              : `Archive order ${formatOrderNumber(order.orderNumber)}`
          }
          onClick={() => onToggleArchive(order)}
        >
          {order.isArchived ? (
            <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Archive className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </td>
    </tr>
  );
}
