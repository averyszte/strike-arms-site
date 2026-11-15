import { CheckCircle2 } from 'lucide-react';

import { BUSINESS } from '@/lib/site-config';
import { CARD_TITLE, PANEL, TEXT_LINK, phoneHref } from '@/lib/storefront-styles';

/** The contact form's thank-you: a reply in a day or two, or ring for anything urgent. */
export function ContactFormSent() {
  return (
    <div className={`${PANEL} p-6`}>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
        {/* Focused when it replaces the form, so a screen reader hears the thank-you. */}
        <h2 ref={(el) => el?.focus()} tabIndex={-1} className={`${CARD_TITLE} text-lg outline-none`}>
          Thanks — we have it
        </h2>
      </div>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        We read every message and normally come back within a day or two. If it is urgent, ring
        the shop on{' '}
        <a href={phoneHref(BUSINESS.telephone)} className={TEXT_LINK}>
          {BUSINESS.telephone}
        </a>{' '}
        — that is always the fastest way to reach us.
      </p>
    </div>
  );
}
