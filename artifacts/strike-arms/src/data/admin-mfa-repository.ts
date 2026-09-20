/**
 * Admin two-factor authentication (TOTP).
 *
 * Every admin write policy in 002_rls.sql checks is_admin_aal2(), and
 * adjust_stock() raises 42501 for the same reason. A password-only session is
 * aal1, so without the flow in this file an admin can sign in, see everything,
 * and be refused by the database on every single save. Enrolment is therefore
 * mandatory, not optional — see AuthGuard.
 */
import { supabase } from '@/lib/supabase';
import type { AuthLevel, MfaState, TotpEnrolment } from '@/types/auth';

const ISSUER = 'Strike Arms Admin';

/**
 * Read the session's assurance level and whether a verified factor exists.
 *
 * Deliberately built on getAuthenticatorAssuranceLevel() alone: it reads the
 * stored session rather than calling the network, which matters because this
 * runs inside onAuthStateChange. nextLevel is 'aal2' exactly when the user has
 * at least one *verified* factor, which is the question we are asking.
 */
export async function getMfaState(): Promise<MfaState> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return { level: 'none', hasTotpFactor: false };
  return {
    level: (data.currentLevel ?? 'none') as AuthLevel,
    hasTotpFactor: data.nextLevel === 'aal2',
  };
}

/**
 * Start enrolment: returns a QR code and the secret behind it.
 *
 * The factor is unusable until verifyTotp() confirms a code from it. Abandoned
 * attempts are cleared first — Supabase caps the number of factors per user,
 * and an admin who closes the tab mid-enrolment would otherwise be locked out
 * of enrolling by their own leftovers.
 */
export async function enrollTotp(): Promise<{
  enrolment: TotpEnrolment | null;
  error: string | null;
}> {
  await removeUnverifiedTotpFactors();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: ISSUER,
  });
  if (error) return { enrolment: null, error: error.message };
  if (!data.totp) return { enrolment: null, error: 'Supabase returned no TOTP factor' };

  return {
    enrolment: {
      factorId: data.id,
      qrCode: toImageSrc(data.totp.qr_code),
      secret: data.totp.secret,
    },
    error: null,
  };
}

/**
 * Verify a six-digit code, which is what raises the session to aal2.
 *
 * Pass the factorId from enrolment while that factor is still unverified;
 * listFactors() only reports verified ones, so it cannot find it for us.
 */
export async function verifyTotp(
  code: string,
  factorId?: string,
): Promise<{ error: string | null }> {
  const id = factorId ?? (await getVerifiedTotpFactorId());
  if (!id) return { error: 'No authenticator is set up on this account' };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code });
  if (error) return { error: error.message };
  return { error: null };
}

/** Remove a verified factor. Leaves the admin at aal1 until they enrol again. */
export async function unenrollTotp(factorId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return { error: error ? error.message : null };
}

async function getVerifiedTotpFactorId(): Promise<string | null> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return null;
  return data.totp[0]?.id ?? null;
}

async function removeUnverifiedTotpFactors(): Promise<void> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return;

  const stale = data.all.filter((f) => f.factor_type === 'totp' && f.status !== 'verified');
  await Promise.all(stale.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })));
}

/**
 * Supabase has returned qr_code both as raw SVG markup and as a data URI
 * depending on version. Normalising here keeps the component a plain <img>.
 */
function toImageSrc(qrCode: string): string {
  if (qrCode.startsWith('data:')) return qrCode;
  return `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`;
}
