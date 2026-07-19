import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchDropdown } from "@/components/SearchDropdown";

type MegaColumn = { title: string; links: { label: string; href: string }[] };
type NavItem = { name: string; href: string; mega?: MegaColumn[] };

const navItems: NavItem[] = [
  {
    name: "Rifles",
    href: "/store/rifles",
    mega: [
      {
        title: "Electric (AEG)",
        links: [
          { label: "AEG Rifles", href: "/store/rifles/aeg-rifles" },
          { label: "SMGs", href: "/store/rifles/smgs" },
          { label: "Support Guns / LMGs", href: "/store/rifles/lmgs" },
          { label: "DMR Rifles", href: "/store/rifles/dmr" },
        ],
      },
      {
        title: "Gas & Spring",
        links: [
          { label: "Gas Rifles / GBBR", href: "/store/rifles/gbbr" },
          { label: "Sniper Rifles", href: "/store/rifles/sniper" },
          { label: "Shotguns", href: "/store/rifles/shotguns" },
          { label: "Spring Rifles", href: "/store/rifles/spring-rifles" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Rifle Magazines", href: "/store/rifles/rifle-magazines" },
          { label: "Rifle Accessories", href: "/store/rifles/rifle-accessories" },
          { label: "New Arrivals", href: "/new" },
          { label: "Best Sellers", href: "/new" },
        ],
      },
    ],
  },
  {
    name: "Pistols",
    href: "/store/pistols",
    mega: [
      {
        title: "Pistol Types",
        links: [
          { label: "Gas Blowback Pistols", href: "/store/pistols/gbb-pistols" },
          { label: "Electric Pistols", href: "/store/pistols/electric-pistols" },
          { label: "Spring Pistols", href: "/store/pistols/spring-pistols" },
          { label: "Revolvers", href: "/store/pistols/revolvers" },
          { label: "Machine Pistols", href: "/store/pistols/machine-pistols" },
        ],
      },
      {
        title: "Parts & Accessories",
        links: [
          { label: "Pistol Magazines", href: "/store/pistols/pistol-magazines" },
          { label: "Pistol Parts", href: "/store/pistols/pistol-parts" },
          { label: "Holsters", href: "/store/pistols/holsters" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas Canisters", href: "/store/consumables/green-gas" },
          { label: "CO\u2082 Canisters", href: "/store/consumables/co2" },
          { label: "Gas Adapters", href: "/store/accessories/gas-adapters" },
        ],
      },
    ],
  },
  {
    name: "Consumables",
    href: "/store/consumables",
    mega: [
      {
        title: "BBs & Ammo",
        links: [
          { label: "BBs", href: "/store/consumables/bbs" },
          { label: "Bio BBs", href: "/store/consumables/bio-bbs" },
          { label: "Tracer BBs", href: "/store/consumables/tracer-bbs" },
          { label: "Speed Loaders", href: "/store/consumables/speed-loaders" },
          { label: "Grenades", href: "/store/consumables/grenades" },
        ],
      },
      {
        title: "Gas & Power",
        links: [
          { label: "Green Gas", href: "/store/consumables/green-gas" },
          { label: "CO\u2082 Cartridges", href: "/store/consumables/co2" },
          { label: "Batteries", href: "/store/consumables/batteries" },
          { label: "Chargers", href: "/store/consumables/chargers" },
        ],
      },
      {
        title: "Maintenance",
        links: [
          { label: "Magazines", href: "/store/consumables" },
          { label: "Lubricants", href: "/store/consumables/lubricants" },
          { label: "Maintenance Essentials", href: "/store/consumables/maintenance" },
          { label: "Targets", href: "/store/more/targets" },
        ],
      },
    ],
  },
  {
    name: "Accessories",
    href: "/store/accessories",
    mega: [
      {
        title: "Sighting & Lighting",
        links: [
          { label: "Optics", href: "/store/accessories/optics" },
          { label: "Scopes", href: "/store/accessories/scopes" },
          { label: "Lens Protectors", href: "/store/accessories/lens-protectors" },
          { label: "Flashlights", href: "/store/accessories/flashlights" },
          { label: "Lasers", href: "/store/accessories/lasers" },
          { label: "Tracers", href: "/store/accessories/tracers" },
        ],
      },
      {
        title: "Attachments",
        links: [
          { label: "Grips", href: "/store/accessories/grips" },
          { label: "Muzzle Devices", href: "/store/accessories/muzzle-devices" },
          { label: "Suppressors", href: "/store/accessories/suppressors" },
          { label: "Mounts", href: "/store/accessories/mounts" },
          { label: "Rails & Attachments", href: "/store/accessories/rails" },
          { label: "HPA Accessories", href: "/store/accessories/hpa" },
        ],
      },
      {
        title: "Carry & Support",
        links: [
          { label: "Slings", href: "/store/accessories/slings" },
          { label: "Bipods", href: "/store/accessories/bipods" },
          { label: "Gun Bags / Cases", href: "/store/accessories/cases" },
        ],
      },
    ],
  },
  {
    name: "Gear",
    href: "/store/gear",
    mega: [
      {
        title: "Body Armour & Clothing",
        links: [
          { label: "Plate Carriers / Vests", href: "/store/gear/plate-carriers" },
          { label: "Chest Rigs", href: "/store/gear/chest-rigs" },
          { label: "Battle Belts", href: "/store/gear/battle-belts" },
          { label: "Uniforms", href: "/store/gear/uniforms" },
          { label: "Ghillie Suits", href: "/store/gear/ghillie" },
          { label: "Camo Accessories", href: "/store/gear/camo" },
        ],
      },
      {
        title: "Protection & Clothing",
        links: [
          { label: "Helmets", href: "/store/gear/helmets" },
          { label: "Face & Eye Protection", href: "/store/gear/eye-protection" },
          { label: "Gloves", href: "/store/gear/gloves" },
          { label: "Footwear", href: "/store/gear/footwear" },
          { label: "Headwear", href: "/store/gear/headwear" },
          { label: "Comms", href: "/store/gear/comms" },
        ],
      },
      {
        title: "Pouches & Carry",
        links: [
          { label: "Pouches", href: "/store/gear/pouches" },
          { label: "Holsters", href: "/store/gear/holsters" },
          { label: "Gun Bags / Transport", href: "/store/gear/gun-bags" },
          { label: "Gun Covers", href: "/store/gear/gun-covers" },
          { label: "Patches", href: "/store/gear/patches" },
        ],
      },
    ],
  },
  {
    name: "Upgrades & Repairs",
    href: "/services",
    mega: [
      {
        title: "Services",
        links: [
          { label: "Repair Services", href: "/services/repairs" },
          { label: "Upgrade Services", href: "/services/upgrades" },
          { label: "Custom Builds", href: "/services" },
          { label: "Book a Repair", href: "/services" },
          { label: "Call the Shop", href: "tel:+353872736351" },
        ],
      },
      {
        title: "Internal Parts",
        links: [
          { label: "AEG Internal Parts", href: "/store/parts/aeg-parts" },
          { label: "GBB / Pistol Parts", href: "/store/parts/gbb-parts" },
          { label: "Sniper Parts", href: "/store/parts/sniper-parts" },
          { label: "Hop-Up Units & Buckings", href: "/store/parts/hop-up" },
          { label: "Barrels", href: "/store/parts/barrels" },
          { label: "Motors", href: "/store/parts/motors" },
        ],
      },
      {
        title: "More Parts",
        links: [
          { label: "Gearboxes", href: "/store/parts/gearboxes" },
          { label: "Springs", href: "/store/parts/springs" },
          { label: "Pistons", href: "/store/parts/pistons" },
          { label: "MOSFETs / ETUs", href: "/store/parts/mosfets" },
          { label: "HPA Upgrades", href: "/store/parts/hpa-upgrades" },
          { label: "External Parts", href: "/store/parts/external-parts" },
        ],
      },
    ],
  },
  {
    name: "Guides",
    href: "/guides",
    mega: [
      {
        title: "Buying Guides",
        links: [
          { label: "AEG vs GBB vs Spring", href: "/guides/aeg-vs-gbb-vs-spring" },
          { label: "FPS & Joules Explained", href: "/guides/fps-and-joules-explained" },
          { label: "BB Weight Guide", href: "/guides/airsoft-bb-weight-guide" },
        ],
      },
      {
        title: "Batteries, Gas & Care",
        links: [
          { label: "Battery Guide", href: "/guides/airsoft-battery-lipo-guide" },
          { label: "Gas Types Explained", href: "/guides/airsoft-gas-types" },
          { label: "Maintenance Guide", href: "/guides/airsoft-maintenance" },
        ],
      },
      {
        title: "Reference",
        links: [
          { label: "All Guides", href: "/guides" },
          { label: "Glossary", href: "/glossary" },
          { label: "Airsoft & the Law", href: "/airsoft-law" },
        ],
      },
    ],
  },
  {
    name: "More",
    href: "/store/more",
    mega: [
      {
        title: "Equipment & Tools",
        links: [
          { label: "Chronographs", href: "/store/more/chronographs" },
          { label: "Targets", href: "/store/more/targets" },
          { label: "Tools", href: "/store/more/tools" },
          { label: "Maintenance Kits", href: "/store/more/maintenance-kits" },
        ],
      },
      {
        title: "Outdoor",
        links: [
          { label: "Camping Gear", href: "/store/more/camping" },
          { label: "Outdoor Gear", href: "/store/more/outdoor" },
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
      { label: "AEG Rifles", href: "/store/rifles/aeg-rifles" },
      { label: "Gas Rifles / GBBR", href: "/store/rifles/gbbr" },
      { label: "Sniper Rifles", href: "/store/rifles/sniper" },
      { label: "DMR Rifles", href: "/store/rifles/dmr" },
      { label: "SMGs", href: "/store/rifles/smgs" },
      { label: "Shotguns", href: "/store/rifles/shotguns" },
    ],
  },
  {
    title: "Pistols",
    links: [
      { label: "Gas Blowback Pistols", href: "/store/pistols/gbb-pistols" },
      { label: "Electric Pistols", href: "/store/pistols/electric-pistols" },
      { label: "Spring Pistols", href: "/store/pistols/spring-pistols" },
      { label: "Revolvers", href: "/store/pistols/revolvers" },
      { label: "Pistol Magazines", href: "/store/pistols/pistol-magazines" },
      { label: "Holsters", href: "/store/pistols/holsters" },
    ],
  },
  {
    title: "Consumables",
    links: [
      { label: "BBs", href: "/store/consumables/bbs" },
      { label: "Bio BBs", href: "/store/consumables/bio-bbs" },
      { label: "Green Gas", href: "/store/consumables/green-gas" },
      { label: "CO\u2082 Cartridges", href: "/store/consumables/co2" },
      { label: "Batteries", href: "/store/consumables/batteries" },
      { label: "Maintenance", href: "/store/consumables/maintenance" },
    ],
  },
  {
    title: "Accessories",
    links: [
      { label: "Optics", href: "/store/accessories/optics" },
      { label: "Flashlights", href: "/store/accessories/flashlights" },
      { label: "Suppressors", href: "/store/accessories/suppressors" },
      { label: "Slings", href: "/store/accessories/slings" },
      { label: "Rails & Attachments", href: "/store/accessories/rails" },
    ],
  },
  {
    title: "Gear",
    links: [
      { label: "Plate Carriers / Vests", href: "/store/gear/plate-carriers" },
      { label: "Face & Eye Protection", href: "/store/gear/eye-protection" },
      { label: "Helmets", href: "/store/gear/helmets" },
      { label: "Ghillie Suits", href: "/store/gear/ghillie" },
      { label: "Pouches", href: "/store/gear/pouches" },
      { label: "Uniforms", href: "/store/gear/uniforms" },
    ],
  },
  {
    title: "Upgrades & Repairs",
    links: [
      { label: "Repair Services", href: "/services/repairs" },
      { label: "Upgrade Services", href: "/services/upgrades" },
      { label: "AEG Internal Parts", href: "/store/parts/aeg-parts" },
      { label: "Hop-Up Units & Buckings", href: "/store/parts/hop-up" },
      { label: "Book a Repair", href: "/services" },
      { label: "Call: +353 87 273 6351", href: "tel:+353872736351" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "AEG vs GBB vs Spring", href: "/guides/aeg-vs-gbb-vs-spring" },
      { label: "FPS & Joules Explained", href: "/guides/fps-and-joules-explained" },
      { label: "BB Weight Guide", href: "/guides/airsoft-bb-weight-guide" },
      { label: "Battery Guide", href: "/guides/airsoft-battery-lipo-guide" },
      { label: "Gas Types Explained", href: "/guides/airsoft-gas-types" },
      { label: "Maintenance Guide", href: "/guides/airsoft-maintenance" },
      { label: "All Guides", href: "/guides" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "New Arrivals", href: "/new" },
      { label: "Sale", href: "/sale" },
      { label: "Brands", href: "/brands" },
      { label: "Chronographs", href: "/store/more/chronographs" },
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "Contact / Store Info", href: "/contact" },
    ],
  },
];

export function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
            {navItems.map((item) => (
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[60] bg-background lg:hidden flex flex-col"
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
