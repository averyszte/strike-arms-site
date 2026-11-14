import type { Product } from "@/types/product";

/**
 * Content for the homepage Evolution band: the scene, its shoppable pins and
 * the shelf it links to.
 *
 * SCENE_IMAGE is a stand-in: the play-style sniper photo shows an OD bolt
 * action and a black-and-tan M4, close to the M40 and the Recon. Swap in the
 * generated Evolution scene here, then re-measure SCENE_PINS on it.
 */
export const SCENE_IMAGE = "/images/playstyles/sniper.webp";
export const SCENE_ALT = "Two players in a forest with a bolt action rifle and an M4";
/** Width over height of SCENE_IMAGE, used to keep pins on target when cropped. */
export const SCENE_ASPECT = 16 / 7;

export const EVOLUTION_TAG = "evolution-range";
export const EVOLUTION_SHELF_HREF = "/evolution";

export type ScenePinSpot = { slug: string; x: number; y: number };

/** Percentages measured on SCENE_IMAGE. A pin whose product is unpublished is left out. */
export const SCENE_PINS: ScenePinSpot[] = [
  { slug: "evolution-m40-sniper-rifle-od", x: 45, y: 50 },
  { slug: "evolution-recon-14-5-carbontech-black-tan", x: 62, y: 26 },
];

/** "Evolution Recon 10\" Carbontech Black" -> "Recon 10\" Carbontech Black". */
export function shortEvolutionName(name: string): string {
  return name.replace(/^Evolution\s+/, "");
}

/** The price a customer pays: the sale price when it undercuts the list price. */
export function payablePriceCents(product: Product): number {
  const { salePrice, price } = product;
  return salePrice !== undefined && salePrice < price ? salePrice : price;
}

/** Pins paired with their published product, in pin order. */
export function pinnedProducts(products: Product[]): { spot: ScenePinSpot; product: Product }[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return SCENE_PINS.flatMap((spot) => {
    const product = bySlug.get(spot.slug);
    return product ? [{ spot, product }] : [];
  });
}
