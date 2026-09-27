import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { SITE_URL } from '@/lib/site-config';
import { CTA_PRIMARY, PAGE_WIDTHS, TEXT_LINK } from '@/lib/storefront-styles';

export default function Login() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.ok) navigate('/account');
    else setError(result.error);
  };

  return (
    <SiteLayout>
      <Helmet>
        <title>Sign in | Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Sign in to your Strike Arms account." />
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${SITE_URL}/login`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: 'Sign in' }]}
        eyebrow="Your account"
        title="Sign in"
        intro="Welcome back."
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className={`${CTA_PRIMARY} w-full`} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            New to Strike Arms?{' '}
            <Link href="/signup" className={TEXT_LINK}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
