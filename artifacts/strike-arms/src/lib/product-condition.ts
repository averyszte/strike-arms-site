import type { ProductCondition } from '@/types/product';

/**
 * What "pre-loved" means to the shop, in one place.
 *
 * Before migration 018 this was carried by a slug prefix, three tags and a
 * sentence appended to the description -- and the storefront renders neither
 * tags nor the description body, so none of it ever reached a customer. The
 * label and the warning below are the parts they actually see.
 */

export const PRODUCT_CONDITIONS = ['new', 'pre-loved'] as const;

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: 'New',
  'pre-loved': 'Pre-loved',
};

/**
 * Alan, 1 Sep 2026: "We will have to stress that these rifles or pistols are
 * sold as seen and are secondhand and will require batteries and a charger."
 *
 * The catalogue importer appends this to the description of every pre-loved
 * row as well. That is belt and braces rather than duplication: the product
 * page shows the short description, not the body, so the import's copy is only
 * visible to whoever opens the row in the admin.
 */
export const SOLD_AS_SEEN =
  'Sold as seen. This is a secondhand item and will require batteries and a charger, which are not included.';

export function isPreLoved(condition: ProductCondition | undefined): boolean {
  return condition === 'pre-loved';
}

/** Narrows a string from a URL or a spreadsheet cell. Anything else is refused. */
export function toProductCondition(value: string): ProductCondition | null {
  const normalised = value.trim().toLowerCase();
  const match = PRODUCT_CONDITIONS.find((condition) => condition === normalised);
  return match ?? null;
}
