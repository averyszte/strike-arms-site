import type { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/lib/auth-context';

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Redirect to="/admin/login" />;

  return <>{children}</>;
}
