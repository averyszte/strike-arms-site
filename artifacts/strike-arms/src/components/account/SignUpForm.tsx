import { useState, type InputHTMLAttributes } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { UserPlus } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { signUpSchema, type SignUpFormInput } from '@/lib/customer-account-validation';
import { PASSWORD_HINT } from '@/lib/password-policy';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type SignUpFormProps = {
  /** Throws when Supabase refuses; the form says why and keeps the fields. */
  onSubmit: (input: SignUpFormInput) => Promise<void>;
};

const EMPTY: SignUpFormInput = { fullName: '', email: '', password: '', confirmPassword: '' };

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignUpFormInput>({ resolver: zodResolver(signUpSchema), defaultValues: EMPTY });

  async function submit(input: SignUpFormInput) {
    setSubmitError(null);
    try {
      await onSubmit(input);
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Create an account</h2>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <Field id="sign-up-name" label="Your name" error={errors.fullName}>
          <Input id="sign-up-name" autoComplete="name" {...register('fullName')} />
        </Field>
        <Field id="sign-up-email" label="Email" error={errors.email}>
          <Input id="sign-up-email" type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field id="sign-up-password" label="Password" error={errors.password} hint={PASSWORD_HINT}>
          <Input id="sign-up-password" {...PASSWORD_INPUT} {...register('password')} />
        </Field>
        <Field id="sign-up-confirm" label="Password again" error={errors.confirmPassword}>
          <Input id="sign-up-confirm" {...PASSWORD_INPUT} {...register('confirmPassword')} />
        </Field>

        <p className="text-xs text-muted-foreground">
          We use your details to run your account and your orders, as set out in our{' '}
          <Link href="/privacy" className={TEXT_LINK}>
            privacy notice
          </Link>
          . No marketing email unless you ask for it.
        </p>

        <FormError message={submitError} />

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Creating account' : 'Create account'}
        </Button>
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

const PASSWORD_INPUT: InputHTMLAttributes<HTMLInputElement> = {
  type: 'password',
  autoComplete: 'new-password',
};

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
        <p className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{note}</p>
      )}
    </div>
  );
}
