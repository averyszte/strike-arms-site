import type { CSSProperties } from "react";
import { motion } from "framer-motion";

import { coverCropX } from "@/lib/cover-crop-x";
import type { Hotspot } from "@/types/loadout";

/** Hotspot x/y are measured on a 16:7 photo, shown in a 16:7 box from md up. */
const IMAGE_ASPECT = 16 / 7;
/** Below md the box is 16:9, so cover trims the photo's sides. */
const MOBILE_BOX_ASPECT = 16 / 9;
/** Past this x the label sits left of the dot so it stays inside the image. */
const FLIP_LEFT_X = 62;
/** Above this y the label drops below the dot so it is not clipped at the top. */
const FLIP_DOWN_Y = 12;

function labelPositionClass(spot: Hotspot): string {
  if (spot.x > FLIP_LEFT_X) return "right-3 top-0 -translate-y-1/2";
  if (spot.y < FLIP_DOWN_Y) return "top-3 left-0 -translate-x-1/2";
  return "left-3 top-0 -translate-y-1/2";
}

/**
 * One labelled point on a play-style photo. The dot's centre is the hotspot;
 * the label hangs off it. Below md there is no room for labels, so the dot
 * carries a number that matches the numbered chips under the photo.
 */
export function HotspotPin({ spot, index }: { spot: Hotspot; index: number }) {
  const style = {
    top: `${spot.y}%`,
    "--pin-x": `${spot.x}%`,
    "--pin-x-sm": `${coverCropX(spot.x, IMAGE_ASPECT, MOBILE_BOX_ASPECT)}%`,
  } as CSSProperties;

  return (
    <div className="absolute left-[var(--pin-x-sm)] md:left-[var(--pin-x)]" style={style}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.08 + 0.25 }}
        className="relative"
      >
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
            w-5 h-5 md:w-2.5 md:h-2.5 rounded-full bg-accent ring-[3px] ring-accent/30 md:animate-pulse
            text-[10px] font-black leading-none text-accent-foreground"
        >
          <span className="md:hidden">{index + 1}</span>
        </span>
        <span
          className={`hidden md:block absolute ${labelPositionClass(spot)}
            bg-background/90 backdrop-blur-sm border border-border/60 px-2.5 py-1 rounded-sm
            text-[11px] font-semibold text-foreground whitespace-nowrap shadow-md leading-none`}
        >
          {spot.label}
        </span>
      </motion.div>
    </div>
  );
}
