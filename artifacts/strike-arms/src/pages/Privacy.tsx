import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { ARTICLE_PROSE, PAGE_WIDTHS, PANEL } from '@/lib/storefront-styles';

const UPDATED = 'July 2026';

export default function Privacy() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Privacy Policy | Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="How Strike Arms collects, uses and protects your personal data, and your rights under GDPR."
        />
        <link rel="canonical" href={`${SITE_URL}/privacy`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Privacy' }]}
        eyebrow="Your data"
        title="Privacy Policy"
        meta={`Last updated: ${UPDATED}`}
        width="narrow"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className={`${PANEL} border-l-2 border-l-accent p-4 text-sm text-muted-foreground`}>
          Draft — this policy should be reviewed by a solicitor or against Data Protection Commission
          guidance before the site goes live.
        </div>

        <div className={`mt-6 ${ARTICLE_PROSE} [&>section:first-child>h2]:mt-8`}>
          <section>
            <h2>Who we are</h2>
            <p>
              Strike Arms is an airsoft retailer based at {BUSINESS.streetAddress},{' '}
              {BUSINESS.addressLocality}, {BUSINESS.addressRegion}. We are the data controller for the
              personal data described here. You can contact us via our{' '}
              <Link href="/contact">contact page</Link>.
            </p>
          </section>

          <section>
            <h2>What we collect</h2>
            <ul>
              <li>Your name, email address and phone number when you place an order.</li>
              <li>Order and delivery details when you buy from us.</li>
              <li>
                If you create an account: your email, name, optional phone number and a password,
                which is stored only as a secure hash.
              </li>
              <li>Your marketing-email preference.</li>
              <li>Limited technical data (e.g. essential cookies to keep you signed in).</li>
            </ul>
            <p className="mt-2">
              Payments are handled by Stripe. We do not store your card details on our systems.
            </p>
          </section>

          <section>
            <h2>Why we use it and our lawful basis</h2>
            <ul>
              <li>To fulfil your orders (performance of a contract).</li>
              <li>To run your account, if you create one, and show you your orders (performance of a contract).</li>
              <li>To meet legal obligations, such as keeping tax and accounting records.</li>
              <li>To send marketing emails only where you have opted in (consent), which you can withdraw at any time.</li>
            </ul>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>
              Where the law requires us to retain records (for example, order and accounting records for tax purposes), we keep
              those for the required period, after which they are deleted or anonymised.
            </p>
            <p className="mt-2">
              An account is kept until you delete it. Deleting it removes your sign-in and account
              details straight away; your past orders stay as sales records but are no longer linked
              to you by an account.
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>Under the GDPR you have the right to:</p>
            <ul>
              <li>Access a copy of your data, and receive it in a portable format.</li>
              <li>Correct inaccurate data.</li>
              <li>Erase your data — note we may retain records we are legally required to keep, in anonymised form.</li>
              <li>Object to, or withdraw consent for, marketing at any time.</li>
            </ul>
            <p className="mt-2">
              If you have an account, you can download your data and delete your account yourself
              from Account details. To use any of these rights, contact us. You also have the right to
              lodge a complaint with the Irish Data Protection Commission (dataprotection.ie).
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              We use essential cookies needed to run the site (for example, to keep you signed in).
              Any non-essential cookies (such as analytics) are only used with your consent.
            </p>
          </section>

          <section>
            <h2>Who we share it with</h2>
            <p>
              We share data only with the service providers needed to run the shop — for example our
              payments provider (Stripe), our hosting and database provider (Supabase) and our email
              provider (Resend) — and where required by law.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
