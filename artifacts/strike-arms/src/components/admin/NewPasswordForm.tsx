import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  newPasswordSchema,
  passwordUpdateError,
  PASSWORD_HINT,
  type NewPasswordInput,
} from '@/lib/password-policy';

interface Props {
  submitLabel: string;
  /** Throws when Supabase refuses; the form shows why and keeps the fields. */
  onSubmit: (password: string) => Promise<void>;
}

/**
 * New password and confirmation, checked against the same rules Supabase
 * enforces. Shared by accepting an invite, resetting and changing a password,
 * which used to check three different things (and none of them what Supabase
 * checks).
 */
export function NewPasswordForm({ submitLabel, onSubmit }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function submit({ password }: NewPasswordInput) {
    setSubmitError(null);
    try {
      await onSubmit(password);
      reset();
    } catch (error: unknown) {
      setSubmitError(passwordUpdateError(error));
    }
  }

  return (
    <form onSubmit={e => void handleSubmit(submit)(e)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-describedby="new-password-note"
          aria-invalid={errors.password ? true : undefined}
          {...register('password')}
        />
        <p
          id="new-password-note"
          className={`text-xs ${errors.password ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {errors.password?.message ?? PASSWORD_HINT}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
