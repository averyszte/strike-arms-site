import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type InventoryAdjustmentRow = Database['public']['Tables']['inventory_adjustments']['Row'];

export type InventoryAdjustment = {
  id: string;
  productId: string;
  adjustment: number;
  reason: string;
  adjustedBy: string | null;
  createdAt: string;
};

export type LowStockProduct = {
  id: string;
  slug: string;
  name: string;
  stockCount: number;
  lowStockThreshold: number;
};

function rowToAdjustment(row: InventoryAdjustmentRow): InventoryAdjustment {
  return {
    id: row.id,
    productId: row.product_id,
    adjustment: row.adjustment,
    reason: row.reason,
    adjustedBy: row.adjusted_by,
    createdAt: row.created_at,
  };
}

/**
 * `adjusted_by` is now decided by the database, not by this call. Migration
 * 014 has `adjust_stock` attribute the row to `auth.uid()` and ignore the
 * argument, because an audit trail that records whoever the caller said they
 * were is not an audit trail.
 *
 * The argument is still sent so this file works against a database with or
 * without 014 applied. Drop the parameter, and this pass-through with it,
 * once 014 is confirmed pushed.
 */
export async function adjustStock(
  productId: string,
  adjustment: number,
  reason: string,
  adjustedBy: string | null = null,
): Promise<void> {
  // The argument is omitted rather than sent as null when there is no signed-in
  // id, so the function falls back to its own default instead of being handed
  // one explicitly.
  const { error } = await supabase.rpc('adjust_stock', {
    p_product_id: productId,
    p_adjustment: adjustment,
    p_reason: reason,
    ...(adjustedBy ? { p_adjusted_by: adjustedBy } : {}),
  });
  if (error) throw error;
}

export async function getInventoryHistory(productId: string): Promise<InventoryAdjustment[]> {
  const { data, error } = await supabase
    .from('inventory_adjustments')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToAdjustment);
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, stock_count, low_stock_threshold')
    .eq('is_published', true)
    .order('stock_count', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((r) => r.stock_count <= r.low_stock_threshold)
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      stockCount: r.stock_count,
      lowStockThreshold: r.low_stock_threshold,
    }));
}
