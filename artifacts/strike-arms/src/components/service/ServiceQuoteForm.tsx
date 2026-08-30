import { useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

import { CheckoutField } from '@/components/cart/CheckoutField';
import { HoneypotField } from '@/components/contact/honeypot-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitInquiry } from '@/hooks/use-inquiries';
import { looksAutomated } from '@/lib/inquiry-validation';
import {
  EMPTY_SERVICE_QUOTE_FORM,
  composeQuoteMessage,
  quoteSubject,
  validateServiceQuote,
  type ServiceQuoteErrors,
  type ServiceQuoteForm as QuoteForm,
} from '@/lib/service-quote';
import { BUSINESS } from '@/lib/site-config';

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

  // When the form was first rendered, for the "no human types this fast" check.
  const [openedAt] = useState(() => Date.now());

  const submit = useSubmitInquiry();

  const patch = (update: Partial<QuoteForm>) => setForm((current) => ({ ...current, ...update }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateServiceQuote(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Answered exactly like a real submission, and quietly dropped.
    if (looksAutomated(form, Date.now() - openedAt)) {
      setIsSent(true);
      return;
    }

    submit.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: quoteSubject(serviceTitle),
        message: composeQuoteMessage(serviceTitle, form),
        consent: form.consent,
        sourcePage: window.location.pathname,
      },
      { onSuccess: () => setIsSent(true) },
    );
  }

  if (isSent) return <QuoteSent />;

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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

      <div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="quote-consent"
            checked={form.consent}
            aria-describedby={errors.consent ? 'quote-consent-error' : undefined}
            onCheckedChange={(checked) => patch({ consent: checked === true })}
          />
          <Label htmlFor="quote-consent" className="text-sm font-normal leading-relaxed">
            I am happy for Strike Arms to hold these details in order to reply to me.
          </Label>
        </div>
        {errors.consent && (
          <p id="quote-consent-error" className="mt-1.5 text-sm text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      {submit.isError && (
        <p className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          That did not send. Please try again, or ring the shop on {BUSINESS.telephone}.
        </p>
      )}

      <Button type="submit" size="lg" disabled={submit.isPending}>
        <Send className="mr-2 h-4 w-4" aria-hidden="true" />
        {submit.isPending ? 'Sending…' : 'Request a quote'}
      </Button>
    </form>
  );
}

function QuoteSent() {
  return (
    <div className="mt-6 rounded-sm border border-border bg-background p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
        <h3 className="font-semibold text-foreground">Thanks — we have it</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We normally come back within a day or two. Any figure we give before seeing the gun is a
        range rather than a price — the job gets quoted properly once it is on the bench. If it is
        urgent, ring the shop on{' '}
        <a
          href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
          className="font-medium text-accent hover:underline"
        >
          {BUSINESS.telephone}
        </a>
        .
      </p>
    </div>
  );
}
