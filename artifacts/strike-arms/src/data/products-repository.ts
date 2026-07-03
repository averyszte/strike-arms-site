/**
 * Products data access layer — backed by Supabase.
 *
 * Function signatures and return types are stable.
 * Components never import this file directly; they go through hooks.
 * For the mock-data version see git history (pre-Supabase migration).
 */

import { supabase } from '@/lib/supabase';
import { rowToProduct } from '@/lib/product-mappers';
import type { Product, ProductFilters, ProductListResult, Category } from '@/types/product';

const PAGE_SIZE_DEFAULT = 24;

const BRAND_NAMES: Record<string, string> = {
  'specna-arms': 'Specna Arms',
  'gandg': 'G&G',
  'ics': 'ICS',
  'krytac': 'Krytac',
  'tokyo-marui': 'Tokyo Marui',
  'asg': 'ASG',
  'we': 'WE',
  'vfc': 'VFC',
  'nuprol': 'Nuprol',
  'vorsk': 'Vorsk',
  'valken': 'Valken',
  'zci': 'ZCI',
  'shs': 'SHS',
  'perun': 'Perun',
  'acetech': 'Acetech',
};

// ─── Read operations ──────────────────────────────────────────────────────────

export async function listProducts(filters: ProductFilters): Promise<ProductListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .range(0, page * pageSize - 1);

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.subcategory) query = query.eq('subcategory', filters.subcategory);
  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.minPrice !== undefined) query = query.gte('price_cents', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('price_cents', filters.maxPrice);
  if (filters.inStockOnly) query = query.eq('in_stock', true);
  if (filters.onSaleOnly) query = query.not('sale_price_cents', 'is', null);

  const sort = filters.sort ?? 'featured';
  switch (sort) {
    case 'featured':
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('price_cents', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price_cents', { ascending: false });
      break;
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { items: (data ?? []).map(rowToProduct), total: count ?? 0, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

export async function listBrands(
  category?: Category,
): Promise<{ slug: string; name: string; count: number }[]> {
  let query = supabase
    .from('products')
    .select('brand')
    .eq('is_published', true);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) counts.set(row.brand, (counts.get(row.brand) ?? 0) + 1);

  return Array.from(counts.entries())
    .map(([slug, count]) => ({ slug, name: BRAND_NAMES[slug] ?? slug, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Write operations (admin dashboard) ──────────────────────────────────────

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
      is_new: input.isNew ?? false,
      is_featured: input.isFeatured ?? false,
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
      ...(patch.isNew !== undefined && { is_new: patch.isNew }),
      ...(patch.isFeatured !== undefined && { is_featured: patch.isFeatured }),
      ...(patch.tags !== undefined && { tags: patch.tags }),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}
