import { Link } from "wouter";
import { Phone, ShoppingBag } from "lucide-react";

export function MobileStickyBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center h-16 p-2 gap-2">
        <a
          href="tel:+353878736351"
          className="flex-1 flex items-center justify-center gap-2 h-full rounded bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Now
        </a>
        <Link
          href="/store"
          className="flex-1 flex items-center justify-center gap-2 h-full rounded bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop Gear
        </Link>
      </div>
    </div>
  );
}
