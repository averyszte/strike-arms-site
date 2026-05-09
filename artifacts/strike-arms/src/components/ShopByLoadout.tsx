import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const loadouts = [
  {
    id: "beginner",
    name: "Beginner Setup",
    image: "/images/playstyles/beginner-setup.webp",
    hotspots: [
      { top: "38%", left: "48%", label: "Starter Rifle" },
      { top: "16%", left: "56%", label: "Eye Protection" },
      { top: "68%", left: "62%", label: "BBs" },
      { top: "52%", left: "28%", label: "Battery / Charger" },
    ],
    products: [
      {
        name: "Specna Arms Core M4",
        desc: "Reliable entry-level AEG. Perfect first rifle straight out of the box.",
        price: "€149.00",
      },
      {
        name: "Bolle Tracker Safety Glasses",
        desc: "ANSI-rated eye protection. Comfortable fit for full-day sessions.",
        price: "€24.00",
      },
      {
        name: "Nuprol 0.20g BBs — 4,000 rounds",
        desc: "Quality BBs for entry-level AEGs. Consistent, seamless feed.",
        price: "€12.00",
      },
    ],
  },
  {
    id: "cqb",
    name: "CQB",
    image: "/images/playstyles/cqb.webp",
    hotspots: [
      { top: "42%", left: "52%", label: "Compact Rifle / SMG" },
      { top: "22%", left: "60%", label: "Red Dot Sight" },
      { top: "34%", left: "32%", label: "Mid-Cap Magazine" },
      { top: "60%", left: "44%", label: "Tactical Light" },
    ],
    products: [
      {
        name: "G&G ARP9",
        desc: "Compact 9mm-style AEG. Fast rate of fire, purpose-built for CQB.",
        price: "€245.00",
      },
      {
        name: "Theta Optics Holosight",
        desc: "Lightweight red dot with crisp 1 MOA reticle. Fits any 20mm rail.",
        price: "€49.00",
      },
      {
        name: "G&G Mid-Cap Magazine — 5 Pack",
        desc: "110-round mid-caps. No winding, reliable feeding under pressure.",
        price: "€35.00",
      },
    ],
  },
  {
    id: "milsim",
    name: "MIL-SIM",
    image: "/images/playstyles/mil-sim.webp",
    hotspots: [
      { top: "30%", left: "42%", label: "Primary Rifle" },
      { top: "14%", left: "55%", label: "Comms / Headset" },
      { top: "55%", left: "30%", label: "Plate Carrier" },
      { top: "48%", left: "65%", label: "Pouches / Load Bearing Gear" },
    ],
    products: [
      {
        name: "Krytac Trident MK2 CRB",
        desc: "Field-grade AEG with strong internals. Reliable in any conditions.",
        price: "€399.00",
      },
      {
        name: "WOSPORT Plate Carrier",
        desc: "Fully adjustable Molle vest with quick-release. Field-ready.",
        price: "€89.00",
      },
      {
        name: "Nuprol Molle Double Mag Pouch",
        desc: "Fits M4/M16 magazines. Secure retention, fast draw.",
        price: "€18.00",
      },
    ],
  },
  {
    id: "sniper",
    name: "Sniper",
    image: "/images/playstyles/sniper.webp",
    hotspots: [
      { top: "44%", left: "62%", label: "Bolt Action Rifle" },
      { top: "18%", left: "38%", label: "High Power Scope" },
      { top: "72%", left: "52%", label: "Heavy BBs" },
      { top: "60%", left: "30%", label: "Bipod / Support Gear" },
    ],
    products: [
      {
        name: "Novritsch SSG10 A1",
        desc: "Pre-upgraded bolt action. Exceptional range and out-of-box performance.",
        price: "€299.00",
      },
      {
        name: "Theta Optics 3–9×40 Scope",
        desc: "Mil-dot reticle with adjustable magnification. Suits woodland ranges.",
        price: "€69.00",
      },
      {
        name: "Geoff's 0.43g Premium BBs",
        desc: "High-weight precision BBs for upgraded snipers. Consistent trajectory.",
        price: "€24.00",
      },
    ],
  },
];

export function ShopByLoadout() {
  const [activeTab, setActiveTab] = useState(loadouts[0].id);

  const activeData = loadouts.find((l) => l.id === activeTab)!;

  return (
    <section className="py-24 bg-card border-y border-border">
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
          <div className="lg:col-span-7 relative aspect-video md:aspect-[16/7] rounded-sm overflow-hidden bg-background">
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
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="absolute flex items-center gap-2"
                      style={{ top: spot.top, left: spot.left }}
                    >
                      <div className="w-3 h-3 rounded-full bg-accent animate-pulse ring-4 ring-accent/30 shrink-0" />
                      <div className="bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-sm text-xs font-semibold text-foreground whitespace-nowrap shadow-lg">
                        {spot.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Products sidebar */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {/* Mobile labels */}
            <div className="md:hidden flex flex-wrap gap-2 mb-2">
              {activeData.hotspots.map((spot, i) => (
                <span
                  key={i}
                  className="bg-muted px-3 py-1 text-xs rounded-sm font-medium text-foreground"
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
