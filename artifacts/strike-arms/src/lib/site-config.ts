import { IS_DELIVERY_ENABLED } from '@/lib/delivery-availability';

/**
 * Site-wide identity and business NAP (name, address, phone).
 *
 * NAP values match the Google Business Profile word for word (checked
 * 2026-11-14), so Google sees one consistent name, address and phone.
 * Geo coordinates are intentionally omitted until real lat/long is confirmed —
 * do not invent them (structured data must reflect reality).
 */
// The canonical origin for every canonical, og:url and schema URL. Set per
// environment with VITE_SITE_URL; production is the default so a build that
// forgets it still points search engines at the real site, never at a
// preview host.
const PRODUCTION_URL = 'https://strikearms.ie';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || PRODUCTION_URL).replace(/\/+$/, '');
export const SITE_NAME = 'Strike Arms';
export const SITE_LEGAL_NAME = 'Strike Arms Airsoft';

export const BUSINESS = {
  name: SITE_LEGAL_NAME,
  streetAddress: 'Ground Floor, Unit C3, Airside Enterprise Centre, Nevinstown East',
  addressLocality: 'Swords',
  addressRegion: 'Co. Dublin',
  postalCode: 'K67 T9H9',
  addressCountry: 'IE',
  telephone: '+353 87 273 6351',
  email: 'info@strikearms.ie',
  openingHours: [
    {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '18:00',
    },
  ],
} as const;

/**
 * Where an item can go, in one place so the copy cannot drift (N-105).
 * Guns are collect in store only; everything else that may be posted goes to
 * the Republic of Ireland only, since checkout takes Republic Eircodes. Change
 * these only when Alan confirms a new delivery area.
 */
export const SHIPPING_LINE_GUNS = 'Collect in store in Swords, Co. Dublin';
export const SHIPPING_LINE_POSTABLE = 'Delivery in the Republic of Ireland';

/**
 * What public copy (category intros, meta descriptions) says about postable
 * items today. While delivery is paused (IS_DELIVERY_ENABLED is false) it
 * says collect in store, so no page promises a delivery checkout cannot
 * offer. It switches back by itself when delivery is turned on.
 */
export const SHIPPING_LINE_POSTABLE_NOW = IS_DELIVERY_ENABLED
  ? SHIPPING_LINE_POSTABLE
  : SHIPPING_LINE_GUNS;

/** Resolve a site-relative path to an absolute URL for schema / OG tags. */
export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
