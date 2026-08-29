import { supabase } from '@/lib/supabase';
import { chunkArray } from '@/lib/chunk-array';
import { rowToOrder, type OrderItemRow, type OrderRow } from '@/lib/order-mappers';
import { ID_CHUNK, buildOrdersQuery } from '@/data/orders-repository';
import type { Order, OrderListFilters } from '@/types/order';

/**
 * Reads for the CSV export, kept apart from the orders repository because they
 * page and the rest of it does not.
 */

/** PostgREST caps how many rows one request returns, so the export asks in chunks. */
const EXPORT_CHUNK = 500;

/**
 * Every order matching the current filter, with its lines, for the CSV export.
 *
 * It pages rather than asking for everything at once because PostgREST will
 * silently hand back its max-rows limit and nothing would say the export was
 * short. The loop stops on the reported count, so a server limit below the
 * chunk size still produces a complete file.
 */
export async function listOrdersForExport(filters: OrderListFilters = {}): Promise<Order[]> {
  const rows: OrderRow[] = [];
  let total = Infinity;

  while (rows.length < total) {
    const { data, error, count } = await buildOrdersQuery(filters).range(
      rows.length,
      rows.length + EXPORT_CHUNK - 1,
    );
    if (error) throw error;
    if (count !== null) total = count;

    const batch = data ?? [];
    // An empty batch with rows still outstanding means the server will not give
    // us any more. Stopping beats looping forever.
    if (batch.length === 0) break;
    rows.push(...batch);
  }

  const itemsById = await listOrderItemsFor(rows.map((row) => row.id));
  return rows.map((row) => rowToOrder(row, itemsById.get(row.id) ?? []));
}

async function listOrderItemsFor(orderIds: string[]): Promise<Map<string, OrderItemRow[]>> {
  const byOrder = new Map<string, OrderItemRow[]>();

  for (const ids of chunkArray(orderIds, ID_CHUNK)) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', ids)
      .order('product_name');
    if (error) throw error;

    for (const item of data ?? []) {
      const existing = byOrder.get(item.order_id);
      if (existing) existing.push(item);
      else byOrder.set(item.order_id, [item]);
    }
  }

  return byOrder;
}

