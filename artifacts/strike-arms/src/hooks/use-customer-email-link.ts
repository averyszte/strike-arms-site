import { useQuery } from '@tanstack/react-query';

import { redeemCustomerLink } from '@/data/customer-auth-repository';
import { customerAuthError } from '@/lib/customer-auth-errors';
import type { EmailLinkState } from '@/types/auth';
import type { CustomerLinkType } from '@/types/customer-account';

/**
 * Redeems the token_hash on a customer's confirm-signup or reset link. A
 * query rather than an effect so it runs exactly once, for the reason given
 * in use-email-link.ts (the admin version).
 */
export function useCustomerEmailLink(
  tokenHash: string | null,
  type: CustomerLinkType,
): EmailLinkState | null {
  const query = useQuery({
    queryKey: ['customer-email-link', type, tokenHash],
    enabled: tokenHash !== null,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      await redeemCustomerLink(tokenHash as string, type);
      return true;
    },
  });

  if (tokenHash === null) return null;
  if (query.isError) return { state: 'invalid', message: customerAuthError(query.error) };
  if (query.isPending) return { state: 'redeeming' };
  return { state: 'redeemed' };
}
