import { loadErrorMessage } from './load-error-message.ts';

/**
 * Bulk-action failures that name what failed (M-040).
 *
 * A bulk write keeps going past a refused row and then throws this, so the
 * toast can say "Not changed: Specna M4, Ares AK" instead of "Some updates
 * failed", and nobody has to work out which ones by hand.
 */

export class PartialWriteError extends Error {
  readonly failedIds: string[];
  readonly total: number;

  constructor(failedIds: string[], total: number, reason: string) {
    super(reason || 'The update was refused.');
    this.name = 'PartialWriteError';
    this.failedIds = failedIds;
    this.total = total;
  }
}

const NAMED = 5;

/** "A, B and C", or "A, B, C, D, E and 3 more". */
export function listNames(names: string[]): string {
  const shown = names.slice(0, NAMED);
  const rest = names.length - shown.length;
  if (rest > 0) return `${shown.join(', ')} and ${rest} more`;
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
}

/**
 * The toast description for a failed bulk write. nameOf turns an id into
 * something a person recognises; an id it does not know is counted, not shown.
 */
export function failedItemsMessage(
  error: unknown,
  nameOf: (id: string) => string | undefined,
  fallback: string,
): string {
  if (!(error instanceof PartialWriteError)) return fallback;
  const names = error.failedIds.flatMap(id => nameOf(id) ?? []);
  const unnamed = error.failedIds.length - names.length;
  if (unnamed > 0) names.push(`${unnamed} other${unnamed === 1 ? '' : 's'}`);
  const done = error.total - error.failedIds.length;
  const head = `Not changed: ${listNames(names)}.`;
  const tail = done > 0 ? ` The other ${done} went through.` : '';
  return `${head}${tail} ${error.message}`;
}

/**
 * Plain English for the technical failures that reach an admin toast (N-078).
 *
 * Matched on the text Postgres, PostgREST and supabase-js actually send, not
 * on the error code alone: the shop's own triggers raise check_violation with
 * a sentence already written for Alan ("SA-2026-0012 is not paid, so it cannot
 * be marked posted"), and that must come through untouched. Only the raw
 * machine wording is replaced. Anything not recognised is shown as it is,
 * because a vague message is worse than an odd one.
 */
const PLAIN_ERRORS: { pattern: RegExp; message: (raw: string) => string }[] = [
  {
    pattern: /violates unique constraint/i,
    message: raw =>
      /slug/i.test(raw)
        ? 'Another product already uses this web address. Change the web address and save again.'
        : 'Another record already uses that value. Change it and save again.',
  },
  {
    pattern: /violates foreign key constraint/i,
    message: () => 'This is still linked to other records, so it cannot be changed or removed that way.',
  },
  {
    pattern: /violates check constraint|violates not-null constraint/i,
    message: () => 'One of the values was not accepted. Check the form and try again.',
  },
  {
    pattern: /jwt expired|invalid jwt|jwt.*malformed|PGRST30[13]|refresh token/i,
    message: () => 'Your sign-in has expired. Reload the page and sign in again, then retry.',
  },
  {
    pattern: /failed to fetch|networkerror|load failed|failed to send a request/i,
    message: () => 'Could not reach the server. Check the internet connection and try again.',
  },
  {
    pattern: /non-2xx status code/i,
    message: () => 'The server could not do that just now. Wait a moment and try again.',
  },
];

export type AdminErrorText = {
  /** What to show. */
  message: string;
  /** The original wording when it was replaced, for a "Details" disclosure. */
  details: string | null;
};

export function describeAdminError(error: unknown): AdminErrorText {
  const raw = loadErrorMessage(error);
  const match = PLAIN_ERRORS.find(entry => entry.pattern.test(raw));
  return match ? { message: match.message(raw), details: raw } : { message: raw, details: null };
}

/** The toast line for a failed admin action. */
export function adminErrorMessage(error: unknown): string {
  return describeAdminError(error).message;
}
