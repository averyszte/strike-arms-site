import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "Rifles",              image: "/images/category-rifles.png",      href: "/store/rifles" },
  { name: "Pistols",             image: "/images/category-pistols.png",     href: "/store/pistols" },
  { name: "Consumables",         image: "/images/category-bbs.png",         href: "/store/consumables" },
  { name: "Accessories",         image: "/images/category-accessories.png", href: "/store/accessories" },
  { name: "Gear",                image: "/images/category-gear.png",        href: "/store/gear" },
  { name: "Parts & Internals",   image: "/images/category-repairs.png",     href: "/store/parts" },
];

export function CategoryStrip() {
  return (
    <section className="py-16 md:py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Shop by Category</h2>
          <Link href="/store" className="hidden md:flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: Grid */}
        <div className="flex overflow-x-auto pb-6 md:pb-0 md:grid md:grid-cols-6 gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative flex-none w-[70vw] sm:w-[45vw] md:w-auto aspect-[3/4] rounded-sm overflow-hidden bg-card snap-center block"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 flex flex-col justify-end">
                <h3 className="text-base md:text-lg font-bold text-foreground mb-1 md:mb-2 leading-snug">
                  {cat.name}
                </h3>

                <div className="overflow-hidden h-0 md:h-auto group-hover:h-auto opacity-0 group-hover:opacity-100 md:opacity-100 md:translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <span className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
