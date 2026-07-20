import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'Green gas or CO2 for my first gas pistol?',
    answer:
      'Green gas is easier and simpler for a beginner pistol. CO2 holds pressure better in the cold but runs at higher pressure. Only use CO2 in a gun and magazine designed for it — otherwise it accelerates wear or damages valves, seals, nozzles and slides.',
  },
  {
    question: 'Why is my gas magazine leaking?',
    answer:
      'The usual leak points are the fill valve, the output valve and the base or main magazine seal. Dried or damaged O-rings, dirt and loose valves are often cheap fixes. A cracked magazine body, damaged casting, corroded valve seat or an unavailable proprietary part can make a repair uneconomical.',
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
      updatedISO="2026-07-20"
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
        <Link href="/glossary#co2">CO2</Link> comes in small capsules and holds pressure far better in
        the cold, so it hits harder when green gas is fading. The trade-off is the higher pressure
        itself.
      </p>
      <p>
        <strong>Only run CO2 in a gun and magazine designed for it.</strong> In a gun that is not
        rated for it, the higher pressure accelerates wear or outright damages valves, seals, nozzles
        and slides. This is not a "it will probably be fine" situation — never exceed what the gun and
        magazine are rated for.
      </p>

      <h3>HPA</h3>
      <p>
        <Link href="/glossary#hpa">HPA</Link> (High Pressure Air) feeds the gun from a regulated
        compressed-air tank, giving highly consistent, tunable performance. It suits experienced
        players willing to manage a tank, a line, a regulator, tuning, and site acceptance — some
        venues have their own rules about it. Not a starting point.
      </p>

      <h2>Cold weather in Ireland</h2>
      <p>
        This matters here more than in warmer climates. On a cold, damp Irish day a green-gas gun can
        noticeably lose power and cycle poorly, while CO2 and HPA stay more consistent. It is one of
        the main reasons many players keep an <Link href="/guides/aeg-vs-gbb-vs-spring">AEG</Link> as
        their primary and treat a gas pistol as a sidearm.
      </p>

      <h2>Gas leaks: where they come from</h2>
      <p>
        Leaks are the most common gas-gun complaint, and they nearly always come from one of three
        places: the <strong>fill valve</strong>, the <strong>output valve</strong>, or the{' '}
        <strong>base or main magazine seal</strong>.
      </p>
      <p>
        The good news is that the usual causes — dried or damaged O-rings, dirt, and loose valves —
        are often cheap fixes. What makes a magazine uneconomical to repair is structural: a cracked
        body, a damaged casting, a corroded valve seat, or a proprietary part that is no longer
        available. That last one is worth thinking about before buying into an obscure platform.
      </p>
      <p>
        Keeping seals healthy is mostly about the right lubricant: silicone-safe oil or grease on gas
        seals and O-rings, and keep oil out of the inner barrel and hop rubber. Our{' '}
        <Link href="/guides/airsoft-maintenance">maintenance guide</Link> covers the routine, and our{' '}
        <Link href="/services/repairs">workshop</Link> can diagnose a leak if you would rather not
        strip a magazine yourself.
      </p>

      <h2>Which should you use?</h2>
      <p>
        For a first gas pistol, green gas is the easier and simpler choice. Use CO2 where the gun and
        magazine are built for it and you want cold-weather consistency. Consider HPA only once you
        are experienced enough to want that level of tuning control.
      </p>
      <p>
        For a beginner's <em>primary</em> in Ireland, though, an{' '}
        <Link href="/guides/aeg-vs-gbb-vs-spring">AEG</Link> is normally the safer call — more
        consistent in the cold, less maintenance, cheaper to run. Gas makes most sense as a sidearm,
        or for an experienced player who values the recoil and realism enough to accept the
        reduced cold-weather efficiency.
      </p>
    </ArticleLayout>
  );
}
