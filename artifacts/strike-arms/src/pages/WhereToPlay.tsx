import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Info } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { SITE_URL } from '@/lib/site-config';
import {
  buildArticleSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  type FaqItem,
} from '@/lib/structured-data';
import { CARD_TITLE, CONTENT_TITLE, PAGE_WIDTHS, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

const TITLE = 'Where to Play Airsoft in Ireland | Strike Arms';
const DESCRIPTION =
  'How to find, choose and book your first airsoft game in Ireland: indoor CQB versus woodland, renting before you buy, what to confirm with a site, and what to bring.';
const UPDATED_ISO = '2026-07-20';
const UPDATED_LABEL = 'July 2026';

type Section = { id: string; heading: string; body: string };

const SITE_TYPES: Section[] = [
  {
    id: 'cqb',
    heading: 'Indoor CQB',
    body: 'Close-quarters sites run in buildings or purpose-built structures. Engagements are short, fast and constant, so you get a lot of contact in a day and very little walking. Good for a first taste of the sport, and easier on the weather. A shorter gun and a stripped-back loadout work best.',
  },
  {
    id: 'woodland',
    heading: 'Woodland and outdoor',
    body: 'Larger outdoor sites in woodland or mixed terrain. Longer engagement distances, more movement, more time spent patient and still. You will carry more ammunition, water and layers, and the Irish weather becomes part of the game. Boots and a sensible layering system matter here more than any piece of kit.',
  },
  {
    id: 'both',
    heading: 'Both, and everything between',
    body: 'Plenty of sites run mixed terrain, and plenty of players do both. If you genuinely do not know which you prefer, that is a good reason to rent before committing to a gun — the right length, weight and loadout for one is not the right answer for the other.',
  },
];

const CONFIRM_POINTS = [
  'Booking — whether it is a scheduled open day, a walk-on, or a private event, and whether you need to book ahead.',
  'Age requirements and any arrangements for younger players.',
  'Eye and face protection standards the site enforces.',
  'Power limits, how they chronograph, and on what BB weight.',
  'Whether rental kit is available, and what it includes.',
  'Whether biodegradable BBs are required.',
];

const FAQ: FaqItem[] = [
  {
    question: 'How do I find my first airsoft game in Ireland?',
    answer:
      'Pick a site within reasonable travelling distance, check whether it runs scheduled open days or walk-on games, and book ahead. Arrive early for the safety brief. If you are not sure which site suits you, ask us in the shop — we talk to players coming back from games every week.',
  },
  {
    question: 'Should I rent kit before buying my own?',
    answer:
      'Rent first if you are unsure you will enjoy it, have not handled different platforms, or do not yet know whether you prefer CQB or woodland. One or two rental days prevent buying the wrong length, weight, control layout or loadout.',
  },
  {
    question: 'What should I check with a site before I book?',
    answer:
      'Confirm the site’s booking process, age requirements, eye and face protection standards, and power limits including how and on what BB weight they chronograph. These vary from venue to venue, so check with the site directly rather than assuming.',
  },
  {
    question: 'What do I need to bring to my first airsoft game?',
    answer:
      'Rated full-seal eye protection, lower-face or dental protection, boots with grip and ankle support, weather layers, gloves, water, quality BBs and a charged spare battery. Confirm the site’s own requirements before you travel, as they differ.',
  },
];

export default function WhereToPlay() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Where to Play', path: '/where-to-play' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/where-to-play`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE_URL}/where-to-play`} />
      </Helmet>
      <JsonLd
        data={[
          buildArticleSchema({
            title: TITLE,
            description: DESCRIPTION,
            path: '/where-to-play',
            isoDate: UPDATED_ISO,
          }),
          buildFaqSchema(FAQ),
          buildBreadcrumbSchema(crumbs),
        ]}
      />

      <PageHero
        crumbs={[{ label: 'Where to Play' }]}
        eyebrow="Your first game"
        title="Where to Play Airsoft in Ireland"
        intro={
          <p>
            Getting to your first game is easier than most people expect. The harder part is picking
            the right kind of site to start at, and turning up prepared. Here is how to work both
            out.
          </p>
        }
        meta={`Last reviewed: ${UPDATED_LABEL}`}
        width="narrow"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <VenueListNote />

        <h2 className={`${CONTENT_TITLE} mt-14`}>The two kinds of game</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Before anything else, work out where you will play most: indoor CQB, woodland, or both. It
          drives your gun length, your loadout and how much you carry more than any other decision.
        </p>
        <div className="mt-6 grid gap-4">
          {SITE_TYPES.map((section) => (
            <section key={section.id} id={section.id} className={`${PANEL} scroll-mt-28 p-6`}>
              <h3 className={`${CARD_TITLE} text-lg`}>{section.heading}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <h2 className={`${CONTENT_TITLE} mt-14`}>Rent before you buy</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          If you are not yet sure you will enjoy it, or have never handled different platforms, rent
          for a day or two first. It is the cheapest way to avoid buying the wrong gun — and a
          rental day tells you more about what suits you than any amount of reading. Our{' '}
          <Link href="/guides/beginners-guide" className={TEXT_LINK}>
            beginner's guide
          </Link>{' '}
          covers what to do once you are ready to buy.
        </p>

        <h2 className={`${CONTENT_TITLE} mt-14`}>Confirm these with the site</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Rules genuinely differ from venue to venue, and they change. Check these directly with the
          site you are booking rather than relying on what someone told you about a different one:
        </p>
        <ul className="mt-4 list-disc pl-5 space-y-2 text-muted-foreground marker:text-accent">
          {CONFIRM_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        <h2 className={`${CONTENT_TITLE} mt-14`}>What to bring</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Rated full-seal{' '}
          <Link href="/store/gear/eye-protection" className={TEXT_LINK}>
            eye protection
          </Link>
          , lower-face or dental protection, boots with grip and ankle support, weather layers,
          gloves, water, quality{' '}
          <Link href="/store/consumables/bbs" className={TEXT_LINK}>
            BBs
          </Link>{' '}
          and a charged spare{' '}
          <Link href="/store/consumables/batteries" className={TEXT_LINK}>
            battery
          </Link>
          . Eye protection, age and face rules vary by site, so check yours directly.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          For how to pack it, see the{' '}
          <Link href="/guides/loadout-cqb" className={TEXT_LINK}>
            CQB
          </Link>{' '}
          and{' '}
          <Link href="/guides/loadout-woodland" className={TEXT_LINK}>
            woodland
          </Link>{' '}
          loadout guides.
        </p>

        <h2 className={`${CONTENT_TITLE} mt-14`}>Before you travel</h2>
        <ol className="mt-4 list-decimal pl-5 space-y-2 text-muted-foreground marker:font-black marker:text-accent">
          <li>Confirm the site's booking, age, protection and power rules.</li>
          <li>Charge and inspect the battery.</li>
          <li>Test that the gun feeds.</li>
          <li>Set the hop-up with the BBs you will actually use.</li>
          <li>Check your eye protection and footwear are comfortable.</li>
        </ol>
      </div>

      <CtaBand
        eyebrow="Walk-in shop in Swords"
        title="Ask us where to start"
        text="We are a walk-in shop in Swords, Co. Dublin, and we talk to players coming back from games every week. Tell us where you are travelling from and what you fancy trying, and we will point you at something that suits."
        cta={{ label: 'Get in touch', href: '/contact' }}
      />
    </SiteLayout>
  );
}

function VenueListNote() {
  return (
    <div className={`${PANEL} flex gap-3 border-l-2 border-l-accent p-5`}>
      <Info className="h-5 w-5 shrink-0 text-accent" />
      <p className="text-sm text-muted-foreground leading-relaxed">
        We are not listing individual sites here yet. Venues open, close and change their rules, and
        a stale directory is worse than none — so rather than publish a list we have not checked, we
        keep our recommendations current in the shop. Ask us and we will tell you what is running.
      </p>
    </div>
  );
}
