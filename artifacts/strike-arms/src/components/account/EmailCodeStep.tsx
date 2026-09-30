import { useState } from 'react';
import { MailCheck } from 'lucide-react';

import { MfaCodeForm } from '@/components/admin/MfaCodeForm';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { CARD_TITLE, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type EmailCodeStepProps = {
  email: string;
  title: string;
  submitLabel: string;
  /** Throws when the code is wrong or expired. */
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
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
      await onResend();
      setResend('sent');
    } catch (caught: unknown) {
      setError(customerAuthError(caught));
      setResend('idle');
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
            disabled={resend === 'sending'}
            onClick={() => void sendAgain()}
          >
            {resend === 'sending' ? 'sending' : 'send a new code'}
          </button>
        )}
      </p>
    </section>
  );
}
