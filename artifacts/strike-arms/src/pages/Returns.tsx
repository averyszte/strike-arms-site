import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { LegalDraftNotice } from '@/components/LegalDraftNotice';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { ARTICLE_PROSE, PAGE_WIDTHS, PANEL } from '@/lib/storefront-styles';

const UPDATED = 'September 2026';

const OPEN_POINTS = [
  'Confirm that online orders collected in store carry the same 14-day right to cancel (solicitor).',
  'Confirm that collect-only items may be required to come back to the shop in person (solicitor).',
  'Which products, if any, ship sealed for hygiene reasons, such as face masks (Alan).',
];

const CANCELLATION_FORM_LINES = [
  `To: ${BUSINESS.name}, ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion} ${BUSINESS.postalCode}, Ireland. Email: ${BUSINESS.email}`,
  'I hereby give notice that I cancel my contract of sale of the following goods:',
  'Ordered on / received on:',
  'Order number:',
  'Name of consumer:',
  'Address of consumer:',
  'Signature of consumer (only if this form is sent on paper):',
  'Date:',
];

export default function Returns() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Returns and Cancellations | Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="How to cancel an online order from Strike Arms within 14 days, how returns work, who pays return postage and when you are refunded."
        />
        <link rel="canonical" href={`${SITE_URL}/returns`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Returns' }]}
        eyebrow="Changed your mind?"
        title="Returns and Cancellations"
        meta={`Last updated: ${UPDATED}`}
        width="narrow"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <LegalDraftNotice openPoints={OPEN_POINTS} />

        <div className={`mt-6 ${ARTICLE_PROSE} [&>section:first-child>h2]:mt-8`}>
          <section>
            <h2>Your right to cancel</h2>
            <p>
              If you order on this website, you can cancel without giving a reason within 14 days of
              the day you, or someone you name, receive the goods. That applies whether we delivered
              them or you collected them from the shop. If an order arrives in several parts, the 14
              days run from the day you receive the last one.
            </p>
            <p>
              This right applies to orders placed online. It does not apply to purchases made in
              person in our shop. It is separate from your rights if an item is faulty, which are
              explained in our <Link href="/terms">terms of sale</Link>.
            </p>
          </section>

          <section>
            <h2>What cannot be cancelled</h2>
            <ul>
              <li>
                Sealed goods that are not suitable for return for health or hygiene reasons, once
                you have unsealed them.
              </li>
              <li>Goods made or modified to your own specification, such as a custom build.</li>
            </ul>
          </section>

          <section>
            <h2>How to cancel</h2>
            <p>
              Tell us clearly before the 14 days are up. Email{' '}
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with your order number, call
              us on {BUSINESS.telephone}, or use the model cancellation form below. You do not have
              to use the form. It is enough that you send your message before the period ends.
            </p>
          </section>

          <section>
            <h2>Sending items back</h2>
            <p>
              Return the items within 14 days of telling us you are cancelling. Items that can be
              posted can be sent to the address above or brought to the shop. Collect-only items,
              including airsoft guns, should be brought back to the shop in person.
            </p>
            <p>
              You pay the cost of returning items, unless they are faulty or we sent you the wrong
              thing. Please pack them well: they are your responsibility until they reach us.
            </p>
            <p>
              You can handle an item as you would in a shop to see what it is and whether it works.
              If it has been used beyond that, for example at a game, we may reduce your refund to
              reflect the loss in value.
            </p>
          </section>

          <section>
            <h2>Your refund</h2>
            <p>
              We refund you within 14 days of being told you are cancelling, including the standard
              delivery charge you paid, if any. We may wait to refund until we have the items back
              or you have shown us proof that you sent them, whichever is sooner. Refunds go back to
              the card or payment method you used, at no charge to you.
            </p>
          </section>

          <section>
            <h2>Model cancellation form</h2>
            <p>Complete and return this form only if you wish to cancel your order.</p>
            <div className={`${PANEL} mt-4 space-y-2 p-5 text-sm text-muted-foreground`}>
              {CANCELLATION_FORM_LINES.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
