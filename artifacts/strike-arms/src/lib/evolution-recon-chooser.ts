import {
  EVOLUTION_DRAFT_RIFLES,
  EVOLUTION_RANGE_LABELS,
  type EvolutionDraftRifle,
} from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";

/** Recon chooser and price ladder logic for the "Find your Evolution" drafts (evolution-drafts-b). */

export type ReconLength = '10"' | '14.5"';
export type ReconColour = "Black" | "Black and Tan";

export const RECON_LENGTHS: { value: ReconLength; label: string; note: string }[] = [
  { value: '10"', label: '10"', note: "Compact" },
  { value: '14.5"', label: '14.5"', note: "Full length" },
];

export const RECON_COLOURS: { value: ReconColour; label: string }[] = [
  { value: "Black", label: "Black" },
  { value: "Black and Tan", label: "Black and Tan" },
];

export const BRAND_HREF = "/brands/evolution";

export function productHref(slug: string): string {
  return `/products/${slug}`;
}

/** The Recon matching a length and colour, or undefined if none is listed. */
export function findRecon(length: ReconLength, colour: ReconColour): EvolutionDraftRifle | undefined {
  return EVOLUTION_DRAFT_RIFLES.find(
    (r) => r.range === "recon" && r.length === length && r.colour === colour,
  );
}

/** Everything that isn't one of the four near-identical Recons, cheapest first. */
export function nonReconRifles(): EvolutionDraftRifle[] {
  return EVOLUTION_DRAFT_RIFLES.filter((r) => r.range !== "recon").sort(
    (a, b) => a.priceCents - b.priceCents,
  );
}

/** Bar width for the length picker, as a share of the longest Recon. */
export function lengthBarPercent(length: ReconLength): number {
  return Math.round((parseFloat(length) / 14.5) * 100);
}

export type PriceStep = { priceCents: number; rifles: EvolutionDraftRifle[] };

/** The range grouped into one step per distinct price, cheapest first. */
export function priceSteps(): PriceStep[] {
  const byPrice = new Map<number, EvolutionDraftRifle[]>();
  for (const rifle of EVOLUTION_DRAFT_RIFLES) {
    byPrice.set(rifle.priceCents, [...(byPrice.get(rifle.priceCents) ?? []), rifle]);
  }
  return [...byPrice.entries()]
    .sort(([a], [b]) => a - b)
    .map(([priceCents, rifles]) => ({ priceCents, rifles }));
}

/** Where a price sits along the rail, 0 to 100. */
export function railPercent(priceCents: number, steps: PriceStep[]): number {
  const min = steps[0]?.priceCents ?? 0;
  const max = steps[steps.length - 1]?.priceCents ?? min;
  return max === min ? 0 : ((priceCents - min) / (max - min)) * 100;
}

/** Euro cents more than the step before, or 0 for the first step. */
export function stepUpCents(steps: PriceStep[], index: number): number {
  return index > 0 ? steps[index].priceCents - steps[index - 1].priceCents : 0;
}

/** Distinct colours across a step, for the spec sheet. */
export function stepColours(step: PriceStep): string {
  const colours = new Set(step.rifles.flatMap((r) => (r.colour ? [r.colour] : [])));
  return colours.size > 0 ? [...colours].join(", ") : "See product";
}

/** Distinct range names across a step, for the spec sheet. */
export function stepRanges(step: PriceStep): string {
  return [...new Set(step.rifles.map((r) => EVOLUTION_RANGE_LABELS[r.range]))].join(", ");
}

/** Whole-euro display for the rail, e.g. 17900 -> "€179". */
export function shortPrice(cents: number): string {
  return formatPrice(cents).replace(/\.00$/, "");
}

export function rifleCountLabel(count: number): string {
  return `${count} ${count === 1 ? "rifle" : "rifles"}`;
}
