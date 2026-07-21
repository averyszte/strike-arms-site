import { Link } from 'wouter';

import { ServiceLayout } from '@/components/service/ServiceLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'Why chrono before game day?',
    answer:
      'Because finding out at the safety brief that your gun is over the limit costs you the day. A bench check beforehand tells you where you actually stand, with time to do something about it.',
  },
  {
    question: 'Why measure in joules rather than FPS?',
    answer:
      'FPS is only speed, and it changes with the BB weight you test on. Joules measure the actual energy the shot carries, which is what a limit is really about. An FPS figure quoted without its BB weight tells you almost nothing.',
  },
  {
    question: 'What is joule creep?',
    answer:
      'When a high-air-volume setup produces more energy on a heavy BB than a light-BB reading suggests. It matters most on marksman and bolt-action setups, where a gun can pass on a light BB and exceed the limit on the weight you actually play with. We test on your BBs for exactly this reason.',
  },
  {
    question: 'My gun was fine at a site abroad. Is it fine here?',
    answer:
      'Do not assume so. Limits differ between countries and between sites, and so does whether different gun roles get different allowances. Treat an imported gun’s factory power setting as something to verify rather than trust.',
  },
  {
    question: 'What if it comes back over the limit?',
    answer:
      'We tell you by how much and what it would take to bring it down. That is usually an air-seal, hop or spring conversation rather than a rebuild.',
  },
];

export default function ChronoServicePage() {
  return (
    <ServiceLayout
      title="Chrono Service"
      metaTitle="Airsoft Chrono Service Dublin | Strike Arms"
      description="Bench chrono testing in Swords, Co. Dublin. Know your real muzzle energy in joules, measured on your own BBs, before you travel to a game."
      path="/services/chrono-service"
      serviceType="Airsoft chronograph testing"
      intro="The worst place to discover your gun is over the limit is at the safety brief, an hour from home, with the day already paid for. A bench check takes minutes and tells you where you genuinely stand."
      faq={FAQ}
    >
      <h2>What we measure, and how</h2>
      <ul>
        <li>Velocity and <Link href="/glossary#joule">muzzle energy</Link>, not just an FPS number.</li>
        <li>On <strong>your</strong> BBs, at the weight you actually play with.</li>
        <li>Across a consistent string of shots, not a single reading.</li>
        <li>Recorded with the BB weight it was taken on, because the figure is meaningless without it.</li>
      </ul>

      <h2>Why joules, not FPS</h2>
      <p>
        <Link href="/glossary#fps">FPS</Link> is speed alone, and speed depends on what you fired.
        The same gun reads faster on a light BB and slower on a heavy one while producing much the
        same energy — so two very different FPS numbers can describe one unchanged gun.
      </p>
      <p>
        Energy is what a limit is actually about, which is why it is the number worth knowing. Our{' '}
        <Link href="/guides/fps-and-joules-explained">FPS and joules guide</Link> works through the
        relationship properly.
      </p>

      <h2>Joule creep, and why we test on your ammunition</h2>
      <p>
        A high-air-volume setup can produce <em>more</em> energy on a heavy BB than a light-BB
        reading would suggest. That means a gun can pass a chrono on 0.20g and be over the limit on
        the 0.28g you actually brought.
      </p>
      <p>
        It bites hardest on marksman and bolt-action builds. Testing on the ammunition you will use
        is the only way to know, which is why we ask you to bring it.
      </p>

      <h2>Before a game, and after any change</h2>
      <p>Worth a check whenever:</p>
      <ul>
        <li>You are playing a new site, or one you have not visited in a while.</li>
        <li>You have changed the spring, the barrel, the hop-up or the bucking.</li>
        <li>You have switched BB weight.</li>
        <li>You have bought the gun second-hand and do not know its history.</li>
        <li>You have imported it, or bought from overseas.</li>
      </ul>
      <p>
        That last one catches people out. Limits and role allowances differ between countries and
        between individual sites, so a gun set up to be legal somewhere else is not automatically
        legal here. Treat a factory power setting as a claim to verify.
      </p>

      <h2>Chrono to your site's method</h2>
      <p>
        Sites state how they test and on what BB weight, and those details change the reading. We
        will test to the method your site uses if you tell us what it is — and if you are not sure,
        check with the venue before you travel rather than assuming. Site rules are set by each site
        and they do change.
      </p>

      <h2>If it comes back over</h2>
      <p>
        We tell you by how much, and what it would take to bring it within limit. That is usually an
        air-seal, hop-up or spring conversation rather than anything dramatic — see{' '}
        <Link href="/services/upgrades">upgrades</Link> for the order we work in. Chasing the number
        without fixing consistency is how guns end up stressed and still failing chrono.
      </p>
    </ServiceLayout>
  );
}
