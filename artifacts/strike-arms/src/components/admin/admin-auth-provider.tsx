import type { ReactNode } from 'react';

import { AdminAuthContext } from '@/hooks/use-admin-auth';
import { useAdminAuthState } from '@/hooks/use-admin-auth-state';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const value = useAdminAuthState();
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
