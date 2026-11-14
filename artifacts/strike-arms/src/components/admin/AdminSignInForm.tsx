import { useState } from 'react';
import type { FormEvent } from 'react';

import { BotCheck } from '@/components/BotCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTurnstile } from '@/hooks/use-turnstile';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { PASSWORD_HINT } from '@/lib/password-policy';

interface Props {
  email: string;
  onEmailChange: (email: string) => void;
  onForgot: () => void;
}

/**
 * Email, password and the Turnstile check Supabase Auth verifies once Auth
 * CAPTCHA is on (M-056). Its own component so the widget is rendered afresh
 * each time the admin comes back from the reset view.
 */
export function AdminSignInForm({ email, onEmailChange, onForgot }: Props) {
  const { signIn } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const turnstile = useTurnstile('admin-auth');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isWaitingForBotCheck) return;
    setError('');
    setIsPending(true);
    try {
      await signIn(email, password, turnstile.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsPending(false);
      // Tokens are single-use: a retry needs a fresh one.
      turnstile.reset();
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-medium text-accent hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
      </div>

      <BotCheck containerRef={turnstile.ref} isEnabled={turnstile.isEnabled} hasFailed={turnstile.hasFailed} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending || isWaitingForBotCheck}>
        {isPending ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
