import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'How much does it cost to start airsoft in Ireland?',
    answer:
      'Budget roughly €300 to €450 all in for a dependable entry-level AEG, a battery and charger, decent BBs and rated eye protection. Do not cut corners on eye protection or the charger, and avoid cheap BBs and batteries — they are a false economy that causes feeding problems and early failures.',
  },
  {
    question: 'Should I rent an airsoft gun before buying one?',
    answer:
      'Rent first if you are not sure you will enjoy it, have not handled different platforms, or do not yet know whether you prefer CQB or woodland. One or two rental days stop you buying the wrong length, weight, control layout or loadout.',
  },
  {
    question: 'Is an AEG or a gas gun better for a beginner?',
    answer:
      'For most beginners an AEG is the safest first primary. It is consistent, easy to run, economical and far less affected by cold than gas. Gas suits players who value realism and accept the extra maintenance and weather sensitivity. Spring is limited as a primary outside sniper and shotgun roles.',
  },
  {
    question: 'What kit do I need besides the gun?',
    answer:
      'Full-seal rated eye protection, lower-face or dental protection, supportive footwear with grip, the correct battery and charger, quality BBs, water, and a workable plan for carrying spare magazines. Check your site’s specific requirements before game day, as they vary.',
  },
  {
    question: 'What should I do to a new airsoft gun before its first game?',
    answer:
      'Charge and inspect the battery, confirm it feeds, clean the inner barrel with a dry rod, set the hop-up with the BB weight you will actually use, and chrono it if you can. Do not start by opening the gearbox or fitting upgrades.',
  },
];

