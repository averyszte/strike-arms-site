import { ArrowDown, Phone } from 'lucide-react';
import { Link } from 'wouter';

import { ServiceTiles, type ServiceFact } from '@/components/service/ServiceTiles';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { BUSINESS } from '@/lib/site-config';

export interface ServiceHeroProps {
  title: string;
  eyebrow: string;
  intro: string;
  facts: ServiceFact[];
}

/**
 * The top of a service page.
 *
 * Every service page used to open with a breadcrumb, an h1 and a paragraph on
 * the page background, which gave a visitor nothing to act on until they had
 * read the whole article. The band puts the two things they came for — the
 * quote form and the phone number — above the fold, and the fact tiles answer
 * the scannable questions so the prose can take its time.
 */
export function ServiceHero({ title, eyebrow, intro, facts }: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-14">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/services">Services</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.15] text-foreground md:text-[2.75rem]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/90">{intro}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="#quote">
              Request a quote
              <ArrowDown aria-hidden="true" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}>
              <Phone aria-hidden="true" />
              {BUSINESS.telephone}
            </a>
          </Button>
        </div>

        <ServiceTiles items={facts} />
      </div>
    </section>
  );
}
