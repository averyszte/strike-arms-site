import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { LogIn } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { signInSchema, type SignInFormInput } from '@/lib/customer-account-validation';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type SignInFormProps = {
  /** Throws when Supabase refuses; the form says why and keeps the email. */
  onSubmit: (input: SignInFormInput) => Promise<void>;
};

export function SignInForm({ onSubmit }: SignInFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    setSubmitError(null);
    try {
      await onSubmit(input);
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
      resetField('password');
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
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
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
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <FormError message={submitError} />

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </Button>
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
