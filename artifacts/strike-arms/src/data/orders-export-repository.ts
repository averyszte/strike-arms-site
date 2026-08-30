import { listOrderItemsFor, pageAll } from '@/data/orders-bulk-reads';
import { rowToOrder, type OrderRow } from '@/lib/order-mappers';
import { buildOrdersQuery } from '@/data/orders-repository';
import type { Order, OrderListFilters } from '@/types/order';

/**
 * Every order matching the current filter, with its lines, for the CSV export.
 *
 * "Export" has to mean everything matching what you are looking at, so it
 * pages rather than accepting whatever one request hands back. A short file
 * would say nothing about being short.
 */
export async function listOrdersForExport(filters: OrderListFilters = {}): Promise<Order[]> {
  const rows = await pageAll<OrderRow>((from, to) =>
    buildOrdersQuery(filters).range(from, to),
  );

  const itemsById = await listOrderItemsFor(rows.map((row) => row.id));
  return rows.map((row) => rowToOrder(row, itemsById.get(row.id) ?? []));
}
