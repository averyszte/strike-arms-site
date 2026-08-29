import { useMemo, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderBoardCard } from '@/components/admin/OrderBoardCard';
import { FULFILLMENT_METHOD_LABELS } from '@/lib/order-display';
import {
  ORDER_BOARD_KEYS,
  boardOrders,
  buildOrderBoardLanes,
  nextBoardStatus,
  type OrderBoardKey,
  type OrderLane,
} from '@/lib/order-board';
import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * The orders board — one column per stage, one card per order.
 *
 * Collection and delivery are separate boards because they are separate jobs.
 * The tabs carry counts so the one with work in it is obvious without opening
 * it.
 */

type OrdersBoardProps = {
  orders: Order[];
  isMoving: boolean;
  onSelect: (orderId: string) => void;
  onAdvance: (order: Order, status: FulfillmentStatus) => void;
};

type LaneColumnProps = {
  lane: OrderLane;
  board: OrderBoardKey;
  isMoving: boolean;
  onSelect: (orderId: string) => void;
  onAdvance: (order: Order, status: FulfillmentStatus) => void;
};

function LaneColumn({ lane, board, isMoving, onSelect, onAdvance }: LaneColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-md bg-muted/40 p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {lane.label}
        </h3>
        <span className="text-xs tabular-nums text-muted-foreground">{lane.orders.length}</span>
      </div>

      {lane.orders.length === 0 ? (
        <p className="px-1 py-6 text-center text-xs text-muted-foreground">Nothing here</p>
      ) : (
        <ul className="space-y-2">
          {lane.orders.map((order) => (
            <OrderBoardCard
              key={order.id}
              order={order}
              nextStatus={nextBoardStatus(board, order.fulfillmentStatus)}
              isMoving={isMoving}
              onSelect={onSelect}
              onAdvance={onAdvance}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrdersBoard({ orders, isMoving, onSelect, onAdvance }: OrdersBoardProps) {
  const [board, setBoard] = useState<OrderBoardKey>('pickup');

  const counts = useMemo(
    () =>
      ORDER_BOARD_KEYS.map((key) => ({ key, count: boardOrders(orders, key).length })),
    [orders],
  );

  const { lanes, unplaced } = useMemo(() => buildOrderBoardLanes(orders, board), [orders, board]);

  return (
    <div>
      <Tabs value={board} onValueChange={(value) => setBoard(value as OrderBoardKey)}>
        <TabsList>
          {counts.map(({ key, count }) => (
            <TabsTrigger key={key} value={key}>
              {FULFILLMENT_METHOD_LABELS[key]}
              <span className="ml-1.5 tabular-nums text-muted-foreground">{count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-3 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {lanes.map((lane) => (
            <LaneColumn
              key={lane.status}
              lane={lane}
              board={board}
              isMoving={isMoving}
              onSelect={onSelect}
              onAdvance={onAdvance}
            />
          ))}
        </div>
      </div>

      {unplaced.length > 0 && (
        <div className="mt-3 rounded-md border border-dashed border-border p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Not on this board
          </h3>
          {/* Reachable by setting a delivery order to "ready for pickup" from
              the table. Better shown in an odd box than dropped in silence. */}
          <p className="mt-1 text-xs text-muted-foreground">
            These have a status that does not belong to this board. Open one to correct it.
          </p>
          <ul className="mt-2 space-y-2">
            {unplaced.map((order) => (
              <OrderBoardCard
                key={order.id}
                order={order}
                nextStatus={null}
                isMoving={isMoving}
                onSelect={onSelect}
                onAdvance={onAdvance}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
