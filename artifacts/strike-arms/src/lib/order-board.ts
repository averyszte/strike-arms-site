import { FULFILLMENT_OPTIONS } from '@/lib/order-display';
import type { FulfillmentMethod, FulfillmentStatus, Order } from '@/types/order';

/**
 * Lane definitions for the order board.
 *
 * A table is for querying and a board is for working a shift, so the two show
 * the same orders arranged for different jobs. Collection and delivery are
 * separate boards because they are separate pieces of work with almost no
 * overlap: nobody packs a parcel for a customer who is standing in the shop.
 *
 * Mixed orders get a third board rather than appearing on both. An order has
 * one fulfillment_status, so a mixed order cannot be "packed" for its delivery
 * half and "ready for pickup" for its collection half at the same time.
 * Showing it twice would imply the two halves move independently when they do
 * not. Tracking them separately needs a status per half in the schema, which is
 * a decision rather than a detail.
 */

export type OrderBoardKey = FulfillmentMethod;

export const ORDER_BOARD_KEYS: OrderBoardKey[] = ['pickup', 'delivery', 'mixed'];

/**
 * Cancelled orders are absent from every board. The board is a to-do list, and
 * a cancelled order is not something to do — the table still finds it.
 */
const BOARD_LANES: Record<OrderBoardKey, FulfillmentStatus[]> = {
  pickup: ['pending', 'ready_for_pickup', 'collected'],
  delivery: ['pending', 'packed', 'shipped', 'delivered'],
  mixed: ['pending', 'packed', 'ready_for_pickup', 'shipped', 'collected', 'delivered'],
};

const STATUS_LABELS = new Map(FULFILLMENT_OPTIONS.map((option) => [option.value, option.label]));

export type OrderLane = {
  status: FulfillmentStatus;
  label: string;
  orders: Order[];
};

export type OrderBoardLanes = {
  lanes: OrderLane[];
  /**
   * Orders on this board whose status is not one of its lanes — a delivery
   * order marked "ready for pickup", say. Nothing stops that being set from
   * the table, and a card that silently vanished would be worse than one in a
   * box labelled odd.
   */
  unplaced: Order[];
};

export function statusLabel(status: FulfillmentStatus): string {
  return STATUS_LABELS.get(status) ?? status;
}

export function boardOrders(orders: Order[], board: OrderBoardKey): Order[] {
  return orders.filter(
    (order) => order.fulfillmentMethod === board && order.fulfillmentStatus !== 'cancelled',
  );
}

export function buildOrderBoardLanes(orders: Order[], board: OrderBoardKey): OrderBoardLanes {
  const mine = boardOrders(orders, board);
  const laneStatuses = BOARD_LANES[board];

  return {
    lanes: laneStatuses.map((status) => ({
      status,
      label: statusLabel(status),
      orders: mine.filter((order) => order.fulfillmentStatus === status),
    })),
    unplaced: mine.filter((order) => !laneStatuses.includes(order.fulfillmentStatus)),
  };
}

/**
 * The lane after this one, or null at the end of the board.
 *
 * This is what the card's single button moves an order to. Anything other than
 * one step forward — a correction, a cancellation — is done from the detail
 * sheet, where the full list of states is visible and the choice is deliberate.
 */
export function nextBoardStatus(
  board: OrderBoardKey,
  status: FulfillmentStatus,
): FulfillmentStatus | null {
  const laneStatuses = BOARD_LANES[board];
  const index = laneStatuses.indexOf(status);
  if (index === -1 || index === laneStatuses.length - 1) return null;
  return laneStatuses[index + 1];
}
