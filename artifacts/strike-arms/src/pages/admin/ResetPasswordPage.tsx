import { useLocation } from 'wouter';

import { EmailLinkScreen } from '@/components/admin/EmailLinkScreen';
import { NewPasswordForm } from '@/components/admin/NewPasswordForm';
import { useToast } from '@/hooks/use-toast';
import { useUpdatePassword } from '@/hooks/use-update-password';

/**
 * /admin/reset-password, where the reset email lands. The link signs the
 * admin in at aal1, so an account with an authenticator is asked for a code
 * before the form (Supabase refuses the change otherwise).
 */
export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { mutateAsync } = useUpdatePassword();

  async function setPassword(password: string) {
    await mutateAsync(password);
    toast({ title: 'Password changed' });
    navigate('/admin');
  }

  return (
    <EmailLinkScreen
      type="recovery"
      pageTitle="Reset password"
      heading="Choose a new password"
      intro="Your old password stops working as soon as this is saved."
      invalidAdvice="Reset links work once and expire. Ask for a new one from the sign-in page."
    >
      <NewPasswordForm submitLabel="Save new password" onSubmit={setPassword} />
    </EmailLinkScreen>
  );
}
