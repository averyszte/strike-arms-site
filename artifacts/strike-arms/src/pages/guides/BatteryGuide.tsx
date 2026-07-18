import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'LiPo or NiMH for a beginner?',
    answer:
      'Either works. NiMH is more forgiving and harder to damage, which makes it a safe first battery. LiPo is lighter and gives a snappier trigger, but must be charged on a balance charger, stored part-charged and never run flat. If you are confident you will follow LiPo care, it is the better performer.',
  },
  {
    question: 'What voltage battery should I use?',
    answer:
      'Most AEGs run happily on 7.4v (2S) or 11.1v (3S) LiPo. Higher voltage gives a faster rate of fire and crisper trigger response but puts more stress on the gearbox, so on a stock gun without a MOSFET, 7.4v is the safer default.',
  },
  {
    question: 'Why will my battery not fit?',
    answer:
      'Batteries have to physically fit the space in your gun, whether that is the stock tube, the handguard or a PEQ box. Check the dimensions and connector type before buying, or bring the gun in and we will match a battery that fits.',
  },
  {
    question: 'How should I store a LiPo?',
    answer:
      'Store LiPos at roughly half charge (around 3.8v per cell), in a LiPo-safe bag, away from heat. Do not leave them fully charged or fully flat for long periods, and never charge them unattended.',
  },
];

export default function BatteryGuide() {
  return (
    <ArticleLayout
      title="Airsoft Battery Guide: LiPo vs NiMH, Voltage and Care"
      metaTitle="Airsoft Battery Guide — LiPo vs NiMH & Voltage | Strike Arms"
      description="LiPo vs NiMH airsoft batteries explained: voltage, capacity, C-rating, connectors, fit, and how to charge and store a LiPo safely."
      path="/guides/airsoft-battery-lipo-guide"
      updatedISO="2026-07-18"
      updatedLabel="July 2026"
      intro="The battery is easy to overlook, but the wrong one will not fit, will underperform, or in the case of a mishandled LiPo can be a genuine hazard. Here is what to know before you buy and how to look after it."
      cta={{ label: 'Shop batteries', href: '/store/consumables/batteries' }}
      faq={FAQ}
    >
      <h2>LiPo vs NiMH</h2>
      <h3>LiPo (Lithium Polymer)</h3>
      <p>
        <Link href="/glossary#lipo">LiPo</Link> batteries are light, compact and high-output, which
        makes them the common choice for <Link href="/glossary#aeg">AEGs</Link>. The trade-off is
        care: they need a balance charger, must be stored part-charged, and must never be run
        completely flat or charged unattended.
      </p>
      <h3>NiMH (Nickel-Metal Hydride)</h3>
      <p>
        <Link href="/glossary#nimh">NiMH</Link> batteries are heavier and lower-output but far more
        forgiving, which makes them a safe first battery for anyone not yet confident with LiPo care.
      </p>

      <h2>Voltage, capacity and C-rating</h2>
      <p>
        <strong>Voltage</strong> drives speed: 7.4v (2S) is the safe stock default, while 11.1v (3S)
        gives a faster rate of fire and snappier trigger at the cost of more stress on the gearbox.
        On a stock gun without a <Link href="/store/parts/mosfets">MOSFET</Link>, stick to 7.4v.
      </p>
      <p>
        <strong>Capacity</strong> (mAh) is roughly how long the battery lasts between charges, and
        <strong> C-rating</strong> is how hard it can discharge. A mid-capacity battery with an
        adequate C-rating covers most skirmish use; you do not need the biggest number on the shelf.
      </p>

      <h2>Connectors and fit</h2>
      <p>
        Guns ship with either small Tamiya or Deans (T-plug) connectors. Deans handle current better
        and are a common upgrade, but the battery connector must match the gun (or be adapted). Just
        as important, the battery has to physically fit the space — stock tube, handguard or PEQ box —
        so always check the dimensions.
      </p>

      <h2>Charging and storage safety</h2>
      <ul>
        <li>Charge LiPos on a balance charger at a sensible rate, and never leave them charging unattended.</li>
        <li>Store at roughly half charge (around 3.8v per cell) in a LiPo-safe bag.</li>
        <li>Stop using a LiPo if it feels puffy or damaged.</li>
        <li>Do not run a battery completely flat; it damages the cells.</li>
      </ul>
      <p>
        Not sure what fits your gun or how to charge it safely? Bring it in and we will set you up
        with the right battery, connector and charger.
      </p>
    </ArticleLayout>
  );
}
