import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Combined homepage — Shop by Category. Same six live categories and the site's
 * tokens, but with bolder type and a firmer hover than the live CategoryStrip.
 * Laid out as full-width stacked rows (one category per row).
 */
const CATEGORIES = [
  { name: "Rifles", image: "/images/category-rifles.png", href: "/store/rifles" },
  { name: "Pistols", image: "/images/category-pistols.png", href: "/store/pistols" },
  { name: "Consumables", image: "/images/category-bbs.png", href: "/store/consumables" },
  { name: "Accessories", image: "/images/category-accessories.png", href: "/store/accessories" },
  { name: "Gear", image: "/images/category-gear.png", href: "/store/gear" },
  { name: "Parts & Internals", image: "/images/category-repairs.png", href: "/store/parts" },
];

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
              The range
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Shop by
              <br />
              category
            </h2>
          </div>
          <Link
            href="/store"
            className="hidden md:inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-accent hover:underline"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative h-32 md:h-44 rounded-sm overflow-hidden bg-card block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 px-6 md:px-10 flex items-center justify-between">
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-none group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <ArrowUpRight className="w-8 h-8 text-accent shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
