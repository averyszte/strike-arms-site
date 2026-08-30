import { isValidEmail } from '@/lib/inquiry-validation';

/**
 * The service quote request.
 *
 * Every service page used to end at a phone number or the general contact
 * form, which meant a quote arrived as "my gun is broken" with no idea what
 * the gun was. Four questions is the least that makes the reply useful: who,
 * how to reach them, what the gun is, and what it is doing.
 *
 * It files into the same `inquiries` table as the contact form rather than a
 * table of its own. There is no service job tracker yet (D8), and a second
 * table nobody reads would be worse than a row in the one Alan already opens.
 */

/** Long enough to name a make and model, short enough not to be a paragraph. */
const GUN_MAX = 120;

/** Matches the contact form, so neither can file something the other cannot. */
const DETAILS_MIN = 10;
const DETAILS_MAX = 2000;

export type ServiceQuoteForm = {
  name: string;
  email: string;
  phone: string;
  /** Make and model, in the customer's own words. */
  gun: string;
  details: string;
  consent: boolean;
  /** Left empty by people and filled in by bots. Never shown, never sent. */
  website: string;
};

export const EMPTY_SERVICE_QUOTE_FORM: ServiceQuoteForm = {
  name: '',
  email: '',
  phone: '',
  gun: '',
  details: '',
  consent: false,
  website: '',
};

export type ServiceQuoteErrors = Partial<Record<keyof ServiceQuoteForm, string>>;

export function validateServiceQuote(form: ServiceQuoteForm): ServiceQuoteErrors {
  const errors: ServiceQuoteErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Please give us your name.';
  }

  if (!isValidEmail(form.email)) {
    errors.email = 'Please give a valid email address, so we can reply.';
  }

  const gun = form.gun.trim();
  if (gun.length < 2) {
    errors.gun = 'Tell us what the gun is, even roughly — make and model if you know them.';
  } else if (gun.length > GUN_MAX) {
    errors.gun = 'Just the make and model here — the rest can go below.';
  }

  const details = form.details.trim();
  if (details.length < DETAILS_MIN) {
    errors.details = 'Tell us a little more, so the quote is for the right job.';
  } else if (details.length > DETAILS_MAX) {
    errors.details = `That is longer than we can take — please keep it under ${DETAILS_MAX} characters.`;
  }

  if (!form.consent) {
    errors.consent = 'We need your permission to hold your details and reply.';
  }

  return errors;
}

/** What lands in the enquiries screen as the subject line. */
export function quoteSubject(serviceTitle: string): string {
  return `Quote request — ${serviceTitle}`;
}

/**
 * The single `message` column, composed from the separate fields.
 *
 * The service and the gun are repeated here rather than left to the subject
 * alone: the enquiries list truncates, and whoever picks the job up wants the
 * gun in front of them without opening anything else.
 */
export function composeQuoteMessage(serviceTitle: string, form: ServiceQuoteForm): string {
  return [
    `Service: ${serviceTitle}`,
    `Gun: ${form.gun.trim()}`,
    '',
    'What they said:',
    form.details.trim(),
  ].join('\n');
}
