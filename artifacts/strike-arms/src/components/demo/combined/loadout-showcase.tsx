import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HotspotPin } from "@/components/ShopByLoadout";
import { loadouts } from "@/lib/loadouts";

/**
 * Combined homepage — demo-styled variant of the live ShopByLoadout. Same
 * interactive hotspot image + product list, but re-dressed to match the rest of
 * the combined demo: orange eyebrow, big black uppercase heading, chunky
 * uppercase tabs. Reuses the live component's data/hotspot logic so there's a
 * single source of truth and the live homepage stays untouched.
 */
export function LoadoutShowcase() {
  const [activeTab, setActiveTab] = useState(loadouts[0].id);
  const activeData = loadouts.find((l) => l.id === activeTab)!;

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
                  alt={activeData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/20" />
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
                  className="bg-muted px-2.5 py-1 text-xs rounded-none font-semibold text-foreground"
                >
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
                {activeData.products.map((prod, i) => (
                  <div
                    key={i}
                    className="group p-4 bg-card border-2 border-border rounded-none hover:border-accent transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-black uppercase text-sm text-foreground group-hover:text-accent transition-colors leading-snug pr-3 tracking-tight">
                        {prod.name}
                      </h4>
                      <span className="text-sm font-black shrink-0">{prod.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{prod.desc}</p>
                    <button className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground group-hover:text-accent transition-colors">
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
