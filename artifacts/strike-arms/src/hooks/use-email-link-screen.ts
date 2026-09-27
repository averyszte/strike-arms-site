import { useSearch } from 'wouter';

import { readTokenHash, useEmailLink } from '@/hooks/use-email-link';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { emailLinkScreen } from '@/lib/email-link-screen';
import type { EmailLinkType } from '@/types/auth';

/**
 * Redeem the link on the current URL and say which screen to show. The
 * session it creates is read from the auth context rather than from the
 * redeem call, because the context is also what AuthGuard reads on /admin.
 */
export function useEmailLinkScreen(type: EmailLinkType) {
  const link = useEmailLink(readTokenHash(useSearch()), type);
  const auth = useAdminAuth();

  const screen = emailLinkScreen(link, {
    isLoading: auth.isLoading,
    hasUser: auth.user !== null,
    isAdmin: auth.isAdmin,
    connectionError: auth.connectionError,
    mfa: auth.mfa,
  });

  return {
    screen,
    linkError: link.state === 'invalid' ? link.message : null,
    connectionError: auth.connectionError,
    recheck: auth.recheck,
    signOut: auth.signOut,
  };
}
