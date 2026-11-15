import { useEffect } from 'react';
import { useLocation } from 'wouter';

import {
  disableGoogleAnalytics,
  loadGoogleAnalytics,
  sendPageView,
} from '@/data/google-analytics-client';
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent';
import {
  GA4_MEASUREMENT_ID,
  IS_ANALYTICS_CONFIGURED,
  shouldTrackPath,
} from '@/lib/analytics-config';

/**
 * Loads GA4 once the visitor accepts, and sends one page view per route.
 * The page view waits briefly so react-helmet-async has set the new title.
 */
export function useGoogleAnalytics() {
  const { consent } = useAnalyticsConsent();
  const [location] = useLocation();
  const isGranted = IS_ANALYTICS_CONFIGURED && consent === 'granted';

  useEffect(() => {
    if (!IS_ANALYTICS_CONFIGURED) return;
    if (isGranted) loadGoogleAnalytics(GA4_MEASUREMENT_ID);
    else if (consent === 'denied') disableGoogleAnalytics(GA4_MEASUREMENT_ID);
  }, [isGranted, consent]);

  useEffect(() => {
    if (!isGranted || !shouldTrackPath(location)) return;
    const timer = window.setTimeout(() => sendPageView(location, document.title), 100);
    return () => window.clearTimeout(timer);
  }, [isGranted, location]);
}
