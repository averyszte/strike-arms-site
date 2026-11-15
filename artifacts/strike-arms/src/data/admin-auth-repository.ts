/**
 * Every Supabase Auth call the admin makes, apart from two-factor, which is
 * in admin-mfa-repository.ts.
 *
 * Each function throws on failure. A caller that needs to tell "no" from
 * "could not ask" -- isCurrentUserAdmin most of all -- can only do that if the
 * failure is not folded into the answer.
 */
import { supabase } from '@/data/supabase-client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { EmailLinkType } from '@/types/auth';

/**
 * captchaToken is the Turnstile token (M-056). Null when there is no site key
 * (local development); once Auth CAPTCHA is on, hosted Supabase refuses that.
 */
export async function signInWithPassword(
  email: string,
  password: string,
  captchaToken: string | null = null,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });
  if (error) throw error;
}

/**
 * This device only. The default scope is 'global', which ends every session
 * the account has: signing out on a phone would leave an admin tab open
 * elsewhere looking signed in while the database refuses its saves.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
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
 *
 * A change while signed in sends the current password too (M-041). Supabase
 * checks it once "Require current password" is on in the hosted Auth settings.
 */
export async function updatePassword(password: string, currentPassword?: string): Promise<void> {
  const { error } = await supabase.auth.updateUser(
    currentPassword ? { password, current_password: currentPassword } : { password },
  );
  if (error) throw error;
}

/**
 * Send a password reset email. The recovery template
 * (supabase/templates/recovery.html) is shared with customers and links to
 * the redirect URL, so this names the admin reset page. It must be on the
 * Supabase redirect allow-list.
 *
 * Supabase answers the same way whether or not the address has an account,
 * so this cannot be used to find out who the admins are.
 */
export async function requestPasswordReset(email: string, captchaToken: string | null = null): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
    ...(captchaToken && { captchaToken }),
  });
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
