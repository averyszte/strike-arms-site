import { useCallback, useSyncExternalStore } from 'react';

import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from '@/data/analytics-consent-repository';
import { IS_ANALYTICS_CONFIGURED } from '@/lib/analytics-config';

export function useAnalyticsConsent() {
  // The server snapshot is "not known yet" (undefined), not "no choice"
  // (null): a prerendered page must not bake the banner into its HTML for
  // visitors who already chose. The banner appears once the browser reads
  // the stored choice.
  const consent = useSyncExternalStore<AnalyticsConsent | null | undefined>(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    () => undefined,
  );

  const accept = useCallback(() => writeAnalyticsConsent('granted'), []);
  const reject = useCallback(() => writeAnalyticsConsent('denied'), []);
  /** Clears the choice so the banner asks again (footer "Cookie settings"). */
  const reopen = useCallback(() => writeAnalyticsConsent(null), []);

  return {
    consent,
    shouldAsk: IS_ANALYTICS_CONFIGURED && consent === null,
    isConfigured: IS_ANALYTICS_CONFIGURED,
    accept,
    reject,
    reopen,
  };
}
