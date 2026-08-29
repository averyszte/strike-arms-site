import {
  getCategory,
  getSubcategory,
  getCategoryIntro,
  STORE_INTRO,
} from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';

export type ShopPageMeta = {
  canonicalPath: string;
  title: string;
  description: string;
  /** Undefined on search results, where the category blurb would be wrong. */
  intro: string | undefined;
  noindex: boolean;
};

const SITE_SUFFIX = 'Strike Arms Airsoft Dublin';

/**
 * The canonical URL, title and description for a /store view.
 *
 * A subcategory is only allowed to be its own canonical when it carries its own
 * SEO copy. Without that it points at the parent category, so we do not publish
 * a dozen near-identical thin pages competing with each other.
 */
function deriveCanonical(
  categorySlug: CategorySlug | undefined,
  subcategorySlug: string | undefined,
): Pick<ShopPageMeta, 'canonicalPath' | 'title' | 'description'> {
  const categoryDef = categorySlug ? getCategory(categorySlug) : undefined;
  const subcategoryDef =
    categorySlug && subcategorySlug ? getSubcategory(categorySlug, subcategorySlug) : undefined;
  const promoted = subcategoryDef?.seo;

  if (promoted && categorySlug && subcategorySlug) {
    return {
      canonicalPath: `/store/${categorySlug}/${subcategorySlug}`,
      title: promoted.title ?? `${subcategoryDef.label} | ${SITE_SUFFIX}`,
      description: promoted.description,
    };
  }

  if (categorySlug && categoryDef) {
    return {
      canonicalPath: `/store/${categorySlug}`,
      title: `${categoryDef.label} | ${SITE_SUFFIX}`,
      description: `Shop ${categoryDef.label.toLowerCase()} at Strike Arms Airsoft Dublin.`,
    };
  }

  return {
    canonicalPath: '/store',
    title: `Shop | ${SITE_SUFFIX}`,
    description:
      'Browse the full range of airsoft guns, gear, and accessories at Strike Arms Dublin.',
  };
}

/** The intro blurb: the subcategory's own copy when it has some, else the category's. */
function deriveIntro(
  categorySlug: CategorySlug | undefined,
  subcategorySlug: string | undefined,
): string | undefined {
  if (subcategorySlug) {
    return categorySlug ? getSubcategory(categorySlug, subcategorySlug)?.seo?.intro : undefined;
  }
  return categorySlug ? getCategoryIntro(categorySlug) : STORE_INTRO;
}

export function deriveShopPageMeta(
  categorySlug: CategorySlug | undefined,
  subcategorySlug: string | undefined,
  searchQuery: string | undefined,
): ShopPageMeta {
  const canonical = deriveCanonical(categorySlug, subcategorySlug);

  // Internal search results are never indexed, and they get their own title
  // rather than inheriting a category's.
  const isSearchResults = !categorySlug && !!searchQuery;

  return {
    ...canonical,
    title: isSearchResults ? `Search: ${searchQuery} | ${SITE_SUFFIX}` : canonical.title,
    description: isSearchResults
      ? `Airsoft products matching "${searchQuery}" at Strike Arms Airsoft Dublin.`
      : canonical.description,
    intro: isSearchResults ? undefined : deriveIntro(categorySlug, subcategorySlug),
    noindex: !!searchQuery,
  };
}
