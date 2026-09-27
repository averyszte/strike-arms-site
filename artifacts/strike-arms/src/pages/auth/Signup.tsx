import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { SITE_URL } from '@/lib/site-config';
import { CTA_PRIMARY, PAGE_WIDTHS, TEXT_LINK } from '@/lib/storefront-styles';

const MIN_PASSWORD = 8;

export default function Signup() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (!ageConfirmed) {
      setError('You must confirm you are 16 or older to create an account.');
      return;
    }
    setSubmitting(true);
    const result = await signUp({ fullName, email, password, marketingOptIn, ageConfirmed });
    setSubmitting(false);
    if (result.ok) navigate('/account');
    else setError(result.error);
  };

  return (
    <SiteLayout>
      <Helmet>
        <title>Create an account | Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Create a Strike Arms account." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${SITE_URL}/signup`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Create account' }]}
        eyebrow="Your account"
        title="Create an account"
        intro="Faster checkout and your order history in one place."
        width="narrow"
        isCompact
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className="max-w-[420px]">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Checkbox
                checked={ageConfirmed}
                onCheckedChange={(v) => setAgeConfirmed(v === true)}
                className="mt-0.5"
                aria-label="Confirm you are 16 or older"
              />
              <span>I confirm I am 16 or older. (Purchases of some airsoft products also require you to be of legal age at checkout.)</span>
            </label>

            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Checkbox
                checked={marketingOptIn}
                onCheckedChange={(v) => setMarketingOptIn(v === true)}
                className="mt-0.5"
                aria-label="Opt in to marketing emails"
              />
              <span>Email me offers and airsoft news. You can change this any time in your account.</span>
            </label>

            <Button type="submit" className={`${CTA_PRIMARY} w-full`} disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our terms. See how we use your data in our{' '}
              <Link href="/privacy" className={TEXT_LINK}>privacy policy</Link>.
            </p>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className={TEXT_LINK}>Sign in</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
