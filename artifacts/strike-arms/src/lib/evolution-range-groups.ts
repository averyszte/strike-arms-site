import {
  EVOLUTION_DRAFT_RIFLES,
  EVOLUTION_RANGE_LABELS,
  type EvolutionDraftRifle,
  type EvolutionRange,
} from "@/lib/evolution-draft-data";

/** Range grouping and naming for the "owner's pick" Evolution drafts (evolution-drafts-a). */

export const RANGE_ORDER: EvolutionRange[] = ["recon", "steel-hybrid", "sniper"];

export type RangeGroup = {
  range: EvolutionRange;
  label: string;
  rifles: EvolutionDraftRifle[];
  fromCents: number;
};

function buildGroups(rifles: EvolutionDraftRifle[]): RangeGroup[] {
  return RANGE_ORDER.flatMap((range) => {
    const inRange = rifles.filter((r) => r.range === range);
    if (inRange.length === 0) return [];
    const fromCents = Math.min(...inRange.map((r) => r.priceCents));
    return [{ range, label: EVOLUTION_RANGE_LABELS[range], rifles: inRange, fromCents }];
  });
}

export const RANGE_GROUPS = buildGroups(EVOLUTION_DRAFT_RIFLES);

/** Short blurb per range, kept to what the product names already say. */
export const RANGE_NOTES: Record<EvolutionRange, string> = {
  recon: "Lightweight Carbontech M4s in 10\" and 14.5\", black or black and tan.",
  "steel-hybrid": "The heavier builds: a metal hybrid MK18 and a full metal AK.",
  sniper: "Spring powered bolt action, in olive drab.",
};

/** "14.5\" / Black and Tan", or the short line when there are no variant facts. */
export function variantLine(rifle: EvolutionDraftRifle): string {
  const parts = [rifle.length, rifle.colour].filter((p): p is NonNullable<typeof p> => p !== undefined);
  return parts.length > 0 ? parts.join(" / ") : rifle.short;
}

/** Drop the brand prefix: the section already says Evolution. */
export function shortName(rifle: EvolutionDraftRifle): string {
  return rifle.name.replace(/^Evolution /, "");
}

export const RIFLE_COUNT = EVOLUTION_DRAFT_RIFLES.length;

export function productHref(rifle: EvolutionDraftRifle): string {
  return `/products/${rifle.slug}`;
}

export const RANGE_HREF = "/brands/evolution";
