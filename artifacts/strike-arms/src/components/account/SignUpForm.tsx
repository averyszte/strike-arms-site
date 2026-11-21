import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { UserPlus } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import { PasswordInputWithToggle } from '@/components/account/password-input-with-toggle';
import { BotCheck } from '@/components/BotCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotCheckStatus } from '@/components/BotCheckStatus';
import { useTurnstile } from '@/hooks/use-turnstile';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { signUpSchema, type SignUpFormInput } from '@/lib/customer-account-validation';
import { PASSWORD_HINT } from '@/lib/password-policy';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type SignUpFormProps = {
  /** Throws when Supabase refuses; the form says why and keeps the fields. */
  onSubmit: (input: SignUpFormInput, captchaToken: string | null) => Promise<void>;
};

const EMPTY: SignUpFormInput = { fullName: '', email: '', password: '' };

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const turnstile = useTurnstile('customer-auth');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignUpFormInput>({ resolver: zodResolver(signUpSchema), defaultValues: EMPTY });

  async function submit(input: SignUpFormInput) {
    if (isWaitingForBotCheck) return;
    setSubmitError(null);
    try {
      await onSubmit(input, turnstile.token);
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
    } finally {
      turnstile.reset();
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Create an account</h2>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <Field id="sign-up-name" label="Your name" error={errors.fullName}>
          <Input
            id="sign-up-name"
            autoComplete="name"
            {...fieldAria('sign-up-name', errors.fullName)}
            {...register('fullName')}
          />
        </Field>
        <Field id="sign-up-email" label="Email" error={errors.email}>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            {...fieldAria('sign-up-email', errors.email)}
            {...register('email')}
          />
        </Field>
        <Field id="sign-up-password" label="Password" error={errors.password} hint={PASSWORD_HINT}>
          <PasswordInputWithToggle
            id="sign-up-password"
            autoComplete="new-password"
            {...fieldAria('sign-up-password', errors.password, true)}
            {...register('password')}
          />
        </Field>

        <p className="text-xs text-muted-foreground">
          We use your details to run your account and your orders, as set out in our{' '}
          <Link href="/privacy" className={TEXT_LINK}>
            privacy notice
          </Link>
          . No marketing email unless you ask for it.
        </p>

        <BotCheck
          containerRef={turnstile.ref}
          isEnabled={turnstile.isEnabled}
          hasFailed={turnstile.hasFailed}
        />

        <FormError message={submitError} />

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting || isWaitingForBotCheck}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Creating account' : 'Create account'}
        </Button>
        <BotCheckStatus isChecking={isWaitingForBotCheck && !turnstile.hasFailed} needsClick={turnstile.needsClick} />
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/account/sign-in" className={TEXT_LINK}>
          Sign in
        </Link>
        .
      </p>
    </section>
  );
}

/** Ties an input to the note under it, and marks it invalid when that note is an error. */
function fieldAria(id: string, error: FieldError | undefined, hasHint = false) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hasHint ? `${id}-note` : undefined,
  };
}

type FieldProps = {
  id: string;
  label: string;
  error: FieldError | undefined;
  hint?: string;
  children: React.ReactNode;
};

/** Label, input and the line under it: the error when there is one, else the hint. */
function Field({ id, label, error, hint, children }: FieldProps) {
  const note = error?.message ?? hint;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {note && (
        <p id={`${id}-note`} className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {note}
        </p>
      )}
    </div>
  );
}
