import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

/** Gate a route behind sign-in. Redirects to /login when not authenticated. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <SiteLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      </SiteLayout>
    );
  }

  return <>{children}</>;
}
