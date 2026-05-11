import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MegaColumn = { title: string; links: { label: string; href: string }[] };
type NavItem = { name: string; href: string; mega?: MegaColumn[] };

const navItems: NavItem[] = [
  {
    name: "Rifles",
    href: "/categories/rifles",
    mega: [
      {
        title: "Electric (AEG)",
        links: [
          { label: "AEG Rifles", href: "/categories/rifles" },
          { label: "SMGs", href: "/categories/rifles" },
          { label: "Support Guns / LMGs", href: "/categories/rifles" },
          { label: "DMR Rifles", href: "/categories/rifles" },
        ],
      },
      {
        title: "Gas & Spring",
        links: [
          { label: "Gas Rifles / GBBR", href: "/categories/rifles" },
          { label: "Sniper Rifles", href: "/categories/rifles" },
          { label: "Shotguns", href: "/categories/rifles" },
          { label: "Spring Rifles", href: "/categories/rifles" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Rifle Magazines", href: "/categories/rifles" },
          { label: "Rifle Accessories", href: "/categories/rifles" },
          { label: "New Arrivals", href: "/new" },
          { label: "Best Sellers", href: "/new" },
        ],
      },
    ],
  },
  {
    name: "Pistols",
    href: "/categories/pistols",
    mega: [
      {
        title: "Pistol Types",
        links: [
          { label: "Gas Blowback Pistols", href: "/categories/pistols" },
          { label: "Electric Pistols", href: "/categories/pistols" },
          { label: "Spring Pistols", href: "/categories/pistols" },
          { label: "Revolvers", href: "/categories/pistols" },
          { label: "Machine Pistols", href: "/categories/pistols" },
        ],
      },
      {
        title: "Parts & Accessories",
        links: [
          { label: "Pistol Magazines", href: "/categories/pistols" },
          { label: "Pistol Parts", href: "/categories/pistols" },
          { label: "Holsters", href: "/categories/pistols" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas Canisters", href: "/categories/pistols" },
          { label: "CO\u2082 Canisters", href: "/categories/pistols" },
          { label: "Gas Adapters", href: "/categories/pistols" },
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
          { label: "BBs", href: "/categories/consumables" },
          { label: "Bio BBs", href: "/categories/consumables" },
          { label: "Tracer BBs", href: "/categories/consumables" },
          { label: "Speed Loaders", href: "/categories/consumables" },
          { label: "Grenades", href: "/categories/consumables" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas", href: "/categories/consumables" },
          { label: "CO\u2082 Cartridges", href: "/categories/consumables" },
          { label: "Batteries", href: "/categories/consumables" },
          { label: "Chargers", href: "/categories/consumables" },
        ],
      },
      {
        title: "Maintenance",
        links: [
          { label: "Magazines", href: "/categories/consumables" },
          { label: "Lubricants", href: "/categories/consumables" },
          { label: "Maintenance Essentials", href: "/categories/consumables" },
          { label: "Targets", href: "/categories/consumables" },
        ],
      },
    ],
  },
  {
    name: "Accessories",
    href: "/categories/accessories",
    mega: [
      {
        title: "Sighting & Lighting",
        links: [
          { label: "Optics", href: "/categories/accessories" },
          { label: "Scopes", href: "/categories/accessories" },
          { label: "Lens Protectors", href: "/categories/accessories" },
          { label: "Flashlights", href: "/categories/accessories" },
          { label: "Lasers", href: "/categories/accessories" },
          { label: "Tracers", href: "/categories/accessories" },
        ],
      },
      {
        title: "Attachments",
        links: [
          { label: "Grips", href: "/categories/accessories" },
          { label: "Muzzle Devices", href: "/categories/accessories" },
          { label: "Suppressors", href: "/categories/accessories" },
          { label: "Mounts", href: "/categories/accessories" },
          { label: "Rails & Attachments", href: "/categories/accessories" },
          { label: "HPA Accessories", href: "/categories/accessories" },
        ],
      },
      {
        title: "Carry & Support",
        links: [
          { label: "Slings", href: "/categories/accessories" },
          { label: "Bipods", href: "/categories/accessories" },
          { label: "Gun Bags / Cases", href: "/categories/accessories" },
        ],
      },
    ],
  },
  {
    name: "Gear",
    href: "/categories/gear",
    mega: [
      {
        title: "Body Armour & Clothing",
        links: [
          { label: "Plate Carriers / Vests", href: "/categories/gear" },
          { label: "Chest Rigs", href: "/categories/gear" },
          { label: "Battle Belts", href: "/categories/gear" },
          { label: "Uniforms", href: "/categories/gear" },
          { label: "Ghillie Suits", href: "/categories/gear" },
          { label: "Camo Accessories", href: "/categories/gear" },
        ],
      },
      {
        title: "Protection & Clothing",
        links: [
          { label: "Helmets", href: "/categories/gear" },
          { label: "Face & Eye Protection", href: "/categories/gear" },
          { label: "Gloves", href: "/categories/gear" },
          { label: "Footwear", href: "/categories/gear" },
          { label: "Headwear", href: "/categories/gear" },
          { label: "Comms", href: "/categories/gear" },
        ],
      },
      {
        title: "Pouches & Carry",
        links: [
          { label: "Pouches", href: "/categories/gear" },
          { label: "Holsters", href: "/categories/gear" },
          { label: "Gun Bags / Transport", href: "/categories/gear" },
          { label: "Gun Covers", href: "/categories/gear" },
          { label: "Patches", href: "/categories/gear" },
        ],
      },
    ],
  },
  {
    name: "Upgrades & Repairs",
    href: "/repairs",
    mega: [
      {
        title: "Services",
        links: [
          { label: "Repair Services", href: "/repairs" },
          { label: "Upgrade Services", href: "/repairs" },
          { label: "Custom Builds", href: "/repairs" },
          { label: "Book a Repair", href: "/repairs" },
          { label: "Call the Shop", href: "tel:+353872736351" },
        ],
      },
      {
        title: "Internal Parts",
        links: [
          { label: "AEG Internal Parts", href: "/repairs" },
          { label: "GBB / Pistol Parts", href: "/repairs" },
          { label: "Sniper Parts", href: "/repairs" },
          { label: "Hop-Up Units & Buckings", href: "/repairs" },
          { label: "Barrels", href: "/repairs" },
          { label: "Motors", href: "/repairs" },
        ],
      },
      {
        title: "More Parts",
        links: [
          { label: "Gearboxes", href: "/repairs" },
          { label: "Springs", href: "/repairs" },
          { label: "Pistons", href: "/repairs" },
          { label: "MOSFETs / ETUs", href: "/repairs" },
          { label: "HPA Upgrades", href: "/repairs" },
          { label: "External Parts", href: "/repairs" },
        ],
      },
    ],
  },
  {
    name: "More",
    href: "/new",
    mega: [
      {
        title: "Equipment & Tools",
        links: [
          { label: "Chronographs", href: "/categories/accessories" },
          { label: "Targets", href: "/categories/consumables" },
          { label: "Tools", href: "/categories/accessories" },
          { label: "Maintenance Kits", href: "/categories/consumables" },
        ],
      },
      {
        title: "Outdoor",
        links: [
          { label: "Camping Gear", href: "/categories/gear" },
          { label: "Outdoor Gear", href: "/categories/gear" },
        ],
      },
      {
        title: "Store",
        links: [
          { label: "New Arrivals", href: "/new" },
          { label: "Sale", href: "/sale" },
          { label: "Brands", href: "/brands" },
          { label: "Gift Cards", href: "/gift-cards" },
          { label: "Contact / Store Info", href: "/contact" },
        ],
      },
    ],
  },
];

const mobileAccordionGroups: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Rifles",
    links: [
      { label: "AEG Rifles", href: "/categories/rifles" },
      { label: "Gas Rifles / GBBR", href: "/categories/rifles" },
      { label: "Sniper Rifles", href: "/categories/rifles" },
      { label: "DMR Rifles", href: "/categories/rifles" },
      { label: "SMGs", href: "/categories/rifles" },
      { label: "Shotguns", href: "/categories/rifles" },
    ],
  },
  {
    title: "Pistols",
    links: [
      { label: "Gas Blowback Pistols", href: "/categories/pistols" },
      { label: "Electric Pistols", href: "/categories/pistols" },
      { label: "Spring Pistols", href: "/categories/pistols" },
      { label: "Revolvers", href: "/categories/pistols" },
      { label: "Pistol Magazines", href: "/categories/pistols" },
      { label: "Holsters", href: "/categories/pistols" },
    ],
  },
  {
    title: "Consumables",
    links: [
      { label: "BBs", href: "/categories/consumables" },
      { label: "Bio BBs", href: "/categories/consumables" },
      { label: "Green Gas", href: "/categories/consumables" },
      { label: "CO\u2082 Cartridges", href: "/categories/consumables" },
      { label: "Batteries", href: "/categories/consumables" },
      { label: "Magazines", href: "/categories/consumables" },
    ],
  },
  {
    title: "Accessories",
    links: [
      { label: "Optics", href: "/categories/accessories" },
      { label: "Flashlights", href: "/categories/accessories" },
      { label: "Suppressors", href: "/categories/accessories" },
      { label: "Slings", href: "/categories/accessories" },
      { label: "Rails & Attachments", href: "/categories/accessories" },
    ],
  },
  {
    title: "Gear",
    links: [
      { label: "Plate Carriers / Vests", href: "/categories/gear" },
      { label: "Face & Eye Protection", href: "/categories/gear" },
      { label: "Helmets", href: "/categories/gear" },
      { label: "Ghillie Suits", href: "/categories/gear" },
      { label: "Pouches", href: "/categories/gear" },
      { label: "Uniforms", href: "/categories/gear" },
    ],
  },
  {
    title: "Upgrades & Repairs",
    links: [
      { label: "Repair Services", href: "/repairs" },
      { label: "Upgrade Services", href: "/repairs" },
      { label: "AEG Internal Parts", href: "/repairs" },
      { label: "Hop-Up Units & Buckings", href: "/repairs" },
      { label: "Book a Repair", href: "/repairs" },
      { label: "Call: +353 87 273 6351", href: "tel:+353872736351" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "New Arrivals", href: "/new" },
      { label: "Sale", href: "/sale" },
      { label: "Brands", href: "/brands" },
      { label: "Chronographs", href: "/categories/accessories" },
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "Contact / Store Info", href: "/contact" },
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-[60px] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">

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
                className={`relative h-full px-2.5 flex items-center gap-1 whitespace-nowrap text-[0.82rem] font-medium tracking-wide transition-colors ${
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
            {/* Pill search — desktop only */}
            <div className="hidden md:flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full border transition-all duration-200 px-3 py-1.5 ${
                  searchFocused
                    ? "bg-card border-accent/60 w-40"
                    : "bg-card border-border/60 w-28 hover:border-border"
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
