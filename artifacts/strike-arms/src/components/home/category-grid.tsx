import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Each tile is a landscape strip cut from the centre of the original portrait
 * art (the band the tile always showed), at 896 and 448 px wide.
 */
function stripSrc(imageSlug: string, width: 896 | 448): string {
  return `/images/category-${imageSlug}-strip-${width}.webp`;
}

/**
 * Combined homepage — Shop by Category. The five live categories plus the workshop, and the site's
 * tokens, but with bolder type and a firmer hover than the live CategoryStrip.
 * Laid out as full-width stacked rows (one category per row).
 */
const CATEGORIES = [
  { name: "Rifles", imageSlug: "rifles", href: "/store/rifles" },
  { name: "Pistols", imageSlug: "pistols", href: "/store/pistols" },
  { name: "Consumables", imageSlug: "bbs", href: "/store/consumables" },
  { name: "Accessories", imageSlug: "accessories", href: "/store/accessories" },
  { name: "Gear", imageSlug: "gear", href: "/store/gear" },
  { name: "Repairs & Upgrades", imageSlug: "repairs", href: "/services" },
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
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.02]">
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
                src={stripSrc(cat.imageSlug, 896)}
                srcSet={`${stripSrc(cat.imageSlug, 448)} 448w, ${stripSrc(cat.imageSlug, 896)} 896w`}
                sizes="(min-width: 1280px) 1232px, 100vw"
                alt=""
                width={896}
                height={336}
                loading="lazy"
                decoding="async"
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
