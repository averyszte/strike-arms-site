import { useEffect } from 'react';
import { useLocation } from 'wouter';

import {
  disableGoogleTagManager,
  loadGoogleTagManager,
  sendPageView,
} from '@/data/google-tag-manager-client';
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent';
import {
  GTM_CONTAINER_ID,
  IS_ANALYTICS_CONFIGURED,
  shouldTrackPath,
} from '@/lib/analytics-config';

/**
 * Loads Google Tag Manager once the visitor accepts, and pushes one page
 * view per route. The push waits briefly so react-helmet-async has set the
 * new title.
 */
export function useGoogleAnalytics() {
  const { consent } = useAnalyticsConsent();
  const [location] = useLocation();
  const isGranted = IS_ANALYTICS_CONFIGURED && consent === 'granted';

  useEffect(() => {
    if (!IS_ANALYTICS_CONFIGURED) return;
    if (isGranted) loadGoogleTagManager(GTM_CONTAINER_ID);
    else if (consent === 'denied') disableGoogleTagManager();
  }, [isGranted, consent]);

  useEffect(() => {
    if (!isGranted || !shouldTrackPath(location)) return;
    const timer = window.setTimeout(() => sendPageView(location, document.title), 100);
    return () => window.clearTimeout(timer);
  }, [isGranted, location]);
}
