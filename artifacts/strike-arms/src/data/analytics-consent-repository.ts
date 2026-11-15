/**
 * The visitor's analytics choice, kept in localStorage. null means they
 * have not chosen yet, which is treated like a refusal: nothing loads
 * until they press Accept.
 */

export type AnalyticsConsent = 'granted' | 'denied';

const STORAGE_KEY = 'strike-arms:analytics-consent:v1';
const listeners = new Set<() => void>();
let memoryConsent: AnalyticsConsent | null = null;

export function readAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return memoryConsent;
  }
}

export function writeAnalyticsConsent(consent: AnalyticsConsent | null): void {
  memoryConsent = consent;
  try {
    if (consent === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Storage blocked: the choice lasts until the tab closes.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAnalyticsConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
