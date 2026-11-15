import { Link, useLocation } from 'wouter';

import { useAnalyticsConsent } from '@/hooks/use-analytics-consent';
import { useGoogleAnalytics } from '@/hooks/use-google-analytics';

/** Same outline style as the hero's secondary button; both choices look alike on purpose. */
const CHOICE_CLASS =
  'inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-sm border border-foreground bg-transparent px-6 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-none';

/**
 * Asks before any analytics loads. Accept and Reject look the same, and
 * until Accept is pressed no Google script or cookie is set.
 * Not shown on staff pages.
 */
export function CookieConsentBanner() {
  useGoogleAnalytics();
  const { shouldAsk, accept, reject } = useAnalyticsConsent();
  const [location] = useLocation();

  if (!shouldAsk || location.startsWith('/admin')) return null;

  return (
    <section
      aria-label="Cookie choice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur md:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Can we use Google Analytics cookies to count visits and see which pages are useful? No
          advertising, and nothing loads unless you say yes.{' '}
          <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={reject} className={CHOICE_CLASS}>
            Reject
          </button>
          <button type="button" onClick={accept} className={CHOICE_CLASS}>
            Accept
          </button>
        </div>
      </div>
    </section>
  );
}
