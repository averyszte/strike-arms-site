import { getCategory, getSubcategory, type CategorySlug } from '@/lib/taxonomy';
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  type BreadcrumbEntry,
  type JsonLdObject,
} from '@/lib/structured-data';
import type { Product } from '@/types/product';

/**
 * BreadcrumbList and ItemList JSON-LD for a /store page (N-007). Pure, so
 * ShopPage only renders the result.
 *
 * The breadcrumb follows the canonical, not the visible trail: a subcategory
 * without its own SEO copy canonicalises to its parent, so its schema stops at
 * the parent rather than naming a URL that says it is not the real page.
 */
export function buildShopSchemaCrumbs(
  categorySlug: CategorySlug | undefined,
  subcategorySlug: string | undefined,
): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/store' },
  ];
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  if (!category) return crumbs;
  crumbs.push({ name: category.label, path: `/store/${category.slug}` });
  const subcategory = subcategorySlug ? getSubcategory(category.slug, subcategorySlug) : undefined;
  if (subcategory?.seo) {
    crumbs.push({ name: subcategory.label, path: `/store/${category.slug}/${subcategory.slug}` });
  }
  return crumbs;
}

/**
 * The schema for one /store view, or none for search results (noindex) and
 * while there are no products to list.
 *
 * The ItemList is only sent when the URL is the canonical one. A folded
 * subcategory or a filtered view (?brand=) shows a different product set
 * from the canonical page, so listing it would contradict the canonical.
 */
export function buildShopSchemas(opts: {
  categorySlug: CategorySlug | undefined;
  subcategorySlug: string | undefined;
  isNoindex: boolean;
  isCanonicalView: boolean;
  products: Product[];
}): JsonLdObject[] {
  if (opts.isNoindex) return [];
  const schemas = [buildBreadcrumbSchema(buildShopSchemaCrumbs(opts.categorySlug, opts.subcategorySlug))];
  if (opts.isCanonicalView && opts.products.length > 0) {
    schemas.push(
      buildItemListSchema(
        opts.products.map((product) => ({ name: product.name, path: `/products/${product.slug}` })),
      ),
    );
  }
  return schemas;
}
