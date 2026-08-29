import type { Database } from '@/types/database';
import type { Product, Category } from '@/types/product';

type ProductRow = Database['public']['Tables']['products']['Row'];

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Category,
    subcategory: row.subcategory,
    brand: row.brand,
    price: row.price_cents,
    salePrice: row.sale_price_cents ?? undefined,
    images: row.images,
    shortDescription: row.short_description,
    description: row.description,
    inStock: row.in_stock,
    isShippable: row.is_shippable,
    isPublished: row.is_published,
    stockCount: row.stock_count,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    tags: row.tags,
    createdAt: row.created_at,
  };
}
