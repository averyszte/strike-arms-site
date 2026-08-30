import type { Category, Product } from '@/types/product';

/**
 * Products bucketed by category for the admin table.
 *
 * The order of the returned groups is fixed, and the order of the products
 * inside each one is fixed too -- subcategory then name. A table whose rows
 * move between renders is a table where someone ticks the wrong row.
 *
 * Empty categories are dropped rather than shown as empty accordions.
 */

export const CATEGORY_ORDER: Category[] = [
  'rifles',
  'pistols',
  'consumables',
  'accessories',
  'gear',
  'parts',
  'more',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  rifles: 'Rifles',
  pistols: 'Pistols',
  consumables: 'Consumables',
  accessories: 'Accessories',
  gear: 'Gear',
  parts: 'Parts',
  more: 'More',
};

export type ProductGroup = {
  category: Category;
  label: string;
  products: Product[];
};

export function groupProductsByCategory(products: Product[]): ProductGroup[] {
  const buckets = new Map<Category, Product[]>();
  for (const product of products) {
    const bucket = buckets.get(product.category) ?? [];
    bucket.push(product);
    buckets.set(product.category, bucket);
  }

  return CATEGORY_ORDER.filter((category) => buckets.has(category)).map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    products: buckets
      .get(category)!
      .slice()
      .sort((a, b) => a.subcategory.localeCompare(b.subcategory) || a.name.localeCompare(b.name)),
  }));
}

/**
 * The groups flattened back out in display order.
 *
 * Selection works against this, not against the raw list from the server, so
 * "select everything" means everything you can actually see.
 */
export function flattenGroups(groups: ProductGroup[]): Product[] {
  return groups.flatMap((group) => group.products);
}
