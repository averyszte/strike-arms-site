import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/use-cart";

/** The header's cart icon, with a count badge once anything is in the cart. */
export function SiteHeaderCartLink({ className = "" }: { className?: string }) {
  const { basics } = useCart();

  return (
    <Link
      href="/cart"
      className={`relative hover:text-accent transition-colors ${className}`}
      aria-label={
        basics.itemCount === 1 ? "Cart, 1 item" : `Cart, ${basics.itemCount} items`
      }
    >
      <span className="relative inline-flex">
        <ShoppingCart className="w-5 h-5" />
        {basics.itemCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-2 -right-2.5 bg-accent text-accent-foreground font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[11px] leading-none"
          >
            {basics.itemCount > 99 ? "99+" : basics.itemCount}
          </span>
        )}
      </span>
    </Link>
  );
}
