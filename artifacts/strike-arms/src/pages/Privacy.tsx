import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { SiteLayout } from '@/components/SiteLayout';
import { SITE_URL, BUSINESS } from '@/lib/site-config';

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
      <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {UPDATED}</p>

        <div className="mt-4 rounded-sm border border-border bg-card p-4 text-sm text-muted-foreground">
          Draft — this policy should be reviewed by a solicitor or against Data Protection Commission
          guidance before the site goes live.
        </div>

        <div className="mt-8 space-y-8 text-muted-foreground leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-2 [&_a]:text-accent hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mt-2">
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
              <li>Account details: your name, email address and (optionally) phone number.</li>
              <li>Order and delivery details when you buy from us.</li>
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
              <li>To create and run your account and fulfil your orders (performance of a contract).</li>
              <li>To meet legal obligations, such as keeping tax and accounting records.</li>
              <li>To send marketing emails only where you have opted in (consent), which you can withdraw at any time.</li>
            </ul>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>
              We keep your account data for as long as your account is open. Where the law requires us
              to retain records (for example, order and accounting records for tax purposes), we keep
              those for the required period, after which they are deleted or anonymised.
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>Under the GDPR you have the right to:</p>
            <ul>
              <li>Access a copy of your data, and receive it in a portable format.</li>
              <li>Correct inaccurate data.</li>
              <li>Erase your data ("delete my account") — note we may retain records we are legally required to keep, in anonymised form.</li>
              <li>Object to, or withdraw consent for, marketing at any time.</li>
            </ul>
            <p className="mt-2">
              You can download your data or delete your account from your{' '}
              <Link href="/account">account page</Link>, or contact us. You also have the right to
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
              payments provider (Stripe) and hosting/database provider — and where required by law.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
