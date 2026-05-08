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
          { label: "AEG Rifles", href: "/categories/aeg-rifles" },
          { label: "SMGs", href: "/categories/smgs" },
          { label: "Support Guns / LMGs", href: "/categories/lmgs" },
          { label: "DMR Rifles", href: "/categories/dmr" },
        ],
      },
      {
        title: "Gas & Spring",
        links: [
          { label: "Gas Rifles / GBBR", href: "/categories/gbbr" },
          { label: "Sniper Rifles", href: "/categories/sniper" },
          { label: "Shotguns", href: "/categories/shotguns" },
          { label: "Spring Rifles", href: "/categories/spring-rifles" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Rifle Magazines", href: "/categories/rifle-magazines" },
          { label: "Rifle Accessories", href: "/categories/rifle-accessories" },
          { label: "New Arrivals", href: "/new" },
          { label: "Best Sellers", href: "/best-sellers" },
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
          { label: "Gas Blowback Pistols", href: "/categories/gbb-pistols" },
          { label: "Electric Pistols", href: "/categories/electric-pistols" },
          { label: "Spring Pistols", href: "/categories/spring-pistols" },
          { label: "Revolvers", href: "/categories/revolvers" },
          { label: "Machine Pistols", href: "/categories/machine-pistols" },
        ],
      },
      {
        title: "Parts & Accessories",
        links: [
          { label: "Pistol Magazines", href: "/categories/pistol-magazines" },
          { label: "Pistol Parts", href: "/categories/pistol-parts" },
          { label: "Holsters", href: "/categories/holsters" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas Canisters", href: "/categories/green-gas" },
          { label: "CO\u2082 Canisters", href: "/categories/co2" },
          { label: "Gas Adapters", href: "/categories/gas-adapters" },
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
          { label: "BBs", href: "/categories/bbs" },
          { label: "Bio BBs", href: "/categories/bio-bbs" },
          { label: "Tracer BBs", href: "/categories/tracer-bbs" },
          { label: "Speed Loaders", href: "/categories/speed-loaders" },
          { label: "Grenades", href: "/categories/grenades" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas", href: "/categories/green-gas" },
          { label: "CO\u2082 Cartridges", href: "/categories/co2" },
          { label: "Batteries", href: "/categories/batteries" },
          { label: "Chargers", href: "/categories/chargers" },
        ],
      },
      {
        title: "Maintenance",
        links: [
          { label: "Magazines", href: "/categories/magazines" },
          { label: "Lubricants", href: "/categories/lubricants" },
          { label: "Maintenance Essentials", href: "/categories/maintenance" },
          { label: "Targets", href: "/categories/targets" },
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
          { label: "Optics", href: "/categories/optics" },
          { label: "Scopes", href: "/categories/scopes" },
          { label: "Lens Protectors", href: "/categories/lens-protectors" },
          { label: "Flashlights", href: "/categories/flashlights" },
          { label: "Lasers", href: "/categories/lasers" },
          { label: "Tracers", href: "/categories/tracers" },
        ],
      },
      {
        title: "Attachments",
        links: [
          { label: "Grips", href: "/categories/grips" },
          { label: "Muzzle Devices", href: "/categories/muzzle-devices" },
          { label: "Suppressors", href: "/categories/suppressors" },
          { label: "Mounts", href: "/categories/mounts" },
          { label: "Rails & Attachments", href: "/categories/rails" },
          { label: "HPA Accessories", href: "/categories/hpa" },
        ],
      },
      {
        title: "Carry & Support",
        links: [
          { label: "Slings", href: "/categories/slings" },
          { label: "Bipods", href: "/categories/bipods" },
          { label: "Gun Bags / Cases", href: "/categories/cases" },
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
          { label: "Plate Carriers / Vests", href: "/categories/plate-carriers" },
          { label: "Chest Rigs", href: "/categories/chest-rigs" },
          { label: "Battle Belts", href: "/categories/battle-belts" },
          { label: "Uniforms", href: "/categories/uniforms" },
          { label: "Ghillie Suits", href: "/categories/ghillie" },
          { label: "Camo Accessories", href: "/categories/camo" },
        ],
      },
      {
        title: "Protection & Clothing",
        links: [
          { label: "Helmets", href: "/categories/helmets" },
          { label: "Face & Eye Protection", href: "/categories/eye-protection" },
          { label: "Gloves", href: "/categories/gloves" },
          { label: "Footwear", href: "/categories/footwear" },
          { label: "Headwear", href: "/categories/headwear" },
          { label: "Comms", href: "/categories/comms" },
        ],
      },
      {
        title: "Pouches & Carry",
        links: [
          { label: "Pouches", href: "/categories/pouches" },
          { label: "Holsters", href: "/categories/holsters" },
          { label: "Gun Bags / Transport", href: "/categories/gun-bags" },
          { label: "Gun Covers", href: "/categories/gun-covers" },
          { label: "Patches", href: "/categories/patches" },
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
          { label: "Upgrade Services", href: "/upgrades" },
          { label: "Custom Builds", href: "/repairs/custom" },
          { label: "Book a Repair", href: "/repairs/book" },
          { label: "Call the Shop", href: "tel:+353872736351" },
        ],
      },
      {
        title: "Internal Parts",
        links: [
          { label: "AEG Internal Parts", href: "/categories/aeg-parts" },
          { label: "GBB / Pistol Parts", href: "/categories/gbb-parts" },
          { label: "Sniper Parts", href: "/categories/sniper-parts" },
          { label: "Hop-Up Units & Buckings", href: "/categories/hop-up" },
          { label: "Barrels", href: "/categories/barrels" },
          { label: "Motors", href: "/categories/motors" },
        ],
      },
      {
        title: "More Parts",
        links: [
          { label: "Gearboxes", href: "/categories/gearboxes" },
          { label: "Springs", href: "/categories/springs" },
          { label: "Pistons", href: "/categories/pistons" },
          { label: "MOSFETs / ETUs", href: "/categories/mosfets" },
          { label: "HPA Upgrades", href: "/categories/hpa-upgrades" },
          { label: "External Parts", href: "/categories/external-parts" },
        ],
      },
    ],
  },
  {
    name: "More",
    href: "/more",
    mega: [
      {
        title: "Equipment & Tools",
        links: [
          { label: "Chronographs", href: "/categories/chronographs" },
          { label: "Targets", href: "/categories/targets" },
          { label: "Tools", href: "/categories/tools" },
          { label: "Maintenance Kits", href: "/categories/maintenance-kits" },
        ],
      },
      {
        title: "Outdoor",
        links: [
          { label: "Camping Gear", href: "/categories/camping" },
          { label: "Outdoor Gear", href: "/categories/outdoor" },
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
      { label: "AEG Rifles", href: "/categories/aeg-rifles" },
      { label: "Gas Rifles / GBBR", href: "/categories/gbbr" },
      { label: "Sniper Rifles", href: "/categories/sniper" },
      { label: "DMR Rifles", href: "/categories/dmr" },
      { label: "SMGs", href: "/categories/smgs" },
      { label: "Shotguns", href: "/categories/shotguns" },
    ],
  },
  {
    title: "Pistols",
    links: [
      { label: "Gas Blowback Pistols", href: "/categories/gbb-pistols" },
      { label: "Electric Pistols", href: "/categories/electric-pistols" },
      { label: "Spring Pistols", href: "/categories/spring-pistols" },
      { label: "Revolvers", href: "/categories/revolvers" },
      { label: "Pistol Magazines", href: "/categories/pistol-magazines" },
      { label: "Holsters", href: "/categories/holsters" },
    ],
  },
  {
    title: "Consumables",
    links: [
      { label: "BBs", href: "/categories/bbs" },
      { label: "Bio BBs", href: "/categories/bio-bbs" },
      { label: "Green Gas", href: "/categories/green-gas" },
      { label: "CO\u2082 Cartridges", href: "/categories/co2" },
      { label: "Batteries", href: "/categories/batteries" },
      { label: "Magazines", href: "/categories/magazines" },
    ],
  },
  {
    title: "Accessories",
    links: [
      { label: "Optics", href: "/categories/optics" },
      { label: "Flashlights", href: "/categories/flashlights" },
      { label: "Suppressors", href: "/categories/suppressors" },
      { label: "Slings", href: "/categories/slings" },
      { label: "Rails & Attachments", href: "/categories/rails" },
    ],
  },
  {
    title: "Gear",
    links: [
      { label: "Plate Carriers / Vests", href: "/categories/plate-carriers" },
      { label: "Face & Eye Protection", href: "/categories/eye-protection" },
      { label: "Helmets", href: "/categories/helmets" },
      { label: "Ghillie Suits", href: "/categories/ghillie" },
      { label: "Pouches", href: "/categories/pouches" },
      { label: "Uniforms", href: "/categories/uniforms" },
    ],
  },
  {
    title: "Upgrades & Repairs",
    links: [
      { label: "Repair Services", href: "/repairs" },
      { label: "Upgrade Services", href: "/upgrades" },
      { label: "AEG Internal Parts", href: "/categories/aeg-parts" },
      { label: "Hop-Up Units & Buckings", href: "/categories/hop-up" },
      { label: "Book a Repair", href: "/repairs/book" },
      { label: "Call: +353 87 273 6351", href: "tel:+353872736351" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "New Arrivals", href: "/new" },
      { label: "Sale", href: "/sale" },
      { label: "Brands", href: "/brands" },
      { label: "Chronographs", href: "/categories/chronographs" },
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
