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
 * Supabase answers an email that already has an account exactly like a new
 * one (and sends that address nothing to confirm), so this page cannot be
 * used to find out who has an account.
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
