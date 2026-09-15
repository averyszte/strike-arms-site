import { Link } from 'wouter';

import { ServiceCallout } from '@/components/service/ServiceCallout';
import { ServiceLayout, type ServiceSection } from '@/components/service/ServiceLayout';
import { ServiceSteps } from '@/components/service/ServiceSteps';
import type { ServiceFact } from '@/components/service/ServiceTiles';
import type { FaqItem } from '@/lib/structured-data';

const FACTS: ServiceFact[] = [
  { label: 'First step', value: 'Repair diagnosis, before anything is opened' },
  { label: 'We replace', value: 'What is worn or unsuitable, not the lot' },
  { label: 'Before it leaves', value: 'Air-seal test and chrono verification' },
];

const SECTIONS: ServiceSection[] = [
  {
    id: 'is-it-the-gearbox',
    title: 'First: are you sure it is the gearbox?',
    body: (
      <>
        <p>
          Most guns that arrive as "the gearbox is gone" are not. Battery, connector and fuse faults
          are far more common than catastrophic gearbox failure, so we work the electrical side
          first — that is the <Link href="/services/repairs">repair</Link> process, and it is a great
          deal cheaper than a strip.
        </p>
        <p>
          We only open a gearbox when the diagnosis points there. That is not us being precious about
          it; opening one unnecessarily costs you labour and gains you nothing.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-rebuild',
    title: 'How we rebuild',
    body: (
      <ServiceSteps
        steps={[
          {
            title: 'Diagnose',
            detail: 'Establish what actually failed before anything is replaced.',
          },
          {
            title: 'Strip and clean',
            detail: 'You cannot assess parts through old grease.',
          },
          {
            title: 'Measure and inspect',
            detail: 'Shell, gears, piston, tappet, nozzle, bearings and wiring.',
          },
          {
            title: 'Replace what is worn or unsuitable',
            detail: 'And only that.',
          },
          {
            title: 'Shim correctly',
            detail: 'Motor height set by ear and feel rather than guesswork.',
          },
          {
            title: 'Lubricate appropriately',
            detail: 'Gear grease on gears, cylinder lube only where it is needed.',
          },
          {
            title: 'Air-seal test',
            detail: 'The single thing that most affects how the gun shoots.',
          },
          {
            title: 'Chrono verification',
            detail: (
              <>
                Confirmed over a string of shots before it goes back to you — the same{' '}
                <Link href="/services/chrono-service">chrono process</Link> we run as a standalone
                service.
              </>
            ),
          },
        ]}
      />
    ),
  },
  {
    id: 'not-everything',
    title: 'Why we do not replace everything as standard',
    body: (
      <>
        <p>
          It is a tempting way to run a workshop. It produces a big, confident-looking invoice and it
          guarantees the gun works when it leaves. It is also, bluntly, not good practice — it hides
          the actual failure, charges you for parts that had life left in them, and teaches you
          nothing about how to avoid the same problem.
        </p>
        <p>
          We would rather tell you "this stripped because the shimming was too tight, here is what
          that did" than hand you a list.
        </p>
      </>
    ),
  },
  {
    id: 'previous-work',
    title: 'Undoing previous work',
    body: (
      <>
        <p>
          A regular part of the job. The recurring causes we find are shimming set too tightly, motor
          height by guesswork, an unsuitable spring or battery, pinched wires, poor soldering, lost
          gearbox timing or small parts, and angle-of-engagement changes made without understanding
          pickup and release.
        </p>
        <p>
          None of that is a reason not to bring it in. It is a reason we assess before quoting,
          because the damage caused by a modification is often bigger than whatever prompted it.
        </p>
      </>
    ),
  },
  {
    id: 'catch-it-early',
    title: 'Catching it before it becomes a rebuild',
    body: (
      <>
        <p>A gearbox rarely fails silently.</p>
        <ServiceCallout tone="warning" title="Any of these means stop, not one more game">
          <ul>
            <li>New grinding, screeching or clicking.</li>
            <li>A sudden change in rate of fire.</li>
            <li>Excessive motor or grip heat.</li>
            <li>An electrical smell.</li>
            <li>Repeated lock-ups or double-firing.</li>
            <li>Worsening misfeeds.</li>
          </ul>
        </ServiceCallout>
        <p>
          Playing through a changed noise is how a cheap fix becomes a full rebuild. If your gun is
          making a sound it did not make last month, that is the moment to get it looked at — see
          the <Link href="/guides/airsoft-maintenance">maintenance guide</Link> for what to watch and
          listen for.
        </p>
      </>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    question: 'Do you replace every part during a rebuild?',
    answer:
      'No, and we would push back on any shop that does. Replacing everything regardless of condition is not automatically good practice — it inflates the bill and tells you nothing about what actually failed. We diagnose, clean, measure, and replace what is worn or unsuitable.',
  },
  {
    question: 'How do I know if I need a rebuild or just a repair?',
    answer:
      'Most guns that arrive expecting a rebuild need a repair. Battery, connector and fuse faults are far more common than gearbox failure. We work through the electrical side first and only strip the gearbox when the diagnosis points there.',
  },
  {
    question: 'What does a rebuild cost?',
    answer:
      'It depends on what the strip reveals and on parts availability, so we diagnose before quoting. Previous DIY work is the other variable — undoing someone else’s modifications can change the job significantly, and we will tell you if that is what we have found.',
  },
  {
    question: 'My gun was fine until I upgraded it myself. Can you fix it?',
    answer:
      'Usually. The recurring causes are over-tight shimming, motor height set by guesswork, an unsuitable spring or battery, pinched wires, poor soldering and lost gearbox timing. No judgement — but the secondary damage is often larger than the original fault, so we assess before quoting.',
  },
];

export default function GearboxRebuildsPage() {
  return (
    <ServiceLayout
      title="Gearbox Rebuilds"
      metaTitle="Airsoft Gearbox Rebuilds Dublin | Strike Arms"
      description="In-house airsoft gearbox rebuilds in Swords, Co. Dublin. Full strip, inspection, shimming, air-seal testing and chrono verification — replacing what is worn, not everything."
      path="/services/gearbox-rebuilds"
      serviceType="Airsoft gearbox rebuild"
      eyebrow="Workshop service"
      intro="A rebuild should leave you knowing what failed and why. If a shop hands back a gun with a bill listing every internal part it sells, you have paid for a parts swap rather than a diagnosis."
      facts={FACTS}
      sections={SECTIONS}
      faq={FAQ}
    />
  );
}
