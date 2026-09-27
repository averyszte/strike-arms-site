import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { GLOSSARY, groupGlossaryByLetter, type GlossaryTerm } from '@/lib/glossary';
import { SITE_URL } from '@/lib/site-config';
import {
  buildDefinedTermSetSchema,
  buildBreadcrumbSchema,
} from '@/lib/structured-data';
import { CARD_TITLE, PAGE_WIDTHS, TEXT_LINK } from '@/lib/storefront-styles';

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

      <PageHero
        crumbs={[{ label: 'Glossary' }]}
        eyebrow="Terms explained"
        title="Airsoft Glossary"
        intro={
          <p>
            The words, abbreviations and jargon you will hear around airsoft, explained plainly by
            the team at Strike Arms. New to the sport? Start here, then browse the shop with
            confidence.
          </p>
        }
        width="medium"
      >
        <LetterNav letters={groups.map((g) => g.letter)} />
      </PageHero>

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-28">
              <h2 className="border-b border-border/60 pb-2 text-2xl font-black uppercase text-accent md:text-3xl">
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
    <nav aria-label="Jump to letter" className="flex flex-wrap gap-1.5">
      {letters.map((letter) => (
        <a
          key={letter}
          href={`#letter-${letter}`}
          className="inline-flex h-9 w-9 items-center justify-center border border-border/60 text-sm font-black text-muted-foreground transition-colors hover:border-accent hover:text-accent"
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
      <dt className={`${CARD_TITLE} text-base`}>{term.term}</dt>
      <dd className="mt-1.5 text-muted-foreground leading-relaxed">{term.definition}</dd>
      {term.seeAlso && term.seeAlso.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {term.seeAlso.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={TEXT_LINK}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
