import { useEffect, useRef } from 'react';

import { MfaCodeForm } from '@/components/admin/MfaCodeForm';
import { useAdminMfa } from '@/hooks/use-admin-mfa';

/**
 * First-time setup: scan the QR, then prove it worked.
 *
 * The factor Supabase creates here is unverified and useless until a code from
 * it comes back, so nothing is lost by abandoning this screen — the next visit
 * clears the abandoned attempt and starts again.
 */
export function MfaEnrolment() {
  const { enrolment, error, isPending, startEnrolment, submitCode } = useAdminMfa();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void startEnrolment();
  }, [startEnrolment]);

  if (!enrolment) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isPending ? 'Preparing your authenticator setup…' : 'Setup could not be started.'}
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Scan this with an authenticator app — Google Authenticator, 1Password, Authy or the
        equivalent — then enter the six-digit code it shows.
      </p>

      {/* The QR is black on transparent, so it needs a light panel of its own
          to stay readable on the admin's dark background. */}
      <div className="flex justify-center rounded-md bg-white p-4">
        <img
          src={enrolment.qrCode}
          alt="QR code for setting up two-factor authentication"
          className="h-44 w-44"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          Cannot scan? Enter this key in the app instead:
        </p>
        <code className="block break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground">
          {enrolment.secret}
        </code>
      </div>

      <MfaCodeForm
        label="Code from your app"
        submitLabel="Confirm and finish setup"
        isPending={isPending}
        error={error}
        onSubmit={submitCode}
      />
    </div>
  );
}
