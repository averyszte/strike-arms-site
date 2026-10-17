import { Link } from 'wouter';

import { ServiceCallout } from '@/components/service/ServiceCallout';
import { ServiceLayout, type ServiceSection } from '@/components/service/ServiceLayout';
import { ServiceSteps } from '@/components/service/ServiceSteps';
import type { ServiceFact } from '@/components/service/ServiceTiles';
import type { FaqItem } from '@/lib/structured-data';

const FACTS: ServiceFact[] = [
  { label: 'What changes', value: 'Range and grouping, not power' },
  { label: 'Tuned to', value: 'The BB weight you actually play with' },
  { label: 'Confirmed by', value: 'A chrono string, not a single shot' },
];

const SECTIONS: ServiceSection[] = [
  {
    id: 'bench-process',
    title: 'Our bench process',
    body: (
      <>
        <p>
          Same sequence every time, because skipping a step is how you end up chasing a symptom that
          was caused three steps earlier:
        </p>
        <ServiceSteps
          steps={[
            {
              title: (
                <>
                  Clean and inspect the <Link href="/glossary#tightbore-barrel">barrel</Link>.
                </>
              ),
            },
            { title: 'Confirm the hop chamber and barrel are centred and stable.' },
            { title: 'Inspect the bucking lips and contact patch.' },
            { title: 'Fit the bucking and nub without twisting or pinching them.' },
            { title: 'Check feeding and air seal.' },
            { title: 'Test with your BB weight, not a shop default.' },
            { title: 'Adjust for a repeatable flat flight rather than maximum lift.' },
            {
              title: 'Confirm consistency over the chrono.',
              detail: 'Across a string of shots rather than one.',
            },
          ]}
        />
      </>
    ),
  },
  {
    id: 'your-bbs',
    title: 'Why we tune to your BBs',
    body: (
      <>
        <p>
          A hop-up set with one BB weight and played with another is set wrong. The lift the rubber
          applies is weight-dependent, so a gun tuned on 0.20g and fed 0.28g on game day will not do
          what it did on the bench.
        </p>
        <p>
          Bring what you actually shoot, or tell us and we will match it. If you are not sure what
          you should be using, the <Link href="/guides/airsoft-bb-weight-guide">BB weight guide</Link>{' '}
          covers it — and BB quality matters here as much as weight, because cheap seamed BBs make a
          correctly-tuned hop look faulty.
        </p>
      </>
    ),
  },
  {
    id: 'flat-not-lift',
    title: 'Flat and repeatable beats maximum lift',
    body: (
      <>
        <p>
          It is easy to wind a hop up until the BB visibly climbs. It looks dramatic and it is
          useless — the shot goes somewhere different every time, and you have traded consistency for
          one impressive-looking flight.
        </p>
        <p>
          What we are after is a flat trajectory you can rely on shot after shot, confirmed over a
          chrono string and a range test rather than judged from a single shot down the shop.
        </p>
      </>
    ),
  },
  {
    id: 'buckings',
    title: 'Buckings and nubs',
    body: (
      <>
        <p>
          We replace a bucking when it is worn, damaged or genuinely poor — not as a matter of
          course. Where a change is warranted, the bucking and nub have to suit the hop window, the
          barrel and the BB weight you shoot. They work as a matched set, and fitting a
          well-reviewed bucking with the wrong nub is a common way to make a gun worse.
        </p>
        <ServiceCallout tone="note" title="Fitting matters as much as choosing">
          <p>
            A bucking that has been twisted or pinched on installation will never seal properly no
            matter what it cost.
          </p>
        </ServiceCallout>
      </>
    ),
  },
  {
    id: 'limits',
    title: 'What tuning will not fix',
    body: (
      <>
        <p>
          If the air seal is failing, or the barrel is damaged, or the gun is feeding badly, no
          amount of hop adjustment will hold. Those are{' '}
          <Link href="/services/repairs">repair</Link> jobs first. We check for them as part of the
          process rather than tuning around a fault and handing the gun back.
        </p>
        <p>
          Equally, tuning will not make a gun more powerful, and it is not meant to. If you need the
          gun brought to a specific figure, that is an <Link href="/services/upgrades">upgrade</Link>{' '}
          conversation and it starts at the <Link href="/services/chrono-service">chrono</Link>.
        </p>
      </>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    question: 'What does hop-up tuning actually do?',
    answer:
      'It sets the backspin the hop-up puts on the BB so the shot flies flat and repeatable rather than climbing, dropping or wandering. Done properly it improves grouping and effective range without touching the gun’s power at all.',
  },
  {
    question: 'Do you tune to the BB weight I actually use?',
    answer:
      'Yes, and that matters more than people expect. A hop set with 0.20g and then played with 0.28g is a hop that is set wrong. Bring the BBs you play with, or tell us what they are and we will tune to them.',
  },
  {
    question: 'Should I aim for maximum lift?',
    answer:
      'No. We adjust for a repeatable flat flight, not maximum lift. A hop wound up until the BB climbs looks impressive for one shot and is inconsistent for the rest of the day.',
  },
  {
    question: 'Will hop-up tuning make my gun more powerful?',
    answer:
      'No, and that is the point. Tuning changes how the BB flies, not how much energy the gun produces, so it improves range and grouping without moving you closer to your site’s limit.',
  },
  {
    question: 'Do I need a new bucking?',
    answer:
      'Only if the one fitted is worn, damaged or genuinely poor. We inspect the lips and contact patch first. Where a replacement is warranted, the bucking and nub need to suit the hop window, the barrel and your BB weight — it is a matched set, not a single part.',
  },
];

export default function HopUpTuningPage() {
  return (
    <ServiceLayout
      title="Hop-Up Tuning"
      metaTitle="Airsoft Hop-Up Tuning Dublin | Strike Arms"
      description="Bench hop-up tuning in Swords, Co. Dublin. We tune for a flat, repeatable trajectory on your own BB weight and confirm consistency over the chrono."
      path="/services/hop-up-tuning"
      serviceType="Airsoft hop-up tuning"
      eyebrow="Workshop service"
      intro="Hop-up is where most guns quietly lose their range, and it is the cheapest thing on the bench to put right. It costs nothing in power and it is the single change most likely to make a gun feel like a different weapon."
      facts={FACTS}
      sections={SECTIONS}
      faq={FAQ}
    />
  );
}
