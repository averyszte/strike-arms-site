import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

/**
 * Direction A — categories rendered as an "armory index": a mono coded list
 * with corner-bracketed image plates. Nothing like the live CategoryStrip tiles.
 */
const INDEX = [
  { code: "RIF", name: "Rifles & AEGs", href: "/store/rifles", img: "/images/category-rifles.png" },
  { code: "PST", name: "Pistols & Sidearms", href: "/store/pistols", img: "/images/category-pistols.png" },
  { code: "AMM", name: "BBs & Gas", href: "/store/bbs", img: "/images/category-bbs.png" },
  { code: "KIT", name: "Tactical Gear", href: "/store/gear", img: "/images/category-gear.png" },
  { code: "ACC", name: "Accessories", href: "/store/accessories", img: "/images/category-accessories.png" },
  { code: "PRT", name: "Parts & Internals", href: "/store/parts", img: "/images/category-repairs.png" },
];

export function ArmoryIndex() {
  return (
    <section className="bg-[#0b0c09] text-[#e9e7dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 border-b border-[#e9e7dc]/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#ff5a1f] mb-3">
              01 — Index
            </p>
            <h2 className="font-sans font-black uppercase text-3xl md:text-5xl tracking-tight">
              The Armory
            </h2>
          </div>
          <Link
            href="/store"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs tracking-[0.2em] uppercase text-[#9a9a86] hover:text-[#ff5a1f] transition-colors"
          >
            Full inventory <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e9e7dc]/10 border border-[#e9e7dc]/10">
          {INDEX.map((item) => (
            <Link
              key={item.code}
              href={item.href}
              className="group relative bg-[#0b0c09] p-5 flex flex-col hover:bg-[#12130d] transition-colors"
            >
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover opacity-80 grayscale-[0.3] group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-l border-t border-[#ff5a1f]" />
                <span className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-r border-b border-[#ff5a1f]" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#6f6f5e]">
                    {item.code}-00
                  </span>
                  <p className="font-sans font-bold text-lg">{item.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6f6f5e] group-hover:text-[#ff5a1f] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
