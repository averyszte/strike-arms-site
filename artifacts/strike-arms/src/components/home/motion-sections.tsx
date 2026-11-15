import { MotionConfig } from "framer-motion";

import { EvolutionBand } from "@/components/home/evolution-band";
import { LoadoutShowcase } from "@/components/home/loadout-showcase";

/**
 * The two home sections that animate with framer-motion, in one module so
 * Home.tsx can load them (and framer-motion) as a single lazy chunk, out of
 * the entry bundle (N-031).
 *
 * MotionConfig reducedMotion="user" makes framer-motion honour the visitor's
 * reduced-motion setting: transforms are skipped and only opacity fades
 * remain. It sits here rather than in App.tsx because framer-motion is
 * imported nowhere else, and an App-level import would put it back in the
 * entry chunk.
 */
export function EvolutionBandSection() {
  return (
    <MotionConfig reducedMotion="user">
      <EvolutionBand />
    </MotionConfig>
  );
}

export function LoadoutShowcaseSection() {
  return (
    <MotionConfig reducedMotion="user">
      <LoadoutShowcase />
    </MotionConfig>
  );
}
