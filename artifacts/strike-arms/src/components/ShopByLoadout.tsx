import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { loadouts } from "@/lib/loadouts";
import type { Hotspot } from "@/types/loadout";

export function HotspotPin({ spot, index }: { spot: Hotspot; index: number }) {
  // Flip label left if dot is near the right edge (x > 62)
  // Flip label below if dot is near the top edge (y < 12)
  const flipLeft  = spot.x > 62;
  const flipDown  = spot.y < 12;

  return (
    <motion.div
      key={index}
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
      {/* Dot + label arranged based on edge proximity */}
      <div
        className={`flex items-center gap-1.5 ${
          flipLeft  ? "flex-row-reverse" :
          flipDown  ? "flex-col items-center" :
                      "flex-row"
        }`}
      >
        {/* Pulsing dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse ring-[3px] ring-accent/30 shrink-0" />

        {/* Label pill */}
        <div
          className={`bg-background/90 backdrop-blur-sm border border-border/60 px-2.5 py-1 rounded-sm
            text-[11px] font-semibold text-foreground whitespace-nowrap shadow-md leading-none
            ${flipDown ? "mt-0.5" : ""}`}
        >
          {spot.label}
        </div>
      </div>
    </motion.div>
  );
}

export function ShopByLoadout() {
  const [activeTab, setActiveTab] = useState(loadouts[0].id);

  const activeData = loadouts.find((l) => l.id === activeTab)!;

  return (
    <section className="py-24 bg-background border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Shop by Play Style
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Curated setups to help you shop by play style, from starter loadouts to specialist kits.
            </p>
          </div>

          {/* Tab buttons — scroll on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex-shrink-0">
            {loadouts.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors border whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Image + Hotspots */}
          <div
            className="lg:col-span-7 relative aspect-video md:aspect-[16/7] rounded-sm overflow-hidden bg-background"
          >
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
                  alt={activeData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/20" />

                {/* Hotspots — desktop only */}
                <div className="hidden md:block">
                  {activeData.hotspots.map((spot, i) => (
                    <HotspotPin key={`${activeTab}-${i}`} spot={spot} index={i} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Products sidebar */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {/* Mobile labels — compact chips */}
            <div className="md:hidden flex flex-wrap gap-2 mb-2">
              {activeData.hotspots.map((spot, i) => (
                <span
                  key={i}
                  className="bg-muted px-2.5 py-1 text-xs rounded-sm font-medium text-foreground"
                >
                  {spot.label}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-bold text-foreground">Featured in this setup</h3>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3"
              >
                {activeData.products.map((prod, i) => (
                  <div
                    key={i}
                    className="group p-4 bg-background border border-border rounded-sm hover:border-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-snug pr-3">
                        {prod.name}
                      </h4>
                      <span className="text-sm font-semibold shrink-0">{prod.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{prod.desc}</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-accent transition-colors">
                      Buy Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
