import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  signIn: (email: string, password: string) => Promise<void>;
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

async function resolveSession(session: Session | null): Promise<AdminSession> {
  if (!session?.user) return SIGNED_OUT;
  try {
    const [isAdmin, mfa] = await Promise.all([isCurrentUserAdmin(), getMfaState()]);
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

  useEffect(() => {
    let mounted = true;

    async function apply(session: Session | null) {
      const next = await resolveSession(session);
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
    const mfa = await getMfaState();
    setState(prev => (prev.user ? { ...prev, mfa } : prev));
  }, []);

  const recheck = useCallback(async () => {
    setState(await resolveSession(await getSession()));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithPassword(email, password);
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
