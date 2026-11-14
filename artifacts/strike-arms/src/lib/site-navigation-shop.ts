import type { NavItem } from '@/types/navigation';

// The shop categories in the header mega menu (Rifles to Gear). Joined with
// the service, guide and info items in lib/site-navigation.ts.
export const SHOP_NAV_ITEMS: NavItem[] = [
  {
    name: "Rifles",
    href: "/store/rifles",
    mega: [
      {
        title: "Electric (AEG)",
        links: [
          { label: "Evolution Range", href: "/evolution" },
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
          { label: "Pre-Loved", href: "/pre-loved" },
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
        title: "Accessories",
        links: [
          { label: "Pistol Magazines", href: "/store/pistols/pistol-magazines" },
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
          { label: "Safety Equipment", href: "/safety-equipment" },
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
];
