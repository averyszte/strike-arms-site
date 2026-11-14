import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import { effectivePriceCents } from "@/lib/effective-price";
import { formatPrice } from "@/lib/format-price";
import type { Product } from "@/types/product";

function displayPriceCents(product: Product): number {
  return effectivePriceCents(product.price, product.salePrice);
}

/** One featured product in a play style, linking through to its product page. */
export function LoadoutProductCard({ product, desc }: { product: Product; desc: string }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block p-4 bg-card border-2 border-border rounded-none hover:border-accent transition-colors"
    >
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="font-black uppercase text-sm text-foreground group-hover:text-accent transition-colors leading-snug pr-3 tracking-tight">
          {product.name}
        </h4>
        <span className="text-sm font-black shrink-0">
          {formatPrice(displayPriceCents(product))}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{desc}</p>
      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground group-hover:text-accent transition-colors">
        Buy Now <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
