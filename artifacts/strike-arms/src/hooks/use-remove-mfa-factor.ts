import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unenrollTotp } from '@/data/admin-mfa-repository';
import { ADMIN_MFA_FACTORS_KEY } from '@/hooks/admin-mfa-query-keys';

/** Remove one authenticator. The repository refuses to remove the last one. */
export function useRemoveMfaFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (factorId: string) => {
      const { error } = await unenrollTotp(factorId);
      if (error) throw new Error(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ADMIN_MFA_FACTORS_KEY }),
  });
}
