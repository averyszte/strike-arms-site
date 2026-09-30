/**
 * An Post tracking numbers (033 orders.tracking_number). The database check
 * is the real rule; this mirrors it so the admin sees the problem before
 * saving. Change the two together.
 */

const AN_POST_TRACKING = 'https://www.anpost.com/Post-Parcels/Track/History?item=';

const TRACKING_NUMBER_PATTERN = /^[A-Za-z0-9 -]{4,40}$/;

export function anPostTrackingUrl(trackingNumber: string): string {
  return AN_POST_TRACKING + encodeURIComponent(trackingNumber);
}

export type TrackingNumberInput = { value: string | null } | { error: string };

/** Blank clears the number. Spaces are kept: An Post prints them. */
export function readTrackingNumber(input: string): TrackingNumberInput {
  const value = input.trim().toUpperCase();
  if (value === '') return { value: null };
  if (!TRACKING_NUMBER_PATTERN.test(value)) {
    return { error: 'Use 4 to 40 letters, numbers, spaces or dashes.' };
  }
  return { value };
}
