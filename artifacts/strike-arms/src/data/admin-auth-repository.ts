import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ session: Session | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
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

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function verifyInviteToken(
  tokenHash: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'invite',
  });
  if (error) return { error: error.message };
  return { error: null };
}
