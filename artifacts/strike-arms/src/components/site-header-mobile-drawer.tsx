import { useMemo, useState } from "react";
import { Link } from "wouter";
import { isAppRoute } from "@/lib/is-app-route";
import { ShoppingCart, X, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useShelfCounts } from "@/hooks/use-shelf-counts";
import { mobileAccordionGroups } from "@/lib/mobile-navigation";
import { pruneLinkGroups } from "@/lib/prune-navigation";

/**
 * The header's full-screen menu below the lg breakpoint: an accordion of the
 * shop's sections (empty shelves left out, see lib/prune-navigation.ts), a
 * few quick links, and account and cart at the foot.
 */

interface SiteHeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiteHeaderMobileDrawer({ isOpen, onClose }: SiteHeaderMobileDrawerProps) {
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { basics } = useCart();
  const shelfCounts = useShelfCounts();
  const visibleMobileGroups = useMemo(
    () => pruneLinkGroups(mobileAccordionGroups, shelfCounts),
    [shelfCounts],
  );

  return (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[60] bg-background lg:hidden flex flex-col"
      >
        {/* Drawer header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex flex-col items-start leading-none" onClick={() => onClose()}>
            <span className="font-black text-lg tracking-tighter uppercase text-accent">Strike Arms</span>
            <span className="text-[0.55rem] text-muted-foreground tracking-[0.25em] font-semibold uppercase">Airsoft</span>
          </Link>
          <button onClick={() => onClose()} className="text-foreground hover:text-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accordion nav */}
        <div className="flex-1 overflow-y-auto py-2">
          {visibleMobileGroups.map((group) => (
            <div key={group.title} className="border-b border-border/40">
              <button
                className="w-full flex items-center justify-between px-4 py-4 text-sm font-semibold text-foreground"
                onClick={() => setMobileExpanded(mobileExpanded === group.title ? null : group.title)}
              >
                {group.title}
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    mobileExpanded === group.title ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {mobileExpanded === group.title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 flex flex-col gap-3">
                      {group.links.map((link) =>
                        isAppRoute(link.href) ? (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => onClose()}
                            className="text-sm text-muted-foreground hover:text-accent transition-colors"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            key={link.label}
                            href={link.href}
                            onClick={() => onClose()}
                            className="text-sm text-muted-foreground hover:text-accent transition-colors"
                          >
                            {link.label}
                          </a>
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Quick links */}
          <div className="px-4 py-6 flex flex-col gap-4 border-t border-border/40 mt-2">
            <Link href="/airsoft-law" onClick={() => onClose()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Airsoft Law
            </Link>
            <Link href="/contact" onClick={() => onClose()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find Us
            </Link>
            <Link href="/account" onClick={() => onClose()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Track an Order
            </Link>
          </div>
        </div>

        {/* Mobile footer */}
        <div className="border-t border-border px-4 py-4 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => onClose()}>
            <User className="w-4 h-4" />
            Your Account
          </Link>
          <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => onClose()}>
            <ShoppingCart className="w-4 h-4" />
            Cart{basics.itemCount > 0 ? ` (${basics.itemCount})` : ""}
          </Link>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  );
}
