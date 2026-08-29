import { useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckoutField } from '@/components/cart/CheckoutField';
import { DeliveryAddressFields } from '@/components/cart/DeliveryAddressFields';
import {
  EMPTY_CHECKOUT_DETAILS,
  validateCheckoutDetails,
  type CheckoutFieldErrors,
} from '@/lib/checkout-validation';
import type { CheckoutDetails } from '@/types/cart';

type CheckoutFormProps = {
  wantsDelivery: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (details: CheckoutDetails) => void;
};

export function CheckoutForm({
  wantsDelivery,
  isSubmitting,
  submitError,
  onSubmit,
}: CheckoutFormProps) {
  const [details, setDetails] = useState<CheckoutDetails>(EMPTY_CHECKOUT_DETAILS);
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});

  const patch = (update: Partial<CheckoutDetails>) =>
    setDetails((current) => ({ ...current, ...update }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const submitted = { ...details, wantsDelivery };
    const found = validateCheckoutDetails(submitted);
    setErrors(found);

    if (Object.keys(found).length === 0) onSubmit(submitted);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">Your details</legend>

        <CheckoutField
          id="customer-name"
          label="Full name"
          value={details.customerName}
          error={errors.customerName}
          autoComplete="name"
          required
          onChange={(customerName) => patch({ customerName })}
        />

        <CheckoutField
          id="customer-email"
          label="Email"
          type="email"
          value={details.customerEmail}
          error={errors.customerEmail}
          autoComplete="email"
          required
          onChange={(customerEmail) => patch({ customerEmail })}
        />

        <CheckoutField
          id="customer-phone"
          label="Phone"
          type="tel"
          value={details.customerPhone}
          autoComplete="tel"
          onChange={(customerPhone) => patch({ customerPhone })}
        />
      </fieldset>

      {wantsDelivery && (
        <DeliveryAddressFields details={details} errors={errors} onChange={patch} />
      )}

      <div>
        <div className="flex items-start gap-3">
          <Checkbox
            id="age-confirmed"
            checked={details.ageConfirmed}
            aria-describedby={errors.ageConfirmed ? 'age-confirmed-error' : undefined}
            onCheckedChange={(checked) => patch({ ageConfirmed: checked === true })}
          />
          <Label htmlFor="age-confirmed" className="cursor-pointer font-normal leading-snug">
            I confirm I am 18 years of age or over.
          </Label>
        </div>
        {errors.ageConfirmed && (
          <p id="age-confirmed-error" className="mt-1.5 text-sm text-destructive">
            {errors.ageConfirmed}
          </p>
        )}
      </div>

      {submitError && (
        <p className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Taking you to payment…' : 'Continue to payment'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payment is handled by Stripe. We never see your card details.
      </p>
    </form>
  );
}
