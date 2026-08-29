import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format-price';
import { ORDER_CHANNEL_LABELS, formatOrderNumber } from '@/lib/order-display';
import { statusLabel } from '@/lib/order-board';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * One order on the board.
 *
 * There is a single button and it moves the order one lane forward. Corrections
 * and cancellations are done in the detail sheet behind a click on the card,
 * where every state is listed and choosing one is deliberate.
 */

type OrderBoardCardProps = {
  order: Order;
  nextStatus: FulfillmentStatus | null;
  isMoving: boolean;
  onSelect: (orderId: string) => void;
  onAdvance: (order: Order, status: FulfillmentStatus) => void;
};

export function OrderBoardCard({
  order,
  nextStatus,
  isMoving,
  onSelect,
  onAdvance,
}: OrderBoardCardProps) {
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        className="w-full cursor-pointer rounded-md border border-border bg-background p-3 text-left transition-colors hover:bg-muted/40"
        onClick={() => onSelect(order.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(order.id);
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-xs font-medium text-foreground">
            {formatOrderNumber(order.orderNumber)}
          </p>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {formatPrice(order.totalCents)}
          </p>
        </div>

        <p className="mt-1 truncate text-sm text-foreground">{order.customerName}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {format(new Date(order.createdAt), 'dd MMM')}
          </span>
          {order.channel !== 'web' && (
            <Badge variant="outline" className="text-[10px]">
              {ORDER_CHANNEL_LABELS[order.channel]}
            </Badge>
          )}
          {/* An unpaid order on the board is the one thing here that must not
              be handed over. It gets the loud badge. */}
          {order.paymentStatus !== 'paid' && (
            <Badge variant="destructive" className="text-[10px] capitalize">
              {order.paymentStatus.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>

        {nextStatus && (
          <div className="mt-2.5" onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 w-full text-xs"
              disabled={isMoving}
              onClick={() => onAdvance(order, nextStatus)}
            >
              {statusLabel(nextStatus)}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
