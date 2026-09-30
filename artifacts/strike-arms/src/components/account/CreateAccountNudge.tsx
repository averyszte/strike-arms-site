import { Link } from 'wouter';
import { UserPlus } from 'lucide-react';

import { useCustomerSession } from '@/hooks/use-customer-session';
import { CARD_TITLE, CTA_SECONDARY_SM, PANEL } from '@/lib/storefront-styles';

/**
 * After a guest checkout: an account made with the same email picks this
 * order up once the email is confirmed. The email is not carried over in the
 * link, so it never lands in a URL or a log.
 */
export function CreateAccountNudge() {
  const { user, isLoading } = useCustomerSession();
  if (isLoading || user) return null;

  return (
    <section className={`${PANEL} mt-6 p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Track it from an account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create an account with the email you just used and this order, and every one after it,
        shows up in one place. Optional: the order emails come either way.
      </p>
      <Link href="/account/sign-up" className={`${CTA_SECONDARY_SM} mt-4`}>
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        Create an account
      </Link>
    </section>
  );
}
