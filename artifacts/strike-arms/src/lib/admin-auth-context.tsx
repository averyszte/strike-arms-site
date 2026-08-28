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

// The admins table is RLS-closed to the browser by design, so a direct select
// always returns nothing. is_admin() is security definer and reads auth.uid().
async function checkIsAdmin(): Promise<boolean> {
  const { data } = await supabase.rpc('is_admin');
  return data === true;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const admin = await checkIsAdmin();
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
        const admin = await checkIsAdmin();
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
    const admin = await checkIsAdmin();
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
