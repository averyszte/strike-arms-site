import { BUSINESS } from '@/lib/site-config';
import { SERVICE_LINKS, SHOP_TEL } from '@/lib/site-navigation';

// The mobile drawer's accordion. A flatter, shallower list than the desktop
// mega menu in site-navigation.ts, so it is kept separate rather than
// derived from it.
export const mobileAccordionGroups: { title: string; links: { label: string; href: string }[] }[] = [
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
      ...SERVICE_LINKS,
      { label: "AEG Internal Parts", href: "/store/parts/aeg-parts" },
      { label: "Hop-Up Units & Buckings", href: "/store/parts/hop-up" },
      { label: `Call: ${BUSINESS.telephone}`, href: SHOP_TEL },
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
