import { useState } from 'react';
import type { FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePassword } from '@/hooks/use-update-password';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);
  const { mutateAsync, isPending, error } = useUpdatePassword();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');
    if (password !== confirm) {
      setValidationError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    try {
      await mutateAsync(password);
      setSuccess(true);
      setPassword('');
      setConfirm('');
    } catch {
      // error surfaced via mutation's error state
    }
  }

  return (
    <>
      <Helmet>
        <title>Change Password | Strike Arms Admin</title>
      </Helmet>
      <div className="max-w-sm">
        <h1 className="text-xl font-bold text-foreground mb-1">Change Password</h1>
        <p className="text-sm text-muted-foreground mb-6">Update your admin account password.</p>

        {success ? (
          <div className="rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 px-4 py-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              Password updated successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            {validationError && <p className="text-sm text-destructive">{validationError}</p>}
            {error && (
              <p className="text-sm text-destructive">{(error as Error).message}</p>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
