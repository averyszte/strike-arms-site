/**
 * Site-wide identity and business NAP (name, address, phone).
 *
 * NAP values are sourced from the existing strikearms.ie contact page.
 * Confirm with Alan before launch in case the new store's details differ.
 * Geo coordinates are intentionally omitted until real lat/long is confirmed —
 * do not invent them (structured data must reflect reality).
 */
export const SITE_URL = 'https://strikearms.ie';
export const SITE_NAME = 'Strike Arms';
export const SITE_LEGAL_NAME = 'Strike Arms Airsoft';

export const BUSINESS = {
  name: SITE_LEGAL_NAME,
  streetAddress: 'Unit C3, Airside Enterprise Centre',
  addressLocality: 'Swords',
  addressRegion: 'Co. Dublin',
  postalCode: 'K67 T9H9',
  addressCountry: 'IE',
  telephone: '+353 87 27 36 351',
  openingHours: [
    {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '18:00',
    },
  ],
} as const;

/** Resolve a site-relative path to an absolute URL for schema / OG tags. */
export function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
