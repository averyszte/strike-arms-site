import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

/**
 * Direction B — categories as bold full-width rows with type overlapping
 * edge-to-edge imagery. Nothing like the live CategoryStrip grid tiles.
 */
const ROWS = [
  { name: "Rifles", href: "/store/rifles", img: "/images/category-rifles.png" },
  { name: "Pistols", href: "/store/pistols", img: "/images/category-pistols.png" },
  { name: "Gear", href: "/store/gear", img: "/images/category-gear.png" },
  { name: "BBs & Gas", href: "/store/bbs", img: "/images/category-bbs.png" },
];

export function CategoryBlocks() {
  return (
    <section className="bg-[#0a0a0a] text-[#f5f1ea]">
      {ROWS.map((row) => (
        <Link
          key={row.name}
          href={row.href}
          className="group relative flex items-center overflow-hidden border-b border-[#f5f1ea]/10 h-[26vh] min-h-[180px]"
        >
          <img
            src={row.img}
            alt={row.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
            <h3 className="font-sans font-black uppercase text-5xl md:text-8xl tracking-[-0.02em] leading-none group-hover:text-[#ff5a1f] transition-colors">
              {row.name}
            </h3>
            <span className="flex items-center gap-2 font-sans font-black uppercase text-sm tracking-wider shrink-0">
              <span className="hidden sm:inline">Shop</span>
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
