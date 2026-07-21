import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'What is the difference between FPS and joules?',
    answer:
      'FPS (feet per second) measures how fast a BB travels, but that speed changes with the BB weight you test on. Joules measure the actual energy the gun produces, which does not change with BB weight, so joules are a fairer way to compare guns and to set safe limits.',
  },
  {
    question: 'What FPS limit do airsoft sites use?',
    answer:
      'Limits are set by each site, usually as a joule limit or as an FPS figure on a stated BB weight. Whether a site gives different limits to different gun roles also varies — do not assume the tiered AEG/DMR/sniper structure used in some other countries applies where you are playing. Check the current rules of the specific site and let them chrono your gun.',
  },
  {
    question: 'What is joule creep?',
    answer:
      'Joule creep is when a gun with high air volume produces more energy with a heavier BB than a chrono reading on a light BB suggests. It matters most on DMR and sniper setups, where a gun can pass on a light BB but exceed the limit on a heavy one.',
  },
  {
    question: 'Does higher FPS mean better range and accuracy?',
    answer:
      'No — this is the most common misconception in airsoft. Hop-up performance, air-seal consistency, BB quality, build quality and reliability all matter far more than an advertised FPS figure, particularly where site power limits apply.',
  },
  {
    question: 'How should I approach raising my gun’s FPS?',
    answer:
      'Establish the site’s energy limit first and measure the gun consistently. Correct the air seal, hop-up and BB choice before touching power. Only change the spring when a measured adjustment is genuinely needed, then chrono again to the site’s method. Chasing FPS without improving consistency adds stress without usable range.',
  },
];

export default function FpsAndJoules() {
  return (
    <ArticleLayout
      title="Airsoft FPS and Joules Explained"
      metaTitle="Airsoft FPS and Joules Explained | Strike Arms"
      description="What FPS and joules mean in airsoft, why joules are the fairer measure of power, how to read a chrono, and what joule creep is."
      path="/guides/fps-and-joules-explained"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="Airsoft power gets talked about in FPS, but sites often set limits in joules. Here is what each one actually measures, why the difference matters, and how it affects staying within a site's limit."
      cta={{ label: 'Shop chronographs', href: '/store/more/chronographs' }}
      faq={FAQ}
    >
      <h2>FPS: how fast the BB travels</h2>
      <p>
        <Link href="/glossary#fps">FPS</Link> (feet per second) is the speed a BB leaves the barrel.
        The catch is that speed depends on the weight of the BB you measure with: the same gun reads
        a higher FPS on a light <Link href="/glossary#bb">0.20g BB</Link> than on a heavier 0.32g
        one. So an FPS figure only means something when you also know the BB weight it was taken on.
      </p>

      <h2>Joules: how much energy the gun produces</h2>
      <p>
        A <Link href="/glossary#joule">joule</Link> measures the muzzle energy of the shot. Because
        energy is weight-independent, it stays roughly constant no matter which BB weight you test
        on, which makes it a fairer way to compare guns and to set a safe power limit. That is why
        many sites express their limits in joules rather than raw FPS.
      </p>
      <p>
        The relationship is energy = ½ × mass × velocity². The practical consequence is what
        matters: put a heavier BB through the same gun and the FPS reading drops, but the energy
        stays in much the same place. Two very different FPS numbers can describe one unchanged
        gun.
      </p>
      <p>
        This is why an FPS figure quoted without its BB weight tells you almost nothing, and why a
        limit expressed in joules is the one worth paying attention to.
      </p>

      <h2>The chrono</h2>
      <p>
        A <Link href="/glossary#chronograph">chronograph</Link> measures your gun's velocity so it
        can be checked against a limit. Sites chrono guns before play; some read FPS on a set BB
        weight, others read joules directly. Owning a chrono lets you check your own gun at home
        before a game so you are never turned away at the safety brief.
      </p>

      <h2>Joule creep, briefly</h2>
      <p>
        <Link href="/glossary#joule-creep">Joule creep</Link> is when a high-volume setup (often a{' '}
        <Link href="/glossary#dmr">DMR</Link> or sniper) makes more energy on a heavy BB than a
        light-BB chrono reading suggests. A gun can pass on a 0.20g BB and still exceed the limit on
        the heavier BB you actually play with, so tune and test on the weight you intend to use.
      </p>

      <h2>The FPS myth</h2>
      <p>
        The single most common belief we have to correct is that a{' '}
        <strong>higher advertised FPS automatically means better range, accuracy or quality</strong>.
        It does not. In practice{' '}
        <Link href="/glossary#hop-up">hop-up</Link> performance, air-seal consistency, BB quality,
        build quality and reliability matter far more — especially where power is limited anyway.
      </p>
      <p>
        The same thinking shows up in barrels. A well-made 6.03–6.05mm tightbore is a sensible
        general range, but <Link href="/glossary#tightbore-barrel">bore size alone does not create
        accuracy</Link>. Straightness, finish, cleanliness, a stable air seal, the bucking and nub,
        correct hop-up and good BBs all usually matter more than shaving another hundredth off the
        bore.
      </p>

      <h2>If you do want more power, do it in this order</h2>
      <ol>
        <li>Establish the site's energy limit, and measure the gun consistently.</li>
        <li>Correct the air seal.</li>
        <li>Set the hop-up properly.</li>
        <li>Settle on the <Link href="/guides/airsoft-bb-weight-guide">BB weight</Link> you will actually play with.</li>
        <li>Only then change the spring — and only if a measured adjustment is genuinely needed.</li>
        <li>Chrono again, to the site's stated method.</li>
      </ol>
      <p>
        Chasing FPS without improving consistency adds stress to the gun without adding usable range.
        Most guns that feel weak are not underpowered; they are inconsistent.
      </p>

      <h2>Know your site's limit</h2>
      <p>
        Power limits are set by each site and they can change. Always check the current rules of the
        specific site you are playing, chrono to their stated method and BB weight, and let their
        marshals check the gun.
      </p>
      <p>
        One trap worth naming: <strong>do not carry figures over from another country</strong>. The
        tiered structure some places use — a higher allowance for a DMR or a bolt-action than for an
        AEG — is not universal, and a gun set up to be legal at a site abroad can be over the limit,
        or outright unusable, at one here. If you are importing a gun or buying from overseas, treat
        its factory power setting as something to verify rather than trust.
      </p>
      <p>
        If you need a gun brought within a limit, our{' '}
        <Link href="/services/upgrades">in-house workshop</Link> can help.
      </p>
    </ArticleLayout>
  );
}
