import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { useEvolutionProducts } from "@/hooks/use-evolution-products";
import { EVOLUTION_SHELF_HREF, SCENE_ALT, SCENE_IMAGE } from "@/lib/evolution-band";
import { EYEBROW } from "@/lib/storefront-styles";
import { EvolutionRailCard } from "@/components/demo/combined/evolution-rail-card";

/** Solid accent call to action into the Evolution shelf. */
function ShelfCta() {
  return (
    <Link
      href={EVOLUTION_SHELF_HREF}
      className="group inline-flex h-14 items-center justify-center gap-2 bg-accent px-8 text-sm font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
    >
      Explore the range
      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  );
}

/**
 * Homepage feature for the Evolution range ("cinematic" draft C1): a full
 * bleed scene, an oversized wordmark, then a rail of every
 * published Evolution rifle. Renders nothing until at least one is published.
 */
export function EvolutionBand() {
  const { products } = useEvolutionProducts();
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="evolution-band-heading" className="relative bg-background border-y border-border/60 overflow-hidden">
      <div className="relative aspect-video md:aspect-[16/7] max-h-[85vh] w-full">
        <img src={SCENE_IMAGE} alt={SCENE_ALT} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-l from-background/80 via-background/10 to-transparent pointer-events-none" />

        <div className="absolute top-6 md:top-10 right-4 md:right-10 z-10 max-w-[16rem] md:max-w-sm text-right">
          <p className={`${EYEBROW} mb-3`}>Featured range</p>
          <p className="hidden md:block text-base text-muted-foreground leading-relaxed mb-6">
            Carbontech Recon M4s, steel hybrid builds and a bolt action M40.
          </p>
          <div className="hidden md:block"><ShelfCta /></div>
        </div>

        <motion.h2
          id="evolution-band-heading"
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
          <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">The Evolution line-up</p>
          <Link
            href={EVOLUTION_SHELF_HREF}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground hover:text-accent transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex md:grid md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {products.map((product) => (
            <EvolutionRailCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 md:hidden"><ShelfCta /></div>
      </div>
    </section>
  );
}
