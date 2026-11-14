import { Link } from "wouter";
import { ArrowUpRight, Camera } from "lucide-react";

import { formatPrice } from "@/lib/format-price";
import { payablePriceCents, shortEvolutionName } from "@/lib/evolution-band";
import type { Product } from "@/types/product";

/** One rifle in the Evolution band's rail. */
export function EvolutionRailCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group snap-start shrink-0 w-[15rem] md:w-auto flex flex-col bg-card border-2 border-border hover:border-accent transition-colors"
    >
      <div className="aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Camera className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">Evolution</p>
        <h3 className="text-sm font-black uppercase leading-tight text-foreground group-hover:text-accent transition-colors">
          {shortEvolutionName(product.name)}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-black tabular-nums text-foreground">
            {formatPrice(payablePriceCents(product))}
          </span>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
