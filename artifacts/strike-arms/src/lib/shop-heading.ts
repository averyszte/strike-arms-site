import { getCategory, getSubcategory, type CategorySlug } from '@/lib/taxonomy';

export interface ShopHeading {
  eyebrow: string;
  title: string;
  crumbs: { label: string; href?: string }[];
}

/**
 * Title, eyebrow and breadcrumb trail for a /store page. The deepest label is
 * the title, and a search query takes precedence over both.
 *   /store          Home > Shop
 *   /store/cat      Home > Shop > Category
 *   /store/cat/sub  Home > Shop > Category > Subcategory
 */
export function buildShopHeading(
  categorySlug: CategorySlug | undefined,
  subcategorySlug: string | undefined,
  query: string | undefined,
): ShopHeading {
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const subcategory =
    categorySlug && subcategorySlug ? getSubcategory(categorySlug, subcategorySlug) : undefined;
  const isSearch = !categorySlug && !!query;

  const crumbs: ShopHeading['crumbs'] = [
    { label: 'Shop', href: categorySlug || isSearch ? '/store' : undefined },
  ];
  if (isSearch) crumbs.push({ label: 'Search' });
  if (category) {
    crumbs.push({
      label: category.label,
      href: subcategory ? `/store/${categorySlug}` : undefined,
    });
  }
  if (subcategory) crumbs.push({ label: subcategory.label });

  if (isSearch) return { eyebrow: 'Search', title: `Results for "${query}"`, crumbs };
  if (subcategory && category) return { eyebrow: category.label, title: subcategory.label, crumbs };
  if (category) return { eyebrow: 'Shop by category', title: category.label, crumbs };
  return { eyebrow: 'The full range', title: 'Shop', crumbs };
}
