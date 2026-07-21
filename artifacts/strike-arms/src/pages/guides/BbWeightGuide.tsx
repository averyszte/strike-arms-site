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
      'When the site or the landowner specifies them. Check your venue’s rules rather than assuming. A good bio BB should perform much like a good standard BB — what matters is consistent diameter, polish and roundness, plus storing them away from heat and moisture. Cheap bio BBs suffer the same feeding and consistency problems as any poor ammunition.',
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
      updatedISO="2026-07-20"
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
            <td>Outdoor play where stability matters, if your hop can lift it and the site allows it.</td>
          </tr>
          <tr>
            <td>0.30g+</td>
            <td>Heavier setups where the site's rules and your hop-up both genuinely support it.</td>
          </tr>
        </tbody>
      </table>
      <p>
        These are starting points, not rules. The right weight depends on your gun, your hop-up and
        the range you play, so it is worth testing a couple of weights to see what groups best.
      </p>
      <p>
        Two cautions. Some sites cap the BB weight you may use, so check before buying a heavy tin.
        And be careful with weight charts written for other countries — they often assume power
        tiers for DMRs and sniper rifles that may not exist where you play, which makes their
        heavier recommendations meaningless here. Match the weight to your actual gun and your
        actual site.
      </p>

      <h2>Getting it wrong in either direction</h2>
      <p>
        Too light and the BB drifts, exaggerating any inconsistency already in the gun. Too heavy for
        what the hop-up can lift and it drops early or feeds poorly. Neither problem is solved by
        buying a more expensive BB in the same wrong weight — start at 0.25g on a stock AEG and move
        from there based on what you actually see downrange.
      </p>

      <h2>Quality matters as much as weight</h2>
      <p>
        A precise, well-graded BB feeds cleanly and flies true. Cheap, seamed or poorly-polished BBs
        misfeed, jam, and damage the hop-up — and can wear the hop rubber and{' '}
        <Link href="/store/parts/barrels">inner barrel</Link>. It is worth being blunt about this:
        a bag of cheap BBs is one of the few things that will actively cost you money by breaking
        parts, and good BBs are one of the cheapest ways to make any gun shoot better.
      </p>

      <h2>Bio BBs</h2>
      <p>
        Use <Link href="/store/consumables/bio-bbs">biodegradable BBs</Link> when the site or the
        landowner specifies them — check your venue's rules rather than assuming either way.
      </p>
      <p>
        A good bio BB should perform much like a good standard BB. The things that matter are the
        same: consistent diameter, polish and roundness. Store them away from heat and moisture,
        because that is what degrades them. Cheap bio BBs suffer exactly the same feeding and
        consistency problems as any poor ammunition. Not sure what suits your gun? Ask us and we will
        point you to the right weight.
      </p>
    </ArticleLayout>
  );
}
