import type { CSSProperties } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

import { coverCropX } from "@/lib/cover-crop-x";
import { formatPrice } from "@/lib/format-price";
import { SCENE_ASPECT, payablePriceCents, shortEvolutionName, type ScenePinSpot } from "@/lib/evolution-band";
import type { Product } from "@/types/product";

/** Below md the scene sits in a 16:9 box, which trims its sides. */
const MOBILE_ASPECT = 16 / 9;
/** Pins right of this point put their label on the left, so it stays on screen. */
const FLIP_LEFT_X = 58;

/**
 * A linked hotspot on the Evolution scene. Unlike the play-style HotspotPin it
 * is a link, and its label carries the price, so the photo itself is shoppable.
 */
export function EvolutionScenePin({ spot, product, index }: { spot: ScenePinSpot; product: Product; index: number }) {
  const name = shortEvolutionName(product.name);
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
        <Link href={`/products/${product.slug}`} className="group block" aria-label={name}>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent ring-4 ring-accent/30 group-hover:ring-8 transition-all" />
          <span className={`hidden md:flex absolute top-0 -translate-y-1/2 ${labelSide} items-stretch whitespace-nowrap shadow-lg`}>
            <span className="bg-background/90 backdrop-blur-sm px-3 py-2 text-xs font-black uppercase tracking-wide text-foreground">
              {name}
            </span>
            <span className="bg-accent px-3 py-2 text-xs font-black tabular-nums text-accent-foreground">
              {formatPrice(payablePriceCents(product))}
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
