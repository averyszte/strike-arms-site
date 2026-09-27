/**
 * Every Supabase Auth call the admin makes, apart from two-factor, which is
 * in admin-mfa-repository.ts.
 *
 * Each function throws on failure. A caller that needs to tell "no" from
 * "could not ask" -- isCurrentUserAdmin most of all -- can only do that if the
 * failure is not folded into the answer.
 */
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { EmailLinkType } from '@/types/auth';

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Subscribe to sign-in, sign-out and token changes. Returns the unsubscribe. */
export function onAuthStateChange(
  handler: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(handler);
  return () => subscription.unsubscribe();
}

/**
 * Whether the signed-in user is an admin.
 *
 * The admins table is RLS-closed to the browser by design, so a direct select
 * always returns nothing. is_admin() is security definer and reads auth.uid().
 * It throws on a failed call: reading the error as "not an admin" sent a real
 * admin back to the login page whenever the connection dropped.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) throw error;
  return data === true;
}

/**
 * Needs a session: a normal one for a change of password, or the one that
 * redeeming an invite or reset link creates.
 */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Send a password reset email. The link in it is built by the recovery
 * template (supabase/templates/recovery.html), not by a redirect URL here.
 *
 * Supabase answers the same way whether or not the address has an account,
 * so this cannot be used to find out who the admins are.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Redeem the token_hash from an invite or reset link. On success the user is
 * signed in, at aal1, which is enough to set a password unless the account
 * already has an authenticator -- then Supabase wants aal2 first.
 */
export async function redeemEmailLink(tokenHash: string, type: EmailLinkType): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) throw error;
}
