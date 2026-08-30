import { Mail, Phone } from 'lucide-react';

import { mailtoHref, telHref } from '@/lib/contact-links';

/**
 * A customer's email and phone, tappable.
 *
 * This is aimed squarely at the phone propped behind the counter: someone
 * wants to ring the person whose order is on the screen, and the alternative
 * is reading a number aloud to themselves while they type it into the dialler.
 *
 * The rows are a full tap target rather than tappable text, and they are
 * deliberately not in the list views — a whole table row already opens the
 * order, and a link inside it would swallow the tap and start a phone call
 * when someone meant to read the order.
 */

const ROW =
  '-mx-2 flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground ' +
  'transition-colors hover:bg-muted/50 hover:text-foreground sm:min-h-8';

const ICON = 'h-4 w-4 shrink-0';

interface Props {
  email: string | null;
  phone?: string | null;
  /** Prefilled on the email, so the reply already says what it is about. */
  subject: string;
  /** Shown when there is no email at all, as opposed to an unusable one. */
  emptyEmailLabel: string;
}

export function ContactLinks({ email, phone, subject, emptyEmailLabel }: Props) {
  const mailto = mailtoHref(email, subject);
  const tel = telHref(phone);

  return (
    <div className="mt-0.5 flex flex-col items-start">
      {mailto ? (
        <a href={mailto} className={ROW}>
          <Mail className={ICON} aria-hidden="true" />
          <span className="break-all">{email}</span>
        </a>
      ) : (
        // Either nothing was given or what was given is not an address. Both
        // read better as text than as a link that goes nowhere.
        <p className="py-1 text-sm text-muted-foreground">{email ?? emptyEmailLabel}</p>
      )}

      {tel ? (
        <a href={tel} className={ROW}>
          <Phone className={ICON} aria-hidden="true" />
          <span>{phone}</span>
        </a>
      ) : (
        phone && <p className="py-1 text-sm text-muted-foreground">{phone}</p>
      )}
    </div>
  );
}
