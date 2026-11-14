import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  getSession,
  isCurrentUserAdmin,
  onAuthStateChange,
  signInWithPassword,
  signOut as signOutOfSupabase,
} from '@/data/admin-auth-repository';
import { getMfaState } from '@/data/admin-mfa-repository';
import type { MfaState } from '@/types/auth';
import type { Session, User } from '@supabase/supabase-js';

type AdminAuthContextValue = {
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

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

type AdminSession = {
  user: User | null;
  isAdmin: boolean;
  mfa: MfaState;
  connectionError: unknown;
};

const SIGNED_OUT: AdminSession = {
  user: null,
  isAdmin: false,
  mfa: { level: 'none', hasTotpFactor: false },
  connectionError: null,
};

const CHECK_FAILED_MESSAGE =
  "Could not check this account's admin access. Check the connection and try again.";

/**
 * Read the MFA level, retrying once. On a second failure keep the last known
 * level for the same user (M-036): a network blip must not drop a working
 * admin back to the code screen. A different or new user starts from 'none'.
 */
async function readMfa(fallback: MfaState): Promise<MfaState> {
  try {
    return await getMfaState();
  } catch {
    return getMfaState().catch(() => fallback);
  }
}

async function resolveSession(session: Session | null, prev: AdminSession): Promise<AdminSession> {
  if (!session?.user) return SIGNED_OUT;
  const fallback = prev.user?.id === session.user.id ? prev.mfa : SIGNED_OUT.mfa;
  try {
    const [isAdmin, mfa] = await Promise.all([isCurrentUserAdmin(), readMfa(fallback)]);
    return { user: session.user, isAdmin, mfa, connectionError: null };
  } catch (error: unknown) {
    return {
      ...SIGNED_OUT,
      user: session.user,
      connectionError: error ?? new Error(CHECK_FAILED_MESSAGE),
    };
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminSession>(SIGNED_OUT);
  const [isLoading, setIsLoading] = useState(true);
  // resolveSession needs the last state without re-subscribing on every change.
  const stateRef = useRef<AdminSession>(SIGNED_OUT);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let mounted = true;

    async function apply(session: Session | null) {
      const next = await resolveSession(session, stateRef.current);
      if (!mounted) return;
      setState(next);
      setIsLoading(false);
    }

    void getSession().then(apply);
    const unsubscribe = onAuthStateChange((_, session) => void apply(session));

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refreshMfa = useCallback(async () => {
    const mfa = await readMfa(stateRef.current.mfa);
    setState(prev => (prev.user ? { ...prev, mfa } : prev));
  }, []);

  const recheck = useCallback(async () => {
    setState(await resolveSession(await getSession(), stateRef.current));
  }, []);

  const signIn = useCallback(async (email: string, password: string, captchaToken: string | null) => {
    await signInWithPassword(email, password, captchaToken);
    const admin = await isCurrentUserAdmin().catch(async () => {
      await signOutOfSupabase();
      throw new Error(CHECK_FAILED_MESSAGE);
    });
    if (!admin) {
      await signOutOfSupabase();
      throw new Error('Access denied — this account is not an admin');
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutOfSupabase();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ ...state, isLoading, refreshMfa, recheck, signIn, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
