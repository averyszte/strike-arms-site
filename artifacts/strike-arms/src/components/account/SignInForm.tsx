import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { LogIn } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import { BotCheck } from '@/components/BotCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotCheckStatus } from '@/components/BotCheckStatus';
import { useTurnstile } from '@/hooks/use-turnstile';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { signInSchema, type SignInFormInput } from '@/lib/customer-account-validation';
import { PASSWORD_HINT } from '@/lib/password-policy';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type SignInFormProps = {
  /** Throws when Supabase refuses; the form says why and keeps the email. */
  onSubmit: (input: SignInFormInput, captchaToken: string | null) => Promise<void>;
};

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const turnstile = useTurnstile('customer-auth');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    resetField,
  } = useForm<SignInFormInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function submit(input: SignInFormInput) {
    if (isWaitingForBotCheck) return;
    setSubmitError(null);
    try {
      await onSubmit(input, turnstile.token);
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
      resetField('password');
    } finally {
      // A token works once; the widget fetches a fresh one for a retry.
      turnstile.reset();
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Sign in</h2>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'sign-in-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="sign-in-email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="sign-in-password">Password</Label>
            <Link href="/account/reset" className={`${TEXT_LINK} text-xs`}>
              Forgot your password?
            </Link>
          </div>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby="sign-in-password-note"
            {...register('password')}
          />
          <p id="sign-in-password-note" className={`text-xs ${errors.password ? 'text-destructive' : 'text-muted-foreground'}`}>
            {errors.password?.message ?? PASSWORD_HINT}
          </p>
        </div>

        <BotCheck
          containerRef={turnstile.ref}
          isEnabled={turnstile.isEnabled}
          hasFailed={turnstile.hasFailed}
        />

        <FormError message={submitError} />

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting || isWaitingForBotCheck}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </Button>
        <BotCheckStatus isChecking={isWaitingForBotCheck && !turnstile.hasFailed} needsClick={turnstile.needsClick} />
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/account/sign-up" className={TEXT_LINK}>
          Create an account
        </Link>
        . You can also check out as a guest.
      </p>
    </section>
  );
}
