import { loadErrorMessage } from '@/lib/load-error-message';
import { BREACHED_PASSWORD_MESSAGE, isBreachedPassword, PASSWORD_HINT } from '@/lib/password-policy';

/**
 * Supabase Auth errors in words a customer can act on. The codes are the
 * ones Supabase Auth returns. Wording never says whether an email has an
 * account: "does not match" covers both a wrong password and no account.
 */

function field(error: unknown, key: string): unknown {
  return typeof error === 'object' && error !== null && key in error
    ? (error as Record<string, unknown>)[key]
    : undefined;
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'That email and password do not match an account.',
  email_not_confirmed:
    'This account is waiting for its email to be confirmed. Use the code in the email we sent.',
  otp_expired: 'That code has expired or is not right. Ask for a new one.',
  same_password: 'The new password must be different from the current one.',
  email_exists: 'That email cannot be used. Try a different one.',
  email_address_invalid: 'That email address does not look right.',
  signup_disabled: 'New accounts are not open yet. You can still check out as a guest.',
  over_email_send_rate_limit: 'Too many emails sent. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many tries. Wait a few minutes and try again.',
  captcha_failed: 'The security check did not pass. Reload the page and try again.',
};

export function isAuthErrorCode(error: unknown, code: string): boolean {
  return field(error, 'code') === code;
}

export function customerAuthError(error: unknown): string {
  const code = String(field(error, 'code') ?? '');
  if (code === 'weak_password') {
    return isBreachedPassword(error)
      ? BREACHED_PASSWORD_MESSAGE
      : `That password does not meet the rules. ${PASSWORD_HINT}`;
  }
  return MESSAGES[code] ?? `That did not work. ${loadErrorMessage(error)}`;
}
