import { useQuery } from '@tanstack/react-query';

import { listTotpFactors } from '@/data/admin-mfa-repository';
import { ADMIN_MFA_FACTORS_KEY } from '@/hooks/admin-mfa-query-keys';

/** The authenticators on this account, for the Settings list (M-026). */
export function useAdminMfaFactors() {
  return useQuery({ queryKey: ADMIN_MFA_FACTORS_KEY, queryFn: listTotpFactors });
}
