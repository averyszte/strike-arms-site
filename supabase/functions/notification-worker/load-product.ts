import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/** The product as the low-stock email needs it, read when the email is sent. */
export type EmailProduct = {
  id: string;
  name: string;
  brand: string;
  stockCount: number;
  threshold: number;
};

export async function loadEmailProduct(
  admin: SupabaseClient,
  productId: string,
): Promise<EmailProduct> {
  const { data: row, error } = await admin
    .from("products")
    .select("id, name, brand, stock_count, low_stock_threshold")
    .eq("id", productId)
    .single();

  if (error || !row) throw new Error(`Product ${productId} not found: ${error?.message ?? ""}`);

  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    stockCount: row.stock_count,
    threshold: row.low_stock_threshold,
  };
}
