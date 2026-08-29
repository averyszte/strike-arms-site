import { SERVICES } from '@/lib/services';
import { BUSINESS } from '@/lib/site-config';
import type { NavItem } from '@/types/navigation';

// The header's link structure. Hand-maintained marketing navigation, kept out
// of SiteHeader so the component is markup and behaviour only.
export const SERVICE_LINKS = SERVICES.map((service) => ({
  label: service.navLabel,
  href: service.path,
}));
export const SHOP_TEL = `tel:${BUSINESS.telephone.replace(/\s/g, "")}`;

export const navItems: NavItem[] = [
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
        links: [...SERVICE_LINKS, { label: "Call the Shop", href: SHOP_TEL }],
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
