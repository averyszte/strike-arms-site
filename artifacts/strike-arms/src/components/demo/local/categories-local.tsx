import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Direction C — categories as warm, rounded, photography-led cards with serif
 * labels. Calm grid, generous space — distinct from the live CategoryStrip.
 */
const CATEGORIES = [
  { name: "Rifles & AEGs", href: "/store/rifles", img: "/images/category-rifles.png" },
  { name: "Pistols", href: "/store/pistols", img: "/images/category-pistols.png" },
  { name: "Tactical gear", href: "/store/gear", img: "/images/category-gear.png" },
  { name: "BBs & gas", href: "/store/bbs", img: "/images/category-bbs.png" },
  { name: "Accessories", href: "/store/accessories", img: "/images/category-accessories.png" },
  { name: "Parts & internals", href: "/store/parts", img: "/images/category-repairs.png" },
];

export function CategoriesLocal() {
  return (
    <section className="bg-[#efe8dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl md:text-5xl text-[#26201b] tracking-tight mb-4">
            Have a look around
          </h2>
          <p className="font-sans text-base text-[#6b6157] max-w-md mx-auto">
            Everything we'd stock for a mate starting out — and everything a
            regular comes back for.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl bg-[#26201b] aspect-[5/4]"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512]/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#f4efe6]">{cat.name}</h3>
                <span className="w-9 h-9 rounded-full bg-[#f4efe6] flex items-center justify-center shrink-0 group-hover:bg-[#b06a2c] transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-[#26201b] group-hover:text-[#f4efe6] transition-colors" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
