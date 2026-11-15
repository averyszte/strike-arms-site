import { useState, useMemo, useRef, type FocusEvent } from "react";
import { Link } from "wouter";
import { Search, Menu, ChevronDown, User } from "lucide-react";
import { SearchDropdown } from "@/components/SearchDropdown";
import { SiteHeaderCartLink } from "@/components/site-header-cart-link";
import { SiteHeaderMegaColumns } from "@/components/site-header-mega-columns";
import { SiteHeaderMobileDrawer } from "@/components/site-header-mobile-drawer";
import { navItems } from "@/lib/site-navigation";
import { pruneNavItems } from "@/lib/prune-navigation";
import { useHoverMenu } from "@/hooks/use-hover-menu";
import { useOutsideMousedown } from "@/hooks/use-outside-mousedown";
import { useShelfCounts } from "@/hooks/use-shelf-counts";

/** 44 px hit area round a 20 px glyph below lg; the desktop keeps its tight row. */
const ICON_HIT = "inline-flex items-center justify-center size-11 lg:size-auto hover:text-accent transition-colors";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const menu = useHoverMenu();
  const { activeMenu, closeMenu } = menu;
  const navRef = useRef<HTMLElement>(null);
  useOutsideMousedown(navRef, activeMenu !== null, closeMenu);

  // Empty shelves are left out of the menus (lib/prune-navigation.ts).
  const shelfCounts = useShelfCounts();
  const visibleNavItems = useMemo(() => pruneNavItems(navItems, shelfCounts), [shelfCounts]);

  // Tabbing out of the nav closes its menu; a click elsewhere is handled above.
  const handleNavBlur = (e: FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && !e.currentTarget.contains(next)) closeMenu();
  };

  return (
    <>
      <header className="relative bg-background border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[60px] grid grid-cols-[auto_1fr_auto] items-center">

          {/* LEFT ZONE — hamburger + logo */}
          <div className="flex items-center gap-1 lg:gap-3">
            <button
              className={`lg:hidden -ml-3 text-foreground ${ICON_HIT}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex flex-col items-start leading-none group shrink-0">
              <span className="font-black text-base md:text-[1.1rem] tracking-tighter uppercase text-foreground group-hover:text-accent transition-colors">
                Strike Arms
              </span>
              <span className="text-[0.55rem] text-muted-foreground tracking-[0.25em] font-semibold uppercase">
                Airsoft
              </span>
            </Link>
          </div>

          {/* CENTER ZONE — primary nav. Each menu panel sits straight after its
              button, so Tab goes from the button into its links. */}
          <nav
            ref={navRef}
            aria-label="Main"
            className="hidden lg:flex items-center justify-center h-full"
            onMouseLeave={menu.scheduleClose}
            onBlur={handleNavBlur}
          >
            {visibleNavItems.map((item) => {
              const isOpen = activeMenu === item.name;
              const panelId = `mega-${item.href.replace(/\W+/g, "-")}`;
              return (
                <div key={item.name} className="h-full flex">
                  <button
                    ref={menu.registerTrigger(item.name)}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={item.mega ? panelId : undefined}
                    onMouseEnter={() => menu.openMenu(item.name)}
                    onClick={() => menu.toggleMenu(item.name)}
                    className={`relative h-full px-2 xl:px-2.5 flex items-center gap-0.5 xl:gap-1 whitespace-nowrap text-[0.82rem] font-medium tracking-wide transition-colors ${
                      isOpen ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-2 right-2 h-[2px] bg-accent transition-opacity duration-150 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                  {isOpen && item.mega && (
                    <div
                      id={panelId}
                      className="absolute left-0 right-0 top-full z-50 bg-[#111111] border-b border-border/60 shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150"
                      onMouseEnter={menu.cancelClose}
                    >
                      <SiteHeaderMegaColumns
                        columns={item.mega}
                        allLink={item.allLabel ? { label: item.allLabel, href: item.href } : undefined}
                        onNavigate={closeMenu}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT ZONE — search + account + cart */}
          <div className="flex items-center justify-end gap-0 lg:gap-3 -mr-3 lg:mr-0 text-foreground">
            {/* Search — desktop live dropdown */}
            <div className="hidden lg:flex items-center">
              <SearchDropdown />
            </div>
            {/* Search icon — mobile only */}
            <button
              className={`lg:hidden ${ICON_HIT}`}
              aria-label="Search"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((o) => !o)}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className={ICON_HIT} aria-label="Your account">
              <User className="w-5 h-5" />
            </Link>
            <SiteHeaderCartLink className={ICON_HIT} />
          </div>
        </div>

        {/* Mobile search bar, just under the header */}
        {mobileSearchOpen && (
          <div className="lg:hidden absolute top-full inset-x-0 z-50 bg-background border-b border-border px-4 py-3 animate-in fade-in-0 slide-in-from-top-2 duration-150">
            <SearchDropdown fullWidth onClose={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </header>

      <SiteHeaderMobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
