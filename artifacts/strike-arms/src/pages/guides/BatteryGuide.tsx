import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'LiPo or NiMH for a beginner?',
    answer:
      'A 7.4v LiPo with a proper balance charger is usually the best balance of performance and simplicity, where the gun suits it. NiMH is more forgiving but bulkier, with slower trigger response. Either way, shape, connector, space, wiring, fuse and any MOSFET all matter — the battery has to suit the gun, not just the spec sheet.',
  },
  {
    question: 'What is the most common battery mistake?',
    answer:
      'Treating a LiPo like a NiMH — using the wrong charger, running it flat, or charging it unattended. That can permanently damage the battery, swell it, damage wiring and electronics, and at worst cause a fire.',
  },
  {
    question: 'What voltage battery should I use?',
    answer:
      'A 7.4v (2S) LiPo is the sensible default for most stock AEGs. An 11.1v (3S) gives a faster rate of fire and snappier trigger, but it is not a default beginner battery unless the gun is actually built for it — it puts more stress on the gearbox and trigger contacts.',
  },
  {
    question: 'Why will my battery not fit?',
    answer:
      'Batteries have to physically fit the space in your gun, whether that is the stock tube, the handguard or a PEQ box. Check the dimensions and connector type before buying, or bring the gun in and we will match a battery that fits.',
  },
  {
    question: 'How should I store a LiPo?',
    answer:
      'Store LiPos at around 3.8v per cell, in a LiPo-safe bag, away from heat. Do not leave them fully charged or flat for long periods, and never charge them unattended. Over-discharging is what kills packs fastest.',
  },
  {
    question: 'How do I dispose of a damaged LiPo?',
    answer:
      'Through proper battery recycling, never in household rubbish. Stop using any pack that is swollen or damaged rather than trying to get one more game out of it.',
  },
];

export default function BatteryGuide() {
  return (
    <ArticleLayout
      title="Airsoft Battery Guide: LiPo vs NiMH, Voltage and Care"
      metaTitle="Airsoft Battery Guide — LiPo vs NiMH & Voltage | Strike Arms"
      description="LiPo vs NiMH airsoft batteries explained: voltage, capacity, C-rating, connectors, fit, and how to charge and store a LiPo safely."
      path="/guides/airsoft-battery-lipo-guide"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="The battery is easy to overlook, but the wrong one will not fit, will underperform, or in the case of a mishandled LiPo can be a genuine hazard. Here is what to know before you buy and how to look after it."
      cta={{ label: 'Shop batteries', href: '/store/consumables/batteries' }}
      faq={FAQ}
    >
      <h2>The mistake we see most</h2>
      <p>
        By some distance: <strong>treating a LiPo like a NiMH</strong>. Using the wrong charger,
        running the pack flat, or leaving it charging unattended. Any of those can permanently damage
        the battery, swell it, damage your wiring and electronics, and at worst cause a fire.
      </p>
      <p>
        LiPos are not dangerous so much as unforgiving. Handled correctly they are the better
        battery; handled like the NiMH someone used ten years ago, they fail fast.
      </p>

      <h2>LiPo vs NiMH</h2>
      <h3>LiPo (Lithium Polymer)</h3>
      <p>
        <Link href="/glossary#lipo">LiPo</Link> batteries are light, compact and high-output, which
        makes them the common choice for <Link href="/glossary#aeg">AEGs</Link>. A{' '}
        <strong>7.4v LiPo with a proper balance charger</strong> is usually the best balance of
        performance and simplicity, where the gun suits it.
      </p>
      <h3>NiMH (Nickel-Metal Hydride)</h3>
      <p>
        <Link href="/glossary#nimh">NiMH</Link> batteries are more forgiving, but bulkier and with
        slower trigger response. A reasonable choice if you would rather not think about charge
        discipline.
      </p>

      <h2>Voltage, capacity and C-rating</h2>
      <p>
        <strong>Voltage</strong> drives speed. 7.4v (2S) is the sensible stock default. An 11.1v (3S)
        gives a faster rate of fire and snappier trigger, but it is{' '}
        <strong>not a default beginner battery unless the gun is built for it</strong> — it loads the
        gearbox and the trigger contacts harder.
      </p>
      <p>
        <strong>Capacity</strong> (mAh) is roughly how long the battery lasts, and should be chosen by
        the space available and how long you play. <strong>C-rating</strong> only needs to supply the
        current the gun actually demands — a higher number does not automatically help, and is not a
        quality score.
      </p>

      <h2>Connectors, fit and everything else that matters</h2>
      <p>
        A battery is not just a voltage. Shape, connector, available space, wiring, the fuse and any{' '}
        <Link href="/store/parts/mosfets">MOSFET</Link> all bear on whether a given pack suits a given
        gun. The battery has to physically fit the stock tube, handguard or PEQ box, so always check
        dimensions before buying.
      </p>
      <p>
        On connectors: Deans-style give a firmer connection and lower resistance than small Tamiya,
        but converting is only worthwhile if it is <em>soldered properly</em> and you standardise both
        the gun and all your batteries. Half-converted collections cause more problems than they
        solve.
      </p>
      <p>
        A MOSFET earns its place when the setup draws more current, runs an 11.1v battery, needs
        electronic trigger functions, or would otherwise put heavy arcing and wear on mechanical
        contacts. It can protect your trigger contacts and add features — but fitting one does not
        automatically mean you should now run 11.1v.
      </p>

      <h2>Charging, storage and disposal</h2>
      <ul>
        <li>Use the correct balance charger, on a non-flammable surface, and stay present while it charges.</li>
        <li>Store at around <strong>3.8v per cell</strong> in a LiPo-safe bag — not full, not empty.</li>
        <li>Over-discharging kills packs fastest. Do not run one flat.</li>
        <li>Stop using any pack that is swollen or damaged.</li>
        <li>Protect the balance lead and avoid short circuits.</li>
        <li>Dispose of damaged lithium packs through proper battery recycling, never household rubbish.</li>
      </ul>
      <p>
        Not sure what fits your gun or how to charge it safely? Bring it in and we will match the
        right battery, connector and charger, and show you the charging routine on the actual pack.
      </p>
    </ArticleLayout>
  );
}
