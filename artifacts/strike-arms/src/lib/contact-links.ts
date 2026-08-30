/**
 * Turning a customer's contact details into something you can tap.
 *
 * Both of these return null rather than a link when the value will not work,
 * and the caller falls back to plain text. That matters more than it sounds:
 * a phone number typed at a counter can be "ask for John" or "085 123 456"
 * with a digit missing, and a link that looks live and does nothing is worse
 * than text, because you tap it, nothing happens, and you blame the phone.
 */

/**
 * Long enough to be dialable. Irish mobiles are 10 digits and landlines 7 to
 * 9, so seven is the floor at which a string is plausibly a number rather
 * than a note someone left in the field.
 */
const MIN_DIALABLE_DIGITS = 7;

/**
 * The E.164 ceiling. It is here to catch two numbers crammed into one field —
 * "085 1234567 / 01 4567890" strips to eighteen digits, and dialling that
 * rings nobody.
 */
const MAX_DIALABLE_DIGITS = 15;

/**
 * A letter anywhere means the field holds a note as well as a number:
 * "085 123 4567 ext 2", "01 234 5678 (shop)". Stripping the non-digits would
 * silently weld the extension onto the number and dial a stranger, so these
 * stay as text for a human to read.
 */
const HAS_WORDS = /[a-z]/i;

/**
 * Deliberately not normalised to +353. Guessing a country code from a bare
 * "085..." would be inventing information, and it already dials correctly
 * from an Irish handset, which is the one behind the counter.
 */
export function telHref(phone: string | null | undefined): string | null {
  if (!phone || HAS_WORDS.test(phone)) return null;

  const plus = phone.trimStart().startsWith('+') ? '+' : '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < MIN_DIALABLE_DIGITS || digits.length > MAX_DIALABLE_DIGITS) return null;

  return `tel:${plus}${digits}`;
}

/** No length limits or exotic cases — just enough to reject what is not an address. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The subject is prefilled because the alternative is typing "your order" into
 * a phone while a customer waits, and because a reply that names the order is
 * the difference between a thread you can find later and one you cannot.
 */
export function mailtoHref(
  email: string | null | undefined,
  subject?: string,
): string | null {
  const address = email?.trim();
  if (!address || !EMAIL_SHAPE.test(address)) return null;

  return subject ? `mailto:${address}?subject=${encodeURIComponent(subject)}` : `mailto:${address}`;
}
