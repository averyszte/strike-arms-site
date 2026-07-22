import { useState } from 'react';
import type { FormEvent } from 'react';
import { Redirect } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function LoginPage() {
  const { user, isAdmin, isLoading, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  if (!isLoading && user && isAdmin) return <Redirect to="/admin" />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsPending(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Login | Strike Arms</title>
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-[360px]">
          <h1 className="text-2xl font-bold text-foreground mb-1">Admin</h1>
          <p className="text-sm text-muted-foreground mb-7">Strike Arms management portal</p>

          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
