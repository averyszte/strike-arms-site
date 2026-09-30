import type { RefObject } from 'react';
import { AlertCircle } from 'lucide-react';

type BotCheckProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  isEnabled: boolean;
  hasFailed: boolean;
};

/**
 * Where the Turnstile widget draws itself, and what to do if it cannot. Most
 * people never see a challenge: the widget passes on its own in a second or
 * two.
 */
export function BotCheck({ containerRef, isEnabled, hasFailed }: BotCheckProps) {
  if (!isEnabled) return null;

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {hasFailed && (
        <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          The bot check could not finish. Reload the page, and if it still fails, allow
          challenges.cloudflare.com in any ad or script blocker.
        </p>
      )}
    </div>
  );
}
