import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'What should a CQB airsoft loadout include?',
    answer:
      'Keep it compact: a shorter primary, a low-profile rig or belt, fewer magazines, secure pouches, lower-profile face protection, and a sling that holds the gun tightly to the body. Avoid loose straps, oversized utility pouches and anything that catches on doorways.',
  },
  {
    question: 'How many magazines do I need for CQB?',
    answer:
      'Around three to six mid-caps depending on capacity, game length and whether you can reload between games. CQB engagements are short and reloads are frequent, so accessible placement matters more than raw count.',
  },
  {
    question: 'Is a plate carrier a good idea for indoor airsoft?',
    answer:
      'Usually not. A plate carrier only makes sense when you specifically want its fit, protection or load distribution. Indoors it mostly adds heat, bulk and weight without carrying anything extra you need. A low-profile chest rig or battle belt is the better default.',
  },
  {
    question: 'Single-point or two-point sling for CQB?',
    answer:
      'A single-point feels quick in CQB but the gun swings more freely. A two-point adjustable sling is still the best all-round choice because it supports the gun and tightens to the body. Poor adjustment, not sling type, is what causes the muzzle or stock to hit your knees and snag on gear.',
  },
  {
    question: 'Where should a dump pouch go?',
    answer:
      'Where your support hand reaches without looking, usually behind the hip on that side. Practise removing a magazine, dropping it straight in and seating the replacement. Keep it structured enough to find but closed during movement so magazines do not bounce out.',
  },
];

export default function LoadoutCqb() {
  return (
    <ArticleLayout
      title="CQB Airsoft Loadout: What to Carry Indoors"
      metaTitle="CQB Airsoft Loadout Guide | Strike Arms Ireland"
      description="How to build a CQB airsoft loadout: compact rig choice, magazine count and placement, slings, dump pouches, face protection, and the gear that only gets in the way indoors."
      path="/guides/loadout-cqb"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="Indoor CQB punishes bulk. Corners, doorways and tight rooms turn every loose strap and oversized pouch into a snag, and the players who move best are almost always the ones carrying least. Here is how to put a close-quarters loadout together."
      cta={{ label: 'Browse tactical gear', href: '/store/gear' }}
      faq={FAQ}
    >
      <h2>The governing principle: compact</h2>
      <p>
        A <Link href="/glossary#cqb">CQB</Link> loadout is built around a shorter primary, a
        low-profile rig or belt, fewer magazines, secure pouches, lower-profile face protection, and
        a sling that keeps the gun controlled and close. Everything else is a liability.
      </p>
      <p>
        Avoid loose straps, oversized utility pouches and anything that catches on a doorway. If a
        piece of kit does not earn its place in a corridor, leave it in the car.
      </p>

      <h2>Rig choice</h2>
      <p>
        A <Link href="/store/gear/battle-belts">battle belt</Link> suits a very light load and works
        well indoors. A low-profile{' '}
        <Link href="/store/gear/chest-rigs">chest rig</Link> is the other sensible option — light,
        ventilated, and it carries what you actually need.
      </p>
      <p>
        A <Link href="/store/gear/plate-carriers">plate carrier</Link> is only the right call when
        you specifically want its fit, protection or load distribution. Indoors it usually just adds
        heat, bulk and weight without carrying more of what matters. Plate carriers, helmets, radios,
        sidearms, optics and excessive pouches are the classic over-buys — that money goes further on
        eye protection, anti-fog, quality BBs and a spare battery.
      </p>

      <h2>Magazines: count and placement</h2>
      <p>
        Around <strong>three to six mid-caps</strong> covers most games, depending on capacity, game
        length and whether you can reload between rounds. Mid-caps are quieter and more consistent
        than hi-caps, which carry more but rattle and need winding — a real tell in a quiet building.
      </p>
      <p>
        Put primary <Link href="/store/rifles/rifle-magazines">magazines</Link> on your{' '}
        <strong>support-hand side</strong>, within natural reach, and mirror that if you are
        left-handed. Keep the front of the rig clear enough to crouch and go prone. See{' '}
        <Link href="/glossary#magazine-capacities">magazine capacities</Link> for the
        low-cap/mid-cap/hi-cap distinction.
      </p>

      <h2>Slings</h2>
      <p>
        A single-point feels fast indoors, but the gun swings freely — into doorframes, into your
        knees, into the wall as you slice a corner. A{' '}
        <Link href="/store/accessories/slings">two-point adjustable sling</Link> remains the best
        all-round choice: it supports the gun and tightens to the body when you need both hands.
      </p>
      <p>
        Most sling complaints are really adjustment complaints. Poor adjustment is what causes the
        muzzle or stock to hit your knees, snag your gear or drag when kneeling — not the sling type.
      </p>

      <h2>Dump pouches and reloads</h2>
      <p>
        Reloads happen more often and under more pressure indoors, so a{' '}
        <Link href="/store/gear/pouches">dump pouch</Link> earns its place. Put it where your support
        hand reaches without looking, usually behind the hip on that side.
      </p>
      <p>
        Practise the sequence: remove the magazine, drop it straight into the pouch, seat the
        replacement. Keep the pouch structured enough to find by feel, but closed while you move so
        magazines do not bounce out as you run.
      </p>

      <h2>Protection indoors</h2>
      <p>
        Engagement distances are short, so <Link href="/store/gear/eye-protection">full-seal rated
        eye protection</Link> and lower-face or dental protection matter more here than anywhere, not
        less. Keep face protection lower-profile so it does not interfere with the gun or your
        peripheral vision, but do not drop it — close hits are exactly what chip teeth.
      </p>
      <p>
        <Link href="/store/gear/gloves">Gloves</Link> are worth having for the same reason. Site
        rules on eye and face protection vary, so confirm what your venue requires before you book.
      </p>

      <h2>The first €150 of gear</h2>
      <p>In priority order, before anything tactical:</p>
      <ol>
        <li>Rated full-seal eye protection.</li>
        <li>Lower-face or dental protection.</li>
        <li>Supportive boots with grip.</li>
        <li>Gloves.</li>
        <li>Anti-fog and hydration.</li>
        <li>A simple way to carry magazines — a basic chest rig or belt, plus one or two spares.</li>
      </ol>
      <p>
        That list beats a helmet, radio, sidearm or heavy plate carrier every time at the start.
      </p>

      <h2>Small things experienced players carry</h2>
      <p>
        Anti-fog, a spare charged{' '}
        <Link href="/store/consumables/batteries">battery</Link>, a speedloader, a barrel-cleaning
        rod, water, a microfibre cloth, electrical tape, a small basic{' '}
        <Link href="/store/more/tools">tool</Link> and a secure dump pouch. None of it weighs much,
        and between them they solve most game-day problems.
      </p>

      <h2>Buying a rig online: fit</h2>
      <p>
        Measure your chest and waist <em>where the rig will actually sit</em>, check the maker's
        adjustment range, and allow for layers underneath. For a plate carrier, check torso length so
        it does not sit on your stomach or clash with your belt. The usual mistake is sizing from
        clothing labels instead of the product's real measurements — which is one more reason to try
        it on in the shop if you can.
      </p>
      <p>
        Playing outdoors too? The{' '}
        <Link href="/guides/loadout-woodland">woodland loadout guide</Link> covers what changes when
        the game gets longer and wetter.
      </p>
    </ArticleLayout>
  );
}
