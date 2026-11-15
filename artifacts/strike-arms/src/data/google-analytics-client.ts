/**
 * Loads Google Analytics 4 (gtag.js) and sends page views. Only called after
 * the visitor has accepted analytics. Advertising features and Google
 * Signals are off, and page views are sent by hand so staff, account and
 * checkout pages are never counted (see lib/analytics-config.ts).
 */

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag } & Record<string, unknown>;

const SCRIPT_ID = 'ga4-gtag';

function analyticsWindow(): AnalyticsWindow {
  return window as unknown as AnalyticsWindow;
}

export function loadGoogleAnalytics(measurementId: string): void {
  const w = analyticsWindow();
  w[`ga-disable-${measurementId}`] = false;
  if (document.getElementById(SCRIPT_ID)) return;

  w.dataLayer = w.dataLayer ?? [];
  // gtag.js expects the arguments object itself on the dataLayer.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer?.push(arguments);
  };
  w.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  w.gtag('js', new Date());
  w.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function sendPageView(path: string, title: string): void {
  analyticsWindow().gtag?.('event', 'page_view', {
    page_location: `${window.location.origin}${path}`,
    page_title: title,
  });
}

/** Stops the tag sending and removes its cookies when consent is withdrawn. */
export function disableGoogleAnalytics(measurementId: string): void {
  analyticsWindow()[`ga-disable-${measurementId}`] = true;
  const host = window.location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim() ?? '';
    if (!name.startsWith('_ga')) return;
    for (const domain of ['', `; domain=.${host}`, `; domain=${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  });
}
