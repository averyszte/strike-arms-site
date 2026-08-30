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
};

function productWord(count: number): string {
  return count === 1 ? 'product' : 'products';
}

export function brandPageMeta(name: string, count: number): BrandPageMeta {
  return {
    title: `${name} Airsoft — Guns, Gear & Parts in Ireland | Strike Arms`,
    description: `Browse the ${name} range at Strike Arms in Swords, Co. Dublin. ${count} ${productWord(
      count,
    )} listed, shipped across Ireland with in-house advice and support.`,
    intro: `Everything we currently list from ${name}. Prices in euro, with the same in-house advice, servicing and support behind every purchase.`,
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
