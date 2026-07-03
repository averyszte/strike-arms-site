import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type AuthLevel = 'none' | 'aal1' | 'aal2';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export async function enrollMfa(): Promise<{
  qrCode: string;
  secret: string;
  factorId: string;
} | null> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Strike Arms Admin',
  });
  if (error || !data.totp) return null;
  return { qrCode: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
}

export async function verifyTotp(
  code: string,
): Promise<{ session: Session | null; error: string | null }> {
  const factorId = await getEnrolledTotpFactorId();
  if (!factorId) return { session: null, error: 'No TOTP factor enrolled' };

  const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (verifyError) return { session: null, error: verifyError.message };

  const { data: sessionData } = await supabase.auth.getSession();
  return { session: sessionData.session, error: null };
}

export async function getAuthLevel(): Promise<AuthLevel> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!data) return 'none';
  return data.currentLevel as AuthLevel;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

async function getEnrolledTotpFactorId(): Promise<string | null> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return null;
  return data.totp[0]?.id ?? null;
}
