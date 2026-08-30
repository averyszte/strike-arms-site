import { Link } from 'wouter';
import { Phone } from 'lucide-react';

import { ServiceQuoteForm } from '@/components/service/ServiceQuoteForm';
import { BUSINESS } from '@/lib/site-config';

/**
 * The foot of every service page.
 *
 * It used to be two buttons — the general contact form and a phone number —
 * which is where a service enquiry went to die: whoever rang got asked the
 * same four questions anyway, and whoever used the contact form wrote "my gun
 * is broken" and waited for a reply asking what the gun was. The form here
 * asks those questions once, on the page describing the service, so the first
 * reply can be about the job rather than about the gun.
 *
 * The phone stays, underneath. Plenty of people would rather talk, and a form
 * that pretends otherwise just loses them.
 */
export function ServiceQuoteBlock({ serviceTitle }: { serviceTitle: string }) {
  return (
    <section className="mt-12 rounded-sm border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">How we quote</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We diagnose the gun before we price the job. Guessing a figure from a description usually
        means quoting for the wrong fault — the thing a customer is sure is a broken gearbox is very
        often a battery, a connector or a fuse.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Tell us what you have and what it is doing, using the form below.</li>
        <li>We come back with what it is likely to need and what to expect.</li>
        <li>
          Nothing gets done until you say so. If it is not worth repairing, we will say that too.
        </li>
      </ul>

      <h3 className="mt-6 border-t border-border pt-6 text-lg font-semibold text-foreground">
        Ask us about {serviceTitle.toLowerCase()}
      </h3>
      <ServiceQuoteForm serviceTitle={serviceTitle} />

      <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
        <Phone className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
        Would rather talk it through? Ring the shop on{' '}
        <a
          href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
          className="font-medium text-accent hover:underline"
        >
          {BUSINESS.telephone}
        </a>
        , or use the{' '}
        <Link href="/contact" className="font-medium text-accent hover:underline">
          general contact form
        </Link>{' '}
        for anything that is not about a specific gun.
      </p>
    </section>
  );
}
