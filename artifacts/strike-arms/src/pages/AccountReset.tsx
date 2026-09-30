import { useState, type ReactNode } from 'react';
import { useLocation, useSearch } from 'wouter';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { EmailCodeStep } from '@/components/account/EmailCodeStep';
import { EmailLinkNotice } from '@/components/account/EmailLinkNotice';
import { ResetRequestForm } from '@/components/account/ResetRequestForm';
import { NewPasswordForm } from '@/components/admin/NewPasswordForm';
import { useCustomerEmailLink } from '@/hooks/use-customer-email-link';
import { useCustomerPasswordReset } from '@/hooks/use-customer-password-reset';
import { readTokenHash } from '@/hooks/use-email-link';
import { CARD_TITLE, PANEL } from '@/lib/storefront-styles';

const CRUMBS = [{ label: 'Your account', href: '/account' }, { label: 'Reset your password' }];

const RETRY = {
  advice: 'Reset links work once and expire after an hour.',
  label: 'Ask for a new one',
  href: '/account/reset',
};

/**
 * Forgotten password. Two ways in: the link in the reset email
 * (?token_hash=...), or asking here and typing the code from that email.
 * Both sign the customer in, and then they choose the new password.
 *
 * The code step shows whether or not the email has an account, so this page
 * never says which emails do.
 */
export default function AccountReset() {
  const [, navigate] = useLocation();
  const link = useCustomerEmailLink(readTokenHash(useSearch()), 'recovery');
  const { request, confirmCode, setPassword } = useCustomerPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);

  async function ask(email: string) {
    await request.mutateAsync(email);
    setSentTo(email);
  }

  async function confirm(email: string, code: string) {
    await confirmCode.mutateAsync({ email, code });
    setIsCodeConfirmed(true);
  }

  async function save(password: string) {
    await setPassword.mutateAsync(password);
    navigate('/account', { replace: true });
  }

  let step: ReactNode;
  if (link?.state === 'redeemed' || isCodeConfirmed) {
    step = (
      <section className={`${PANEL} p-6`}>
        <h2 className={`${CARD_TITLE} mb-4 text-lg`}>Choose a new password</h2>
        <NewPasswordForm submitLabel="Save new password" onSubmit={save} />
      </section>
    );
  } else if (link) {
    step = <EmailLinkNotice link={link} retry={RETRY} />;
  } else if (sentTo) {
    step = (
      <EmailCodeStep
        email={sentTo}
        title="Check your email"
        submitLabel="Continue"
        onConfirm={(code) => confirm(sentTo, code)}
        onResend={() => request.mutateAsync(sentTo)}
      />
    );
  } else {
    step = <ResetRequestForm onSubmit={ask} />;
  }

  return (
    <AccountPageFrame
      pageTitle="Reset your password"
      path="/account/reset"
      crumbs={CRUMBS}
      title="Reset your password"
    >
      {step}
    </AccountPageFrame>
  );
}
