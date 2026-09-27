import { useLocation } from 'wouter';

import { EmailLinkScreen } from '@/components/admin/EmailLinkScreen';
import { NewPasswordForm } from '@/components/admin/NewPasswordForm';
import { useUpdatePassword } from '@/hooks/use-update-password';

/**
 * /auth/confirm, where the invite email lands. The link signs the new admin
 * in; they choose a password here, then AuthGuard on /admin takes them
 * through setting up two-factor.
 */
export default function AcceptInvitePage() {
  const [, navigate] = useLocation();
  const { mutateAsync } = useUpdatePassword();

  async function setPassword(password: string) {
    await mutateAsync(password);
    navigate('/admin');
  }

  return (
    <EmailLinkScreen
      type="invite"
      pageTitle="Accept invite"
      heading="Set your password"
      intro="Choose the password you will sign in to the admin with."
      invalidAdvice="Invite links work once and expire. Ask whoever invited you to send a new one."
    >
      <NewPasswordForm submitLabel="Set password" onSubmit={setPassword} />
    </EmailLinkScreen>
  );
}
