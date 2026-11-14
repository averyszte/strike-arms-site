import type { CSSProperties } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight, Camera } from "lucide-react";

import { coverCropX } from "@/lib/cover-crop-x";
import { formatPrice } from "@/lib/format-price";
import {
  EVOLUTION_RANGE_LABELS,
  type EvolutionDraftRifle,
} from "@/lib/evolution-draft-data";
import { RANGE_PAGE, productHref, shortName, findRifle } from "@/lib/evolution-scene-ranges";

/**
 * Shared pieces for the "Cinematic" Evolution drafts (C1 and C2).
 */

/** No product photos yet: a clearly marked stand-in panel. */
export function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground ${className}`}
    >
      <Camera className="w-6 h-6" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Photo to come</span>
    </div>
  );
}

/** One card in the C1 product rail. */
export function RailCard({ rifle }: { rifle: EvolutionDraftRifle }) {
  return (
    <Link
      href={productHref(rifle)}
      className="group snap-start shrink-0 w-[15rem] md:w-auto flex flex-col bg-card border-2 border-border hover:border-accent transition-colors"
    >
      <PhotoPlaceholder className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
          {EVOLUTION_RANGE_LABELS[rifle.range]}
        </p>
        <h3 className="text-sm font-black uppercase leading-tight text-foreground">
          {shortName(rifle)}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black tabular-nums text-foreground">
            {formatPrice(rifle.priceCents)}
          </span>
          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

export type ScenePinSpot = { slug: string; x: number; y: number };

/** The scene photo is 16:7; below md it sits in a 16:9 box, which trims the sides. */
const SCENE_ASPECT = 16 / 7;
const MOBILE_ASPECT = 16 / 9;
const FLIP_LEFT_X = 58;

/**
 * A linked hotspot on the C1 scene. Unlike the play-style HotspotPin it is a
 * link, and its label carries the price, so the photo itself is shoppable.
 */
export function ScenePin({ spot, index }: { spot: ScenePinSpot; index: number }) {
  const rifle = findRifle(spot.slug);
  if (!rifle) return null;
  const style = {
    top: `${spot.y}%`,
    "--pin-x": `${spot.x}%`,
    "--pin-x-sm": `${coverCropX(spot.x, SCENE_ASPECT, MOBILE_ASPECT)}%`,
  } as CSSProperties;
  const labelSide = spot.x > FLIP_LEFT_X ? "right-4 flex-row-reverse" : "left-4";

  return (
    <div className="absolute z-20 left-[var(--pin-x-sm)] md:left-[var(--pin-x)]" style={style}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15 + 0.4 }}
        className="relative"
      >
        <Link href={productHref(rifle)} className="group block" aria-label={shortName(rifle)}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-accent/30 group-hover:ring-8 transition-all" />
          <span
            className={`hidden md:flex absolute top-0 -translate-y-1/2 ${labelSide} items-stretch whitespace-nowrap shadow-lg`}
          >
            <span className="bg-background/90 backdrop-blur-sm px-3 py-2 text-xs font-black uppercase tracking-wide text-foreground">
              {shortName(rifle)}
            </span>
            <span className="bg-accent px-3 py-2 text-xs font-black tabular-nums text-accent-foreground">
              {formatPrice(rifle.priceCents)}
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

/** Solid accent call to action, the house style for primary buttons. */
export function RangeCta({ label = "Explore the range" }: { label?: string }) {
  return (
    <Link
      href={RANGE_PAGE}
      className="group inline-flex h-14 items-center justify-center gap-2 bg-accent px-8 text-sm font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
    >
      {label}
      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  );
}
