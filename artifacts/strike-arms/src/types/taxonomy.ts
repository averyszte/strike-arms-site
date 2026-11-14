/** The shop's category tree: top-level categories and their subcategories. */
export type CategorySlug =
  | 'rifles'
  | 'pistols'
  | 'consumables'
  | 'accessories'
  | 'gear'
  | 'more';

export type SubcategoryDef = {
  slug: string;
  label: string;
  /**
   * Optional — when present, this subcategory becomes its own canonical SEO page
   * instead of canonicalising to its parent category. Use this to promote a
   * subcategory once it has unique content and traffic worth ranking on its own.
   */
  seo?: {
    title?: string;
    description: string;
    intro?: string;
  };
};

export type CategoryDef = {
  slug: CategorySlug;
  label: string;       // "Airsoft Rifles" — used in breadcrumbs and h1
  shortLabel: string;  // "Rifles" — used in nav
  subcategories: SubcategoryDef[];
};
