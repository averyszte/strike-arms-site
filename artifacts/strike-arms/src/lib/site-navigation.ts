import { SERVICES } from '@/lib/services';
import { BUSINESS } from '@/lib/site-config';
import { SHOP_NAV_ITEMS } from '@/lib/site-navigation-shop';
import type { NavItem } from '@/types/navigation';

// The header's link structure. Hand-maintained marketing navigation, kept out
// of SiteHeader so the component is markup and behaviour only.
export const SERVICE_LINKS = SERVICES.map((service) => ({
  label: service.navLabel,
  href: service.path,
}));
export const SHOP_TEL = `tel:${BUSINESS.telephone.replace(/\s/g, "")}`;

export const navItems: NavItem[] = [
  ...SHOP_NAV_ITEMS,
  {
    name: "Upgrades & Repairs",
    href: "/services",
    mega: [
      {
        title: "Services",
        links: [...SERVICE_LINKS, { label: "Call the Shop", href: SHOP_TEL }],
      },
      {
        title: "Know Your Internals",
        links: [
          { label: "Maintenance Guide", href: "/guides/airsoft-maintenance" },
          { label: "Batteries & LiPo Guide", href: "/guides/airsoft-battery-lipo-guide" },
          { label: "FPS & Joules Explained", href: "/guides/fps-and-joules-explained" },
          { label: "Airsoft Glossary", href: "/glossary" },
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
          { label: "Pre-Loved", href: "/pre-loved" },
          { label: "Evolution Range", href: "/evolution" },
          { label: "Jumble", href: "/jumble" },
          { label: "Wallhangers & Props", href: "/store/more/wallhangers-props" },
          { label: "Sale", href: "/sale" },
          { label: "Brands", href: "/brands" },
          { label: "Gift Cards", href: "/gift-cards" },
          { label: "Contact / Store Info", href: "/contact" },
        ],
      },
    ],
  },
];
