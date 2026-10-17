import { BUSINESS } from '@/lib/site-config';

/**
 * Google Maps links and the opening-hours line for the shop, built from the
 * NAP in site-config so the map, the directions button and the schema can
 * never disagree about where the shop is.
 */

const QUERY = encodeURIComponent(
  `${BUSINESS.name}, ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.postalCode}`,
);

export const MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${QUERY}`;
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${QUERY}`;
// The keyless embed. Needs https://www.google.com in the CSP frame-src.
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${QUERY}&z=15&output=embed`;

export const ADDRESS_LINES = [
  BUSINESS.streetAddress,
  `${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`,
  BUSINESS.postalCode,
];

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const shortDay = (day: string) => day.slice(0, 3);

/** "Tue – Sun" for a run of days, a lone day in full, otherwise the days listed. */
function dayRange(days: readonly string[]): string {
  if (days.length === 1) return days[0];
  const first = WEEK.indexOf(days[0]);
  const isRun = days.every((day, i) => WEEK.indexOf(day) === first + i);
  if (days.length > 2 && isRun) return `${shortDay(days[0])} – ${shortDay(days[days.length - 1])}`;
  return days.map(shortDay).join(', ');
}

export type HoursLine = { days: string; hours: string };

/** Opening hours as display lines, with the closed days as a final line. */
export function openingHoursLines(): HoursLine[] {
  const lines: HoursLine[] = BUSINESS.openingHours.map((h) => ({
    days: dayRange(h.days),
    hours: `${h.opens} – ${h.closes}`,
  }));
  const openDays = new Set<string>(BUSINESS.openingHours.flatMap((h) => [...h.days]));
  const closed = WEEK.filter((day) => !openDays.has(day));
  if (closed.length > 0) lines.push({ days: dayRange(closed), hours: 'Closed' });
  return lines;
}
