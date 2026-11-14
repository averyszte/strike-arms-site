import { useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronUp } from "lucide-react";

import { EVOLUTION_DRAFT_RIFLES, RECON_SPEC_POINTS, type EvolutionDraftRifle } from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";
import { ChooserStep, Eyebrow, OptionButton, RangeRow, SpecRow, PhotoPlaceholder, RangeLink } from "@/components/demo/drafts/evolution-drafts-b-parts";
import {
  RECON_COLOURS,
  RECON_LENGTHS,
  findRecon,
  lengthBarPercent,
  nonReconRifles,
  priceSteps,
  productHref,
  railPercent,
  rifleCountLabel,
  shortPrice,
  stepColours,
  stepRanges,
  stepUpCents,
  type PriceStep,
  type ReconColour,
  type ReconLength,
} from "@/lib/evolution-recon-chooser";

/**
 * Evolution featured-section drafts, direction B "Find your Evolution".
 * B1: a Recon chooser (length + colour) beside the rest of the range.
 * B2: a price ladder from the cheapest to the dearest, with a spec sheet per step.
 */

function ReconResult({ rifle }: { rifle: EvolutionDraftRifle }) {
  return (
    <motion.div
      key={rifle.slug}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="border-2 border-accent bg-card p-5"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">Your Recon</p>
      <h3 className="mt-2 text-2xl font-black uppercase tracking-tight leading-none">{rifle.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{rifle.short}</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-black leading-none">{formatPrice(rifle.priceCents)}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Code {rifle.supplierCode}</p>
        </div>
        <Link
          href={productHref(rifle.slug)}
          className="group inline-flex h-12 items-center gap-2 bg-accent px-6 text-sm font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
        >
          View this rifle
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

/** B1: pick a length, pick a colour, and the one matching Recon appears. */
export function EvolutionDraftB1() {
  const [length, setLength] = useState<ReconLength>('10"');
  const [colour, setColour] = useState<ReconColour>("Black");
  const rifle = findRecon(length, colour);
  const others = nonReconRifles();

  return (
    <section className="py-16 md:py-24 bg-background border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <Eyebrow>Alan's pick: Evolution</Eyebrow>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Find your
              <br />
              <span className="text-accent">Recon</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground md:text-right">
            Four Recons, one rifle underneath. They only differ in barrel length and colour, so pick those two and you're done.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
            <PhotoPlaceholder label={rifle?.name ?? "Evolution Recon"} className="aspect-[4/5] md:aspect-auto md:min-h-[26rem]" />
            <div className="flex flex-col gap-6">
              <ChooserStep index={1} title="Length">
                {RECON_LENGTHS.map((opt) => (
                  <OptionButton key={opt.value} isActive={length === opt.value} onClick={() => setLength(opt.value)}>
                    <span className="block text-2xl font-black leading-none">{opt.label}</span>
                    <span className="block text-xs uppercase tracking-wider mt-1">{opt.note}</span>
                    <span className="mt-3 block h-1.5 bg-accent" style={{ width: `${lengthBarPercent(opt.value)}%` }} />
                  </OptionButton>
                ))}
              </ChooserStep>
              <ChooserStep index={2} title="Colour">
                {RECON_COLOURS.map((opt) => (
                  <OptionButton key={opt.value} isActive={colour === opt.value} onClick={() => setColour(opt.value)}>
                    <span className="block text-sm font-black uppercase tracking-wide">{opt.label}</span>
                  </OptionButton>
                ))}
              </ChooserStep>
              <AnimatePresence mode="wait">{rifle ? <ReconResult rifle={rifle} /> : null}</AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Every Recon comes with</h3>
              <ul className="space-y-2">
                {RECON_SPEC_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-3">Rest of the range</h3>
              {others.map((r) => (
                <RangeRow key={r.slug} rifle={r} />
              ))}
              <div className="mt-6">
                <RangeLink />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type RailStopProps = { step: PriceStep; steps: PriceStep[]; isActive: boolean; isFlipped: boolean; onSelect: () => void };

/** One price on the rail. Close prices sit near each other, so every other label flips above the line. */
function RailStop({ step, steps, isActive, isFlipped, onSelect }: RailStopProps) {
  const left = `${railPercent(step.priceCents, steps)}%`;
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      style={isFlipped ? { left, bottom: "calc(50% - 10px)" } : { left, top: "calc(50% - 10px)" }}
      className={`group absolute -translate-x-1/2 flex items-center gap-0 ${isFlipped ? "flex-col-reverse" : "flex-col"}`}
    >
      <span className={`w-5 h-5 border-2 rounded-none transition-colors ${isActive ? "bg-accent border-accent" : "bg-background border-foreground group-hover:border-accent"}`} />
      <span className={`mt-2 mb-1 text-sm md:text-lg font-black transition-colors ${isActive ? "text-accent" : "text-foreground"}`}>
        {shortPrice(step.priceCents)}
      </span>
      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {rifleCountLabel(step.rifles.length)}
      </span>
    </button>
  );
}

function StepSheet({ step, stepUp }: { step: PriceStep; stepUp: number }) {
  return (
    <motion.div
      key={step.priceCents}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="grid md:grid-cols-[1fr_1.4fr] gap-6 md:gap-10"
    >
      <div>
        <p className="text-6xl md:text-7xl font-black leading-none">{shortPrice(step.priceCents)}</p>
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          {stepUp > 0 ? <ChevronUp className="w-4 h-4 text-accent" aria-hidden="true" /> : null}
          {stepUp > 0 ? `${formatPrice(stepUp)} over the step below` : "Where the range starts"}
        </p>
        <dl className="mt-6 border-t border-border">
          <SpecRow term="Range">{stepRanges(step)}</SpecRow>
          <SpecRow term="Colours">{stepColours(step)}</SpecRow>
        </dl>
      </div>
      <ul className="grid sm:grid-cols-2 gap-4">
        {step.rifles.map((r) => (
          <li key={r.slug}>
            <Link href={productHref(r.slug)} className="group block">
              <PhotoPlaceholder label={r.name} className="aspect-[4/3]" />
              <h4 className="mt-3 font-black uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">{r.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{r.short}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">Code {r.supplierCode}</p>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** B2: the whole range on one price rail; each stop opens its spec sheet. */
export function EvolutionDraftB2() {
  const steps = priceSteps();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = steps[activeIndex];

  return (
    <section className="py-16 md:py-24 bg-card border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <Eyebrow>The Evolution range</Eyebrow>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Step up the
              <br />
              <span className="text-accent">price ladder</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:items-end max-w-sm">
            <p className="text-muted-foreground md:text-right">
              {EVOLUTION_DRAFT_RIFLES.length} rifles between {shortPrice(steps[0].priceCents)} and{" "}
              {shortPrice(steps[steps.length - 1].priceCents)}. Tap a price to see what it gets you.
            </p>
            <RangeLink />
          </div>
        </div>

        <div className="relative mx-6 md:mx-10 h-36 mb-8" role="group" aria-label="Evolution prices">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-border" />
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-accent transition-all duration-300"
            style={{ width: `${railPercent(active.priceCents, steps)}%` }}
          />
          {steps.map((step, i) => (
            <RailStop key={step.priceCents} step={step} steps={steps} isActive={i === activeIndex} isFlipped={i % 2 === 1} onSelect={() => setActiveIndex(i)} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <StepSheet step={active} stepUp={stepUpCents(steps, activeIndex)} />
        </AnimatePresence>
      </div>
    </section>
  );
}