export default function BeginnersGuide() {
  return (
    <ArticleLayout
      title="Airsoft for Beginners: A Complete Starter Guide"
      metaTitle="Airsoft for Beginners in Ireland: Starter Guide | Strike Arms"
      description="A beginner's guide to starting airsoft in Ireland: realistic budget, renting vs buying, choosing a first gun, the kit people forget, and what to do before your first game."
      path="/guides/beginners-guide"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="Starting airsoft is straightforward once you get the order of decisions right. Most beginners go wrong not by picking the wrong gun, but by spending nearly everything on it and arriving underprepared. Here is how to start well, based on what we see across the counter in Swords."
      cta={{ label: 'Talk to us before you buy', href: '/contact' }}
      faq={FAQ}
    >
      <h2>Start with three questions, not with a gun</h2>
      <p>
        Before looking at any replica, answer these. They narrow the choice far better than
        appearance does.
      </p>
      <ol>
        <li>
          <strong>Where will you play most?</strong> Indoor CQB, woodland, or both. This drives length,
          weight and how much you carry.
        </li>
        <li>
          <strong>What is your total budget</strong>, including safety gear and power — not just the gun.
        </li>
        <li>
          <strong>What matters most to you?</strong> Reliability, realism, weight, or upgrade
          potential. These pull in different directions.
        </li>
      </ol>

      <h2>What it realistically costs to start</h2>
      <p>
        Plan on roughly <strong>€300 to €450</strong> for a dependable entry-level{' '}
        <Link href="/store/rifles/aeg-rifles">AEG</Link>, a battery and charger, quality BBs and rated
        eye protection.
      </p>
      <p>
        Do not cut corners on <Link href="/store/gear/eye-protection">eye protection</Link> or the
        charger. Cheap <Link href="/store/consumables/bbs">BBs</Link> and{' '}
        <Link href="/store/consumables/batteries">batteries</Link> are false economies — they cause
        feeding problems, poor performance and early failure, and they cost more in the end than the
        good ones would have.
      </p>

      <h2>Rent first, or buy first?</h2>
      <p>
        Rent first if you are unsure you will enjoy it, have not handled different platforms, or do
        not yet know whether you prefer CQB or woodland. One or two rental days prevent buying the
        wrong length, weight, control layout or loadout — which is the expensive mistake, not the
        rental fee.
      </p>

      <h2>AEG, gas or spring for a first gun</h2>
      <p>
        For most beginners an <strong>AEG is the safest first primary</strong>: consistent, easy,
        economical, and less affected by cold. Gas suits players who value realism and accept the
        maintenance and weather sensitivity that comes with it. Spring is limited as a primary except
        in sniper and shotgun roles.
      </p>
      <p>
        A common myth is that gas or a sniper rifle is automatically more powerful or more effective.
        In practice reliability, hop-up setup and consistency matter far more. Our{' '}
        <Link href="/guides/aeg-vs-gbb-vs-spring">AEG vs GBB vs spring guide</Link> goes into the
        trade-offs in detail.
      </p>

      <h3>Why a sniper rifle is a poor first choice</h3>
      <p>
        A bolt-action sniper is a poor first primary for most players: low rate of fire, less
        forgiving of mistakes, often needing expensive tuning, and sometimes subject to
        minimum-engagement-distance rules. A beginner gets more effective range and far more playing
        time from a reliable AEG while learning movement, positioning and hop-up.
      </p>

      <h2>The kit people forget</h2>
      <p>Beyond the gun itself, you need:</p>
      <ul>
        <li>Full-seal <strong>rated eye protection</strong> — never a compromise, and mandatory everywhere.</li>
        <li>Lower-face or dental protection.</li>
        <li>Supportive footwear with real grip and ankle support.</li>
        <li>The correct battery and charger for your gun.</li>
        <li>Quality BBs, water, and gloves.</li>
        <li>A workable plan for carrying spare magazines — a simple belt or chest rig beats a plate carrier at the start.</li>
      </ul>
      <p>
        Weather layers matter too: a moisture-wicking base layer, a light mid-layer, and a breathable
        waterproof outer you can vent or remove. Avoid heavy cotton next to the skin — it stays wet
        and cold all day.
      </p>

      <h2>Batteries and BBs: the two cheap things people get wrong</h2>
      <p>
        The most common battery mistake is <strong>treating a LiPo like a NiMH</strong> — using the
        wrong charger, running it flat, or charging it unattended. That can permanently damage the
        battery, swell it, damage wiring and electronics, and at worst cause a fire.
      </p>
      <p>
        A <strong>7.4V LiPo with a proper balance charger</strong> is usually the best balance of
        performance and simplicity where the gun suits it. NiMH is more forgiving but bulkier with
        slower trigger response. An 11.1V LiPo is not a default beginner battery unless the gun is
        built for it. Shape, connector, space, wiring, fuse and any MOSFET all matter — see the{' '}
        <Link href="/guides/airsoft-battery-lipo-guide">battery guide</Link>.
      </p>
      <p>
        For BBs, good-quality <strong>0.25g</strong> is a sensible start for a stock AEG. Cheap,
        seamed or poorly-polished BBs misfeed, jam, and damage the hop-up. Too light and they drift
        and exaggerate inconsistency; too heavy for the hop and they may drop early or feed poorly.
        The <Link href="/guides/airsoft-bb-weight-guide">BB weight guide</Link> covers the full range.
      </p>

      <h2>Before your first game</h2>
      <p>Do these things with a new gun before it ever sees a game day:</p>
      <ol>
        <li>Charge and inspect the battery.</li>
        <li>Confirm the gun feeds reliably.</li>
        <li>Clean the inner barrel with a dry rod.</li>
        <li>Set the hop-up using the BB weight you will actually play with.</li>
        <li>Chrono it if you can.</li>
        <li>Check that your eye protection and footwear are genuinely comfortable.</li>
      </ol>
      <p>
        Do <em>not</em> start by opening the{' '}
        <Link href="/glossary#gearbox">gearbox</Link> or fitting upgrades. Also confirm your site’s
        booking, age, protection and power requirements directly with them beforehand — these vary
        from site to site.
      </p>

      <h2>The three most common first-month mistakes</h2>
      <ol>
        <li>
          <strong>Spending nearly the whole budget on the gun</strong> and neglecting eye protection
          and footwear.
        </li>
        <li>
          <strong>Poor-quality BBs or the wrong battery setup.</strong>
        </li>
        <li>
          <strong>Arriving unprepared</strong> — without charging, test-firing, chronoing or adjusting
          the hop-up.
        </li>
      </ol>
      <p>
        Preparation errors waste more game days than a lack of upgrades ever will.
      </p>

      <h2>What not to buy yet</h2>
      <p>
        Beginners commonly rush into internal performance parts, a stronger spring, an 11.1V battery,
        or an expensive optic before they understand the stock gun. Play several games, find a{' '}
        <em>real</em> limitation, then upgrade the part that addresses it.
      </p>
      <p>
        The same applies to gear. Plate carriers, helmets, radios, sidearms and excessive pouches are
        the classic over-buys. That money is better spent on eye protection, boots, anti-fog, quality
        BBs, a spare battery and a comfortable, simple rig.
      </p>

      <h2>Rules, sites and the law</h2>
      <p>
        Site rules — eye protection standards, age policies, power limits and how they chrono — vary
        by venue, so confirm them with the site directly before you book. On the legal side, our{' '}
        <Link href="/airsoft-law">airsoft and the law</Link> page points to the official Irish
        sources rather than giving you second-hand answers.
      </p>

      <h2>The single best piece of advice</h2>
      <p>
        Buy a reliable, common-platform AEG and spend the rest on rated eye protection, a proper
        charger, quality BBs and footwear. Do not chase maximum FPS, and do not replace working
        internals before the gun has shown you a real weakness.
      </p>
      <p>
        If you would rather work it out in person, call in. Handling a few guns, checking the size and
        controls, matching the right battery and testing the feed takes about ten minutes in the shop
        and saves a lot of guesswork — and if something does go wrong later, our{' '}
        <Link href="/services/repairs">in-house workshop</Link> is here rather than in another
        country.
      </p>
    </ArticleLayout>
  );
}
