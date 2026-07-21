import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight, Phone } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import {
  buildServiceSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  type FaqItem,
  type JsonLdObject,
} from '@/lib/structured-data';

// Tailwind child selectors so service bodies stay plain semantic HTML.
const PROSE =
  'mt-8 text-foreground [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground ' +
  '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-muted-foreground ' +
  '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-muted-foreground ' +
  '[&_a]:font-medium [&_a]:text-accent hover:[&_a]:underline ' +
  '[&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:py-2 [&_th]:pr-4 ' +
  '[&_td]:py-2 [&_td]:pr-4 [&_td]:border-t [&_td]:border-border [&_td]:text-muted-foreground';

export interface ServiceLayoutProps {
  title: string;
  metaTitle?: string;
  description: string;
  path: string;
  serviceType: string;
  intro: string;
  faq?: FaqItem[];
  children: ReactNode;
}

export function ServiceLayout(props: ServiceLayoutProps) {
  const { title, metaTitle, description, path, serviceType, intro, faq } = props;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: title, path },
  ];
  const schema: JsonLdObject[] = [
    buildServiceSchema({ name: title, description, path, serviceType }),
    buildBreadcrumbSchema(crumbs),
  ];
  if (faq && faq.length > 0) schema.push(buildFaqSchema(faq));

  return (
    <SiteLayout>
      <Helmet>
        <title>{metaTitle ?? `${title} | Strike Arms Airsoft Dublin`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>
      <JsonLd data={schema} />

      <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
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

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
        <p className="mt-5 text-lg text-foreground leading-relaxed">{intro}</p>

        <div className={PROSE}>{props.children}</div>

        {faq && faq.length > 0 && <FaqSection items={faq} />}
        <QuoteBlock />
      </div>
    </SiteLayout>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
      <dl className="mt-4 space-y-6">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-1 text-muted-foreground leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function QuoteBlock() {
  return (
    <section className="mt-12 rounded-sm border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">How we quote</h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        We diagnose the gun before we price the job. Guessing a figure from a description usually
        means quoting for the wrong fault — the thing a customer is sure is a broken gearbox is
        very often a battery, a connector or a fuse.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5">
        <li>Bring the gun in, or talk to us first if you are not sure it is worth the trip.</li>
        <li>We diagnose, then tell you what it needs and what it will cost.</li>
        <li>Nothing gets done until you say so. If it is not worth repairing, we will say that too.</li>
      </ul>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <Button asChild>
          <Link href="/contact">
            Get in touch
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}>
            <Phone className="mr-2 h-4 w-4" />
            {BUSINESS.telephone}
          </a>
        </Button>
      </div>
    </section>
  );
}
