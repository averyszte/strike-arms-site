import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import type { z } from 'zod';

import { FormError } from '@/components/account/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerAuthError } from '@/lib/customer-auth-errors';
import { emailOnlySchema } from '@/lib/customer-account-validation';
import { CARD_TITLE, CTA_SECONDARY_SM, PANEL } from '@/lib/storefront-styles';

type EmailOnly = z.infer<typeof emailOnlySchema>;

type EmailChangeCardProps = {
  currentEmail: string;
  onSubmit: (email: string) => Promise<void>;
};

/**
 * Changing the sign-in email. Supabase emails both the old and the new
 * address, and the change only happens once both links are followed.
 */
export function EmailChangeCard({ currentEmail, onSubmit }: EmailChangeCardProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<EmailOnly>({ resolver: zodResolver(emailOnlySchema), defaultValues: { email: '' } });

  async function submit({ email }: EmailOnly) {
    setSubmitError(null);
    try {
      await onSubmit(email);
      setSentTo(email);
      reset();
    } catch (error: unknown) {
      setSubmitError(customerAuthError(error));
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Email</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        You sign in with <span className="font-bold text-foreground">{currentEmail}</span>.
      </p>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="new-email">New email</Label>
          <Input id="new-email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <FormError message={submitError} />
        {sentTo && (
          <p className="text-sm text-muted-foreground" role="status">
            We have emailed {currentEmail} and {sentTo}. Follow the link in both to finish the change.
          </p>
        )}

        <Button type="submit" className={CTA_SECONDARY_SM} disabled={isSubmitting}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Sending' : 'Change email'}
        </Button>
      </form>
    </section>
  );
}
