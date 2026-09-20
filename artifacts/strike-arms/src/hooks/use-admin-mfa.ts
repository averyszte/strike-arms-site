import { useCallback, useState } from 'react';

import { enrollTotp, verifyTotp } from '@/data/admin-mfa-repository';
import { useAdminAuth } from '@/lib/admin-auth-context';
import type { TotpEnrolment } from '@/types/auth';

/**
 * Drives both halves of the admin MFA gate: setting an authenticator up, and
 * entering a code from one that is already set up.
 *
 * They share this hook because they share the failure mode — a wrong code
 * leaves the admin exactly where they were, with a message and an empty field.
 */
export function useAdminMfa() {
  const { refreshMfa } = useAdminAuth();
  const [enrolment, setEnrolment] = useState<TotpEnrolment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const startEnrolment = useCallback(async () => {
    setIsPending(true);
    setError(null);
    const result = await enrollTotp();
    setEnrolment(result.enrolment);
    setError(result.error);
    setIsPending(false);
  }, []);

  /**
   * Verify a code. Returns whether it was accepted so the caller can clear the
   * field on a rejection rather than leaving six wrong digits in place.
   */
  const submitCode = useCallback(
    async (code: string): Promise<boolean> => {
      setIsPending(true);
      setError(null);
      const { error: verifyError } = await verifyTotp(code, enrolment?.factorId);
      setIsPending(false);

      if (verifyError) {
        setError(verifyError);
        return false;
      }

      // The session is aal2 from here. The context is what AuthGuard reads.
      await refreshMfa();
      return true;
    },
    [enrolment, refreshMfa],
  );

  return { enrolment, error, isPending, startEnrolment, submitCode };
}
