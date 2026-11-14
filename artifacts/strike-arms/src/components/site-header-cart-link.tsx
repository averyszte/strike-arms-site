import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/hooks/use-cart";

/** The header's cart icon, with a count badge once anything is in the cart. */
export function SiteHeaderCartLink() {
  const { basics } = useCart();

  return (
    <Link
      href="/cart"
      className="relative hover:text-accent transition-colors"
      aria-label={
        basics.itemCount === 1 ? "Cart, 1 item" : `Cart, ${basics.itemCount} items`
      }
    >
      <ShoppingCart className="w-5 h-5" />
      {basics.itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground font-bold min-w-[14px] h-[14px] px-[3px] flex items-center justify-center rounded-full text-[9px] leading-none">
          {basics.itemCount > 99 ? "99+" : basics.itemCount}
        </span>
      )}
    </Link>
  );
}
