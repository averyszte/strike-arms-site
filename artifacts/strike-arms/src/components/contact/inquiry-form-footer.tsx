import { Send } from 'lucide-react';

import { BotCheck } from '@/components/BotCheck';
import { InquirySendError } from '@/components/contact/inquiry-send-error';
import { Button } from '@/components/ui/button';
import { BotCheckStatus } from '@/components/BotCheckStatus';
import { TOO_FAST_MESSAGE } from '@/lib/inquiry-validation';
import { CTA_PRIMARY } from '@/lib/storefront-styles';
import type { TurnstileState } from '@/hooks/use-turnstile';

type Props = {
  turnstile: TurnstileState;
  isPending: boolean;
  sendError: string | null;
  isTooFast: boolean;
  idleLabel: string;
};

/**
 * The end of an enquiry form: the bot check, why a send failed, the button,
 * and a line saying why the button is waiting while the check runs (N-049).
 */
export function InquiryFormFooter({ turnstile, isPending, sendError, isTooFast, idleLabel }: Props) {
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  return (
    <>
      <BotCheck
        containerRef={turnstile.ref}
        isEnabled={turnstile.isEnabled}
        hasFailed={turnstile.hasFailed}
      />

      {sendError !== null && <InquirySendError message={sendError} />}
      {isTooFast && (
        <p role="alert" className="text-sm text-destructive">
          {TOO_FAST_MESSAGE}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending || isWaitingForBotCheck} className={CTA_PRIMARY}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Sending…' : idleLabel}
      </Button>
      <BotCheckStatus isChecking={isWaitingForBotCheck && !turnstile.hasFailed} needsClick={turnstile.needsClick} />
    </>
  );
}
