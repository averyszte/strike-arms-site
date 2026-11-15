import { useState } from 'react';
import type { FormEvent } from 'react';

import { BotCheck } from '@/components/BotCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRequestPasswordReset } from '@/hooks/use-request-password-reset';
import { useTurnstile } from '@/hooks/use-turnstile';
import { adminErrorMessage } from '@/lib/admin-error-message';

interface Props {
  initialEmail: string;
  onBack: () => void;
}

/**
 * Ask for a reset link. The confirmation reads the same whether or not the
 * address is an admin's, because Supabase answers the same way and the page
 * should not claim to know more than it does.
 */
export function ForgotPasswordPanel({ initialEmail, onBack }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const request = useRequestPasswordReset();
  // Turnstile on the reset request too (M-056), or it is an open email cannon.
  const turnstile = useTurnstile('admin-auth');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isWaitingForBotCheck) return;
    request.mutate({ email: email.trim(), captchaToken: turnstile.token }, { onSettled: turnstile.reset });
  }

  if (request.isSuccess) {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          If {email.trim()} belongs to an admin account, a reset link is on its way. It can take a
          few minutes, so check the spam folder too. The link works once.
        </p>
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Enter the email you sign in with and a link to choose a new password will be sent to it.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <BotCheck containerRef={turnstile.ref} isEnabled={turnstile.isEnabled} hasFailed={turnstile.hasFailed} />

      {request.isError && (
        <p role="alert" className="text-sm text-destructive">
          The reset email was not sent. {adminErrorMessage(request.error)}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={request.isPending || isWaitingForBotCheck}>
        {request.isPending ? 'Sending…' : 'Send reset link'}
      </Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back to sign in
      </Button>
    </form>
  );
}
