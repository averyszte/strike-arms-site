import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { NewPasswordForm } from '@/components/admin/NewPasswordForm';
import { useUpdatePassword } from '@/hooks/use-update-password';

export default function ChangePasswordPage() {
  const [isChanged, setIsChanged] = useState(false);
  const { mutateAsync } = useUpdatePassword();

  async function changePassword(password: string) {
    setIsChanged(false);
    await mutateAsync(password);
    setIsChanged(true);
  }

  return (
    <>
      <Helmet>
        <title>Change Password | Strike Arms Admin</title>
      </Helmet>
      <div className="max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-foreground">Change Password</h1>
        <p className="mb-6 text-sm text-muted-foreground">Update your admin account password.</p>

        {isChanged && (
          <p role="status" className="mb-4 rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
            Password changed. Use the new one next time you sign in.
          </p>
        )}
        <NewPasswordForm submitLabel="Update password" onSubmit={changePassword} />
      </div>
    </>
  );
}
