import { useState } from 'react';
import type { FormEvent } from 'react';
import { Redirect } from 'wouter';
import { AdminAuthScreen } from '@/components/admin/AdminAuthScreen';
import { ForgotPasswordPanel } from '@/components/admin/ForgotPasswordPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function LoginPage() {
  const { user, isAdmin, isLoading, signIn } = useAdminAuth();
  const [view, setView] = useState<'sign-in' | 'forgot'>('sign-in');
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

  if (view === 'forgot') {
    return (
      <AdminAuthScreen pageTitle="Reset password" heading="Reset password">
        <ForgotPasswordPanel initialEmail={email} onBack={() => setView('sign-in')} />
      </AdminAuthScreen>
    );
  }

  return (
    <AdminAuthScreen pageTitle="Login" heading="Admin" intro="Strike Arms management portal">
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
          <div className="flex items-baseline justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={() => setView('forgot')}
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </button>
          </div>
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
    </AdminAuthScreen>
  );
}
