import {
  EVOLUTION_DRAFT_RIFLES,
  type EvolutionDraftRifle,
  type EvolutionRange,
} from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";

/**
 * Scene and range data for the "Cinematic" Evolution drafts (evolution-drafts-c).
 *
 * SCENE_IMAGE is a stand-in: the play-style sniper photo happens to show an OD
 * bolt action and a black-and-tan M4, close to the M40 and the Recon. A
 * generated Evolution scene will replace it before anything goes live.
 */
export const SCENE_IMAGE = "/images/playstyles/sniper.webp";
export const RANGE_PAGE = "/brands/evolution";
export const RANGE_ORDER: EvolutionRange[] = ["recon", "steel-hybrid", "sniper"];

/** Short range blurbs, built only from the product descriptions in the data file. */
export const RANGE_BLURBS: Record<EvolutionRange, string> = {
  recon: 'Lightweight Carbontech M4s in 10" and 14.5", in black or black and tan.',
  "steel-hybrid": "An MK18 Mod 1 with a CNC aluminium rail, and a full metal AK with a folding stock.",
  sniper: "A spring powered bolt action M40 in olive drab.",
};

export const EYEBROW = "text-xs font-black uppercase tracking-[0.3em] text-accent";

export function productHref(rifle: EvolutionDraftRifle): string {
  return `/products/${rifle.slug}`;
}

/** "Evolution Recon 10" Carbontech Black" -> "Recon 10" Carbontech Black". */
export function shortName(rifle: EvolutionDraftRifle): string {
  return rifle.name.replace(/^Evolution\s+/, "");
}

export function riflesInRange(range: EvolutionRange): EvolutionDraftRifle[] {
  return EVOLUTION_DRAFT_RIFLES.filter((r) => r.range === range);
}

/** "From €179.00" when the range has more than one price, else the one price. */
export function rangePriceLabel(range: EvolutionRange): string {
  const prices = riflesInRange(range).map((r) => r.priceCents);
  const low = Math.min(...prices);
  return prices.some((p) => p !== low) ? `From ${formatPrice(low)}` : formatPrice(low);
}

export function findRifle(slug: string): EvolutionDraftRifle | undefined {
  return EVOLUTION_DRAFT_RIFLES.find((r) => r.slug === slug);
}
