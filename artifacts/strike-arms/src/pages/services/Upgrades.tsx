import { Link } from 'wouter';

import { ServiceCallout } from '@/components/service/ServiceCallout';
import { ServiceLayout, type ServiceSection } from '@/components/service/ServiceLayout';
import { ServiceSteps } from '@/components/service/ServiceSteps';
import type { ServiceFact } from '@/components/service/ServiceTiles';
import type { FaqItem } from '@/lib/structured-data';

const FACTS: ServiceFact[] = [
  { label: 'Our rule', value: 'One change, one measured reason, test after' },
  { label: 'First money', value: 'BBs, hop-up, then air seal' },
  { label: 'Power work', value: 'Last, and only against a target figure' },
];

const SECTIONS: ServiceSection[] = [
  {
    id: 'what-works',
    title: 'Where the money actually makes a difference',
    body: (
      <>
        <p>In rough order of what you will notice on the field:</p>
        <ServiceSteps
          steps={[
            {
              title: (
                <>
                  Quality <Link href="/store/consumables/bbs">BBs</Link>
                </>
              ),
              detail: 'The cheapest change that improves every single shot.',
            },
            {
              title: (
                <>
                  <Link href="/glossary#hop-up">Hop-up</Link> consistency
                </>
              ),
              detail: 'Plus the bucking and nub, if the stock parts are poor.',
            },
            {
              title: 'Fixing air-seal inconsistency',
              detail: 'Most guns that feel weak are inconsistent rather than underpowered.',
            },
            {
              title: 'Motor and electronics',
              detail: 'For trigger response, efficiency or control features.',
            },
          ]}
        />
        <p>
          Notice what is not on that list: a stronger spring, or an extremely tight barrel. Both add
          stress without usable accuracy, and both are near the top of what customers ask for.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-talk-you-out-of',
    title: 'What we will talk you out of',
    body: (
      <>
        <p>
          Replacing working internals. Fitting a stronger spring with no goal. Cosmetic parts sold as
          performance parts. Anything fitted because a list on the internet said so rather than
          because the gun demonstrated a problem.
        </p>
        <ServiceCallout tone="note" title="The rule we work to">
          <p>
            Change one thing for a measured reason, and test after each step. An upgrade you cannot
            measure the effect of was not an upgrade.
          </p>
        </ServiceCallout>
      </>
    ),
  },
  {
    id: 'power-order',
    title: 'If you want more power, this is the order',
    body: (
      <>
        <p>
          Power work comes last, not first, and it starts with knowing your target rather than your
          current number.
        </p>
        <ServiceSteps
          steps={[
            { title: 'Establish the limit your site enforces, and measure the gun against it.' },
            { title: 'Correct the air seal.' },
            { title: 'Set the hop-up properly.' },
            {
              title: (
                <>
                  Settle on the{' '}
                  <Link href="/guides/airsoft-bb-weight-guide">BB weight</Link> you will actually
                  play with.
                </>
              ),
            },
            {
              title: 'Only then change the spring.',
              detail: 'And only if a measured adjustment is genuinely needed.',
            },
            { title: "Chrono again, to the site's stated method." },
          ]}
        />
        <p>
          Chasing a headline figure without improving consistency adds stress to the gun and gains
          you nothing usable. Our{' '}
          <Link href="/guides/fps-and-joules-explained">FPS and joules guide</Link> explains why, and
          our <Link href="/services/chrono-service">chrono service</Link> gives you the real numbers.
        </p>
      </>
    ),
  },
  {
    id: 'mosfets',
    title: 'MOSFETs and electronics',
    body: (
      <>
        <p>
          A <Link href="/glossary#mosfet">MOSFET</Link> or ETU earns its place when the setup draws
          more current, runs an 11.1v battery, needs programmable trigger functions or diagnostics,
          or would otherwise put heavy arcing and wear on mechanical trigger contacts.
        </p>
        <p>
          It is not a status upgrade, and we will not fit one where the standard system is reliable
          and doing its job. Fitting a MOSFET also does not automatically mean you should now run a
          higher voltage — see the{' '}
          <Link href="/guides/airsoft-battery-lipo-guide">battery guide</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'diy-work',
    title: 'Undoing DIY work',
    body: (
      <>
        <p>
          A regular job, and no judgement — everyone learns somewhere. The recurring ones are
          shimming set too tightly, motor height by guesswork, an unsuitable spring or battery,
          pinched wires, poor soldering, a misaligned hop rubber, lost gearbox timing or small parts,
          and angle-of-engagement changes made without understanding pickup and release.
        </p>
        <p>
          We diagnose what was actually changed before quoting, because the secondary damage is often
          larger than the fault that prompted the work. If it has gone far enough, a{' '}
          <Link href="/services/gearbox-rebuilds">full rebuild</Link> is sometimes the cheaper
          answer.
        </p>
      </>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    question: 'What upgrade gives the best return for the money?',
    answer:
      'Quality BBs, a correct hop-up setup and, where the stock parts are poor, a properly fitted bucking and nub. Fixing air-seal inconsistency comes before anything else. These change how the gun actually shoots far more than a stronger spring or a more expensive barrel.',
  },
  {
    question: 'Will a stronger spring make my gun better?',
    answer:
      'Usually not. Fitting a stronger spring with no measured goal is the single most common waste of money we see. It adds stress to the gearbox without adding usable range, and it can put you over your site’s limit. We will tell you if that is what you are asking for.',
  },
  {
    question: 'Do I need a MOSFET?',
    answer:
      'A MOSFET earns its place when the setup draws more current, runs an 11.1v battery, needs electronic trigger functions, or would otherwise put heavy arcing and wear on mechanical trigger contacts. It is not a status upgrade, and fitting one does not mean you should then run a higher voltage.',
  },
  {
    question: 'Can you undo a botched DIY upgrade?',
    answer:
      'Yes, and it is a regular job. The usual culprits are over-tight shimming, motor height set by guesswork, an unsuitable spring or battery, pinched wires, poor soldering, a misaligned hop rubber and lost gearbox timing. We diagnose what was changed before quoting, because the secondary damage is often bigger than the original problem.',
  },
  {
    question: 'Is a tightbore barrel worth it?',
    answer:
      'A well-made 6.03–6.05mm barrel is a sensible general range, but bore size alone does not create accuracy. Straightness, finish, cleanliness, a stable air seal, the bucking and nub, correct hop-up and good BBs all usually matter more than shaving another hundredth off the bore.',
  },
];

export default function UpgradesServicePage() {
  return (
    <ServiceLayout
      title="Airsoft Upgrades"
      metaTitle="Airsoft Upgrades Dublin | Strike Arms"
      description="In-house airsoft upgrades in Swords, Co. Dublin: hop-up and air-seal work, buckings, motors, MOSFETs and electronics — fitted to solve a measured problem, not a shopping list."
      path="/services/upgrades"
      serviceType="Airsoft gun upgrade and tuning"
      eyebrow="Workshop service"
      intro="We will happily fit whatever you ask for. We would rather first ask what the gun is actually failing to do, because a good half of the upgrade money we see spent goes on parts that were never going to fix the problem."
      facts={FACTS}
      sections={SECTIONS}
      faq={FAQ}
    />
  );
}
