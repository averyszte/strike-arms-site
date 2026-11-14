import { useState } from 'react';
import { MailCheck } from 'lucide-react';

import { MfaCodeForm } from '@/components/admin/MfaCodeForm';
import { BotCheck } from '@/components/BotCheck';
import { useTurnstile } from '@/hooks/use-turnstile';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { CARD_TITLE, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type EmailCodeStepProps = {
  email: string;
  title: string;
  submitLabel: string;
  /** Throws when the code is wrong or expired. */
  onConfirm: (code: string) => Promise<void>;
  /** Sends a new email; the token is for Supabase Auth's bot check. */
  onResend: (captchaToken: string | null) => Promise<void>;
};

type ResendState = 'idle' | 'sending' | 'sent';

/**
 * "We emailed you a code": the 6-digit code from a confirm-signup or reset
 * email. Following the link in the same email works too; this is for when
 * the email is open on a different device.
 */
export function EmailCodeStep({ email, title, submitLabel, onConfirm, onResend }: EmailCodeStepProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resend, setResend] = useState<ResendState>('idle');
  // Only the resend needs a bot check: typing the code is not guarded.
  const turnstile = useTurnstile('customer-auth');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  async function confirm(code: string): Promise<boolean> {
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(code);
      return true;
    } catch (caught: unknown) {
      setError(customerAuthError(caught));
      return false;
    } finally {
      setIsPending(false);
    }
  }

  async function sendAgain() {
    setResend('sending');
    setError(null);
    try {
      await onResend(turnstile.token);
      setResend('sent');
    } catch (caught: unknown) {
      setError(customerAuthError(caught));
      setResend('idle');
    } finally {
      turnstile.reset();
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <div className="flex items-start gap-3">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <h2 className={`${CARD_TITLE} text-lg`}>{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            If {email} has an account with us, we have emailed it a 6-digit code. Enter it below, or
            use the link in the email.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <MfaCodeForm
          label="Code from the email"
          submitLabel={submitLabel}
          isPending={isPending}
          error={error}
          onSubmit={confirm}
        />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {resend === 'sent' ? 'A new code is on its way. ' : 'Nothing arrived? Check your spam folder, or '}
        {resend !== 'sent' && (
          <button
            type="button"
            className={TEXT_LINK}
            disabled={resend === 'sending' || isWaitingForBotCheck}
            onClick={() => void sendAgain()}
          >
            {resend === 'sending' ? 'sending' : 'send a new code'}
          </button>
        )}
      </p>
      {resend !== 'sent' && (
        <div className="mt-4">
          <BotCheck
            containerRef={turnstile.ref}
            isEnabled={turnstile.isEnabled}
            hasFailed={turnstile.hasFailed}
          />
        </div>
      )}
    </section>
  );
}
