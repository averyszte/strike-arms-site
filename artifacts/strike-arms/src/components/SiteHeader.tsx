import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Search, ShoppingCart, Menu, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchDropdown } from "@/components/SearchDropdown";
import { SiteHeaderMobileDrawer } from "@/components/site-header-mobile-drawer";
import { useCart } from "@/hooks/use-cart";
import { navItems } from "@/lib/site-navigation";
import { pruneNavItems } from "@/lib/prune-navigation";
import { useShelfCounts } from "@/hooks/use-shelf-counts";

export function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { basics } = useCart();

  const handleNavEnter = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(name);
  };

  const handleNavLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  const handleMegaEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  // Empty shelves are left out of the menus (lib/prune-navigation.ts).
  const shelfCounts = useShelfCounts();
  const visibleNavItems = useMemo(() => pruneNavItems(navItems, shelfCounts), [shelfCounts]);

  const activeMegaData = visibleNavItems.find((n) => n.name === activeMenu);

  return (
    <>
      <header className="relative bg-background border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[60px] grid grid-cols-[auto_1fr_auto] items-center">

          {/* LEFT ZONE — hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
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

          {/* CENTER ZONE — primary nav */}
          <nav
            className="hidden lg:flex items-center justify-center h-full"
            onMouseLeave={handleNavLeave}
          >
            {visibleNavItems.map((item) => (
              <button
                key={item.name}
                onMouseEnter={() => handleNavEnter(item.name)}
                className={`relative h-full px-2 xl:px-2.5 flex items-center gap-0.5 xl:gap-1 whitespace-nowrap text-[0.82rem] font-medium tracking-wide transition-colors ${
                  activeMenu === item.name
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {item.name}
                <ChevronDown
                  className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                    activeMenu === item.name ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] bg-accent transition-opacity duration-150 ${
                    activeMenu === item.name ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* RIGHT ZONE — search + account + cart */}
          <div className="flex items-center justify-end gap-3 text-foreground">
            {/* Search — desktop live dropdown */}
            <div className="hidden lg:flex items-center">
              <SearchDropdown />
            </div>
            {/* Search icon — mobile only */}
            <button
              className="lg:hidden hover:text-accent transition-colors"
              aria-label="Search"
              onClick={() => setMobileSearchOpen((o) => !o)}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="hover:text-accent transition-colors" aria-label="Your account">
              <User className="w-5 h-5" />
            </Link>
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
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed top-[60px] inset-x-0 z-50 bg-background border-b border-border px-4 py-3"
            >
              <SearchDropdown fullWidth onClose={() => setMobileSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega menu */}
        <AnimatePresence>
          {activeMenu && activeMegaData?.mega && (
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full z-50 bg-[#111111] border-b border-border/60 shadow-2xl"
              onMouseEnter={handleMegaEnter}
              onMouseLeave={handleMegaLeave}
            >
              <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-3 gap-8">
                {activeMegaData.mega.map((col) => (
                  <div key={col.title}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent mb-4">
                      {col.title}
                    </p>
                    <ul className="space-y-2.5">
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SiteHeaderMobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
