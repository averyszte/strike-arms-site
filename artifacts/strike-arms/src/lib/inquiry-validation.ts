/**
 * Client-side checks on the contact form.
 *
 * Like the checkout's, these are for fast field-level feedback and are not a
 * security boundary — anything checked only in the browser is not checked at
 * all. The table's own constraints are what actually hold.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Deliberately loose. The only email address this can prove is real is one
 * that has already been replied to, so all this rules out is the typo -- a
 * missing @, a missing dot, a stray space.
 *
 * Exported because the service quote form asks the same question, and two
 * copies of an email regex drift apart the moment one of them is edited.
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Long enough to be a question, short enough not to be a novel or a payload. */
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

export type InquiryForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
  /** Left empty by people and filled in by bots. Never shown, never sent. */
  website: string;
};

export const EMPTY_INQUIRY_FORM: InquiryForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  consent: false,
  website: '',
};

export type InquiryFieldErrors = Partial<Record<keyof InquiryForm, string>>;

export function validateInquiry(form: InquiryForm): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Please give us your name.';
  }

  if (!isValidEmail(form.email)) {
    errors.email = 'Please give a valid email address, so we can reply.';
  }

  const message = form.message.trim();
  if (message.length < MESSAGE_MIN) {
    errors.message = 'Please tell us a little more about what you need.';
  } else if (message.length > MESSAGE_MAX) {
    errors.message = `That is longer than we can take — please keep it under ${MESSAGE_MAX} characters.`;
  }

  if (!form.consent) {
    errors.consent = 'We need your permission to hold your details and reply.';
  }

  return errors;
}

/**
 * Nobody types a name, an email and a paragraph in three seconds.
 */
const MIN_HUMAN_FILL_MS = 3000;

/**
 * Whether this submission looks like a script rather than a customer.
 *
 * Takes anything carrying a honeypot field, so the contact form and the service
 * quote form share one answer rather than two that can disagree.
 *
 * Both signals are client-side and a targeted bot walks straight through them.
 * They are here for the drive-by spam that finds any public form and fills it
 * forever, which is the difference between an enquiries screen Alan reads and
 * one he stops opening. Real protection is a challenge on the server (C11).
 *
 * A caught submission is answered with the same thank-you as a real one: a bot
 * told it failed simply tries again differently.
 */
export function looksAutomated(form: { website: string }, elapsedMs: number): boolean {
  return form.website.trim() !== '' || elapsedMs < MIN_HUMAN_FILL_MS;
}
