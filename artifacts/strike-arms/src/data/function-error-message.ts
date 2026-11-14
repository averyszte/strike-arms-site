/**
 * A non-2xx reply from an Edge Function arrives from supabase-js as an error
 * with the Response attached. The functions put a message safe to show in
 * its `error` field; these read it, or give back the fallback.
 */

export type FunctionErrorReply = {
  /** The HTTP status, or null when there was no response (a network failure). */
  status: number | null;
  /** The parsed JSON body, or an empty object when it was missing or not JSON. */
  body: Record<string, unknown>;
};

/** The status and body of a failed function call, read once. */
export async function readFunctionError(error: unknown): Promise<FunctionErrorReply> {
  const context = (error as { context?: unknown })?.context;
  if (!(context instanceof Response)) return { status: null, body: {} };

  try {
    const body: unknown = await context.json();
    const isRecord = typeof body === 'object' && body !== null && !Array.isArray(body);
    return { status: context.status, body: isRecord ? (body as Record<string, unknown>) : {} };
  } catch {
    return { status: context.status, body: {} };
  }
}

/**
 * Plain wording for the machine-readable `code` the functions send beside
 * `error`. British English, and written for the shopper, not the log.
 */
const CODE_MESSAGES = {
  rate_limited: 'Too many attempts in a short time. Please wait a few minutes and try again.',
  captcha_missing: 'Please complete the bot check and try again.',
  captcha_failed: 'The bot check did not pass. Please try it again.',
  captcha_action_mismatch: 'The bot check did not match this form. Please reload the page and try again.',
  captcha_hostname_mismatch: 'The bot check did not match this site. Please reload the page and try again.',
  captcha_unavailable: 'The bot check is not responding right now. Please try again in a few minutes.',
  captcha_misconfigured:
    'This form is temporarily unavailable at our end. Please try again later, or call the shop.',
  invalid_request: 'Something in the form was not accepted. Please check your details and try again.',
  checkout_failed: 'Checkout is temporarily unavailable. Please try again.',
  already_paid:
    'Your earlier payment for this basket went through, so we have not taken another. ' +
    'Check your email for the order confirmation.',
} as const;

export type FunctionErrorCode = keyof typeof CODE_MESSAGES;

/**
 * Codes whose server text is generic, so the wording above is clearer. For the
 * others (invalid_request, already_paid) the server writes a specific message,
 * such as which field was wrong, and that wins when it is there.
 */
const CLIENT_WORDING_WINS: ReadonlySet<FunctionErrorCode> = new Set([
  'rate_limited',
  'captcha_missing',
  'captcha_failed',
  'captcha_action_mismatch',
  'captcha_hostname_mismatch',
  'captcha_unavailable',
  'captcha_misconfigured',
  'checkout_failed',
]);

function isFunctionErrorCode(value: unknown): value is FunctionErrorCode {
  return typeof value === 'string' && Object.hasOwn(CODE_MESSAGES, value);
}

/** The reply's `code`, when it is one this file knows. */
export function replyCode(reply: FunctionErrorReply): FunctionErrorCode | null {
  return isFunctionErrorCode(reply.body.code) ? reply.body.code : null;
}

/**
 * What to show for a failed call: the wording for a known code, else the
 * reply's `error` field, else the fallback. An unknown or missing code reads
 * exactly as it did before codes were mapped.
 */
export function replyMessage(reply: FunctionErrorReply, fallback: string): string {
  const code = replyCode(reply);
  if (code && CLIENT_WORDING_WINS.has(code)) return CODE_MESSAGES[code];
  const message = reply.body.error;
  if (typeof message === 'string' && message.length > 0) return message;
  return code ? CODE_MESSAGES[code] : fallback;
}

export async function functionErrorMessage(error: unknown, fallback: string): Promise<string> {
  return replyMessage(await readFunctionError(error), fallback);
}
