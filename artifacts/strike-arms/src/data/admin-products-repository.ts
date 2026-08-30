/**
 * Admin product CRUD — backed by Supabase.
 *
 * The storefront reads from products-repository.ts (currently mock data);
 * this file is the admin dashboard's write path. When the catalogue moves
 * to Supabase, the storefront repository swaps to the same table and the
 * two stay separate: public reads there, admin reads/writes here.
 *
 * Components never import this file directly; they go through hooks
 * (see use-admin-products.ts).
 */

import { supabase } from '@/lib/supabase';
import { rowToProduct } from '@/lib/product-mappers';
import type { Product, ProductBulkPatch } from '@/types/product';

export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function createProduct(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      slug: input.slug,
      name: input.name,
      category: input.category,
      subcategory: input.subcategory,
      brand: input.brand,
      price_cents: input.price,
      sale_price_cents: input.salePrice ?? null,
      images: input.images,
      short_description: input.shortDescription,
      description: input.description ?? '',
      is_published: input.isPublished ?? false,
      stock_count: input.stockCount ?? 0,
      is_new: input.isNew ?? false,
      is_featured: input.isFeatured ?? false,
      is_shippable: input.isShippable,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...(patch.slug !== undefined && { slug: patch.slug }),
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.subcategory !== undefined && { subcategory: patch.subcategory }),
      ...(patch.brand !== undefined && { brand: patch.brand }),
      ...(patch.price !== undefined && { price_cents: patch.price }),
      ...('salePrice' in patch && { sale_price_cents: patch.salePrice ?? null }),
      ...(patch.images !== undefined && { images: patch.images }),
      ...(patch.shortDescription !== undefined && { short_description: patch.shortDescription }),
      ...(patch.description != null && { description: patch.description }),
      ...(patch.isPublished !== undefined && { is_published: patch.isPublished }),
      ...(patch.stockCount !== undefined && { stock_count: patch.stockCount }),
      ...(patch.isNew !== undefined && { is_new: patch.isNew }),
      ...(patch.isFeatured !== undefined && { is_featured: patch.isFeatured }),
      ...(patch.isShippable !== undefined && { is_shippable: patch.isShippable }),
      ...(patch.tags !== undefined && { tags: patch.tags }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

/**
 * The images are not deleted here. Migration 011 puts a trigger on the table
 * that files every path into orphaned_images, which the sweeper drains — so
 * cleanup happens whether the row goes through this function, a cascade, or
 * someone in the SQL editor.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

/**
 * How many ids go into one `in (...)` filter.
 *
 * PostgREST puts the filter in the query string, so a few hundred UUIDs is a
 * URL long enough for a proxy to reject — and the failure looks like the
 * database refusing the write rather than the request never arriving.
 */
const ID_CHUNK = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Applies the same patch to many products. See ProductBulkPatch for why it is narrow. */
export async function bulkUpdateProducts(ids: string[], patch: ProductBulkPatch): Promise<void> {
  if (ids.length === 0) return;
  const row = {
    ...(patch.isPublished !== undefined && { is_published: patch.isPublished }),
    ...(patch.isFeatured !== undefined && { is_featured: patch.isFeatured }),
    ...(patch.isNew !== undefined && { is_new: patch.isNew }),
  };
  if (Object.keys(row).length === 0) return;

  for (const batch of chunk(ids, ID_CHUNK)) {
    const { error } = await supabase.from('products').update(row).in('id', batch);
    if (error) throw error;
  }
}

/**
 * Images are not deleted here either — see deleteProduct. The trigger from
 * migration 011 files them for the sweeper however the row goes away.
 */
export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  for (const batch of chunk(ids, ID_CHUNK)) {
    const { error } = await supabase.from('products').delete().in('id', batch);
    if (error) throw error;
  }
}
