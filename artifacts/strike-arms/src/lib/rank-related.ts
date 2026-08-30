import type { CrossSellTarget } from '@/lib/cross-sell';
import type { Product } from '@/types/product';

/**
 * Choosing which four products to show under the one being looked at.
 *
 * The old rule was "the first few in the same subcategory", which shows nothing
 * at all for a subcategory holding a single product -- exactly the pages that
 * need the help most. Similar products now widen to the category and rank what
 * they find, so the row is only empty when the category genuinely is.
 *
 * Ties are broken all the way down to id. Two products with equal scores in an
 * unstable order would reshuffle on every render, and a row that moves under a
 * cursor is a row people misclick.
 */

/** Same shelf. The strongest signal there is. */
const SAME_SUBCATEGORY = 4;
/** Same make -- someone looking at a Specna rifle often wants another. */
const SAME_BRAND = 2;
/**
 * Something they can actually buy today. Worth more than a price match, so an
 * out-of-stock item never leads a row over an equally close one in stock.
 */
const IN_STOCK = 2;
/** Roughly the same money. A 600 euro rifle beside a 40 euro one helps nobody. */
const SIMILAR_PRICE = 1;
const PRICE_BAND = 0.4;

function effectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

function priceDistance(a: Product, b: Product): number {
  return Math.abs(effectivePrice(a) - effectivePrice(b));
}

function isSimilarPrice(product: Product, other: Product): boolean {
  const anchor = effectivePrice(product);
  if (anchor <= 0) return false;
  return priceDistance(product, other) / anchor <= PRICE_BAND;
}

function similarityScore(product: Product, other: Product): number {
  let score = 0;
  if (other.subcategory === product.subcategory) score += SAME_SUBCATEGORY;
  if (other.brand === product.brand) score += SAME_BRAND;
  if (other.inStock) score += IN_STOCK;
  if (isSimilarPrice(product, other)) score += SIMILAR_PRICE;
  return score;
}

export function rankSimilar(product: Product, candidates: Product[], limit: number): Product[] {
  return candidates
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      candidate,
      score: similarityScore(product, candidate),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const byPrice = priceDistance(product, a.candidate) - priceDistance(product, b.candidate);
      if (byPrice !== 0) return byPrice;
      return a.candidate.id.localeCompare(b.candidate.id);
    })
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Cheap, available and in the shop window first. */
function compareAddOns(a: Product, b: Product): number {
  if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  const byPrice = effectivePrice(a) - effectivePrice(b);
  if (byPrice !== 0) return byPrice;
  return a.id.localeCompare(b.id);
}

/**
 * One from each target before a second from any of them.
 *
 * Taking the best four outright would let a well-stocked shelf swallow the row:
 * a rifle would be offered four batteries and no BBs. Going round the targets
 * in turn keeps the suggestions covering different needs.
 */
export function pickCrossSell(
  product: Product,
  candidates: Product[],
  targets: CrossSellTarget[],
  limit: number,
): Product[] {
  const byTarget = new Map<string, Product[]>();
  for (const candidate of candidates) {
    if (candidate.id === product.id) continue;
    const key = `${candidate.category}/${candidate.subcategory}`;
    const bucket = byTarget.get(key);
    if (bucket) bucket.push(candidate);
    else byTarget.set(key, [candidate]);
  }
  for (const bucket of byTarget.values()) bucket.sort(compareAddOns);

  const keys = targets.map((target) => `${target.category}/${target.subcategory}`);
  const picked: Product[] = [];
  const taken = new Set<string>();

  for (let round = 0; picked.length < limit; round += 1) {
    let addedThisRound = false;
    for (const key of keys) {
      if (picked.length >= limit) break;
      const candidate = byTarget.get(key)?.[round];
      if (!candidate || taken.has(candidate.id)) continue;
      taken.add(candidate.id);
      picked.push(candidate);
      addedThisRound = true;
    }
    if (!addedThisRound) break;
  }

  return picked;
}
