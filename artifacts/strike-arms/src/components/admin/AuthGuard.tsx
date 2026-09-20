import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { MfaGate } from '@/components/admin/MfaGate';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { user, isAdmin, isLoading, mfa } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Redirect to="/admin/login" />;

  // A password gets you aal1. Every admin write policy checks is_admin_aal2(),
  // so an aal1 admin is not a limited admin — it is one the database refuses.
  if (mfa.level !== 'aal2') return <MfaGate />;

  return <>{children}</>;
}
