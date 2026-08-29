import { useQuery } from '@tanstack/react-query';

import { verifyInviteToken } from '@/data/admin-auth-repository';

export type InviteVerification =
  | { state: 'verifying' }
  | { state: 'set-password' }
  | { state: 'error'; message: string };

const MISSING_TOKEN = 'Invite link is missing or invalid.';

/**
 * Redeems the token_hash on an admin invite link.
 *
 * Deliberately a query rather than an effect: verifyOtp signs the invited user
 * in, so it must run exactly once. react-query's cache is what guarantees that
 * — retry is off, and StrictMode's double render does not double-redeem.
 */
export function useInviteVerification(tokenHash: string | null): InviteVerification {
  const query = useQuery({
    queryKey: ['invite-verification', tokenHash],
    enabled: tokenHash !== null,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => verifyInviteToken(tokenHash as string),
  });

  if (tokenHash === null) return { state: 'error', message: MISSING_TOKEN };
  if (query.isPending) return { state: 'verifying' };
  if (query.error) {
    return {
      state: 'error',
      message: query.error instanceof Error ? query.error.message : MISSING_TOKEN,
    };
  }
  if (query.data?.error) return { state: 'error', message: query.data.error };
  return { state: 'set-password' };
}
