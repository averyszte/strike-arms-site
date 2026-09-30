import { Redirect, useSearch } from 'wouter';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { EmailLinkNotice } from '@/components/account/EmailLinkNotice';
import { useCustomerEmailLink } from '@/hooks/use-customer-email-link';
import { readTokenHash } from '@/hooks/use-email-link';
import type { EmailLinkState } from '@/types/auth';

const CRUMBS = [{ label: 'Your account', href: '/account' }, { label: 'Confirm your email' }];

const MISSING_LINK: EmailLinkState = {
  state: 'invalid',
  message: 'The link is incomplete. Open it again from the email.',
};

const RETRY = {
  advice: 'Links work once and expire after an hour. Sign in and we will send you a new code.',
  label: 'Sign in',
  href: '/account/sign-in',
};

/**
 * Where the confirm-signup email's button lands. Redeeming the link confirms
 * the email and signs the customer in; /account then links their guest
 * orders.
 */
export default function AccountConfirm() {
  const tokenHash = readTokenHash(useSearch());
  const link = useCustomerEmailLink(tokenHash, 'email') ?? MISSING_LINK;

  if (link.state === 'redeemed') return <Redirect to="/account" replace />;

  return (
    <AccountPageFrame
      pageTitle="Confirm your email"
      path="/account/confirm"
      crumbs={CRUMBS}
      title="Confirm your email"
    >
      <EmailLinkNotice link={link} retry={RETRY} />
    </AccountPageFrame>
  );
}
