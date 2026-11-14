/**
 * Admin two-factor authentication (TOTP).
 *
 * Every admin write policy in 002_rls.sql checks is_admin_aal2(), and
 * create_counter_order() raises 42501 for the same reason. A password-only session is
 * aal1, so without the flow in this file an admin can sign in, see everything,
 * and be refused by the database on every single save. Enrolment is therefore
 * mandatory, not optional — see AuthGuard.
 *
 * M-026: an admin may hold a second, named authenticator (a backup device), so
 * a lost phone is not a lockout. A factor can be removed only while another
 * verified one remains.
 */
import { supabase } from '@/data/supabase-client';
import type { AuthLevel, MfaState, TotpEnrolment, TotpFactor } from '@/types/auth';

const ISSUER = 'Strike Arms Admin';

/**
 * Read the session's assurance level and whether a verified factor exists.
 *
 * Deliberately built on getAuthenticatorAssuranceLevel() alone: it reads the
 * stored session rather than calling the network, which matters because this
 * runs inside onAuthStateChange. nextLevel is 'aal2' exactly when the user has
 * at least one *verified* factor, which is the question we are asking.
 *
 * Throws when the level cannot be read (M-036), so the caller can keep the
 * last known level instead of dropping a working admin to aal1.
 */
export async function getMfaState(): Promise<MfaState> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) throw error ?? new Error('Could not read the two-factor state');
  return {
    level: (data.currentLevel ?? 'none') as AuthLevel,
    hasTotpFactor: data.nextLevel === 'aal2',
  };
}

/** The verified authenticators on this account, oldest first. */
export async function listTotpFactors(): Promise<TotpFactor[]> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data.totp
    .map(f => ({ id: f.id, name: f.friendly_name ?? '', createdAt: f.created_at }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Start enrolment: returns a QR code and the secret behind it.
 *
 * The factor is unusable until verifyTotp() confirms a code from it. Abandoned
 * attempts are cleared first — Supabase caps the number of factors per user,
 * and an admin who closes the tab mid-enrolment would otherwise be locked out
 * of enrolling by their own leftovers. A second factor needs a name that the
 * account does not already use (Supabase refuses duplicates).
 */
export async function enrollTotp(name?: string): Promise<{
  enrolment: TotpEnrolment | null;
  error: string | null;
}> {
  await removeUnverifiedTotpFactors();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: ISSUER,
    ...(name ? { friendlyName: name } : {}),
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
 * Without one, the code is tried against each verified factor in turn, so a
 * code from the backup device works at the gate without picking a device.
 */
export async function verifyTotp(
  code: string,
  factorId?: string,
): Promise<{ error: string | null }> {
  const ids = factorId ? [factorId] : await getVerifiedTotpFactorIds();
  if (ids.length === 0) return { error: 'No authenticator is set up on this account' };

  let lastError = 'That code was not accepted';
  for (const id of ids) {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: id, code });
    if (!error) return { error: null };
    lastError = error.message;
  }
  return { error: lastError };
}

/**
 * Remove a verified factor. Refused when it is the only one, because that
 * would leave the account with no second factor and the admin locked at aal1.
 */
export async function unenrollTotp(factorId: string): Promise<{ error: string | null }> {
  const ids = await getVerifiedTotpFactorIds();
  if (!ids.includes(factorId)) return { error: 'That authenticator is no longer on this account' };
  if (ids.length < 2) {
    return { error: 'Add another authenticator before removing this one' };
  }
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return { error: error ? error.message : null };
}

async function getVerifiedTotpFactorIds(): Promise<string[]> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) return [];
  return data.totp.map(f => f.id);
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
