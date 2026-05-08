import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MegaColumn = { title: string; links: { label: string; href: string }[] };
type NavItem = { name: string; href: string; mega?: MegaColumn[] };

const navItems: NavItem[] = [
  {
    name: "Airsoft Guns",
    href: "/categories/guns",
    mega: [
      {
        title: "Shop Airsoft Guns",
        links: [
          { label: "All Airsoft Guns", href: "/categories/guns" },
          { label: "Rifles", href: "/categories/rifles" },
          { label: "Pistols", href: "/categories/pistols" },
          { label: "Sniper Rifles", href: "/categories/sniper" },
          { label: "Shotguns", href: "/categories/shotguns" },
          { label: "Electric AEGs", href: "/categories/aeg" },
          { label: "Gas Blowback", href: "/categories/gbb" },
          { label: "Spring Powered", href: "/categories/spring" },
        ],
      },
      {
        title: "Popular Categories",
        links: [
          { label: "Beginner Rifles", href: "/categories/beginner" },
          { label: "CQB Rifles", href: "/categories/cqb" },
          { label: "Outdoor Rifles", href: "/categories/outdoor" },
          { label: "Sidearms", href: "/categories/sidearms" },
          { label: "Starter Setups", href: "/categories/starter" },
        ],
      },
      {
        title: "Shop by Use",
        links: [
          { label: "New Arrivals", href: "/new" },
          { label: "Best Sellers", href: "/best-sellers" },
          { label: "Under €150", href: "/categories/budget" },
          { label: "Premium Replicas", href: "/categories/premium" },
          { label: "Gift Ideas", href: "/categories/gifts" },
        ],
      },
    ],
  },
  {
    name: "Consumables",
    href: "/categories/consumables",
    mega: [
      {
        title: "BBs & Ammo",
        links: [
          { label: "Airsoft BBs", href: "/categories/bbs" },
          { label: "Bio BBs", href: "/categories/bio-bbs" },
          { label: "Tracer BBs", href: "/categories/tracer-bbs" },
          { label: "Heavy BBs", href: "/categories/heavy-bbs" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas", href: "/categories/green-gas" },
          { label: "CO2", href: "/categories/co2" },
          { label: "Batteries", href: "/categories/batteries" },
          { label: "Chargers", href: "/categories/chargers" },
        ],
      },
      {
        title: "Magazines & Essentials",
        links: [
          { label: "Magazines", href: "/categories/magazines" },
          { label: "Speed Loaders", href: "/categories/speed-loaders" },
          { label: "Targets", href: "/categories/targets" },
          { label: "Maintenance Supplies", href: "/categories/maintenance" },
        ],
      },
    ],
  },
  {
    name: "Gear",
    href: "/categories/gear",
    mega: [
      {
        title: "Tactical Gear",
        links: [
          { label: "Plate Carriers", href: "/categories/plate-carriers" },
          { label: "Vests", href: "/categories/vests" },
          { label: "Belts", href: "/categories/belts" },
          { label: "Holsters", href: "/categories/holsters" },
          { label: "Gloves", href: "/categories/gloves" },
        ],
      },
      {
        title: "Clothing & Protection",
        links: [
          { label: "Eye Protection", href: "/categories/eye-protection" },
          { label: "Face Protection", href: "/categories/face-protection" },
          { label: "Boots", href: "/categories/boots" },
          { label: "Clothing", href: "/categories/clothing" },
          { label: "Ghillie Suits", href: "/categories/ghillie" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Optics", href: "/categories/optics" },
          { label: "Rail Attachments", href: "/categories/rail" },
          { label: "Slings", href: "/categories/slings" },
          { label: "Pouches", href: "/categories/pouches" },
          { label: "Cases", href: "/categories/cases" },
        ],
      },
    ],
  },
  {
    name: "Repairs & Upgrades",
    href: "/repairs",
    mega: [
      {
        title: "Repairs",
        links: [
          { label: "Repair Services", href: "/repairs" },
          { label: "Troubleshooting", href: "/repairs/troubleshooting" },
          { label: "Servicing", href: "/repairs/servicing" },
          { label: "Gas Leak Help", href: "/repairs/gas-leak" },
        ],
      },
      {
        title: "Upgrades",
        links: [
          { label: "Internal Upgrades", href: "/upgrades/internal" },
          { label: "External Upgrades", href: "/upgrades/external" },
          { label: "Batteries & Wiring", href: "/upgrades/batteries" },
          { label: "Hop-Up Parts", href: "/upgrades/hop-up" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Book a Repair", href: "/repairs/book" },
          { label: "Call the Shop", href: "tel:+353872736351" },
          { label: "Visit In Store", href: "/contact" },
          { label: "Parts Requests", href: "/repairs/parts" },
        ],
      },
    ],
  },
];

const mobileAccordionGroups: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Airsoft Guns",
    links: [
      { label: "All Airsoft Guns", href: "/categories/guns" },
      { label: "Rifles", href: "/categories/rifles" },
      { label: "Pistols", href: "/categories/pistols" },
      { label: "Sniper Rifles", href: "/categories/sniper" },
      { label: "AEGs", href: "/categories/aeg" },
      { label: "Gas Blowback", href: "/categories/gbb" },
    ],
  },
  {
    title: "Consumables",
    links: [
      { label: "Airsoft BBs", href: "/categories/bbs" },
      { label: "Green Gas", href: "/categories/green-gas" },
      { label: "CO2", href: "/categories/co2" },
      { label: "Batteries", href: "/categories/batteries" },
      { label: "Magazines", href: "/categories/magazines" },
    ],
  },
  {
    title: "Gear",
    links: [
      { label: "Plate Carriers", href: "/categories/plate-carriers" },
      { label: "Eye Protection", href: "/categories/eye-protection" },
      { label: "Optics", href: "/categories/optics" },
      { label: "Accessories", href: "/categories/accessories" },
    ],
  },
  {
    title: "Repairs & Upgrades",
    links: [
      { label: "Repair Services", href: "/repairs" },
      { label: "Internal Upgrades", href: "/upgrades/internal" },
      { label: "Book a Repair", href: "/repairs/book" },
      { label: "Call: +353 87 273 6351", href: "tel:+353872736351" },
    ],
  },
];

export function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const activeMegaData = navItems.find((n) => n.name === activeMenu);

  return (
    <>
      <header className="relative bg-background border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[60px] grid grid-cols-[1fr_auto_1fr] md:grid-cols-3 items-center">

          {/* LEFT ZONE — hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-foreground hover:text-accent transition-colors"
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
            className="hidden md:flex items-center justify-center h-full"
            onMouseLeave={handleNavLeave}
          >
            {navItems.map((item) => (
              <button
                key={item.name}
                onMouseEnter={() => handleNavEnter(item.name)}
                className={`relative h-full px-4 flex items-center gap-1.5 text-[0.9rem] font-medium transition-colors ${
                  activeMenu === item.name
                    ? "text-foreground"
                    : "text-foreground/75 hover:text-foreground"
                }`}
              >
                {item.name}
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeMenu === item.name ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[2px] bg-accent transition-opacity duration-150 ${
                    activeMenu === item.name ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* RIGHT ZONE — search + account + cart */}
          <div className="flex items-center justify-end gap-3 text-foreground">
            {/* Pill search — desktop only */}
            <div className="hidden md:flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full border transition-all duration-200 px-3 py-1.5 ${
                  searchFocused
                    ? "bg-card border-accent/60 w-48"
                    : "bg-card border-border/60 w-36 hover:border-border"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none w-full"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
            {/* Search icon — mobile only */}
            <button className="md:hidden hover:text-accent transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="hover:text-accent transition-colors hidden sm:flex" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative hover:text-accent transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground font-bold w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] leading-none">
                0
              </span>
            </Link>
          </div>
        </div>

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

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col"
          >
            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border">
              <Link href="/" className="flex flex-col items-start leading-none" onClick={() => setMobileOpen(false)}>
                <span className="font-black text-lg tracking-tighter uppercase text-accent">Strike Arms</span>
                <span className="text-[0.55rem] text-muted-foreground tracking-[0.25em] font-semibold uppercase">Airsoft</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-foreground hover:text-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion nav */}
            <div className="flex-1 overflow-y-auto py-2">
              {mobileAccordionGroups.map((group) => (
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
                          {group.links.map((link) => (
                            <Link
                              key={link.label}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className="text-sm text-muted-foreground hover:text-accent transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Quick links */}
              <div className="px-4 py-6 flex flex-col gap-4 border-t border-border/40 mt-2">
                <Link href="/airsoft-law" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Airsoft Law
                </Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Find a Store
                </Link>
                <Link href="/account" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Mobile footer */}
            <div className="border-t border-border px-4 py-4 flex items-center justify-between">
              <Link href="/account" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>
                <User className="w-4 h-4" />
                My Account
              </Link>
              <Link href="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
