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
import { chunkArray } from '@/lib/chunk-array';
import { escapeSearchTerm } from '@/lib/escape-search-term';
import { ADMIN_PAGE_SIZE } from '@/lib/page-bounds';
import { rowToProduct } from '@/lib/product-mappers';
import { OPENING_STOCK_FORM_REASON } from '@/lib/stock-adjustment';
import { LOW_STOCK_THRESHOLD } from '@/lib/stock-levels';
import { adjustStock } from '@/data/inventory-repository';
import { ID_CHUNK, pageAll } from '@/data/orders-bulk-reads';
import type {
  AdminProductListFilters,
  CreatedProduct,
  NewProduct,
  Product,
  ProductBulkPatch,
  ProductPatch,
} from '@/types/product';

/**
 * Every product, archived included, paged past the server's row cap.
 *
 * For the screens that need the whole catalogue at once: the dashboard's
 * counts, the counter sale picker, CSV export, and the import's slug match --
 * which must see archived slugs, because the slug stays taken.
 */
export async function listAllProducts(): Promise<Product[]> {
  const rows = await pageAll((from, to) =>
    supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to),
  );
  return rows.map(rowToProduct);
}

/**
 * One page of the admin products list.
 *
 * Sorted by category, subcategory and name so the page splits into the same
 * category groups the table shows, and id last so a page boundary never falls
 * between two rows that sort equal. The stock filters mirror
 * lib/stock-levels.ts, on the generated sellable_count (026).
 */
export async function listProducts(
  filters: AdminProductListFilters = {},
): Promise<{ items: Product[]; total: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? ADMIN_PAGE_SIZE;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_archived', filters.isArchived ?? false);

  if (filters.stock === 'low') {
    query = query
      .eq('is_published', true)
      .gt('sellable_count', 0)
      .lte('sellable_count', LOW_STOCK_THRESHOLD);
  } else if (filters.stock === 'out') {
    query = query.eq('is_published', true).lte('sellable_count', 0);
  }

  // Escaped for the same reason as the orders search: .or() is a
  // comma-separated list, and a raw comma would become another clause.
  const search = filters.search ? escapeSearchTerm(filters.search) : '';
  if (search) query = query.or(`search_text.ilike.%${search}%,slug.ilike.%${search}%`);

  const { data, error, count } = await query
    .order('category')
    .order('subcategory')
    .order('name')
    .order('id')
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;

  return { items: (data ?? []).map(rowToProduct), total: count ?? 0 };
}

/**
 * Inserts the row with no stock, then books the opening stock through
 * adjust_stock like the CSV import does, so the ledger has a first entry that
 * says who put the units there.
 */
export async function createProduct(
  input: NewProduct,
  openingStock: number,
): Promise<CreatedProduct> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      slug: input.slug,
      name: input.name,
      category: input.category,
      subcategory: input.subcategory,
      brand: input.brand,
      condition: input.condition,
      price_cents: input.price,
      sale_price_cents: input.salePrice ?? null,
      images: input.images,
      short_description: input.shortDescription,
      description: input.description ?? '',
      is_published: input.isPublished ?? false,
      stock_count: 0,
      is_new: input.isNew ?? false,
      is_featured: input.isFeatured ?? false,
      is_shippable: input.isShippable,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error) throw error;
  const product = rowToProduct(data);
  if (openingStock <= 0) return { product };

  try {
    await adjustStock(product.id, openingStock, OPENING_STOCK_FORM_REASON);
    return { product };
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'the stock change was refused';
    return { product, stockError: detail };
  }
}

export async function updateProduct(id: string, patch: ProductPatch): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...(patch.slug !== undefined && { slug: patch.slug }),
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.subcategory !== undefined && { subcategory: patch.subcategory }),
      ...(patch.brand !== undefined && { brand: patch.brand }),
      ...(patch.condition !== undefined && { condition: patch.condition }),
      ...(patch.price !== undefined && { price_cents: patch.price }),
      ...('salePrice' in patch && { sale_price_cents: patch.salePrice ?? null }),
      ...(patch.images !== undefined && { images: patch.images }),
      ...(patch.shortDescription !== undefined && { short_description: patch.shortDescription }),
      // !== undefined, not != null: clearing the description is a real edit.
      // No description is stored as the empty string the column wants.
      ...(patch.description !== undefined && { description: patch.description ?? '' }),
      ...(patch.isPublished !== undefined && { is_published: patch.isPublished }),
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

// ─── Archive and bulk operations ──────────────────────────────────────────────

/**
 * Archives or restores products. There is no delete (026): archiving keeps the
 * stock ledger and the order links that a delete would cascade away.
 *
 * Archiving also unpublishes and unfeatures, because an archived product may
 * not be live (the database refuses it) and a featured flag left behind would
 * put it back on the homepage the day it is restored. Restoring brings it
 * back as a draft, to be checked before it is published again.
 *
 * Chunked because PostgREST puts the id filter in the URL, and a few hundred
 * UUIDs is long enough for a proxy to reject.
 */
export async function setProductsArchived(ids: string[], isArchived: boolean): Promise<void> {
  const row = isArchived
    ? {
        is_archived: true,
        archived_at: new Date().toISOString(),
        is_published: false,
        is_featured: false,
      }
    : { is_archived: false, archived_at: null };

  for (const batch of chunkArray(ids, ID_CHUNK)) {
    const { error } = await supabase.from('products').update(row).in('id', batch);
    if (error) throw error;
  }
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

  for (const batch of chunkArray(ids, ID_CHUNK)) {
    const { error } = await supabase.from('products').update(row).in('id', batch);
    if (error) throw error;
  }
}
