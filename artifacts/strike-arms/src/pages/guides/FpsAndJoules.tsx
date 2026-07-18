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
      'Limits vary by site and by gun role (AEG, DMR, sniper) and are usually posted as an FPS figure on a stated BB weight, or as a joule limit. Always check the current rules of the specific site you are playing and let them chrono your gun. Do not assume a figure from another country applies.',
  },
  {
    question: 'What is joule creep?',
    answer:
      'Joule creep is when a gun with high air volume produces more energy with a heavier BB than a chrono reading on a light BB suggests. It matters most on DMR and sniper setups, where a gun can pass on a light BB but exceed the limit on a heavy one.',
  },
];

export default function FpsAndJoules() {
  return (
    <ArticleLayout
      title="Airsoft FPS and Joules Explained"
      metaTitle="Airsoft FPS and Joules Explained | Strike Arms"
      description="What FPS and joules mean in airsoft, why joules are the fairer measure of power, how to read a chrono, and what joule creep is."
      path="/guides/fps-and-joules-explained"
      updatedISO="2026-07-18"
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
        The relationship is energy = ½ × mass × velocity². As a worked example, a gun shooting a
        0.20g BB at 350 FPS (about 107 m/s) produces roughly 1.14 joules. Feed a heavier BB and the
        FPS drops, but the energy stays in the same ballpark.
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

      <h2>Know your site's limit</h2>
      <p>
        Power limits differ from site to site and by gun role, and they can change. Always check the
        current rules of the specific site you are playing, and let their marshals chrono your gun.
        If you need a gun brought within a limit, our{' '}
        <Link href="/services/upgrades">in-house workshop</Link> can help.
      </p>
    </ArticleLayout>
  );
}
