import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const loadouts = [
  {
    id: "beginner",
    name: "Beginner Setup",
    image: "/images/loadout-beginner.png",
    hotspots: [
      { top: "35%", left: "45%", label: "Starter AEG" },
      { top: "15%", left: "55%", label: "Eye Protection" },
      { top: "70%", left: "60%", label: "BBs 0.20g" },
      { top: "45%", left: "30%", label: "Chest Rig" },
    ],
    products: [
      { name: "Specna Arms Core", desc: "Reliable M4 platform, perfect first rifle.", price: "€149.00" },
      { name: "Valken Starter Kit", desc: "Includes battery, charger, and 0.20g BBs.", price: "€35.00" },
    ]
  },
  {
    id: "cqb",
    name: "CQB",
    image: "/images/loadout-cqb.png",
    hotspots: [
      { top: "40%", left: "50%", label: "SMG/PDW" },
      { top: "20%", left: "45%", label: "Tracer Unit" },
      { top: "30%", left: "60%", label: "Full Face Mask" },
    ],
    products: [
      { name: "G&G ARP9", desc: "Compact, fast-firing PDW for tight corners.", price: "€245.00" },
      { name: "Acetech Brighter C", desc: "Compact tracer unit for indoor games.", price: "€59.00" },
    ]
  },
  {
    id: "outdoor",
    name: "Outdoor",
    image: "/images/loadout-outdoor.png",
    hotspots: [
      { top: "50%", left: "55%", label: "Long-barrel AEG" },
      { top: "25%", left: "40%", label: "Magnified Optic" },
      { top: "60%", left: "35%", label: "Plate Carrier" },
    ],
    products: [
      { name: "Krytac Trident MK2", desc: "Exceptional range and accuracy out of the box.", price: "€399.00" },
      { name: "Vortex Crossfire II", desc: "Clear 1-4x magnification.", price: "€210.00" },
    ]
  },
  {
    id: "sniper",
    name: "Sniper",
    image: "/images/loadout-outdoor.png", // Reuse outdoor or make sniper specific later
    hotspots: [
      { top: "45%", left: "65%", label: "Bolt Action Rifle" },
      { top: "15%", left: "35%", label: "High Power Scope" },
      { top: "80%", left: "50%", label: "Heavy BBs (0.40g+)" },
    ],
    products: [
      { name: "Novritsch SSG10", desc: "Pre-upgraded sniper rifle.", price: "€299.00" },
      { name: "Geoffs 0.43g BBs", desc: "Precision heavy ammo.", price: "€24.00" },
    ]
  },
];

export function ShopByLoadout() {
  const [activeTab, setActiveTab] = useState(loadouts[0].id);

  const activeData = loadouts.find(l => l.id === activeTab)!;

  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Shop by Play Style</h2>
            <p className="text-muted-foreground max-w-xl">Curated setups to ensure you have exactly what you need for your environment, without the fluff.</p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-4">
            {loadouts.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors border ${
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
          {/* Image & Hotspots */}
          <div className="lg:col-span-8 relative aspect-video md:aspect-[16/7] rounded-sm overflow-hidden bg-background">
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
                
                {/* Hotspots - hidden on mobile */}
                <div className="hidden md:block">
                  {activeData.hotspots.map((spot, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="absolute flex items-center gap-2 group"
                      style={{ top: spot.top, left: spot.left }}
                    >
                      <div className="w-3 h-3 rounded-full bg-accent animate-pulse ring-4 ring-accent/30" />
                      <div className="bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-sm text-xs font-semibold text-foreground whitespace-nowrap shadow-lg">
                        {spot.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Products Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4 justify-center">
            {/* Mobile labels */}
            <div className="md:hidden flex flex-wrap gap-2 mb-4">
              {activeData.hotspots.map((spot, i) => (
                <span key={i} className="bg-muted px-3 py-1 text-xs rounded-sm font-medium text-foreground">
                  {spot.label}
                </span>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-2">Featured in this setup</h3>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                {activeData.products.map((prod, i) => (
                  <div key={i} className="group p-4 bg-background border border-border rounded-sm hover:border-accent transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground group-hover:text-accent transition-colors">{prod.name}</h4>
                      <span className="text-sm font-semibold">{prod.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{prod.desc}</p>
                    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-accent transition-colors">
                      Enquire <ArrowRight className="w-3 h-3" />
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
