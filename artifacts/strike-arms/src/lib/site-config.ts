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
 * Every product can be posted (migration 052, at Alan's request), to the
 * Republic of Ireland only, since checkout takes Republic Eircodes. A product
 * Alan marks collection-only in the admin uses SHIPPING_LINE_COLLECT. Change
 * these only when Alan confirms a new delivery area or delivery time.
 */
export const SHIPPING_LINE_COLLECT = 'Collect in store in Swords, Co. Dublin';
export const SHIPPING_LINE_POSTABLE = 'Delivery anywhere in the Republic of Ireland';
/** Alan's estimate is 2 working days; the site promises 3 for leeway. */
export const DELIVERY_TIME_LINE = 'usually within 3 working days';
export const DELIVERY_WORKING_DAYS_MAX = 3;

/**
 * What public copy (category intros, meta descriptions) says about postable
 * items today. While delivery is paused (IS_DELIVERY_ENABLED is false) it
 * says collect in store, so no page promises a delivery checkout cannot
 * offer. It switches back by itself when delivery is turned on.
 */
export const SHIPPING_LINE_POSTABLE_NOW = IS_DELIVERY_ENABLED
  ? SHIPPING_LINE_POSTABLE
  : SHIPPING_LINE_COLLECT;

/** Category intros: both ways to get an order, or collection while delivery is paused. */
export const DELIVERY_OR_COLLECT_LINE_NOW = IS_DELIVERY_ENABLED
  ? `${SHIPPING_LINE_POSTABLE}, or collect in store in Swords, Co. Dublin`
  : SHIPPING_LINE_COLLECT;

/** The short form, for meta descriptions where every character counts. */
export const DELIVERY_OR_COLLECT_SHORT_NOW = IS_DELIVERY_ENABLED
  ? 'Delivered in Ireland or collect in Swords'
  : SHIPPING_LINE_COLLECT;

/** Resolve a site-relative path to an absolute URL for schema / OG tags. */
export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** The share image for pages without one of their own (1200x630, public/). */
export const DEFAULT_OG_IMAGE = toAbsoluteUrl('/opengraph.jpg');
