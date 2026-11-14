import { createContext, useContext } from 'react';

import type { AdminAuthContextValue } from '@/types/auth';

/** Provided by components/admin/admin-auth-provider.tsx, filled by useAdminAuthState. */
export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
