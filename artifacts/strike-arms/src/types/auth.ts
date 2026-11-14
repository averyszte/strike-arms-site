import type { User } from '@supabase/supabase-js';

/**
 * Supabase's assurance level for the *current* session.
 *
 * aal1 is "knows the password". aal2 is "and has just entered a TOTP code".
 * The admin RLS policies check is_admin_aal2(), so this is not a hardening
 * nicety — an aal1 admin is refused by the database on every write.
 */
export type AuthLevel = 'none' | 'aal1' | 'aal2';

/** What the admin gate needs to know before it lets anyone past the login. */
export interface MfaState {
  level: AuthLevel;
  /** True once a TOTP factor has been enrolled *and* verified at least once. */
  hasTotpFactor: boolean;
}

/** A freshly enrolled TOTP factor, not yet verified, so not yet usable. */
export interface TotpEnrolment {
  factorId: string;
  /** Ready for <img src>. Supabase hands back SVG; the repository normalises it. */
  qrCode: string;
  /** The same secret as text, for an authenticator that cannot scan. */
  secret: string;
}

/** A verified authenticator on the admin's account (M-026: a backup device is allowed). */
export interface TotpFactor {
  id: string;
  /** What the admin called it, for example "Alan's phone". Empty for the first one enrolled. */
  name: string;
  createdAt: string;
}

/** The two kinds of emailed link an admin can arrive from. */
export type EmailLinkType = 'invite' | 'recovery';

/** Where redeeming an invite or password reset link has got to. */
export type EmailLinkState =
  | { state: 'redeeming' }
  | { state: 'redeemed' }
  | { state: 'invalid'; message: string };

/** What useAdminAuth hands the admin screens. */
export type AdminAuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  /**
   * Assurance level and factor status. AuthGuard holds the admin at the MFA
   * gate until level is 'aal2', because that is what the write policies check.
   */
  mfa: MfaState;
  /** Re-read the assurance level after enrolling or entering a code. */
  refreshMfa: () => Promise<void>;
  /**
   * Set when the admin check itself failed, as opposed to answering "no".
   * AuthGuard shows a retry instead of sending a real admin back to login.
   */
  connectionError: unknown;
  /** Run the admin check again after a connection error. */
  recheck: () => Promise<void>;
  signIn: (email: string, password: string, captchaToken: string | null) => Promise<void>;
  signOut: () => Promise<void>;
};
