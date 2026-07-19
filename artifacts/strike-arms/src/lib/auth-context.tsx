import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import * as authRepo from '@/data/auth-repository';
import type { AuthUser, SignUpInput, ProfilePatch, AuthResult } from '@/types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthResult>;
  exportData: () => Promise<Record<string, unknown> | null>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authRepo
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const result = await authRepo.signUp(input);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authRepo.signIn(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authRepo.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!user) return { ok: false, error: 'Not signed in.' } as AuthResult;
      const result = await authRepo.updateProfile(user.id, patch);
      if (result.ok) setUser(result.user);
      return result;
    },
    [user],
  );

  const exportData = useCallback(async () => {
    if (!user) return null;
    return authRepo.exportUserData(user.id);
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await authRepo.deleteAccount(user.id);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signUp, signIn, signOut, updateProfile, exportData, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
