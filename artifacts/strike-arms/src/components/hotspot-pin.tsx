import { motion } from "framer-motion";

import type { Hotspot } from "@/types/loadout";

/** Past this x the label sits left of the dot so it stays inside the image. */
const FLIP_LEFT_X = 62;
/** Above this y the label drops below the dot so it is not clipped at the top. */
const FLIP_DOWN_Y = 12;

function layoutClass(spot: Hotspot): string {
  if (spot.x > FLIP_LEFT_X) return "flex-row-reverse";
  if (spot.y < FLIP_DOWN_Y) return "flex-col items-center";
  return "flex-row";
}

export function HotspotPin({ spot, index }: { spot: Hotspot; index: number }) {
  const isBelow = spot.x <= FLIP_LEFT_X && spot.y < FLIP_DOWN_Y;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.08 + 0.25 }}
      className="absolute"
      style={{
        top: `${spot.y}%`,
        left: `${spot.x}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className={`flex items-center gap-1.5 ${layoutClass(spot)}`}>
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse ring-[3px] ring-accent/30 shrink-0" />
        <div
          className={`bg-background/90 backdrop-blur-sm border border-border/60 px-2.5 py-1 rounded-sm
            text-[11px] font-semibold text-foreground whitespace-nowrap shadow-md leading-none
            ${isBelow ? "mt-0.5" : ""}`}
        >
          {spot.label}
        </div>
      </div>
    </motion.div>
  );
}
