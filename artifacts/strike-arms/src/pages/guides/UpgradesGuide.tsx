import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'What upgrade gives the best return for the money?',
    answer:
      'Quality BBs, a correct hop-up setup and, where the stock parts are poor, a properly fitted bucking and nub. Fixing air-seal inconsistency comes before anything else. These change how the gun actually shoots far more than a stronger spring or a more expensive barrel.',
  },
  {
    question: 'Will a stronger spring make my gun better?',
    answer:
      'Usually not. Fitting a stronger spring with no measured goal is the most common waste of upgrade money. It adds stress to the gearbox without adding usable range, and it can put you over your site’s limit.',
  },
  {
    question: 'Do I need a MOSFET?',
    answer:
      'A MOSFET earns its place when the setup draws more current, runs an 11.1v battery, needs electronic trigger functions, or would otherwise put heavy arcing and wear on mechanical trigger contacts. It is not a status upgrade, and fitting one does not mean you should then run a higher voltage.',
  },
  {
    question: 'What goes wrong with DIY upgrades?',
    answer:
      'The usual culprits are over-tight shimming, motor height set by guesswork, an unsuitable spring or battery, pinched wires, poor soldering, a misaligned hop rubber and lost gearbox timing. The secondary damage is often bigger than the problem the upgrade was meant to fix.',
  },
  {
    question: 'Is a tightbore barrel worth it?',
    answer:
      'A well-made 6.03–6.05mm barrel is a sensible general range, but bore size alone does not create accuracy. Straightness, finish, cleanliness, a stable air seal, the bucking and nub, correct hop-up and good BBs all usually matter more than shaving another hundredth off the bore.',
  },
];

export default function UpgradesGuide() {
  return (
    <ArticleLayout
      title="Airsoft Upgrades: What Is Worth Doing"
      metaTitle="Airsoft Upgrades Guide: What Is Worth Doing | Strike Arms"
      description="Which airsoft upgrades actually improve a gun, in what order, and which ones waste money: BBs, hop-up, air seal, springs, MOSFETs and tightbore barrels."
      path="/guides/airsoft-upgrades"
      updatedISO="2026-10-17"
      updatedLabel="October 2026"
      intro="Most upgrade money goes on parts that were never going to fix the problem. Before buying anything, work out what the gun is actually failing to do. This guide covers where the money makes a difference, the order to do it in, and what to skip."
      faq={FAQ}
    >
      <h2>Start with what the gun is failing to do</h2>
      <p>
        Change one thing for a measured reason, and test after each step. An upgrade whose effect you
        cannot measure was not an upgrade. If you cannot say what is wrong with the gun now, no part
        will fix it.
      </p>
      <p>
        Strike Arms does not sell upgrade parts, but our workshop will fit the ones you buy. If you
        are not sure what to buy, ask before you spend anything — see our{' '}
        <Link href="/services/upgrades">upgrades service</Link>.
      </p>

      <h2>Where the money actually makes a difference</h2>
      <p>In rough order of what you will notice on the field:</p>
      <ol>
        <li>
          <strong>
            Quality <Link href="/store/consumables/bbs">BBs</Link>.
          </strong>{' '}
          The cheapest change that improves every single shot.
        </li>
        <li>
          <strong>
            <Link href="/glossary#hop-up">Hop-up</Link> consistency.
          </strong>{' '}
          Plus the bucking and nub, if the stock parts are poor.
        </li>
        <li>
          <strong>Fixing air-seal inconsistency.</strong> Most guns that feel weak are inconsistent
          rather than underpowered.
        </li>
        <li>
          <strong>Motor and electronics.</strong> For trigger response, efficiency or control
          features.
        </li>
      </ol>
      <p>
        Notice what is not on that list: a stronger spring, or an extremely tight barrel. Both add
        stress without usable accuracy, and both are near the top of what people ask for.
      </p>

      <h2>What to skip</h2>
      <p>
        Replacing working internals. Fitting a stronger spring with no goal. Cosmetic parts sold as
        performance parts. Anything fitted because a list on the internet said so rather than because
        the gun demonstrated a problem.
      </p>

      <h2>If you want more power, this is the order</h2>
      <p>
        Power work comes last, not first, and it starts with knowing your target rather than your
        current number.
      </p>
      <ol>
        <li>Establish the limit your site enforces, and measure the gun against it.</li>
        <li>Correct the air seal.</li>
        <li>Set the hop-up properly.</li>
        <li>
          Settle on the <Link href="/guides/airsoft-bb-weight-guide">BB weight</Link> you will
          actually play with.
        </li>
        <li>Only then change the spring, and only if a measured adjustment is genuinely needed.</li>
        <li>Chrono again, to the site’s stated method.</li>
      </ol>
      <p>
        Chasing a headline figure without improving consistency adds stress to the gun and gains you
        nothing usable. The <Link href="/guides/fps-and-joules-explained">FPS and joules guide</Link>{' '}
        explains why, and our <Link href="/services/chrono-service">chrono service</Link> gives you
        the real numbers.
      </p>

      <h2>MOSFETs and electronics</h2>
      <p>
        A <Link href="/glossary#mosfet">MOSFET</Link> or ETU earns its place when the setup draws more
        current, runs an 11.1v battery, needs programmable trigger functions or diagnostics, or would
        otherwise put heavy arcing and wear on mechanical trigger contacts.
      </p>
      <p>
        It is not a status upgrade, and there is no point fitting one where the standard system is
        reliable and doing its job. Fitting a MOSFET also does not automatically mean you should now
        run a higher voltage — see the{' '}
        <Link href="/guides/airsoft-battery-lipo-guide">battery guide</Link>.
      </p>

      <h2>When a DIY upgrade goes wrong</h2>
      <p>
        Everyone learns somewhere. The recurring mistakes are shimming set too tightly, motor height
        by guesswork, an unsuitable spring or battery, pinched wires, poor soldering, a misaligned hop
        rubber, lost gearbox timing or small parts, and angle-of-engagement changes made without
        understanding pickup and release.
      </p>
      <p>
        If something has stopped working, bring it in for a{' '}
        <Link href="/services/repairs">repair</Link>, or bring the parts and have the{' '}
        <Link href="/services/upgrades">upgrade fitted</Link> properly. We diagnose what was changed before quoting,
        because the secondary damage is often larger than the fault that prompted the work.
      </p>
    </ArticleLayout>
  );
}
