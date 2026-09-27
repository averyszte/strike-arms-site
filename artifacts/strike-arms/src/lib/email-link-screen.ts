import type { EmailLinkState, MfaState } from '@/types/auth';

/**
 * What an invite or password reset page shows, from the state of its link and
 * of the session the link creates.
 *
 * - checking:   the link is being redeemed, or the session it made has not
 *               reached the auth context yet
 * - invalid:    missing, used or expired link
 * - connection: signed in, but the admin check could not be made
 * - not-admin:  signed in, but the account has no admins row
 * - mfa:        the account has an authenticator, so Supabase wants a code
 *               (aal2) before it will change the password
 * - ready:      show the new password form
 */
export type EmailLinkScreen = 'checking' | 'invalid' | 'connection' | 'not-admin' | 'mfa' | 'ready';

export interface EmailLinkSession {
  isLoading: boolean;
  hasUser: boolean;
  isAdmin: boolean;
  connectionError: unknown;
  mfa: MfaState;
}

export function emailLinkScreen(link: EmailLinkState, session: EmailLinkSession): EmailLinkScreen {
  if (link.state === 'invalid') return 'invalid';
  if (link.state === 'redeeming' || session.isLoading || !session.hasUser) return 'checking';
  if (session.connectionError) return 'connection';
  if (!session.isAdmin) return 'not-admin';
  if (session.mfa.hasTotpFactor && session.mfa.level !== 'aal2') return 'mfa';
  return 'ready';
}
