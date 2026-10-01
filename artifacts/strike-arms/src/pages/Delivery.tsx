import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { LegalDraftNotice } from '@/components/LegalDraftNotice';
import { useStoreRates } from '@/hooks/use-store-rates';
import { formatPrice } from '@/lib/format-price';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { ARTICLE_PROSE, PAGE_WIDTHS } from '@/lib/storefront-styles';

const UPDATED = 'September 2026';

const OPEN_POINTS = [
  'Delivery zones beyond the Republic of Ireland, if any (Alan).',
  'Delivery cost and free-delivery threshold: the figures below are the current store settings, still placeholders (Alan).',
  'Courier and typical delivery time (Alan).',
  'How long collect-in-store orders are held (Alan).',
];

const [OPENING_HOURS] = BUSINESS.openingHours;
const OPENING_HOURS_TEXT =
  `${OPENING_HOURS.days[0]} to ${OPENING_HOURS.days[OPENING_HOURS.days.length - 1]}, ` +
  `${OPENING_HOURS.opens} to ${OPENING_HOURS.closes}`;

/** The live rates, so this page can never quote a different price from the basket. */
function DeliveryCharge() {
  const { data: rates } = useStoreRates();

  if (!rates) {
    return <p>The delivery charge is shown in your basket before you pay.</p>;
  }
  return (
    <p>
      Delivery costs {formatPrice(rates.shippingFlatCents)} per order, and is free when the items
      being delivered come to {formatPrice(rates.freeShippingThresholdCents)} or more. Items you
      collect do not count towards that total. The exact charge is shown in your basket before you
      pay.
    </p>
  );
}

export default function Delivery() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Delivery and Collection | Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="Delivery costs and areas, and how to collect your order from the Strike Arms shop in Swords, Co. Dublin."
        />
        <link rel="canonical" href={`${SITE_URL}/delivery`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Delivery' }]}
        eyebrow="Getting your order"
        title="Delivery and Collection"
        meta={`Last updated: ${UPDATED}`}
        width="narrow"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <LegalDraftNotice openPoints={OPEN_POINTS} />

        <div className={`mt-6 ${ARTICLE_PROSE} [&>section:first-child>h2]:mt-8`}>
          <section>
            <h2>Collect or deliver</h2>
            <p>
              Each product says whether it can be delivered or must be collected from the shop.
              Airsoft guns are collect in store only. If your basket has both kinds, you can have
              the deliverable items posted and collect the rest.
            </p>
          </section>

          <section>
            <h2>Collecting from the shop</h2>
            <p>
              Collection is free. We email you when your order is ready. Our shop is at{' '}
              {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, {BUSINESS.addressRegion}{' '}
              {BUSINESS.postalCode}, open {OPENING_HOURS_TEXT}.
            </p>
            <p>
              <strong>Bring photo ID showing you are 18 or over.</strong> We cannot hand over an
              order without it, whoever is collecting.
            </p>
          </section>

          <section>
            <h2>Delivery</h2>
            <p>We deliver to addresses in the Republic of Ireland.</p>
            <DeliveryCharge />
            <p>
              We email you when your order is posted, with tracking details where the courier
              provides them. You can also follow it on <Link href="/account">your account</Link>.
            </p>
          </section>

          <section>
            <h2>Problems with a delivery</h2>
            <p>
              If an order arrives damaged, or something is missing, please{' '}
              <Link href="/contact">contact us</Link> with your order number as soon as you can. For
              returns, see our <Link href="/returns">returns and cancellation policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
