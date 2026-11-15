import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, ShoppingCart, User } from "lucide-react";
import { isAppRoute } from "@/lib/is-app-route";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchDropdown } from "@/components/SearchDropdown";
import { useCart } from "@/hooks/use-cart";
import { useShelfCounts } from "@/hooks/use-shelf-counts";
import { mobileAccordionGroups } from "@/lib/mobile-navigation";
import { pruneLinkGroups } from "@/lib/prune-navigation";

/**
 * The header's menu below the lg breakpoint, on the shadcn Sheet so it is a
 * real dialog (focus trap, Escape, a named close button): a search box, an
 * accordion of the shop's sections (empty shelves left out, see
 * lib/prune-navigation.ts) each with a "Shop all" link, a few quick links,
 * and account and cart at the foot.
 */

interface SiteHeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUB_LINK = "text-sm text-muted-foreground hover:text-accent transition-colors py-1.5";
const QUICK_LINK = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1";

function DrawerLink({ href, className, onClose, children }: {
  href: string;
  className: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return isAppRoute(href) ? (
    <Link href={href} onClick={onClose} className={className}>{children}</Link>
  ) : (
    <a href={href} onClick={onClose} className={className}>{children}</a>
  );
}

export function SiteHeaderMobileDrawer({ isOpen, onClose }: SiteHeaderMobileDrawerProps) {
  const { basics } = useCart();
  const shelfCounts = useShelfCounts();
  const visibleMobileGroups = useMemo(
    () => pruneLinkGroups(mobileAccordionGroups, shelfCounts),
    [shelfCounts],
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="left" className="lg:hidden w-full sm:max-w-sm p-0 flex flex-col gap-0">
        <SheetHeader className="border-b border-border px-4 pt-4 pb-4 space-y-3 text-left">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Shop sections, guides and your account</SheetDescription>
          <Link href="/" className="flex flex-col items-start leading-none w-fit" onClick={onClose}>
            <span className="font-black text-lg tracking-tighter uppercase text-accent">Strike Arms</span>
            <span className="text-[0.55rem] text-muted-foreground tracking-[0.25em] font-semibold uppercase">Airsoft</span>
          </Link>
          <SearchDropdown fullWidth shouldAutoFocus={false} onClose={onClose} />
        </SheetHeader>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto py-2">
          <Accordion type="single" collapsible>
            {visibleMobileGroups.map((group) => (
              <AccordionItem key={group.title} value={group.title} className="border-border/40 px-4">
                <AccordionTrigger className="font-semibold text-foreground hover:no-underline">
                  {group.title}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1.5">
                  {group.href && group.allLabel && (
                    <DrawerLink href={group.href} onClose={onClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors py-1.5">
                      {group.allLabel}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </DrawerLink>
                  )}
                  {group.links.map((link) => (
                    <DrawerLink key={link.label} href={link.href} onClose={onClose} className={SUB_LINK}>
                      {link.label}
                    </DrawerLink>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Quick links */}
          <div className="px-4 py-6 flex flex-col gap-3 border-t border-border/40 mt-2">
            <Link href="/airsoft-law" onClick={onClose} className={QUICK_LINK}>Airsoft Law</Link>
            <Link href="/contact" onClick={onClose} className={QUICK_LINK}>Find Us</Link>
            <Link href="/account" onClick={onClose} className={QUICK_LINK}>Track an Order</Link>
          </div>
        </nav>

        {/* Mobile footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={onClose}>
            <User className="w-4 h-4" aria-hidden="true" />
            Your Account
          </Link>
          <Link href="/cart" className="flex items-center gap-2 min-h-11 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={onClose}>
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            Cart{basics.itemCount > 0 ? ` (${basics.itemCount})` : ""}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
