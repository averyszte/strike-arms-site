import { useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import {
  EVOLUTION_DRAFT_RIFLES,
  EVOLUTION_RANGE_LABELS,
  RECON_SPEC_POINTS,
  type EvolutionRange,
} from "@/lib/evolution-draft-data";
import { RailCard, RangeCta, ScenePin, type ScenePinSpot } from "@/components/demo/drafts/evolution-drafts-c-parts";
import {
  EYEBROW,
  RANGE_BLURBS,
  RANGE_ORDER,
  SCENE_IMAGE,
  productHref,
  rangePriceLabel,
  riflesInRange,
  shortName,
} from "@/lib/evolution-scene-ranges";

/**
 * Evolution featured section, direction C "Cinematic".
 * C1: a full-bleed scene with shoppable pins, an oversized wordmark and a rail.
 * C2: a pinned, scroll-driven reveal that steps through the three ranges.
 * Both use SCENE_IMAGE, a stand-in until a generated Evolution scene exists.
 */

/** Pins measured on the 16:7 stand-in photo: the OD bolt action and the tan M4. */
const C1_PINS: ScenePinSpot[] = [
  { slug: "evolution-m40-sniper-rifle-od", x: 45, y: 50 },
  { slug: "evolution-recon-14-5-carbontech-black-tan", x: 62, y: 26 },
];

export function EvolutionDraftC1() {
  return (
    <section className="relative bg-background border-y border-border/60 overflow-hidden">
      <div className="relative aspect-video md:aspect-[16/7] max-h-[85vh] w-full">
        <img src={SCENE_IMAGE} alt="Two players in a forest with a bolt action rifle and an M4" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-background/10 to-transparent pointer-events-none" />

        <div className="absolute top-6 md:top-10 right-4 md:right-10 z-10 max-w-[16rem] md:max-w-sm text-right">
          <p className={`${EYEBROW} mb-3`}>Alan's first choice</p>
          <p className="hidden md:block text-base text-muted-foreground leading-relaxed mb-6">
            Carbontech Recon M4s, steel hybrids and a bolt action M40. The range we reach for first.
          </p>
          <div className="hidden md:block"><RangeCta /></div>
        </div>

        {C1_PINS.map((spot, i) => (
          <ScenePin key={spot.slug} spot={spot} index={i} />
        ))}

        {/* Oversized wordmark, bottom aligned so it bleeds into the rail */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 bottom-0 z-10 translate-y-[18%] text-center font-black uppercase leading-none tracking-tighter text-foreground text-[17vw] select-none pointer-events-none"
        >
          Evolution
        </motion.h2>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-16 md:pb-20">
        <div className="flex items-end justify-between gap-6 mb-6">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
            The full Evolution line-up
          </p>
          <Link href="/brands/evolution" className="hidden sm:inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground hover:text-accent transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex md:grid md:grid-cols-4 xl:grid-cols-7 gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {EVOLUTION_DRAFT_RIFLES.map((rifle) => (
            <RailCard key={rifle.slug} rifle={rifle} />
          ))}
        </div>
        <div className="mt-8 md:hidden"><RangeCta /></div>
      </div>
    </section>
  );
}

/** Where the camera "looks" on the stand-in scene for each range chapter. */
const RANGE_FOCUS: Record<EvolutionRange, { scale: number; originX: number; originY: number; isMuted: boolean }> = {
  recon: { scale: 2.1, originX: 0.64, originY: 0.26, isMuted: false },
  "steel-hybrid": { scale: 1.15, originX: 0.5, originY: 0.5, isMuted: true },
  sniper: { scale: 1.9, originX: 0.44, originY: 0.52, isMuted: false },
};

function progressToIndex(progress: number): number {
  return Math.min(RANGE_ORDER.length - 1, Math.max(0, Math.floor(progress * RANGE_ORDER.length)));
}

