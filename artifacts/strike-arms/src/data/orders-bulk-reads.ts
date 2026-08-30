import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { chunkArray } from '@/lib/chunk-array';
import type { OrderItemRow } from '@/lib/order-mappers';

/**
 * Reading more rows than one request will return.
 *
 * PostgREST caps a response at its max-rows setting and says nothing about it:
 * you get a valid array that happens to be short. Anything that sums money or
 * counts stock has to page, or it quietly reports a smaller number than the
 * truth and looks perfectly healthy doing it.
 */

/** Rows per request. Well under any sane server cap, so the loop always advances. */
const PAGE_SIZE = 500;

/** How many ids fit in an `in.()` before the URL gets unreasonable. */
export const ID_CHUNK = 100;

type PagedResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
};

/**
 * Drains a ranged query.
 *
 * The caller's query must ask for `count: 'exact'`, because the count is how
 * the loop knows when it is finished. Without it this stops after the first
 * short page, which is the bug it exists to prevent.
 */
export async function pageAll<T>(
  fetchRange: (from: number, to: number) => PromiseLike<PagedResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  let total = Infinity;

  while (rows.length < total) {
    const { data, error, count } = await fetchRange(rows.length, rows.length + PAGE_SIZE - 1);
    if (error) throw error;
    if (count !== null) total = count;

    const batch = data ?? [];
    // An empty page with rows still outstanding means the server will not give
    // us any more. Stopping beats looping forever.
    if (batch.length === 0) break;
    rows.push(...batch);
  }

  return rows;
}

/**
 * The line items for a set of orders, grouped by order.
 *
 * Chunked by id for URL length and paged within each chunk for row count — a
 * hundred orders can easily carry more lines than one response will return,
 * and a missing line is a product that silently sells none.
 */
export async function listOrderItemsFor(orderIds: string[]): Promise<Map<string, OrderItemRow[]>> {
  const byOrder = new Map<string, OrderItemRow[]>();

  for (const ids of chunkArray(orderIds, ID_CHUNK)) {
    const items = await pageAll<OrderItemRow>((from, to) =>
      supabase
        .from('order_items')
        .select('*', { count: 'exact' })
        .in('order_id', ids)
        .order('product_name')
        .range(from, to),
    );

    for (const item of items) {
      const existing = byOrder.get(item.order_id);
      if (existing) existing.push(item);
      else byOrder.set(item.order_id, [item]);
    }
  }

  return byOrder;
}
