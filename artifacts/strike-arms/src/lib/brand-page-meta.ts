import { getCategory } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import type { Category } from '@/types/product';

/**
 * Title, description and intro copy for a per-brand page.
 *
 * Templated on purpose. Writing a paragraph about each manufacturer would mean
 * inventing claims about products we have not tested, and the copy would rot
 * the moment the range changed. What is said here is only what the catalogue
 * itself can vouch for: this is the brand, this is how much of it we list.
 *
 * Alan can replace any of it with real copy later -- one brand at a time,
 * without touching the page.
 */

export type BrandPageMeta = {
  title: string;
  description: string;
  intro: string;
  /** True for a brand too thin to index yet; see MIN_INDEXED_BRAND_PRODUCTS. */
  noindex: boolean;
};

/**
 * A brand with fewer products than this is `noindex,follow` (N-009): one or
 * two products under a templated intro is a thin page competing with the
 * products themselves. The page still works and still passes its links on.
 * scripts/generate-sitemap.mjs leaves the same brands out; keep the two equal.
 */
export const MIN_INDEXED_BRAND_PRODUCTS = 3;

function productWord(count: number): string {
  return count === 1 ? 'product' : 'products';
}

/**
 * The title says only what is true of every brand: "Guns & Gear" was wrong for
 * the eyewear and optics makers. Nor does the description promise delivery,
 * because guns are collect in store only.
 */
export function brandPageMeta(name: string, count: number): BrandPageMeta {
  return {
    title: `${name} Airsoft in Ireland | Strike Arms`,
    description: `Browse the ${name} range at Strike Arms in Swords, Co. Dublin. ${count} ${productWord(
      count,
    )} listed, with in-house advice and support.`,
    intro: `Everything we currently list from ${name}. Prices in euro, with the same in-house advice, servicing and support behind every purchase.`,
    noindex: count < MIN_INDEXED_BRAND_PRODUCTS,
  };
}

export type BrandCategoryLink = {
  label: string;
  path: string;
  count: number;
};

/**
 * Links into the shop, one per shelf the brand appears on.
 *
 * The brand rides along as a query parameter rather than becoming part of the
 * path, because the shop filters on it already and a second URL for the same
 * set of products is a second page for Google to choose between.
 */
export function brandCategoryLinks(
  brandSlug: string,
  categories: { category: Category; count: number }[],
): BrandCategoryLink[] {
  return categories.flatMap((entry) => {
    const definition = getCategory(entry.category as CategorySlug);
    if (!definition) return [];
    return [
      {
        label: definition.label,
        path: `/store/${entry.category}?brand=${brandSlug}`,
        count: entry.count,
      },
    ];
  });
}
