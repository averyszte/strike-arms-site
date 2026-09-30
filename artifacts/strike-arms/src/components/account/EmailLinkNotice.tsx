import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';

import { CARD_TITLE, PANEL, TEXT_LINK } from '@/lib/storefront-styles';
import type { EmailLinkState } from '@/types/auth';

type EmailLinkNoticeProps = {
  link: EmailLinkState;
  /** What to do when the link cannot be used, and where to go to do it. */
  retry: { advice: string; label: string; href: string };
};

/**
 * What the customer sees while a confirm or reset link is checked, and when
 * it cannot be used. Once redeemed the page shows its own next step instead.
 */
export function EmailLinkNotice({ link, retry }: EmailLinkNoticeProps) {
  if (link.state === 'redeeming') {
    return (
      <section className={`${PANEL} flex items-center gap-3 p-6 text-sm text-muted-foreground`}>
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
        Checking the link
      </section>
    );
  }
  if (link.state !== 'invalid') return null;

  return (
    <section className={`${PANEL} p-6`} role="alert">
      <h2 className={`${CARD_TITLE} text-lg`}>This link cannot be used</h2>
      <p className="mt-2 text-sm text-destructive">{link.message}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {retry.advice}{' '}
        <Link href={retry.href} className={TEXT_LINK}>
          {retry.label}
        </Link>
        .
      </p>
    </section>
  );
}