function SceneFrame({ range, isAnimated }: { range: EvolutionRange; isAnimated: boolean }) {
  const focus = RANGE_FOCUS[range];
  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <motion.img
        src={SCENE_IMAGE}
        alt=""
        initial={false}
        animate={{ scale: focus.scale, originX: focus.originX, originY: focus.originY }}
        transition={isAnimated ? { duration: 1.1, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
        className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-700 ${focus.isMuted ? "grayscale brightness-50" : ""}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-background pointer-events-none" />
      {focus.isMuted && (
        <span className="absolute left-4 bottom-4 bg-background/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Steel Hybrid scene to come
        </span>
      )}
    </div>
  );
}

function ChapterCopy({ range, index }: { range: EvolutionRange; index: number }) {
  const rifles = riflesInRange(range);
  return (
    <div className="flex flex-col">
      <p className={`${EYEBROW} mb-3`}>
        {String(index + 1).padStart(2, "0")} / {String(RANGE_ORDER.length).padStart(2, "0")} &middot; Evolution
      </p>
      <h3 className="text-4xl md:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[0.9] text-foreground">
        {EVOLUTION_RANGE_LABELS[range]}
      </h3>
      <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-md">{RANGE_BLURBS[range]}</p>
      <p className="mt-2 text-sm font-black uppercase tracking-wider text-foreground">{rangePriceLabel(range)}</p>

      {range === "recon" && (
        <ul className="hidden lg:grid mt-6 gap-2">
          {RECON_SPEC_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 w-4 h-4 shrink-0 text-accent" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-6 border-t border-border">
        {rifles.map((rifle) => (
          <li key={rifle.slug}>
            <Link href={productHref(rifle)} className="group flex items-center justify-between gap-4 border-b border-border py-3">
              <span className="text-sm font-black uppercase text-foreground group-hover:text-accent transition-colors">{shortName(rifle)}</span>
              <span className="flex items-center gap-2 text-sm font-black tabular-nums text-foreground">
                {formatPrice(rifle.priceCents)}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Reduced motion: the same three chapters, stacked, with nothing pinned or zooming. */
function StaticChapters() {
  return (
    <section className="bg-background border-y border-border/60">
      {RANGE_ORDER.map((range, i) => (
        <div key={range} className="grid lg:grid-cols-2 border-b border-border/60 last:border-b-0">
          <div className="aspect-video lg:aspect-auto lg:min-h-[32rem]"><SceneFrame range={range} isAnimated={false} /></div>
          <div className="px-4 md:px-10 py-12 flex flex-col justify-center gap-8">
            <ChapterCopy range={range} index={i} />
          </div>
        </div>
      ))}
      <div className="container mx-auto px-4 md:px-6 py-12"><RangeCta label="See every Evolution rifle" /></div>
    </section>
  );
}

export function EvolutionDraftC2() {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActiveIndex(progressToIndex(v)));

  if (shouldReduceMotion) return <StaticChapters />;
  const range = RANGE_ORDER[activeIndex];

  return (
    <section ref={trackRef} className="relative h-[300vh] bg-background border-y border-border/60">
      <div className="sticky top-0 h-[100svh] overflow-hidden grid grid-rows-[38svh_1fr] lg:grid-rows-1 lg:grid-cols-2">
        <SceneFrame range={range} isAnimated />

        <div className="relative flex flex-col justify-center px-4 md:px-10 xl:px-16 py-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={range}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChapterCopy range={range} index={activeIndex} />
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 hidden md:block"><RangeCta label="See every Evolution rifle" /></div>
        </div>

        {/* Chapter rail: three segments that fill as the reader scrolls */}
        <div className="absolute inset-x-0 bottom-0 h-1 flex gap-1 lg:inset-x-auto lg:left-1/2 lg:top-0 lg:h-auto lg:w-1 lg:flex-col">
          {RANGE_ORDER.map((r, i) => (
            <span key={r} className={`flex-1 transition-colors duration-500 ${i <= activeIndex ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
