import { useRef, useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';

import { BotCheck } from '@/components/BotCheck';
import { Button } from '@/components/ui/button';
import { CheckoutAgeConfirmation } from '@/components/cart/checkout-age-confirmation';
import { CheckoutField } from '@/components/cart/CheckoutField';
import { DeliveryAddressFields } from '@/components/cart/DeliveryAddressFields';
import { FormErrorSummary } from '@/components/form-error-summary';
import { BotCheckStatus } from '@/components/BotCheckStatus';
import { useCheckoutDraft } from '@/hooks/use-checkout-draft';
import { useCheckoutPrefill } from '@/hooks/use-checkout-prefill';
import { useFocusFirstError } from '@/hooks/use-focus-first-error';
import { useTurnstile } from '@/hooks/use-turnstile';
import { applyCheckoutPrefill } from '@/lib/checkout-prefill';
import { validateCheckoutDetails, type CheckoutFieldErrors } from '@/lib/checkout-validation';
import { CTA_PRIMARY } from '@/lib/storefront-styles';
import type { CheckoutDetails } from '@/types/cart';

type CheckoutFormProps = {
  wantsDelivery: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (details: CheckoutDetails, turnstileToken: string | null) => void;
};

export function CheckoutForm({
  wantsDelivery,
  isSubmitting,
  submitError,
  onSubmit,
}: CheckoutFormProps) {
  const [details, setDetails] = useCheckoutDraft();
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const reportErrors = useFocusFirstError(formRef);
  const errorCount = Object.keys(errors).length;
  const prefill = useCheckoutPrefill();
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const turnstile = useTurnstile('checkout');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  // A signed-in customer's details arrive after the first render. Fill them in
  // once, during render (React's pattern for state that follows a prop).
  if (prefill && !hasPrefilled) {
    setHasPrefilled(true);
    setDetails((current) => applyCheckoutPrefill(current, prefill));
  }

  const patch = (update: Partial<CheckoutDetails>) =>
    setDetails((current) => ({ ...current, ...update }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const submitted = { ...details, wantsDelivery };
    const found = validateCheckoutDetails(submitted);
    setErrors(found);
    reportErrors(Object.keys(found).length);

    if (Object.keys(found).length > 0 || isWaitingForBotCheck) return;

    // Tokens are single-use: this one goes with the request, and the widget
    // starts on a fresh one in case the shopper has to try again.
    onSubmit(submitted, turnstile.token);
    turnstile.reset();
  };

  return (
    <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} noValidate>
      <FormErrorSummary count={errorCount} />

      <fieldset className="space-y-4">
        <legend className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Your details
        </legend>

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

      <CheckoutAgeConfirmation
        checked={details.ageConfirmed}
        error={errors.ageConfirmed}
        onChange={(ageConfirmed) => patch({ ageConfirmed })}
      />

      <BotCheck
        containerRef={turnstile.ref}
        isEnabled={turnstile.isEnabled}
        hasFailed={turnstile.hasFailed}
      />

      {submitError && (
        <p className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className={`${CTA_PRIMARY} w-full`}
        disabled={isSubmitting || isWaitingForBotCheck}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? 'Taking you to payment…' : 'Continue to payment'}
      </Button>
      <BotCheckStatus
        isChecking={isWaitingForBotCheck && !turnstile.hasFailed}
        needsClick={turnstile.needsClick}
        className="-mt-3 text-center"
      />

      <p className="text-center text-xs text-muted-foreground">
        Payment is handled by Stripe. We never see your card details.
      </p>
    </form>
  );
}
