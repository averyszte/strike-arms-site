import { useQuery } from '@tanstack/react-query';

import { redeemEmailLink } from '@/data/admin-auth-repository';
import { loadErrorMessage } from '@/lib/load-error-message';
import type { EmailLinkState, EmailLinkType } from '@/types/auth';

const MISSING_TOKEN = 'The link is incomplete. Open it again from the email, or ask for a new one.';

/** The token_hash an invite or reset email put on the URL. */
export function readTokenHash(search: string): string | null {
  return new URLSearchParams(search).get('token_hash');
}

/**
 * Redeems the token_hash on an admin invite or password reset link.
 *
 * Deliberately a query rather than an effect: redeeming signs the user in and
 * uses the token up, so it must run exactly once. react-query's cache is what
 * guarantees that -- retry is off, and StrictMode's double render does not
 * redeem twice.
 */
export function useEmailLink(tokenHash: string | null, type: EmailLinkType): EmailLinkState {
  const query = useQuery({
    queryKey: ['email-link', type, tokenHash],
    enabled: tokenHash !== null,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      await redeemEmailLink(tokenHash as string, type);
      return true;
    },
  });

  if (tokenHash === null) return { state: 'invalid', message: MISSING_TOKEN };
  if (query.isError) return { state: 'invalid', message: loadErrorMessage(query.error) };
  if (query.isPending) return { state: 'redeeming' };
  return { state: 'redeemed' };
}
