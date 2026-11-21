/**
 * Loads the Google Tag Manager container, which carries the GA4 tags. Only
 * called after the visitor has accepted analytics. Advertising consent is
 * always denied. Page views are pushed by hand as a `virtual_page_view`
 * event so staff, account and checkout pages are never counted
 * (see lib/analytics-config.ts); the GTM container fires the GA4 page_view
 * tag on that event.
 */

import { readAnalyticsConsent } from '@/data/analytics-consent-repository';
import { IS_ANALYTICS_CONFIGURED } from '@/lib/analytics-config';
import type { EcommerceEventName, EcommercePayload } from '@/lib/analytics-ecommerce';

type AnalyticsWindow =Window & { dataLayer?: unknown[] };

const SCRIPT_ID = 'gtm-container';

function dataLayer(): unknown[] {
  const w = window as AnalyticsWindow;
  w.dataLayer = w.dataLayer ?? [];
  return w.dataLayer;
}

/** Consent commands must be pushed as an `arguments` object, as gtag does. */
function gtag(..._args: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params
  dataLayer().push(arguments);
}

export function loadGoogleTagManager(containerId: string): void {
  if (document.getElementById(SCRIPT_ID)) {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }

  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  dataLayer().push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
}

export function sendPageView(path: string, title: string): void {
  if (!document.getElementById(SCRIPT_ID)) return;
  dataLayer().push({
    event: 'virtual_page_view',
    page_location: `${window.location.origin}${path}`,
    page_path: path,
    page_title: title,
  });
}

/**
 * A GA4 ecommerce event. Checks consent itself rather than whether the
 * script has loaded: the success page's first render, straight back from
 * Stripe, runs before the container script is added, and GTM reads anything
 * already queued in the dataLayer when it starts. The `ecommerce: null` push
 * stops one event's items leaking into the next, as Google recommends.
 */
export function sendEcommerceEvent(event: EcommerceEventName, ecommerce: EcommercePayload): void {
  if (!IS_ANALYTICS_CONFIGURED || readAnalyticsConsent() !== 'granted') return;
  dataLayer().push({ ecommerce: null });
  dataLayer().push({ event, ecommerce });
}

/** Tells the loaded tags to stop storing, and removes the GA cookies. */
export function disableGoogleTagManager(): void {
  if (document.getElementById(SCRIPT_ID)) {
    gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  const host = window.location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim() ?? '';
    if (!name.startsWith('_ga')) return;
    for (const domain of ['', `; domain=.${host}`, `; domain=${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  });
}
