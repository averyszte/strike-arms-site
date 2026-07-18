import { Link } from 'wouter';

import { ArticleLayout } from '@/components/article/ArticleLayout';
import type { FaqItem } from '@/lib/structured-data';

const FAQ: FaqItem[] = [
  {
    question: 'What BB weight should a beginner use?',
    answer:
      'For a stock AEG, 0.25g is a sensible all-round default: heavier than 0.20g so it holds a line better in wind, but light enough for a standard gun to push. Move up to 0.28g once you want more stability outdoors.',
  },
  {
    question: 'Do heavier BBs improve accuracy?',
    answer:
      'Up to a point. A heavier BB carries more momentum and resists wind, so it is more stable in flight, but only if your hop-up and gun have enough power to lift and stabilise it. Too heavy for the setup and range and grouping actually get worse.',
  },
  {
    question: 'Do I need bio BBs?',
    answer:
      'Most outdoor sites in Ireland require biodegradable BBs so spent rounds do not persist in the environment. Check your site rules; indoor CQB sites often allow standard BBs. Either way, buy a quality, well-graded BB.',
  },
  {
    question: 'Why do cheap BBs cause jams?',
    answer:
      'Low-grade BBs have visible seams, inconsistent diameter and poor roundness. Those flaws cause misfeeds and jams, and can wear or damage the hop-up rubber and inner barrel. A good BB is one of the cheapest ways to make any gun shoot better.',
  },
];

export default function BbWeightGuide() {
  return (
    <ArticleLayout
      title="Airsoft BB Weight Guide: Which Weight to Use"
      metaTitle="Airsoft BB Weight Guide — Which Weight to Use | Strike Arms"
      description="How airsoft BB weight affects accuracy and range, which weight to use for CQB, skirmish and sniper setups, and why BB quality matters as much as weight."
      path="/guides/airsoft-bb-weight-guide"
      updatedISO="2026-07-18"
      updatedLabel="July 2026"
      intro="BB weight quietly makes or breaks how your gun shoots. Pick the right weight for your setup and you get a flatter, steadier flight; get it wrong and you lose range, accuracy or feeding. Here is how to choose."
      cta={{ label: 'Shop BBs', href: '/store/consumables/bbs' }}
      faq={FAQ}
    >
      <h2>Why weight matters</h2>
      <p>
        A heavier <Link href="/glossary#bb">BB</Link> carries more momentum, so it holds its line
        better against wind and is less easily deflected, but it needs enough power and a
        well-set <Link href="/glossary#hop-up">hop-up</Link> to lift and stabilise it. Matching the
        weight to your gun and the range you play is the goal, not simply going as heavy as possible.
      </p>

      <h2>Which weight for which setup</h2>
      <table>
        <thead>
          <tr>
            <th>Weight</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0.20g</td>
            <td>Low-power guns, indoor CQB, plinking. Light and fast but wind-sensitive.</td>
          </tr>
          <tr>
            <td>0.25g</td>
            <td>The all-round skirmish standard for a stock AEG. A good default.</td>
          </tr>
          <tr>
            <td>0.28g</td>
            <td>Upgraded AEGs and outdoor play where stability matters.</td>
          </tr>
          <tr>
            <td>0.30–0.32g+</td>
            <td>DMRs and sniper rifles with the power to drive a heavy BB at range.</td>
          </tr>
        </tbody>
      </table>
      <p>
        These are starting points, not rules. The right weight depends on your gun's power, hop-up
        and the range you play, so it is worth testing a couple of weights to see what groups best.
      </p>

      <h2>Quality matters as much as weight</h2>
      <p>
        A precise, well-graded BB feeds cleanly and flies true; a cheap one with seams and uneven
        sizing causes jams, misfeeds and can wear the hop rubber and{' '}
        <Link href="/store/parts/barrels">inner barrel</Link>. Buying a good BB is one of the
        cheapest upgrades you can make.
      </p>

      <h2>Bio BBs for outdoor play</h2>
      <p>
        Most outdoor sites in Ireland require{' '}
        <Link href="/store/consumables/bio-bbs">biodegradable BBs</Link> so spent rounds break down
        over time. Check your site's rules, and keep separate weights of bio BB for CQB and outdoor
        games. Not sure what suits your gun? Ask us and we will point you to the right weight.
      </p>
    </ArticleLayout>
  );
}
