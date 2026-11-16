import { Link } from 'wouter';
import { ArrowRight, Phone } from 'lucide-react';

import { BUSINESS } from '@/lib/site-config';
import {
  CTA_ARROW,
  CTA_PRIMARY,
  CTA_SECONDARY,
  EYEBROW,
  GRID_TEXTURE,
  SECTION_TITLE,
  phoneHref,
} from '@/lib/storefront-styles';

interface CtaBandProps {
  eyebrow?: string;
  title: string;
  text?: string;
  cta: { label: string; href: string };
  /** Shows the shop phone as the secondary CTA. On by default. */
  shouldShowPhone?: boolean;
}

/**
 * Closing call to action for the homepage and content pages: card surface,
 * faint grid paper, a black uppercase headline and the square accent /
 * outline button pair. No glow, so it sits quietly with the rest of the site.
 */
export function CtaBand({
  eyebrow = 'Come in. Handle the gear.',
  title,
  text,
  cta,
  shouldShowPhone = true,
}: CtaBandProps) {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-card py-16 md:py-24">
      <div className={`pointer-events-none absolute inset-0 ${GRID_TEXTURE}`} />

      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 className={`${SECTION_TITLE} mt-4`}>{title}</h2>
        {text && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{text}</p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={cta.href} className={`${CTA_PRIMARY} w-full sm:w-auto`}>
            {cta.label}
            <ArrowRight className={CTA_ARROW} />
          </Link>
          {shouldShowPhone && (
            <a href={phoneHref(BUSINESS.telephone)} className={`${CTA_SECONDARY} w-full sm:w-auto`}>
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call {BUSINESS.telephone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
