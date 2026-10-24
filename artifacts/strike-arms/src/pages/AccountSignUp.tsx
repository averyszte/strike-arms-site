import { useState } from 'react';
import { Redirect } from 'wouter';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { EmailCodeStep } from '@/components/account/EmailCodeStep';
import { SignUpForm } from '@/components/account/SignUpForm';
import { useCustomerSession } from '@/hooks/use-customer-session';
import { useCustomerSignUp } from '@/hooks/use-customer-sign-up';
import type { SignUpFormInput } from '@/lib/customer-account-validation';

const CRUMBS = [{ label: 'Your account', href: '/account' }, { label: 'Create an account' }];

/**
 * Sign-up, then the emailed code. Confirming signs the customer in, and
 * /account then links any guest orders placed with the same email.
 *
 * An email that already has an account is refused on the form with a
 * message saying so, rather than reaching the code step for an email that
 * will never come.
 */
export default function AccountSignUp() {
  const session = useCustomerSession();
  const { signUp, confirmCode, resendCode } = useCustomerSignUp();
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (session.user) return <Redirect to="/account" replace />;

  async function submit({ fullName, email, password }: SignUpFormInput) {
    await signUp.mutateAsync({ fullName, email, password });
    setSentTo(email);
  }

  return (
    <AccountPageFrame
      pageTitle="Create an account"
      path="/account/sign-up"
      crumbs={CRUMBS}
      title="Create an account"
      intro="Track every order in one place. Orders you placed as a guest with the same email are added once you confirm it."
    >
      {sentTo ? (
        <EmailCodeStep
          email={sentTo}
          title="Check your email"
          submitLabel="Confirm email"
          onConfirm={(code) => confirmCode.mutateAsync({ email: sentTo, code })}
          onResend={() => resendCode.mutateAsync(sentTo)}
        />
      ) : (
        <SignUpForm onSubmit={submit} />
      )}
    </AccountPageFrame>
  );
}
