import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'How often should I clean my airsoft gun?',
    answer:
      'Give the barrel a quick clean and a general wipe-down after each game day, especially in wet Irish conditions, and check the battery and magazines. A deeper service depends on how much you play, but a gun used regularly benefits from a proper look-over each season.',
  },
  {
    question: 'What lubricant should I use?',
    answer:
      'Use silicone oil on gas seals, hop rubbers and other rubber or plastic parts. Never use petroleum-based oils on rubber, as they degrade it. Gearbox internals need the correct grease, not oil, and only a light, correct amount.',
  },
  {
    question: 'Should I back the hop-up off when storing the gun?',
    answer:
      'Yes. Backing the hop-up off relieves pressure on the hop rubber during storage, which helps it last longer and stay consistent.',
  },
  {
    question: 'What maintenance should I leave to a technician?',
    answer:
      'Anything inside the gearbox — spring changes, shimming, gear or motor work — is best left to a tech unless you know what you are doing, because it is easy to cause damage. Barrel cleaning, external care and basic lubrication are fine to do yourself.',
  },
];

export default function MaintenanceGuide() {
  return (
    <ArticleLayout
      title="How to Maintain Your Airsoft Gun"
      metaTitle="How to Maintain Your Airsoft Gun | Strike Arms"
      description="Simple airsoft gun maintenance: barrel cleaning, the right lubricant, hop-up and battery care, gas gun upkeep, and what to leave to a technician."
      path="/guides/airsoft-maintenance"
      updatedISO="2026-07-18"
      updatedLabel="July 2026"
      intro="A little regular maintenance keeps an airsoft gun accurate and reliable and heads off expensive repairs, which matters all the more in the damp Irish climate. Here is what to do yourself and what to leave to a tech."
      cta={{ label: 'Book a repair or service', href: '/services/repairs' }}
      faq={FAQ}
    >
      <h2>After every game day</h2>
      <p>
        Wipe the gun down, unload your magazines, check the battery, and give the barrel a quick
        clean — especially after a wet game. A few minutes here prevents grit and moisture causing
        problems later.
      </p>

      <h2>Cleaning the barrel</h2>
      <p>
        Run a cleaning rod with a lightly-oiled cloth patch through the{' '}
        <Link href="/store/parts/barrels">inner barrel</Link> to clear dust, BB residue and moisture,
        then a dry patch to finish. A clean barrel feeds and shoots more consistently, and a build-up
        is a common cause of stray shots.
      </p>

      <h2>Lubrication done right</h2>
      <p>
        Use <strong>silicone oil</strong> on gas seals, hop rubbers and other rubber or plastic parts.
        Never use petroleum-based oils on rubber — they degrade it. The{' '}
        <Link href="/glossary#gearbox">gearbox</Link> needs the correct grease, not oil, and only a
        light, correct amount; over-lubricating attracts grit and does more harm than good.
      </p>

      <h2>Hop-up and battery care</h2>
      <ul>
        <li>Back the <Link href="/glossary#hop-up">hop-up</Link> off when storing to relieve the hop rubber.</li>
        <li>Store <Link href="/store/consumables/batteries">LiPo batteries</Link> at about half charge in a safe bag; see our <Link href="/guides/airsoft-battery-lipo-guide">battery guide</Link>.</li>
        <li>Do not dry-fire a spring or gas gun repeatedly; it stresses internals.</li>
      </ul>

      <h2>Gas gun care</h2>
      <p>
        For <Link href="/store/pistols/gbb-pistols">gas blowback</Link> guns, a drop of silicone oil
        on the seals keeps them supple, and storing magazines with a little gas in them helps the
        seals stay seated. Keep gas guns clean and dry between games.
      </p>

      <h2>What to leave to a technician</h2>
      <p>
        Barrel cleaning, external care and basic lubrication are fine to do at home. Anything inside
        the gearbox — spring changes, shimming, gear or motor work — is easy to get wrong and can
        cause real damage, so leave it to a tech. Our{' '}
        <Link href="/services/repairs">in-house workshop</Link> handles rebuilds, upgrades and
        diagnostics if your gun needs more than a clean.
      </p>
    </ArticleLayout>
  );
}
