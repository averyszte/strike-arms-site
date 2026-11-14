/**
 * Every Supabase Auth call a customer makes: sign-up, sign-in, the emailed
 * codes, and changing a password or email. Admin sign-in has its own file
 * (admin-auth-repository.ts); both share the one Supabase session.
 *
 * The emails carry a 6-digit code as well as a link (supabase/templates),
 * so a customer who opens the email on another device can type the code.
 *
 * Each function throws on failure. Reset answers the same way whether or
 * not the address has an account. Sign-up does not: Phil chose to tell a
 * customer outright when their email is already registered (see
 * docs/customer-accounts-plan.md), since Supabase would otherwise show the
 * code screen and send nothing.
 *
 * Sign-up, sign-in, the resend and the reset request take a Turnstile token
 * (`captchaToken`). Supabase checks it once Auth CAPTCHA is on for the
 * project; until then it is ignored, so passing it is safe either way. Null
 * (no site key, local development) sends none.
 */
import { supabase } from '@/data/supabase-client';
import type { CustomerLinkType, SignUpInput } from '@/types/customer-account';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

function pageUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

/** The token as supabase-js wants it: absent rather than null. */
function captcha(captchaToken: string | null): { captchaToken?: string } {
  return captchaToken ? { captchaToken } : {};
}

export async function getCustomerSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Subscribe to sign-in, sign-out and token changes. Returns the unsubscribe. */
export function onCustomerAuthChange(
  handler: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(handler);
  return () => subscription.unsubscribe();
}

/**
 * Supabase answers an email that already has a confirmed account with a
 * user that has no identities, and sends nothing. Turn that into an error.
 */
export async function signUpCustomer(
  { fullName, email, password }: SignUpInput,
  captchaToken: string | null,
): Promise<void> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: pageUrl('/account/confirm'),
      ...captcha(captchaToken),
    },
  });
  if (error) throw error;
  if (data.user?.identities?.length === 0) {
    throw Object.assign(new Error('Account already exists'), { code: 'user_already_exists' });
  }
}

export async function resendSignUpCode(email: string, captchaToken: string | null): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: pageUrl('/account/confirm'), ...captcha(captchaToken) },
  });
  if (error) throw error;
}

/** The 6-digit code from the confirm-signup email. Signs the customer in. */
export async function confirmSignUpCode(email: string, code: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
  if (error) throw error;
}

/** The token_hash from a confirm-signup or reset link. Signs the customer in. */
export async function redeemCustomerLink(tokenHash: string, type: CustomerLinkType): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) throw error;
}

export async function signInCustomer(
  email: string,
  password: string,
  captchaToken: string | null,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captcha(captchaToken),
  });
  if (error) throw error;
}

export async function signOutCustomer(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestCustomerPasswordReset(
  email: string,
  captchaToken: string | null,
): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: pageUrl('/account/reset'),
    ...captcha(captchaToken),
  });
  if (error) throw error;
}

/** The 6-digit code from the reset email. Signs the customer in to set a new password. */
export async function confirmRecoveryCode(email: string, code: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
  if (error) throw error;
}

export async function updateCustomerPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Starts an email change. Supabase emails both the old and the new address,
 * and the change only happens once both links are followed.
 */
export async function requestEmailChange(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: pageUrl('/account/details') },
  );
  if (error) throw error;
}
