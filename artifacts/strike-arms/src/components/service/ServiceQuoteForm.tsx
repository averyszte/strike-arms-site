import { useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { CheckoutField } from '@/components/cart/CheckoutField';
import { ConsentField } from '@/components/contact/consent-field';
import { HoneypotField } from '@/components/contact/honeypot-field';
import { InquiryFormFooter } from '@/components/contact/inquiry-form-footer';
import { FormErrorSummary } from '@/components/form-error-summary';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFocusFirstError } from '@/hooks/use-focus-first-error';
import { useSubmitInquiry } from '@/hooks/use-submit-inquiry';
import { useTurnstile } from '@/hooks/use-turnstile';
import { isHoneypotFilled, isSubmittedTooFast } from '@/lib/inquiry-validation';
import {
  EMPTY_SERVICE_QUOTE_FORM,
  composeQuoteMessage,
  quoteSubject,
  validateServiceQuote,
  type ServiceQuoteErrors,
  type ServiceQuoteForm as QuoteForm,
} from '@/lib/service-quote';
import { BUSINESS } from '@/lib/site-config';
import { CARD_TITLE, TEXT_LINK, phoneHref } from '@/lib/storefront-styles';

/**
 * Asks for a quote on one service, from the page describing it.
 *
 * It files into the same enquiries screen as the contact form. Nothing emails
 * yet, so the thank-you promises a reply in a day or two and offers the phone
 * for anything that will not wait — the same promise the contact form makes,
 * because it is the same inbox.
 */

export function ServiceQuoteForm({ serviceTitle }: { serviceTitle: string }) {
  const [form, setForm] = useState<QuoteForm>(EMPTY_SERVICE_QUOTE_FORM);
  const [errors, setErrors] = useState<ServiceQuoteErrors>({});
  const [isSent, setIsSent] = useState(false);
  const [isTooFast, setIsTooFast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const reportErrors = useFocusFirstError(formRef);

  // When the form was first rendered, for the "no human types this fast" check.
  const [openedAt] = useState(() => Date.now());

  const submit = useSubmitInquiry();
  const turnstile = useTurnstile('inquiry');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  const patch = (update: Partial<QuoteForm>) => setForm((current) => ({ ...current, ...update }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateServiceQuote(form);
    setErrors(found);
    reportErrors(Object.keys(found).length);
    if (Object.keys(found).length > 0 || isWaitingForBotCheck) return;

    // Answered exactly like a real submission, and quietly dropped.
    if (isHoneypotFilled(form)) {
      setIsSent(true);
      return;
    }
    const isFast = isSubmittedTooFast(Date.now() - openedAt);
    setIsTooFast(isFast);
    if (isFast) return;

    submit.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: quoteSubject(serviceTitle),
        message: composeQuoteMessage(serviceTitle, form),
        consent: form.consent,
        sourcePage: window.location.pathname,
        turnstileToken: turnstile.token,
      },
      { onSuccess: () => setIsSent(true) },
    );
    // Single-use: a fresh token in case the message has to be sent again.
    turnstile.reset();
  }

  if (isSent) return <QuoteSent />;

  return (
    <form ref={formRef} className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      <FormErrorSummary count={Object.keys(errors).length} />
      <CheckoutField
        id="quote-name"
        label="Your name"
        value={form.name}
        error={errors.name}
        autoComplete="name"
        required
        onChange={(name) => patch({ name })}
      />

      <CheckoutField
        id="quote-email"
        label="Email"
        type="email"
        value={form.email}
        error={errors.email}
        autoComplete="email"
        required
        onChange={(email) => patch({ email })}
      />

      <CheckoutField
        id="quote-phone"
        label="Phone (optional)"
        type="tel"
        value={form.phone}
        autoComplete="tel"
        onChange={(phone) => patch({ phone })}
      />

      <CheckoutField
        id="quote-gun"
        label="Gun make and model"
        value={form.gun}
        error={errors.gun}
        required
        onChange={(gun) => patch({ gun })}
      />

      <div>
        <Label htmlFor="quote-details">
          What is it doing, and what have you already tried?
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Textarea
          id="quote-details"
          rows={5}
          value={form.details}
          aria-invalid={errors.details ? true : undefined}
          aria-describedby={errors.details ? 'quote-details-error' : 'quote-details-hint'}
          className="mt-1.5"
          onChange={(event) => patch({ details: event.target.value })}
        />
        {errors.details ? (
          <p id="quote-details-error" className="mt-1.5 text-sm text-destructive">
            {errors.details}
          </p>
        ) : (
          <p id="quote-details-hint" className="mt-1.5 text-sm text-muted-foreground">
            Sounds, when it started, and anything you have already swapped or checked. The more we
            know, the closer the first answer is.
          </p>
        )}
      </div>

      <HoneypotField
        id="quote-website"
        value={form.website}
        onChange={(website) => patch({ website })}
      />

      <ConsentField
        id="quote-consent"
        checked={form.consent}
        error={errors.consent}
        onChange={(consent) => patch({ consent })}
      />

      <InquiryFormFooter
        turnstile={turnstile}
        isPending={submit.isPending}
        sendError={submit.isError ? submit.errorMessage : null}
        isTooFast={isTooFast}
        idleLabel="Request a quote"
      />
    </form>
  );
}

function QuoteSent() {
  return (
    <div className="mt-6 border border-border/60 bg-background p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 ref={(el) => el?.focus()} tabIndex={-1} className={`${CARD_TITLE} text-base outline-none`}>
          Thanks — we have it
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We normally come back within a day or two. Any figure we give before seeing the gun is a
        range rather than a price — the job gets quoted properly once it is on the bench. If it is
        urgent, ring the shop on{' '}
        <a href={phoneHref(BUSINESS.telephone)} className={TEXT_LINK}>
          {BUSINESS.telephone}
        </a>
        .
      </p>
    </div>
  );
}
