import { TAXONOMY } from '@/lib/taxonomy-data';
import type { CategoryDef, CategorySlug, SubcategoryDef } from '@/types/taxonomy';

export type { CategoryDef, CategorySlug, SubcategoryDef } from '@/types/taxonomy';
export { TAXONOMY } from '@/lib/taxonomy-data';

export function getCategory(slug: string): CategoryDef | undefined {
  return TAXONOMY.find((c) => c.slug === slug);
}

export function getSubcategory(
  categorySlug: string,
  subSlug: string,
): SubcategoryDef | undefined {
  return getCategory(categorySlug)?.subcategories.find((s) => s.slug === subSlug);
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return TAXONOMY.some((c) => c.slug === slug);
}

/**
 * Intro copy shown above the product grid on each category page for topical
 * relevance. Plain text (no links) — rendered as a paragraph. Irish English.
 */
export const CATEGORY_INTROS: Record<CategorySlug, string> = {
  rifles:
    'Airsoft rifles are the backbone of any skirmish loadout. Electric AEGs suit most players and are the usual first buy, gas blowback rifles add realism, and bolt-action springers cover the sniper role. We stock trusted brands including Specna Arms, G&G, Krytac and ICS, and back every gun with in-house repairs and upgrades. Not sure which to pick? Our team will match a rifle to how and where you play. Ships across Ireland.',
  pistols:
    'An airsoft pistol makes a reliable sidearm and a great backup for CQB or sniper loadouts. Gas blowback models give realistic recoil, while electric and spring pistols keep things simple and affordable. We stock Tokyo Marui, ASG, WE and more, with advice on the right gas and magazines for the Irish climate. In-house servicing keeps your pistol running. Ships across Ireland.',
  consumables:
    'Consumables are what keep you shooting: BBs, gas, batteries and chargers. The right BB weight and quality make a real difference to accuracy and feeding, and most Irish sites require biodegradable BBs outdoors. We stock quality BBs, green gas, CO2, and both LiPo and NiMH batteries. Unsure what suits your gun? Check our guides or ask the team. Ships across Ireland.',
  accessories:
    'Accessories tune your setup to how you play — optics and red dots for faster target acquisition, plus magazines, slings, grips and more. We stock reliable brands and can advise on what genuinely improves performance versus what just adds weight. Fitting and setup advice comes as standard. Ships across Ireland.',
  gear:
    'The right tactical gear keeps you comfortable and in the game, which matters in the wet, cold conditions typical of Irish sites. From eye protection and plate carriers to chest rigs, gloves and footwear, we stock durable kit and can help you build a practical loadout without over-spending. Ships across Ireland.',
  more:
    'Everything else you need around the game: chronographs to check your gun is site-legal, tools and maintenance kits, targets, and outdoor gear. Practical kit from a shop that actually plays the sport. Ships across Ireland.',
};

export function getCategoryIntro(slug: string): string | undefined {
  return isValidCategorySlug(slug) ? CATEGORY_INTROS[slug] : undefined;
}

/** Intro copy for the /store root (all products) page. */
export const STORE_INTRO =
  'Browse the full Strike Arms range: airsoft rifles and pistols, BBs, gas and batteries, tactical gear, accessories and internals. We stock the brands players trust and back every purchase with in-house advice, repairs and upgrades from our shop in Swords, Co. Dublin. Ships across Ireland.';
