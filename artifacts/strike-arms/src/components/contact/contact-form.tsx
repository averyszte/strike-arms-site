import { useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';

import { CheckoutField } from '@/components/cart/CheckoutField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitInquiry } from '@/hooks/use-inquiries';
import {
  EMPTY_INQUIRY_FORM,
  looksAutomated,
  validateInquiry,
  type InquiryFieldErrors,
  type InquiryForm,
} from '@/lib/inquiry-validation';
import { BUSINESS } from '@/lib/site-config';

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

  const patch = (update: Partial<InquiryForm>) =>
    setForm((current) => ({ ...current, ...update }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateInquiry(form);
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
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        consent: form.consent,
        sourcePage: window.location.pathname,
      },
      { onSuccess: () => setIsSent(true) },
    );
  }

  if (isSent) {
    return (
      <div className="rounded-sm border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="font-semibold text-foreground">Thanks — we have it</h2>
        </div>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          We read every message and normally come back within a day or two. If it is urgent,
          ring the shop on{' '}
          <a
            href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
            className="font-medium text-accent hover:underline"
          >
            {BUSINESS.telephone}
          </a>{' '}
          — that is always the fastest way to reach us.
        </p>
      </div>
    );
  }

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

      <HoneypotField value={form.website} onChange={(website) => patch({ website })} />

      <div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="contact-consent"
            checked={form.consent}
            aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
            onCheckedChange={(checked) => patch({ consent: checked === true })}
          />
          <Label htmlFor="contact-consent" className="text-sm font-normal leading-relaxed">
            I am happy for Strike Arms to hold these details in order to reply to me.
          </Label>
        </div>
        {errors.consent && (
          <p id="contact-consent-error" className="mt-1.5 text-sm text-destructive">
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
        {submit.isPending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}

/**
 * Hidden from people and from screen readers, but not with `display: none` —
 * some bots skip what is displayed none. It is moved off-screen instead, taken
 * out of the tab order, and told not to autofill, so a password manager cannot
 * fill it in on a real customer's behalf and get them silently dropped.
 */
function HoneypotField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor="contact-website">Website</label>
      <input
        id="contact-website"
        name="website"
        type="text"
        value={value}
        tabIndex={-1}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
