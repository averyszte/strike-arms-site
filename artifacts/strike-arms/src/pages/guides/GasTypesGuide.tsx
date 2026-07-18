import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'Green gas or CO2 for my first gas pistol?',
    answer:
      'Green gas is the easier, more gun-friendly starting point and suits most pistols. CO2 hits harder and copes better with cold, but runs at higher pressure and can stress seals in guns not built for it, so only use CO2 in a gun or magazine designed for it.',
  },
  {
    question: 'Do gas guns work in cold weather?',
    answer:
      'Green gas loses pressure as temperature drops, so a gas gun loses power and can run sluggishly on a cold Irish day. CO2 handles the cold better. Many players run an AEG as their primary in winter and keep a gas pistol as a sidearm.',
  },
  {
    question: 'Is green gas safe to use indoors?',
    answer:
      'Green gas is used indoors at CQB sites routinely, but follow the site rules and use it in a ventilated space. Store and transport gas cans sensibly, away from heat.',
  },
  {
    question: 'What is HPA?',
    answer:
      'HPA (High Pressure Air) runs the gun from a regulated compressed-air tank instead of green gas or CO2. It gives very consistent, tunable performance but needs a tank, line and an engine fitted to the gun, so it is a bigger commitment favoured by some competitive players.',
  },
];

export default function GasTypesGuide() {
  return (
    <ArticleLayout
      title="Airsoft Gas Types Explained: Green Gas vs CO2 vs HPA"
      metaTitle="Green Gas vs CO2 vs HPA — Airsoft Gas Explained | Strike Arms"
      description="Green gas, CO2 and HPA compared: how each propellant works, how they behave in cold weather, and which to choose for your airsoft gun."
      path="/guides/airsoft-gas-types"
      updatedISO="2026-07-18"
      updatedLabel="July 2026"
      intro="Gas guns run on more than one kind of propellant, and they are not interchangeable. Here is what separates green gas, CO2 and HPA, how each performs in the Irish climate, and which suits your setup."
      cta={{ label: 'Shop gas & consumables', href: '/store/consumables/green-gas' }}
      faq={FAQ}
    >
      <h2>The three propellants</h2>

      <h3>Green gas</h3>
      <p>
        <Link href="/glossary#green-gas">Green gas</Link> is the most common airsoft propellant, a
        pressurised gas pre-mixed with silicone oil that lubricates seals as it works. It is
        convenient and gun-friendly, which makes it the default for most gas pistols. Its main
        weakness is cold: pressure drops as the temperature falls, so power drops with it.
      </p>

      <h3>CO2</h3>
      <p>
        <Link href="/glossary#co2">CO2</Link> comes in small capsules and runs at a higher pressure
        than green gas, so it hits harder and copes far better in the cold. The trade-off is that
        higher pressure can stress seals, so only run CO2 in a gun or magazine designed for it.
      </p>

      <h3>HPA</h3>
      <p>
        <Link href="/glossary#hpa">HPA</Link> (High Pressure Air) feeds the gun from a regulated
        compressed-air tank, giving highly consistent, tunable performance. It needs a tank, a line
        and an engine fitted to the gun, so it is a bigger step favoured by some competitive and
        speedsoft players rather than a first choice.
      </p>

      <h2>Cold weather in Ireland</h2>
      <p>
        This matters here more than in warmer climates. On a cold, damp Irish day a green-gas gun can
        noticeably lose power and cycle poorly, while CO2 and HPA stay more consistent. It is one of
        the main reasons many players keep an <Link href="/guides/aeg-vs-gbb-vs-spring">AEG</Link> as
        their primary and treat a gas pistol as a sidearm.
      </p>

      <h2>Which should you use?</h2>
      <p>
        For a first gas pistol, green gas is the easy, forgiving choice. Step up to CO2 if you want
        more power or play through the winter, and only consider HPA once you are chasing consistency
        for competitive play. Always match the propellant to what your gun and magazines are rated
        for — ask us if you are unsure.
      </p>
    </ArticleLayout>
  );
}
