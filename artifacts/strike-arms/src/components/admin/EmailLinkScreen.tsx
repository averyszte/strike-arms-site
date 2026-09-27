import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

import { AdminAuthScreen } from '@/components/admin/AdminAuthScreen';
import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { MfaChallenge } from '@/components/admin/MfaChallenge';
import { Button } from '@/components/ui/button';
import { useEmailLinkScreen } from '@/hooks/use-email-link-screen';
import type { EmailLinkType } from '@/types/auth';

interface Props {
  type: EmailLinkType;
  pageTitle: string;
  heading: string;
  intro: string;
  /** Shown under the link's own error when it is missing, used or expired. */
  invalidAdvice: string;
  /** The new password form, shown once the link and session are good. */
  children: ReactNode;
}

function Spinner() {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-b-2 border-accent" />
      Checking the link…
    </div>
  );
}

function BackToLogin() {
  return (
    <Button asChild variant="outline" className="w-full">
      <Link href="/admin/login">Back to sign in</Link>
    </Button>
  );
}

/**
 * The page around an invite or reset form: everything that can come before
 * the form, and the form once nothing is in the way.
 */
export function EmailLinkScreen({ type, pageTitle, heading, intro, invalidAdvice, children }: Props) {
  const { screen, linkError, connectionError, recheck, signOut } = useEmailLinkScreen(type);
  const [isRechecking, setIsRechecking] = useState(false);

  function retry() {
    setIsRechecking(true);
    void recheck().finally(() => setIsRechecking(false));
  }

  if (screen === 'checking') {
    return (
      <AdminAuthScreen pageTitle={pageTitle} heading={heading}>
        <Spinner />
      </AdminAuthScreen>
    );
  }

  if (screen === 'invalid') {
    return (
      <AdminAuthScreen pageTitle={pageTitle} heading="This link cannot be used">
        <div className="space-y-4">
          <p className="text-sm text-destructive">{linkError}</p>
          <p className="text-sm text-muted-foreground">{invalidAdvice}</p>
          <BackToLogin />
        </div>
      </AdminAuthScreen>
    );
  }

  if (screen === 'connection') {
    return (
      <AdminAuthScreen pageTitle={pageTitle} heading={heading}>
        <AdminLoadError
          what="your admin access"
          error={connectionError}
          isRetrying={isRechecking}
          onRetry={retry}
        />
      </AdminAuthScreen>
    );
  }

  if (screen === 'not-admin') {
    return (
      <AdminAuthScreen pageTitle={pageTitle} heading="No admin access">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The link worked, but this account has not been given access to the admin. Ask whoever
            runs the shop's admin to check the invite.
          </p>
          <Button type="button" variant="outline" className="w-full" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </AdminAuthScreen>
    );
  }

  if (screen === 'mfa') {
    return (
      <AdminAuthScreen
        pageTitle={pageTitle}
        heading="Two-factor"
        intro="This account has an authenticator, so a code is needed before the password can change."
      >
        <MfaChallenge />
      </AdminAuthScreen>
    );
  }

  return (
    <AdminAuthScreen pageTitle={pageTitle} heading={heading} intro={intro}>
      {children}
    </AdminAuthScreen>
  );
}
