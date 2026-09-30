import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { Mail } from 'lucide-react';
import type { z } from 'zod';

import { FormError } from '@/components/account/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { emailOnlySchema } from '@/lib/customer-account-validation';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

type EmailOnly = z.infer<typeof emailOnlySchema>;

type ResetRequestFormProps = {
  onSubmit: (email: string) => Promise<void>;
};

/** Step one of a reset: the email to send the code to. */
export function ResetRequestForm({ onSubmit }: ResetRequestFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<EmailOnly>({ resolver: zodResolver(emailOnlySchema), defaultValues: { email: '' } });

  async function submit({ email }: EmailOnly) {
    setSubmitError(null);
    try {
      await onSubmit(email);
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Reset your password</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We will email you a code and a link. Either one lets you choose a new password.
      </p>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <FormError message={submitError} />

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Sending' : 'Email me a code'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/account/sign-in" className={TEXT_LINK}>
          Sign in
        </Link>
        .
      </p>
    </section>
  );
}
