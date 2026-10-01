import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { LegalDraftNotice } from '@/components/LegalDraftNotice';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { ARTICLE_PROSE, PAGE_WIDTHS } from '@/lib/storefront-styles';

const UPDATED = 'September 2026';

const OPEN_POINTS = [
  'How long order and accounting records are kept, in years (accountant).',
  "Whether Cloudflare's bot check sets cookies of its own, and whether that needs naming (solicitor).",
];

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
        <LegalDraftNotice openPoints={OPEN_POINTS} />

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
              <li>
                When you check out or look up an order: your IP address and browser signals, used
                by the bot check and to limit repeated attempts. The address is not stored in the
                clear.
              </li>
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
              <li>To protect checkout and order lookup from bots and abuse (legitimate interests).</li>
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
            <h2>Cookies and browser storage</h2>
            <p>
              We do not use analytics, advertising or tracking cookies. The site keeps your basket,
              and your sign-in if you have an account, in your own browser&apos;s storage so they
              survive a page reload. Signing out or clearing your browser data removes them. If we
              ever add analytics, we will ask for your consent first.
            </p>
          </section>

          <section>
            <h2>Who we share it with</h2>
            <p>
              We share data only with the service providers needed to run the shop — for example our
              payments provider (Stripe), our hosting and database provider (Supabase) and our email
              provider (Resend), and Cloudflare, which hosts the site and runs the bot check
              (Turnstile) on checkout and order lookup — and where required by law.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
