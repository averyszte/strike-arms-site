import { Link, useSearch } from 'wouter';
import { Loader2, LogIn, Settings, UserPlus } from 'lucide-react';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { MyOrders } from '@/components/account/MyOrders';
import { GuestOrderLookup } from '@/components/order-lookup/GuestOrderLookup';
import { useCustomerSession } from '@/hooks/use-customer-session';
import { orderNumberFromSearch } from '@/lib/order-timeline';
import { CARD_TITLE, CTA_PRIMARY_SM, CTA_SECONDARY_SM, PANEL } from '@/lib/storefront-styles';

/**
 * /account. Signed in: every order on the account with its tracker.
 * Signed out: sign in, or look up one order with its number and email (no
 * account needed). Status emails link here with ?order=, which fills in the
 * lookup; a signed-in customer finds the same order in their list.
 */
export default function Account() {
  const { user, isLoading } = useCustomerSession();
  const initialOrderNumber = orderNumberFromSearch(useSearch());

  if (isLoading) {
    return (
      <AccountPageFrame pageTitle="Your account" path="/account" crumbs={[{ label: 'Your account' }]} title="Your account">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
          Loading
        </p>
      </AccountPageFrame>
    );
  }

  if (user) {
    return (
      <AccountPageFrame
        pageTitle="Your orders"
        path="/account"
        crumbs={[{ label: 'Your account' }]}
        title="Your orders"
        intro={`Signed in as ${user.email ?? ''}.`}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/account/details" className={CTA_SECONDARY_SM}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            Account details
          </Link>
        </div>
        <MyOrders userId={user.id} />
        <h2 className={`${CARD_TITLE} pt-6 text-lg`}>Looking for another order?</h2>
        <GuestOrderLookup initialOrderNumber={initialOrderNumber} />
      </AccountPageFrame>
    );
  }

  return (
    <AccountPageFrame
      pageTitle="Track your order"
      path="/account"
      crumbs={[{ label: 'Your account' }]}
      title="Track your order"
      intro="Sign in to see all your orders, or enter an order number and the email you used at checkout. No account needed."
    >
      <SignInPrompt />
      <GuestOrderLookup initialOrderNumber={initialOrderNumber} />
    </AccountPageFrame>
  );
}

function SignInPrompt() {
  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Have an account?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Every order in one place, with where each one is.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/account/sign-in" className={CTA_PRIMARY_SM}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Sign in
        </Link>
        <Link href="/account/sign-up" className={CTA_SECONDARY_SM}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Create an account
        </Link>
      </div>
    </section>
  );
}
