import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { MapPin, Wrench, MessageSquare, ArrowRight } from 'lucide-react';

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
import { buildBreadcrumbSchema, buildLocalBusinessSchema } from '@/lib/structured-data';

const TITLE = 'About Strike Arms | Airsoft Shop in Swords, Co. Dublin';
const DESCRIPTION =
  'Strike Arms is a walk-in airsoft shop and repair workshop in Swords, Co. Dublin. What we do differently from ordering online, and why in-person advice catches what a product page cannot.';

type Pillar = { icon: typeof MapPin; heading: string; body: string };

const PILLARS: Pillar[] = [
  {
    icon: MapPin,
    heading: 'A shop you can walk into',
    body: 'You can handle the gun, check its size and controls, and find out whether it actually suits you before you spend anything. Weight, balance and where the controls sit matter more over a full game day than any spec on a product page.',
  },
  {
    icon: Wrench,
    heading: 'A workshop behind the counter',
    body: 'Repairs, upgrades, rebuilds and tuning happen here rather than being posted somewhere. If something goes wrong with a gun we sold you, the people who fix it are the people who sold it.',
  },
  {
    icon: MessageSquare,
    heading: 'Advice that sometimes costs us the sale',
    body: 'We would rather tell you the cheaper option is the better one, or that an upgrade will not fix your problem, than sell you something you come back annoyed about. Most of what we talk customers out of is money they were about to waste.',
  },
];

export default function About() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/about`} />
      </Helmet>
      <JsonLd data={[buildLocalBusinessSchema(), buildBreadcrumbSchema(crumbs)]} />

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
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">About Strike Arms</h1>
        <p className="mt-5 text-lg text-foreground leading-relaxed">
          We are an airsoft shop and repair workshop in {BUSINESS.addressLocality}, Co. Dublin,
          serving players across Ireland. The short version of what we are for: most of the airsoft
          advice available to an Irish player is written for somewhere else, and most of the cheapest
          options turn out to cost the most.
        </p>

        <div className="mt-10 space-y-8">
          {PILLARS.map((pillar) => (
            <section key={pillar.heading}>
              <div className="flex items-center gap-3">
                <pillar.icon className="h-5 w-5 shrink-0 text-accent" />
                <h2 className="text-xl font-bold text-foreground">{pillar.heading}</h2>
              </div>
              <p className="mt-3 text-muted-foreground leading-relaxed">{pillar.body}</p>
            </section>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-foreground">
          What in-person catches that a product page cannot
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          These are the things we correct across the counter most weeks, and none of them are
          visible when you are buying from a photo:
        </p>
        <ul className="mt-4 list-disc pl-5 space-y-2 text-muted-foreground">
          <li>A gun that is the wrong size or weight for the person holding it.</li>
          <li>Awkward controls for how they actually shoot.</li>
          <li>The wrong battery shape or connector for the gun.</li>
          <li>Magazines that will not fit the platform they bought.</li>
          <li>Eye protection that is not suitable for a site.</li>
          <li>Unrealistic expectations about range and power.</li>
        </ul>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          A cheap online price stops being cheap when the wrong spec arrives, the accessories do not
          fit, or a return has to ship abroad. That is the honest case for buying locally — not that
          we are always cheaper, but that the total cost of getting it wrong is carried by you.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-foreground">Where to start</h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          If you are new, the{' '}
          <Link href="/guides/beginners-guide" className="font-medium text-accent hover:underline">
            beginner's guide
          </Link>{' '}
          covers the budget and kit picture, and{' '}
          <Link href="/guides/first-airsoft-gun" className="font-medium text-accent hover:underline">
            choosing a first gun
          </Link>{' '}
          walks through the decision. If you already play and something is not working right, that is
          what the{' '}
          <Link href="/services" className="font-medium text-accent hover:underline">
            workshop
          </Link>{' '}
          is for.
        </p>

        <div className="mt-12 rounded-sm border border-border bg-card p-6">
          <p className="font-semibold text-foreground">Come in and ask</p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Tell us where you play, what you want to spend and what matters most to you. Ten minutes
            across the counter saves a lot of guesswork — and we will tell you honestly when the
            cheaper option is the better one.
          </p>
          <Button asChild className="mt-4">
            <Link href="/contact">
              Find us and get in touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
