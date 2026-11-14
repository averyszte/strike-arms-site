import type { Database } from '@/types/database';
import type { Product, Category } from '@/types/product';

type ProductRow = Database['public']['Tables']['products']['Row'];

/**
 * The columns rowToProduct reads. A full row (admin reads) fits as well; the
 * storefront selects only these (products-repository.ts), so it never pulls
 * search_text, ship weights or the archive stamp it has no use for.
 */
export type MappedProductRow = Pick<
  ProductRow,
  | 'id'
  | 'slug'
  | 'name'
  | 'category'
  | 'subcategory'
  | 'brand'
  | 'condition'
  | 'price_cents'
  | 'sale_price_cents'
  | 'images'
  | 'short_description'
  | 'description'
  | 'in_stock'
  | 'is_shippable'
  | 'is_published'
  | 'is_new'
  | 'is_featured'
  | 'is_archived'
  | 'tags'
  | 'created_at'
>;

export function rowToProduct(row: MappedProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Category,
    subcategory: row.subcategory,
    brand: row.brand,
    condition: row.condition,
    price: row.price_cents,
    salePrice: row.sale_price_cents ?? undefined,
    images: row.images,
    shortDescription: row.short_description,
    description: row.description,
    inStock: row.in_stock,
    isShippable: row.is_shippable,
    isPublished: row.is_published,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isArchived: row.is_archived,
    tags: row.tags,
    createdAt: row.created_at,
  };
}
