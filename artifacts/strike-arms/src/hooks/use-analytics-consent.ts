import { useCallback, useSyncExternalStore } from 'react';

import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from '@/data/analytics-consent-repository';
import { IS_ANALYTICS_CONFIGURED } from '@/lib/analytics-config';

export function useAnalyticsConsent() {
  const consent = useSyncExternalStore<AnalyticsConsent | null>(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    () => null,
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
