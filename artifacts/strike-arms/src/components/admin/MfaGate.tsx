import { ShieldCheck } from 'lucide-react';

import { MfaChallenge } from '@/components/admin/MfaChallenge';
import { MfaEnrolment } from '@/components/admin/MfaEnrolment';
import { useAdminAuth } from '@/lib/admin-auth-context';

/**
 * Stands between a signed-in admin and the admin itself until the session is
 * aal2.
 *
 * This is a gate rather than a prompt-you-can-skip because the database makes
 * it one: the RLS policies on products, orders and stock all check
 * is_admin_aal2(). An admin let through at aal1 sees a working admin that
 * refuses every save, which is a worse experience than being asked for a code.
 */
export function MfaGate() {
  const { user, mfa, signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-foreground">
            {mfa.hasTotpFactor ? 'Two-factor' : 'Set up two-factor'}
          </h1>
        </div>
        <p className="mb-7 text-sm text-muted-foreground">
          Changing anything in the admin needs a code as well as a password.
        </p>

        {mfa.hasTotpFactor ? <MfaChallenge /> : <MfaEnrolment />}

        <p className="mt-7 border-t border-border pt-4 text-xs text-muted-foreground">
          Signed in as {user?.email ?? 'unknown'} ·{' '}
          <button
            type="button"
            onClick={() => void signOut()}
            className="font-medium text-accent hover:underline"
          >
            Sign out
          </button>
        </p>
      </div>
    </div>
  );
}
