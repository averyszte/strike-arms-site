import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  enrollTotp,
  listTotpFactors,
  unenrollTotp,
  verifyTotp,
} from '@/data/admin-mfa-repository';
import type { TotpEnrolment } from '@/types/auth';

const FACTORS_KEY = ['admin-mfa-factors'];

/** The authenticators on this account, for the Settings list (M-026). */
export function useAdminMfaFactors() {
  return useQuery({ queryKey: FACTORS_KEY, queryFn: listTotpFactors });
}

/** Remove one authenticator. The repository refuses to remove the last one. */
export function useRemoveMfaFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (factorId: string) => {
      const { error } = await unenrollTotp(factorId);
      if (error) throw new Error(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: FACTORS_KEY }),
  });
}

/**
 * Add a backup authenticator: name it, scan the QR, confirm a code from it.
 * The new factor counts only once the code is accepted.
 */
export function useAddMfaFactor() {
  const qc = useQueryClient();
  const [enrolment, setEnrolment] = useState<TotpEnrolment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const start = useCallback(async (name: string) => {
    setIsPending(true);
    setError(null);
    const result = await enrollTotp(name);
    setEnrolment(result.enrolment);
    setError(result.error);
    setIsPending(false);
  }, []);

  const confirm = useCallback(
    async (code: string): Promise<boolean> => {
      if (!enrolment) return false;
      setIsPending(true);
      setError(null);
      const { error: verifyError } = await verifyTotp(code, enrolment.factorId);
      setIsPending(false);
      if (verifyError) {
        setError(verifyError);
        return false;
      }
      setEnrolment(null);
      await qc.invalidateQueries({ queryKey: FACTORS_KEY });
      return true;
    },
    [enrolment, qc],
  );

  const reset = useCallback(() => {
    setEnrolment(null);
    setError(null);
  }, []);

  return { enrolment, error, isPending, start, confirm, reset };
}
