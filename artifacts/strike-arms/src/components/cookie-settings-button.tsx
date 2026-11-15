import { useAnalyticsConsent } from '@/hooks/use-analytics-consent';

/** Footer link that brings the cookie banner back so the choice can change. */
export function CookieSettingsButton() {
  const { isConfigured, reopen } = useAnalyticsConsent();
  if (!isConfigured) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      className="cursor-pointer text-xs text-muted-foreground hover:text-accent transition-colors"
    >
      Cookie settings
    </button>
  );
}
