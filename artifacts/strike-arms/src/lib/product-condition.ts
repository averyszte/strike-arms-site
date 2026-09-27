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

/** For everything that is not a gun: a used pouch or belt needs no battery. */
export const SOLD_AS_SEEN_KIT = 'Sold as seen. This is a secondhand item.';

/**
 * Alan's sentence was about "rifles or pistols", so it goes on the guns and
 * nothing else -- not on a pre-owned magazine that happens to sit under
 * pistols, and not on the used kit from his jumble pages.
 */
const GUN_SUBCATEGORIES: ReadonlySet<string> = new Set([
  'aeg-rifles',
  'smgs',
  'lmgs',
  'dmr',
  'gbbr',
  'sniper',
  'shotguns',
  'spring-rifles',
  'gbb-pistols',
  'electric-pistols',
  'spring-pistols',
  'revolvers',
  'machine-pistols',
]);

export function soldAsSeenNotice(subcategory: string): string {
  return GUN_SUBCATEGORIES.has(subcategory) ? SOLD_AS_SEEN : SOLD_AS_SEEN_KIT;
}

export function isPreLoved(condition: ProductCondition | undefined): boolean {
  return condition === 'pre-loved';
}

/** Narrows a string from a URL or a spreadsheet cell. Anything else is refused. */
export function toProductCondition(value: string): ProductCondition | null {
  const normalised = value.trim().toLowerCase();
  const match = PRODUCT_CONDITIONS.find((condition) => condition === normalised);
  return match ?? null;
}
