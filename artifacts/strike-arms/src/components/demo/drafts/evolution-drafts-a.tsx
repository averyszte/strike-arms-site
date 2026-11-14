import { Link } from "wouter";
import { ArrowUpRight, Check } from "lucide-react";

import { RECON_SPEC_POINTS, type EvolutionDraftRifle } from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";
import { Eyebrow, OwnerQuote, PhotoToCome, RangeLink, ShopCtas } from "@/components/demo/drafts/evolution-drafts-a-parts";
import {
  RANGE_GROUPS,
  RANGE_NOTES,
  RIFLE_COUNT,
  productHref,
  shortName,
  variantLine,
  type RangeGroup,
} from "@/lib/evolution-range-groups";

/**
 * Evolution featured-section drafts, direction A: "The owner's pick".
 * Editorial and trust-led, with Alan's recommendation as the hook.
 * A1 is a ledger: the quote holds the left column, every rifle sits in ruled
 * rows by range on the right. A2 is three picks: one rifle per range as a big
 * numbered card, with the rest of each range listed underneath.
 */

function SpecTicks() {
  return (
    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
      {RECON_SPEC_POINTS.map((point) => (
        <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          {point}
        </li>
      ))}
    </ul>
  );
}

function LedgerRow({ rifle }: { rifle: EvolutionDraftRifle }) {
  return (
    <li>
      <Link
        href={productHref(rifle)}
        className="group grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-baseline py-4 border-b border-border"
      >
        <span className="font-black uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">
          {shortName(rifle)}
        </span>
        <span className="font-black tabular-nums text-foreground">{formatPrice(rifle.priceCents)}</span>
        <span className="text-sm text-muted-foreground">{variantLine(rifle)}</span>
        <ArrowUpRight
          className="w-4 h-4 justify-self-end text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function LedgerGroup({ group, index }: { group: RangeGroup; index: number }) {
  return (
    <div className="grid md:grid-cols-[9rem_1fr] gap-4 md:gap-8 py-8 border-t-2 border-foreground first:border-t-0 first:pt-0">
      <div className="flex md:flex-col gap-3 md:gap-4 items-start">
        <PhotoToCome className="w-24 h-24 md:w-36 md:h-28 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground md:mt-1">
          {String(index + 1).padStart(2, "0")} / {group.rifles.length} {group.rifles.length === 1 ? "rifle" : "rifles"}
        </span>
      </div>
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">{group.label}</h3>
          <span className="text-sm font-black uppercase tracking-wider text-accent">
            From {formatPrice(group.fromCents)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{RANGE_NOTES[group.range]}</p>
        {group.range === "recon" && <SpecTicks />}
        <ul className="mt-4 border-t border-border">
          {group.rifles.map((rifle) => (
            <LedgerRow key={rifle.slug} rifle={rifle} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function StoreBand() {
  return (
    <div className="relative mt-16 md:mt-20 overflow-hidden border border-border">
      <img
        src="/images/store-front-1.jpg"
        alt="The Strike Arms shop front in Swords"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.35) saturate(0.7)" }}
      />
      <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-end p-8 md:p-12">
        <div>
          <Eyebrow>Before you buy</Eyebrow>
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[0.9] text-foreground">
            Handle one in the
            <br />
            shop in <span className="text-accent">Swords</span>
          </h3>
          <p className="mt-4 max-w-lg text-base text-foreground/80">
            Feel the weight and the length before you decide. Alan will talk you through which
            one suits how you play.
          </p>
        </div>
        <ShopCtas />
      </div>
    </div>
  );
}

/** A1: the ledger. Sticky quote on the left, every rifle in ruled rows. */
export function EvolutionDraftA1() {
  return (
    <section className="py-16 md:py-24 bg-background border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16">
          <div className="lg:sticky lg:top-24 self-start">
            <Eyebrow>The owner's pick</Eyebrow>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-foreground mb-10">
              Alan's
              <br />
              <span className="text-accent">Evolution</span>
            </h2>
            <div className="border-l-2 border-accent pl-6">
              <OwnerQuote />
            </div>
            <p className="mt-8 max-w-md text-base text-muted-foreground">
              Of everything on the shelves, this is the range Alan reaches for first. Three lines,
              {RIFLE_COUNT} rifles, grouped the way he'd talk you through them.
            </p>
            <div className="mt-6">
              <RangeLink />
            </div>
          </div>
          <div>
            {RANGE_GROUPS.map((group, i) => (
              <LedgerGroup key={group.range} group={group} index={i} />
            ))}
          </div>
        </div>
        <StoreBand />
      </div>
    </section>
  );
}

function PickCard({ group, index }: { group: RangeGroup; index: number }) {
  const [pick, ...rest] = group.rifles;
  return (
    <article className="flex flex-col bg-card border border-border">
      <div className="relative">
        <PhotoToCome className="aspect-[4/3] w-full border-0 border-b" />
        <span className="absolute top-2 left-4 font-black text-6xl md:text-7xl leading-none text-foreground/15">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute top-4 right-4 bg-accent px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-accent-foreground">
          {group.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Link href={productHref(pick)} className="group">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight text-foreground group-hover:text-accent transition-colors">
            {shortName(pick)}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">{pick.short}</p>
        <p className="mt-4 text-2xl font-black tabular-nums text-foreground">{formatPrice(pick.priceCents)}</p>
        <p className="mt-5 border-l-2 border-accent pl-4 text-sm italic text-foreground/80">
          [Alan's note on why this is the one to start with]
        </p>
        {rest.length > 0 && (
          <div className="mt-auto pt-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Also in the range
            </p>
            <ul className="divide-y divide-border border-y border-border">
              {rest.map((rifle) => (
                <li key={rifle.slug}>
                  <Link
                    href={productHref(rifle)}
                    className="flex justify-between gap-4 py-2.5 text-sm text-foreground hover:text-accent transition-colors"
                  >
                    <span>{variantLine(rifle)}</span>
                    <span className="tabular-nums font-bold">{formatPrice(rifle.priceCents)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

/** A2: three picks. Full-bleed quote over a scene photo, one card per range. */
export function EvolutionDraftA2() {
  return (
    <section className="bg-background border-y border-border/60">
      <div className="relative overflow-hidden">
        <img
          src="/images/playstyles/mil-sim.webp"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.3) saturate(0.6)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative container mx-auto px-4 md:px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-5xl">
          <Eyebrow>The owner's pick / Evolution</Eyebrow>
          <OwnerQuote size="xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[0.9] text-foreground">
            One pick from
            <br />
            each line
          </h2>
          <RangeLink label={`All ${RIFLE_COUNT} rifles`} />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {RANGE_GROUPS.map((group, i) => (
            <PickCard key={group.range} group={group} index={i} />
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Recon Carbontech spec, from the supplier
          </p>
          <SpecTicks />
        </div>
        <div className="mt-16 grid lg:grid-cols-2 border border-border">
          <div className="relative min-h-[240px]">
            <img
              src="/images/store-front-1.jpg"
              alt="The Strike Arms shop front in Swords"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.7) saturate(0.8)" }}
            />
          </div>
          <div className="bg-card p-8 md:p-12">
            <Eyebrow>Visit the shop</Eyebrow>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-[0.9] text-foreground">
              Handle one in the shop in Swords
            </h3>
            <p className="mt-4 mb-8 text-base text-muted-foreground">
              A photo only tells you so much. Call in, get one in your hands and ask Alan anything
              before you decide.
            </p>
            <ShopCtas />
          </div>
        </div>
      </div>
    </section>
  );
}
