/**
 * Products data access layer.
 *
 * Currently backed by an in-memory mock array (mock-products.ts).
 * To migrate to Supabase: replace the body of each function with the
 * equivalent supabase.from('products').select()... call. The function
 * signatures and return types must NOT change — every consumer in the
 * app depends on them.
 *
 * Write functions (createProduct, updateProduct, deleteProduct) are
 * stubs intended for the future admin dashboard. The admin form should
 * be generated from the Product type — see types/product.ts.
 */

import type { Product, ProductFilters, ProductListResult, Category } from '@/types/product';
import { MOCK_PRODUCTS } from './mock-products';

// ─── Read operations ──────────────────────────────────────────────────────────

export async function listProducts(filters: ProductFilters): Promise<ProductListResult> {
  await new Promise((r) => setTimeout(r, 150));

  let results = [...MOCK_PRODUCTS];

  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }
  if (filters.subcategory) {
    results = results.filter((p) => p.subcategory === filters.subcategory);
  }
  if (filters.brand) {
    results = results.filter((p) => p.brand === filters.brand);
  }
  if (filters.minPrice !== undefined) {
    results = results.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.inStockOnly) {
    results = results.filter((p) => p.inStock);
  }
  if (filters.onSaleOnly) {
    results = results.filter((p) => p.salePrice !== undefined);
  }

  const total = results.length;
  const sort = filters.sort ?? 'featured';

  results.sort((a, b) => {
    switch (sort) {
      case 'featured':
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'price-asc':
        return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      case 'price-desc':
        return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      case 'name-asc':
        return a.name.localeCompare(b.name);
    }
  });

  // "Load more" pagination: always fetch from index 0 up to page * pageSize.
  // Incrementing page in the URL appends more items without a separate accumulation layer.
  // When migrating to Supabase, use .range(0, page * pageSize - 1).
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const items = results.slice(0, page * pageSize);

  return { items, total, page, pageSize };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

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
};

export async function listBrands(
  category?: Category,
): Promise<{ slug: string; name: string; count: number }[]> {
  await new Promise((r) => setTimeout(r, 150));

  const source = category
    ? MOCK_PRODUCTS.filter((p) => p.category === category)
    : MOCK_PRODUCTS;

  const counts = new Map<string, number>();
  for (const p of source) {
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([slug, count]) => ({
      slug,
      name: BRAND_NAMES[slug] ?? slug,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── Write stubs (future admin dashboard) ────────────────────────────────────

export async function createProduct(
  _input: Omit<Product, 'id' | 'createdAt'>,
): Promise<Product> {
  throw new Error('Not implemented — admin dashboard not built yet');
}

export async function updateProduct(
  _id: string,
  _patch: Partial<Product>,
): Promise<Product> {
  throw new Error('Not implemented — admin dashboard not built yet');
}

export async function deleteProduct(_id: string): Promise<void> {
  throw new Error('Not implemented — admin dashboard not built yet');
}
