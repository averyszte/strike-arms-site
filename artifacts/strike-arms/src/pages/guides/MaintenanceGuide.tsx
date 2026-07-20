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
      'Silicone-safe oil or grease on gas seals and O-rings, a small amount of suitable gear grease on gears and contact surfaces, and cylinder lubricant only where it is actually needed. Keep oil out of the inner barrel and away from the hop rubber. Never let petroleum-based lubricant contact rubber, as it degrades it.',
  },
  {
    question: 'Should I back the hop-up off when storing the gun?',
    answer:
      'Yes. Backing the hop-up off relieves pressure on the hop rubber during storage, which helps it last longer and stay consistent.',
  },
  {
    question: 'What maintenance should I leave to a technician?',
    answer:
      'Anything inside the gearbox — spring changes, shimming, gear or motor work — is best left to a tech unless you know what you are doing, because it is easy to cause damage. Barrel cleaning, external care and basic lubrication are fine to do yourself. Do not lubricate the hop rubber or alter shimming unless you know exactly what you are doing.',
  },
  {
    question: 'How often should an airsoft gun be serviced?',
    answer:
      'For a gun used around twice a month, an inspection or service every 6 to 12 months is sensible — or sooner if symptoms appear.',
  },
  {
    question: 'My AEG has stopped firing. What should I check first?',
    answer:
      'In order: confirm it is safe and unloaded, test the battery voltage and try a known-good battery, inspect the connector and wiring, check the fuse, then check the motor connections and any MOSFET fault. Only after that is it worth investigating the motor and gearbox. Battery, connector and fuse faults are far more common than a destroyed gearbox.',
  },
  {
    question: 'What are the warning signs a gearbox is about to fail?',
    answer:
      'New grinding, screeching or clicking; a sudden drop or fluctuation in rate of fire; excessive motor or grip heat; intermittent firing; an electrical smell; repeated lock-ups; double-firing; worsening misfeeds. Stop using the gun when the sound changes sharply — continuing can turn a small fault into a full rebuild.',
  },
];

export default function MaintenanceGuide() {
  return (
    <ArticleLayout
      title="How to Maintain Your Airsoft Gun"
      metaTitle="How to Maintain Your Airsoft Gun | Strike Arms"
      description="Simple airsoft gun maintenance: barrel cleaning, the right lubricant, hop-up and battery care, gas gun upkeep, and what to leave to a technician."
      path="/guides/airsoft-maintenance"
      updatedISO="2026-07-20"
      updatedLabel="July 2026"
      intro="A little regular maintenance keeps an airsoft gun accurate and reliable and heads off expensive repairs, which matters all the more in the damp Irish climate. Here is what to do yourself and what to leave to a tech."
      cta={{ label: 'Book a repair or service', href: '/services/repairs' }}
      faq={FAQ}
    >
      <h2>After every game day</h2>
      <p>
        Remove the battery and magazine, clear the chamber safely, wipe the exterior, dry off any
        moisture, and clean the inner barrel with a dry non-abrasive patch. Store the gun dry and
        ventilated. A few minutes here prevents grit and moisture causing problems later.
      </p>
      <p>
        After a wet game this matters more, not less. Cold reduces battery performance and gas
        pressure, damp on metal and electrical connections encourages corrosion, and moisture and
        dirt affect hop-up consistency. Dry and ventilate the gun <em>and the bag</em>, wipe exposed
        metal, and inspect the connectors. Do not store it sealed while wet, and do not flood it with
        lubricant as a substitute for drying it properly — wet kit left in a closed bag causes more
        damage than anything that happens during the game.
      </p>

      <h2>How often to service</h2>
      <p>
        For a gun used around twice a month, an inspection or service every{' '}
        <strong>6 to 12 months</strong> is sensible — or sooner if symptoms appear.
      </p>

      <h2>Cleaning the barrel</h2>
      <p>
        Run a cleaning rod with a lightly-oiled cloth patch through the{' '}
        <Link href="/store/parts/barrels">inner barrel</Link> to clear dust, BB residue and moisture,
        then a dry patch to finish. A clean barrel feeds and shoots more consistently, and a build-up
        is a common cause of stray shots.
      </p>

      <h2>Lubrication done right</h2>
      <p>Match the lubricant to the area:</p>
      <ul>
        <li><strong>Gas seals and O-rings</strong> — silicone-safe oil or grease.</li>
        <li>
          <strong>Gears and contact surfaces</strong> — a small amount of suitable gear grease. The{' '}
          <Link href="/glossary#gearbox">gearbox</Link> needs grease, not oil.
        </li>
        <li><strong>Cylinder</strong> — appropriate cylinder lubricant, only where it is needed.</li>
      </ul>
      <p>
        <strong>Keep oil out of the inner barrel and away from the hop rubber.</strong> The two most
        common lubrication mistakes are spraying silicone over everything and letting petroleum-based
        lubricant touch rubber. Both contaminate the hop-up, attract grit and damage seals — and a
        contaminated hop is a far more annoying problem to chase than the dryness someone was trying
        to prevent.
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

      <h2>If the gun stops firing</h2>
      <p>
        Work through it in this order before assuming the worst. Battery, connector and fuse faults
        are <em>far</em> more common than a destroyed gearbox.
      </p>
      <ol>
        <li>Confirm the gun is safe and unloaded.</li>
        <li>Test the battery voltage, and try a known-good battery.</li>
        <li>Inspect the connector and wiring.</li>
        <li>Check the fuse.</li>
        <li>Check the motor connections and any <Link href="/glossary#mosfet">MOSFET</Link> fault.</li>
        <li>Only then investigate the motor and gearbox.</li>
      </ol>

      <h2>Warning signs to stop and get it looked at</h2>
      <p>
        A gearbox rarely fails without notice. Stop using the gun if you notice:
      </p>
      <ul>
        <li>New grinding, screeching or clicking.</li>
        <li>A sudden drop or fluctuation in rate of fire.</li>
        <li>Excessive motor or grip heat.</li>
        <li>Intermittent firing, repeated lock-ups or double-firing.</li>
        <li>An electrical smell.</li>
        <li>Worsening misfeeds.</li>
      </ul>
      <p>
        When the sound changes sharply, stop. Continuing is what turns a small fault into a full
        rebuild — most of the expensive jobs on the bench started as a noise someone played through.
      </p>

      <h2>What to leave to a technician</h2>
      <p>
        Barrel cleaning, external care and basic lubrication are fine to do at home. Anything inside
        the gearbox — spring changes, shimming, gear or motor work — is easy to get wrong and can
        cause real damage, so leave it to a tech. Do not open the gearbox, alter shimming, or
        lubricate the hop rubber unless you know exactly what you are doing.
      </p>
      <p>
        Our <Link href="/services/repairs">in-house workshop</Link> handles rebuilds, upgrades and
        diagnostics if your gun needs more than a clean.
      </p>
    </ArticleLayout>
  );
}
