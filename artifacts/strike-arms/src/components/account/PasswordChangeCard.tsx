import { useState } from 'react';

import { NewPasswordForm } from '@/components/admin/NewPasswordForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CARD_TITLE, PANEL } from '@/lib/storefront-styles';

type PasswordChangeCardProps = {
  /** Throws when the current password is wrong or the new one is refused. */
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
};

/** Current password, then the shared new-password form. */
export function PasswordChangeCard({ onSubmit }: PasswordChangeCardProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChanged, setIsChanged] = useState(false);

  async function submit(newPassword: string) {
    setIsChanged(false);
    if (!currentPassword) throw new Error('Enter your current password.');
    await onSubmit(currentPassword, newPassword);
    setCurrentPassword('');
    setIsChanged(true);
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Password</h2>
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <NewPasswordForm submitLabel="Change password" onSubmit={submit} />
        {isChanged && (
          <p className="text-sm text-muted-foreground" role="status">
            Password changed.
          </p>
        )}
      </div>
    </section>
  );
}
