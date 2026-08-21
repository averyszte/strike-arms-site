import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type AdminAuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// TEMP DEV-ONLY LOGIN BYPASS — remove before any deploy.
// Lets the dashboard render without hitting Supabase auth (the shared DB has a
// broken auth.identities row for the admin, returning a 500 on login). Guarded
// by import.meta.env.DEV so it can never take effect in a production build.
const DEV_BYPASS_ADMIN = import.meta.env.DEV && true;

const FAKE_ADMIN_USER = {
  id: 'dev-bypass-admin',
  email: 'dev-bypass@local',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: new Date(0).toISOString(),
} as unknown as User;

async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from('admins').select('id').eq('id', userId).maybeSingle();
  return !!data;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_BYPASS_ADMIN ? FAKE_ADMIN_USER : null);
  const [isAdmin, setIsAdmin] = useState(DEV_BYPASS_ADMIN);
  const [isLoading, setIsLoading] = useState(!DEV_BYPASS_ADMIN);

  useEffect(() => {
    if (DEV_BYPASS_ADMIN) return;
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const admin = await checkIsAdmin(session.user.id);
        if (!mounted) return;
        setUser(session.user);
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      if (session?.user) {
        const admin = await checkIsAdmin(session.user.id);
        if (!mounted) return;
        setUser(session.user);
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) throw new Error('Authentication failed');
    const admin = await checkIsAdmin(u.id);
    if (!admin) {
      await supabase.auth.signOut();
      throw new Error('Access denied — this account is not an admin');
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
