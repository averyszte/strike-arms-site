import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { LegalDraftNotice } from '@/components/LegalDraftNotice';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { ARTICLE_PROSE, PAGE_WIDTHS } from '@/lib/storefront-styles';

const UPDATED = 'September 2026';

const OPEN_POINTS = [
  'Legal name of the business, and the company number if it is a company (Alan).',
  'VAT number (Alan or the accountant).',
  'What happens if a customer cannot show ID at collection: hold, refund, or both (Alan).',
];

export default function Terms() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Terms of Sale | Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="The terms that apply when you buy from Strike Arms: who we are, prices, payment, the 18+ rule, collection, faulty goods and complaints."
        />
        <link rel="canonical" href={`${SITE_URL}/terms`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Terms of sale' }]}
        eyebrow="Buying from us"
        title="Terms of Sale"
        meta={`Last updated: ${UPDATED}`}
        width="narrow"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <LegalDraftNotice openPoints={OPEN_POINTS} />

        <div className={`mt-6 ${ARTICLE_PROSE} [&>section:first-child>h2]:mt-8`}>
          <section>
            <h2>Who we are</h2>
            <p>
              This website is run by {BUSINESS.name}, {BUSINESS.streetAddress},{' '}
              {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}, Ireland.
              Phone {BUSINESS.telephone}, email{' '}
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
            </p>
            <p>
              These terms apply to every order placed on this website. Please read them before you
              order. Our <Link href="/returns">returns and cancellation policy</Link>, our{' '}
              <Link href="/delivery">delivery and collection information</Link> and our{' '}
              <Link href="/privacy">privacy policy</Link> also apply.
            </p>
          </section>

          <section>
            <h2>You must be 18 or over</h2>
            <p>
              We sell only to adults. By ordering you confirm that you are 18 or over. Items marked
              collect in store are handed over only when the person collecting shows valid photo ID
              proving they are 18 or over. We may cancel an order and refund it in full if we have
              reason to believe the buyer is under 18.
            </p>
            <p>
              Owning and using airsoft equipment in Ireland is your responsibility. Our{' '}
              <Link href="/airsoft-law">airsoft law page</Link> is general information, not legal
              advice.
            </p>
          </section>

          <section>
            <h2>Prices and VAT</h2>
            <p>
              All prices are in euro and include VAT. Delivery, where it applies, is shown in your
              basket before you pay. If we have made an obvious pricing error, we will contact you
              before your order goes out and you can choose to pay the correct price or cancel for a
              full refund.
            </p>
          </section>

          <section>
            <h2>Your order and payment</h2>
            <p>
              Payment is taken by Stripe when you check out. We do not see or store your card
              details. Your contract with us is formed when your payment is confirmed and we email
              you an order confirmation with your order number.
            </p>
            <p>
              Stock is checked when you pay. If an item turns out to be unavailable after all, we
              will tell you and refund what you paid for it in full.
            </p>
          </section>

          <section>
            <h2>Delivery and collection</h2>
            <p>
              Some items, including airsoft guns, can only be collected from our shop. Others can be
              delivered or collected, as shown on each product and in your basket. The details are
              on our <Link href="/delivery">delivery and collection page</Link>. Items you collect
              become your responsibility once handed over; items we deliver become your
              responsibility when they reach you or someone you have named.
            </p>
          </section>

          <section>
            <h2>Changing your mind</h2>
            <p>
              Most items bought on this website can be cancelled within 14 days of receiving them,
              without giving a reason. How to do it, the exceptions and how refunds work are set out
              in our <Link href="/returns">returns and cancellation policy</Link>.
            </p>
          </section>

          <section>
            <h2>Faulty goods</h2>
            <p>
              Everything we sell must be as described, fit for purpose and of satisfactory quality.
              Under the Consumer Rights Act 2022, if an item is faulty you are entitled to a repair,
              a replacement, a price reduction or a refund, depending on the fault and when you
              report it. These rights are in addition to the right to cancel and are not affected by
              anything in these terms. The{' '}
              <a href="https://www.ccpc.ie/consumers/" target="_blank" rel="noreferrer">
                Competition and Consumer Protection Commission
              </a>{' '}
              explains them in full.
            </p>
            <p>
              If something you bought is faulty, <Link href="/contact">contact us</Link> with your
              order number and a short description of the problem.
            </p>
          </section>

          <section>
            <h2>Repairs and upgrades</h2>
            <p>
              Workshop services are quoted and agreed separately, in person or through our{' '}
              <Link href="/services">services pages</Link>. These terms cover goods bought on this
              website.
            </p>
          </section>

          <section>
            <h2>Complaints</h2>
            <p>
              If you are unhappy with anything, please tell us first by phone, by email or through
              our <Link href="/contact">contact page</Link>, quoting your order number. We will
              reply as soon as we can. If we cannot resolve it, you can contact the Competition and
              Consumer Protection Commission for advice, or use the Small Claims procedure of the
              District Court.
            </p>
          </section>

          <section>
            <h2>Using this website</h2>
            <p>
              The text, photos and design of this website belong to us or our suppliers and may not
              be copied for commercial use without permission. We work to keep product information
              accurate, but manufacturers change specifications; if something matters to you, ask us
              before you order.
            </p>
          </section>

          <section>
            <h2>Law and changes</h2>
            <p>
              These terms are governed by Irish law. Nothing in them affects your statutory rights
              as a consumer. We may update these terms from time to time; the version on this page
              when you place your order is the one that applies to it.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
