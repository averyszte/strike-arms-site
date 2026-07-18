import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { GLOSSARY, groupGlossaryByLetter, type GlossaryTerm } from '@/lib/glossary';
import { SITE_URL } from '@/lib/site-config';
import {
  buildDefinedTermSetSchema,
  buildBreadcrumbSchema,
} from '@/lib/structured-data';

const TITLE = 'Airsoft Glossary — Terms & Abbreviations Explained | Strike Arms';
const DESCRIPTION =
  'Plain-English airsoft glossary from a Dublin airsoft shop: AEG, GBB, FPS, joules, hop-up, MOSFET and more, with links to the gear each term relates to.';

export default function Glossary() {
  const groups = groupGlossaryByLetter();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Glossary', path: '/glossary' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/glossary`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE_URL}/glossary`} />
      </Helmet>
      <JsonLd
        data={[
          buildDefinedTermSetSchema('Airsoft Glossary', '/glossary', GLOSSARY),
          buildBreadcrumbSchema(crumbs),
        ]}
      />

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Glossary</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">Airsoft Glossary</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
          The words, abbreviations and jargon you will hear around airsoft, explained plainly by the
          team at Strike Arms. New to the sport? Start here, then browse the shop with confidence.
        </p>

        <LetterNav letters={groups.map((g) => g.letter)} />

        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <section key={group.letter} id={`letter-${group.letter}`}>
              <h2 className="text-xl font-bold text-accent border-b border-border pb-2">
                {group.letter}
              </h2>
              <dl className="mt-4 space-y-6">
                {group.terms.map((term) => (
                  <GlossaryEntry key={term.slug} term={term} />
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

function LetterNav({ letters }: { letters: string[] }) {
  return (
    <nav aria-label="Jump to letter" className="mt-6 flex flex-wrap gap-1.5">
      {letters.map((letter) => (
        <a
          key={letter}
          href={`#letter-${letter}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          {letter}
        </a>
      ))}
    </nav>
  );
}

function GlossaryEntry({ term }: { term: GlossaryTerm }) {
  return (
    <div id={term.slug} className="scroll-mt-28">
      <dt className="text-base font-semibold text-foreground">{term.term}</dt>
      <dd className="mt-1 text-muted-foreground leading-relaxed">{term.definition}</dd>
      {term.seeAlso && term.seeAlso.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {term.seeAlso.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-accent hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
