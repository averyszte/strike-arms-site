import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadErrorMessage } from '@/lib/load-error-message';
import { profileSchema } from '@/lib/customer-account-validation';
import { CARD_TITLE, CTA_PRIMARY_SM, PANEL } from '@/lib/storefront-styles';
import type { ProfileInput } from '@/types/customer-account';

type ProfileCardProps = {
  initial: ProfileInput;
  onSave: (input: ProfileInput) => Promise<void>;
};

/** Name and phone. Checkout still asks for both each time; these fill it in. */
export function ProfileCard({ initial, onSave }: ProfileCardProps) {
  const [status, setStatus] = useState<{ isError: boolean; text: string } | null>(null);
  const {
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: initial });

  async function submit(input: ProfileInput) {
    setStatus(null);
    try {
      await onSave(input);
      reset(input);
      setStatus({ isError: false, text: 'Saved.' });
    } catch (error: unknown) {
      setStatus({ isError: true, text: `Not saved. ${loadErrorMessage(error)}` });
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Your details</h2>
      <form onSubmit={(e) => void handleSubmit(submit)(e)} className="mt-4 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input id="profile-name" autoComplete="name" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">Phone (optional)</Label>
          <Input id="profile-phone" type="tel" autoComplete="tel" {...register('phone')} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        {status?.isError ? (
          <FormError message={status.text} />
        ) : (
          status && <p className="text-sm text-muted-foreground" role="status">{status.text}</p>
        )}

        <Button type="submit" className={CTA_PRIMARY_SM} disabled={isSubmitting || !isDirty}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Saving' : 'Save details'}
        </Button>
      </form>
    </section>
  );
}
