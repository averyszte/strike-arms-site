import { Link } from 'wouter';

import { ServiceLayout } from '@/components/service/ServiceLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'My AEG stopped firing mid-game. Is the gearbox gone?',
    answer:
      'Usually not. Battery, connector and fuse faults are far more common than a destroyed gearbox. We work through the electrical side first — battery voltage, a known-good battery, connector and wiring, fuse, motor connections and any MOSFET fault — before opening anything up.',
  },
  {
    question: 'How do I know when to stop using the gun and bring it in?',
    answer:
      'When the sound changes sharply. New grinding, screeching or clicking, a sudden drop or fluctuation in rate of fire, excessive motor or grip heat, an electrical smell, intermittent firing, double-firing or worsening misfeeds. Continuing to play through any of those can turn a small fault into a full rebuild.',
  },
  {
    question: 'Do you repair gas guns and magazines as well as AEGs?',
    answer:
      'Yes. Gas leaks usually come from the fill valve, the output valve, or the base or main magazine seal. Dried or damaged O-rings, dirt and loose valves are often cheap fixes. A cracked magazine body, damaged casting, corroded valve seat or an unavailable proprietary part can make a repair uneconomical, and we will tell you when that is the case.',
  },
  {
    question: 'What does a repair cost?',
    answer:
      'We diagnose the gun before quoting, because pricing a fault from a description usually means quoting for the wrong thing. Once we know what it actually needs, you get the cost before any work starts.',
  },
  {
    question: 'Can I fix it myself?',
    answer:
      'Barrel cleaning, external care and basic lubrication are fine to do at home. Anything inside the gearbox — spring changes, shimming, gear or motor work — is easy to get wrong and can cause real damage. Undoing a botched home repair is usually more expensive than the original fault.',
  },
];

export default function RepairsServicePage() {
  return (
    <ServiceLayout
      title="Airsoft Repairs"
      metaTitle="Airsoft Repairs Dublin | Strike Arms"
      description="In-house airsoft repairs in Swords, Co. Dublin. AEG, gas and spring gun diagnosis and repair — we find the actual fault before quoting. Serving players across Ireland."
      path="/services/repairs"
      serviceType="Airsoft gun repair"
      intro="Most guns that arrive on the bench as a dead gearbox are not a dead gearbox. Our job is to find the fault that is actually there rather than the one the symptoms suggest, and to tell you honestly when a repair is not worth paying for."
      faq={FAQ}
    >
      <h2>How we diagnose a dead gun</h2>
      <p>
        There is a right order to this, and it saves customers money. We work from the cheap and
        likely to the expensive and unlikely:
      </p>
      <ol>
        <li>Confirm the gun is safe and unloaded.</li>
        <li>Test the battery voltage, and try a known-good battery.</li>
        <li>Inspect the connector and wiring.</li>
        <li>Check the fuse.</li>
        <li>Check the motor connections and any <Link href="/glossary#mosfet">MOSFET</Link> fault.</li>
        <li>Only then investigate the motor and <Link href="/glossary#gearbox">gearbox</Link>.</li>
      </ol>
      <p>
        Battery, connector and fuse faults are <strong>far</strong> more common than catastrophic
        gearbox failure. A gun that died mid-game is more often a flat or unsuitable battery, a
        loose connector or a blown fuse than anything that needs stripping.
      </p>

      <h2>What customers think is wrong, versus what we find</h2>
      <p>
        The three most common actual causes are a flat or damaged battery, a connector, fuse or
        trigger fault, and a motor or gearbox jam. Customers frequently assume the gearbox is
        destroyed before any of the simpler checks have been done — which is exactly why we do not
        quote from a phone description.
      </p>

      <h2>Bring it in before it gets worse</h2>
      <p>A gearbox rarely fails without warning. Stop using the gun if you notice:</p>
      <ul>
        <li>New grinding, screeching or clicking.</li>
        <li>A sudden drop or fluctuation in rate of fire.</li>
        <li>Excessive motor or grip heat.</li>
        <li>Intermittent firing, repeated lock-ups or double-firing.</li>
        <li>An electrical smell.</li>
        <li>Worsening misfeeds.</li>
      </ul>
      <p>
        When the sound changes sharply, stop. Most of the expensive jobs on our bench started as a
        noise someone played through for another two games.
      </p>

      <h2>Gas guns and magazines</h2>
      <p>
        Gas leaks nearly always come from one of three places: the <strong>fill valve</strong>, the{' '}
        <strong>output valve</strong>, or the <strong>base or main magazine seal</strong>. Dried or
        damaged O-rings, dirt and loose valves are usually cheap to put right.
      </p>
      <p>
        What makes a magazine uneconomical is structural — a cracked body, a damaged casting, a
        corroded valve seat, or a proprietary part that is no longer available. We would rather tell
        you that up front than take your money for a repair that will not hold. The{' '}
        <Link href="/guides/airsoft-gas-types">gas types guide</Link> covers the maintenance side.
      </p>

      <h2>Irish weather does its own damage</h2>
      <p>
        Cold exposes weak batteries and reduces gas pressure. Damp corrodes steel parts and
        electrical connections. Low temperatures stiffen hop rubber. The single most damaging habit
        is putting wet kit into a closed bag and leaving it — that causes more harm than the game
        did. Our <Link href="/guides/airsoft-maintenance">maintenance guide</Link> covers the drill
        that prevents most of what we see.
      </p>

      <h2>What to do yourself, and what to leave alone</h2>
      <p>
        Barrel cleaning, external care and basic lubrication are fine at home. Do not open the
        gearbox, alter shimming, or lubricate the hop rubber unless you know exactly what you are
        doing — undoing a botched home job usually costs more than the original fault would have.
      </p>
      <p>
        For a gun used around twice a month, an inspection or service every{' '}
        <strong>6 to 12 months</strong> is sensible, or sooner if symptoms appear. If the problem is
        performance rather than failure, <Link href="/services/hop-up-tuning">hop-up tuning</Link> or{' '}
        <Link href="/services/upgrades">an upgrade</Link> may be the better conversation.
      </p>
    </ServiceLayout>
  );
}
