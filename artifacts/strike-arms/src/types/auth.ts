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

/** The two kinds of emailed link an admin can arrive from. */
export type EmailLinkType = 'invite' | 'recovery';

/** Where redeeming an invite or password reset link has got to. */
export type EmailLinkState =
  | { state: 'redeeming' }
  | { state: 'redeemed' }
  | { state: 'invalid'; message: string };
