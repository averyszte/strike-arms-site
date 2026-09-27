import { useState } from 'react';
import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { MfaGate } from '@/components/admin/MfaGate';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { user, isAdmin, isLoading, mfa, connectionError, recheck } = useAdminAuth();
  const [isRechecking, setIsRechecking] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  // Signed in, but the admin check never answered. That is not "not an admin",
  // so the login page would be the wrong place to send them.
  if (user && connectionError) {
    const retry = () => {
      setIsRechecking(true);
      void recheck().finally(() => setIsRechecking(false));
    };
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl">
          <AdminLoadError
            what="your admin access"
            error={connectionError}
            isRetrying={isRechecking}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return <Redirect to="/admin/login" />;

  // A password gets you aal1. Every admin write policy checks is_admin_aal2(),
  // so an aal1 admin is not a limited admin — it is one the database refuses.
  if (mfa.level !== 'aal2') return <MfaGate />;

  return <>{children}</>;
}
