import type { Product } from "@/types/product";

/**
 * Content for the homepage Evolution band: the scene and the shelf it links
 * to.
 *
 * The scene shows two players with black-and-tan M4s: a short one on the
 * left (the Recon 10") and a longer one on the right (the Recon 14.5").
 */
export const SCENE_IMAGE = "/images/evolution/evolution-banner.webp";
export const SCENE_ALT = "Two players kneeling in long grass with black and tan M4 rifles";

export const EVOLUTION_TAG = "evolution-range";
export const EVOLUTION_SHELF_HREF = "/evolution";

/** "Evolution Recon 10\" Carbontech Black" -> "Recon 10\" Carbontech Black". */
export function shortEvolutionName(name: string): string {
  return name.replace(/^Evolution\s+/, "");
}

/** The price a customer pays: the sale price when it undercuts the list price. */
export function payablePriceCents(product: Product): number {
  const { salePrice, price } = product;
  return salePrice !== undefined && salePrice < price ? salePrice : price;
}
