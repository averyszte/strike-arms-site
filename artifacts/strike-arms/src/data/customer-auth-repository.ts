/**
 * Every Supabase Auth call a customer makes: sign-up, sign-in, the emailed
 * codes, and changing a password or email. Admin sign-in has its own file
 * (admin-auth-repository.ts); both share the one Supabase session.
 *
 * The emails carry a 6-digit code as well as a link (supabase/templates),
 * so a customer who opens the email on another device can type the code.
 *
 * Each function throws on failure. Supabase answers sign-up and reset the
 * same way whether or not the address has an account, and the forms keep
 * it that way, so neither can be used to find out who shops here.
 */
import { supabase } from '@/lib/supabase';
import type { CustomerLinkType, SignUpInput } from '@/types/customer-account';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

function pageUrl(path: string): string {
  return `${window.location.origin}${path}`;
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

export async function signUpCustomer({ fullName, email, password }: SignUpInput): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: pageUrl('/account/confirm'),
    },
  });
  if (error) throw error;
}

export async function resendSignUpCode(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: pageUrl('/account/confirm') },
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

export async function signInCustomer(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutCustomer(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestCustomerPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: pageUrl('/account/reset'),
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
