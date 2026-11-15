import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { HotspotPin } from "@/components/hotspot-pin";
import { LoadoutProductCard } from "@/components/home/loadout-product-card";
import { useLoadoutProducts } from "@/hooks/use-loadout-products";
import { loadouts } from "@/lib/loadouts";
import { LOADOUT_IMAGE_FULL_WIDTH, LOADOUT_IMAGE_WIDTHS, publicImageSrcSet } from "@/lib/public-image-srcset";

/**
 * Homepage "Shop by play style": a tabbed photo with labelled hotspots and the
 * featured products beside it. Products come from the catalogue by slug, so
 * names and prices are always current and each card links to its product page.
 */
export function LoadoutShowcase() {
  const [activeTab, setActiveTab] = useState(loadouts[0].id);
  const activeData = loadouts.find((l) => l.id === activeTab)!;
  const { bySlug, isLoading } = useLoadoutProducts();

  return (
    <section className="py-16 md:py-24 bg-background border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
              Build your loadout
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Shop by
              <br />
              play style
            </h2>
          </div>

          {/* Tab buttons — scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex-shrink-0">
            {loadouts.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-black uppercase tracking-wider rounded-none transition-colors border-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted-foreground border-border hover:border-accent hover:text-accent"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Image + hotspots */}
          <div className="lg:col-span-7 relative aspect-video md:aspect-[16/7] rounded-none overflow-hidden bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <img
                  src={activeData.image}
                  srcSet={publicImageSrcSet(activeData.image, LOADOUT_IMAGE_WIDTHS, LOADOUT_IMAGE_FULL_WIDTH)}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  alt={activeData.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/20" />
                {activeData.hotspots.map((spot, i) => (
                  <HotspotPin key={`${activeTab}-${i}`} spot={spot} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Products sidebar */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {/* Mobile key: numbered to match the numbered pins on the photo */}
            <div className="md:hidden flex flex-wrap gap-2 mb-2">
              {activeData.hotspots.map((spot, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-muted pl-1 pr-2.5 py-1 text-xs rounded-none font-semibold text-foreground"
                >
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-accent text-[10px] font-black leading-none text-accent-foreground">
                    {i + 1}
                  </span>
                  {spot.label}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
              Featured in this setup
            </h3>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {activeData.products.map((item) => {
                  const product = bySlug.get(item.slug);
                  if (product) {
                    return <LoadoutProductCard key={item.slug} product={product} desc={item.desc} />;
                  }
                  return isLoading ? (
                    <div key={item.slug} className="h-24 bg-card border-2 border-border animate-pulse" />
                  ) : null;
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
