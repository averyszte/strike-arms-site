import { useState } from 'react';
import { Redirect, useLocation } from 'wouter';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { EmailCodeStep } from '@/components/account/EmailCodeStep';
import { SignInForm } from '@/components/account/SignInForm';
import { useCustomerSession } from '@/hooks/use-customer-session';
import { useCustomerSignIn } from '@/hooks/use-customer-sign-in';
import { useCustomerSignUp } from '@/hooks/use-customer-sign-up';
import { isAuthErrorCode } from '@/lib/customer-auth-errors';
import type { SignInInput } from '@/types/customer-account';

const CRUMBS = [{ label: 'Your account', href: '/account' }, { label: 'Sign in' }];

/**
 * Customer sign-in. An account whose email was never confirmed gets the code
 * step here rather than a dead end, because the password was right.
 */
export default function AccountSignIn() {
  const [, navigate] = useLocation();
  const session = useCustomerSession();
  const signIn = useCustomerSignIn();
  const { confirmCode, resendCode } = useCustomerSignUp();
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  if (session.user && !signIn.isPending) return <Redirect to="/account" replace />;

  async function submit(input: SignInInput) {
    try {
      await signIn.mutateAsync(input);
      navigate('/account', { replace: true });
    } catch (error: unknown) {
      if (!isAuthErrorCode(error, 'email_not_confirmed')) throw error;
      setUnconfirmedEmail(input.email);
    }
  }

  return (
    <AccountPageFrame
      pageTitle="Sign in"
      path="/account/sign-in"
      crumbs={CRUMBS}
      title="Sign in"
      intro="See your orders and where they are, and check out faster."
    >
      {unconfirmedEmail ? (
        <EmailCodeStep
          email={unconfirmedEmail}
          title="Confirm your email first"
          submitLabel="Confirm and sign in"
          onConfirm={(code) => confirmCode.mutateAsync({ email: unconfirmedEmail, code })}
          onResend={() => resendCode.mutateAsync(unconfirmedEmail)}
        />
      ) : (
        <SignInForm onSubmit={submit} />
      )}
    </AccountPageFrame>
  );
}
