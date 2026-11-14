import { useState } from 'react';
import { Send } from 'lucide-react';

import { BotCheck } from '@/components/BotCheck';
import { CheckoutField } from '@/components/cart/CheckoutField';
import { ConsentField } from '@/components/contact/consent-field';
import { ContactFormSent } from '@/components/contact/contact-form-sent';
import { HoneypotField } from '@/components/contact/honeypot-field';
import { InquirySendError } from '@/components/contact/inquiry-send-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitInquiry } from '@/hooks/use-submit-inquiry';
import { useTurnstile } from '@/hooks/use-turnstile';
import {
  EMPTY_INQUIRY_FORM,
  looksAutomated,
  validateInquiry,
  type InquiryFieldErrors,
  type InquiryForm,
} from '@/lib/inquiry-validation';
import { CTA_PRIMARY } from '@/lib/storefront-styles';

/**
 * The public contact form.
 *
 * Nothing emails yet, so what actually happens is that this lands in the admin
 * enquiries screen and the dashboard says how many are waiting. The thank-you
 * below therefore promises a reply in a day or two rather than "check your
 * inbox", and offers the phone for anything that will not wait — a promise the
 * site cannot keep is worse than no form at all.
 */

export function ContactForm() {
  const [form, setForm] = useState<InquiryForm>(EMPTY_INQUIRY_FORM);
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [isSent, setIsSent] = useState(false);

  // When the form was first rendered, for the "no human types this fast" check.
  // Lazily, because the argument to useRef is evaluated on every render and
  // reading the clock during one is exactly the impurity React can punish.
  const [openedAt] = useState(() => Date.now());

  const submit = useSubmitInquiry();
  const turnstile = useTurnstile('inquiry');
  const isWaitingForBotCheck = turnstile.isEnabled && !turnstile.token;

  const patch = (update: Partial<InquiryForm>) => setForm((current) => ({ ...current, ...update }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateInquiry(form);
    setErrors(found);
    if (Object.keys(found).length > 0 || isWaitingForBotCheck) return;

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
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        consent: form.consent,
        sourcePage: window.location.pathname,
        turnstileToken: turnstile.token,
      },
      { onSuccess: () => setIsSent(true) },
    );
    // Single-use: a fresh token in case the message has to be sent again.
    turnstile.reset();
  }

  if (isSent) return <ContactFormSent />;

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <CheckoutField
        id="contact-name"
        label="Your name"
        value={form.name}
        error={errors.name}
        autoComplete="name"
        required
        onChange={(name) => patch({ name })}
      />

      <CheckoutField
        id="contact-email"
        label="Email"
        type="email"
        value={form.email}
        error={errors.email}
        autoComplete="email"
        required
        onChange={(email) => patch({ email })}
      />

      <CheckoutField
        id="contact-phone"
        label="Phone (optional)"
        type="tel"
        value={form.phone}
        autoComplete="tel"
        onChange={(phone) => patch({ phone })}
      />

      <CheckoutField
        id="contact-subject"
        label="Subject (optional)"
        value={form.subject}
        onChange={(subject) => patch({ subject })}
      />

      <div>
        <Label htmlFor="contact-message">
          Message
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Textarea
          id="contact-message"
          rows={6}
          value={form.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className="mt-1.5"
          onChange={(event) => patch({ message: event.target.value })}
        />
        {errors.message && (
          <p id="contact-message-error" className="mt-1.5 text-sm text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      <HoneypotField
        id="contact-website"
        value={form.website}
        onChange={(website) => patch({ website })}
      />

      <ConsentField
        id="contact-consent"
        checked={form.consent}
        error={errors.consent}
        onChange={(consent) => patch({ consent })}
      />

      <BotCheck
        containerRef={turnstile.ref}
        isEnabled={turnstile.isEnabled}
        hasFailed={turnstile.hasFailed}
      />

      {submit.isError && <InquirySendError message={submit.errorMessage} />}

      <Button
        type="submit"
        size="lg"
        disabled={submit.isPending || isWaitingForBotCheck}
        className={CTA_PRIMARY}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {submit.isPending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
