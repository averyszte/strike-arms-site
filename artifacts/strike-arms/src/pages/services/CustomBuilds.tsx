import { Link } from 'wouter';

import { ServiceLayout } from '@/components/service/ServiceLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'What should I ask before paying anyone for a custom build?',
    answer:
      'The exact goal, the target energy, the BB weight it is built around, the full parts list, the reasoning behind each compatibility choice, the expected reliability, how it will be tested, the chrono results, the warranty, and what happens if it misses spec. Any builder worth using can answer all ten.',
  },
  {
    question: 'What are the red flags in a builder?',
    answer:
      'Vague promises, chasing maximum FPS, refusing to document the parts list, no test results, guaranteed extreme range, replacing every component unnecessarily, no chrono record, and no clear aftercare. A build with no paperwork is a build you cannot troubleshoot later.',
  },
  {
    question: 'Will you build me the most powerful gun possible?',
    answer:
      'No. A build is designed around the limit your site enforces, with a margin below it — not tuned to sit exactly on the line, where normal chrono variation puts you over. If maximum power is the goal, we are the wrong workshop.',
  },
  {
    question: 'What makes a DMR build work?',
    answer:
      'Consistency, not power. Air seal, a stable hop-up, a suitable barrel, correct cylinder volume and reliable semi-only electronics where the site requires them. A DMR that is inconsistent is just an unreliable rifle with a longer barrel.',
  },
];

export default function CustomBuildsPage() {
  return (
    <ServiceLayout
      title="Custom Builds"
      metaTitle="Custom Airsoft Builds Dublin | Strike Arms"
      description="Custom airsoft builds from our Swords, Co. Dublin workshop: built to a written spec with a stated goal, a documented parts list, chrono results and clear aftercare."
      path="/services/custom-builds"
      serviceType="Custom airsoft gun build"
      intro="A custom build is the easiest job in airsoft to do badly and charge well for, because the customer usually cannot check the work. So here is the list of questions we think you should ask any builder — including us."
      faq={FAQ}
    >
      <h2>Ask these before you pay anyone</h2>
      <p>
        We would rather you arrived with this list than took our word for it. A builder who cannot
        answer all of these is telling you something:
      </p>
      <ol>
        <li>What is the <strong>exact goal</strong> of this build?</li>
        <li>What <strong>target energy</strong> is it built to, and with what margin?</li>
        <li>What <strong>BB weight</strong> is it built around?</li>
        <li>What is the <strong>full parts list</strong>?</li>
        <li>What is the <strong>reasoning</strong> behind each compatibility choice?</li>
        <li>What <strong>reliability</strong> should I expect from it?</li>
        <li>How will it be <strong>tested</strong>?</li>
        <li>What were the <strong>chrono results</strong>?</li>
        <li>What <strong>warranty</strong> covers the work?</li>
        <li>What happens <strong>if it misses spec</strong>?</li>
      </ol>

      <h2>Red flags</h2>
      <ul>
        <li>Vague promises instead of numbers.</li>
        <li>Chasing maximum FPS as the headline.</li>
        <li>Refusing to document the parts list.</li>
        <li>No test results, or no chrono record.</li>
        <li>Guaranteed extreme range.</li>
        <li>Replacing every component whether it needed it or not.</li>
        <li>No clear aftercare, or no answer on who fixes it if it fails.</li>
      </ul>
      <p>
        The parts list one matters more than it sounds. A build with no record is a build nobody can
        troubleshoot later — including the next tech who opens it, and including us if you bought it
        second-hand.
      </p>

      <h2>How we approach a build</h2>
      <p>
        We start from what you want the gun to <em>do</em> — the role, the site, the range you are
        realistically engaging at — and work back to the parts. Not the other way round.
      </p>
      <p>
        A build is designed around the limit your site enforces, with a sensible margin below it.
        Tuning to sit exactly on the line is a mistake: normal chrono variation, temperature and
        joule creep will all put you over on the day, and being turned away at the safety brief is a
        wasted trip. Our <Link href="/guides/fps-and-joules-explained">FPS and joules guide</Link>{' '}
        explains the measurement side, and every build leaves with{' '}
        <Link href="/services/chrono-service">chrono results</Link>.
      </p>

      <h2>DMR and marksman builds</h2>
      <p>
        The most commonly misunderstood build. A DMR is not a more powerful rifle — it is a more
        consistent one. What actually delivers it:
      </p>
      <ul>
        <li>A properly corrected air seal.</li>
        <li>A stable, well-tuned <Link href="/services/hop-up-tuning">hop-up</Link>.</li>
        <li>A suitable barrel, chosen for finish and straightness rather than the tightest bore.</li>
        <li>Correct cylinder volume for that barrel.</li>
        <li>Reliable semi-only electronics where the site requires them.</li>
      </ul>
      <p>
        Check your site's rules before commissioning one. Whether semi-lock is required, and what
        limits apply to a marksman role, vary by venue — and do not assume the tiered structure used
        in some other countries applies where you play.
      </p>

      <h2>What we will not build</h2>
      <p>
        Anything aimed purely at maximum power, anything that puts you over your site's limit, and
        anything where the customer wants the numbers but not the testing. We would rather turn the
        job down than hand over a gun that fails chrono on its first outing with our name on it.
      </p>
    </ServiceLayout>
  );
}
