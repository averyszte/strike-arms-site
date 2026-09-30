import { Redirect } from 'wouter';
import { Loader2, LogOut } from 'lucide-react';

import { AccountPageFrame } from '@/components/account/AccountPageFrame';
import { EmailChangeCard } from '@/components/account/EmailChangeCard';
import { MarketingCard } from '@/components/account/MarketingCard';
import { PasswordChangeCard } from '@/components/account/PasswordChangeCard';
import { ProfileCard } from '@/components/account/ProfileCard';
import { YourDataCard } from '@/components/account/YourDataCard';
import { Button } from '@/components/ui/button';
import { useCustomerAccountActions } from '@/hooks/use-customer-account-actions';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useCustomerSession } from '@/hooks/use-customer-session';
import { loadErrorMessage } from '@/lib/load-error-message';
import { CTA_SECONDARY_SM } from '@/lib/storefront-styles';

const CRUMBS = [{ label: 'Your account', href: '/account' }, { label: 'Account details' }];

/**
 * Everything about the account itself. Signed out (including straight after
 * deleting it) goes back to /account, which offers sign-in and the guest
 * order lookup.
 */
export default function AccountDetails() {
  const { user, isLoading } = useCustomerSession();
  const email = user?.email ?? '';
  const owner = user ? { id: user.id, email } : null;
  const { profile, save, setMarketing } = useCustomerProfile(user?.id ?? null);
  const actions = useCustomerAccountActions(owner);

  if (!isLoading && !user) return <Redirect to="/account" replace />;

  return (
    <AccountPageFrame
      pageTitle="Account details"
      path="/account/details"
      crumbs={CRUMBS}
      title="Account details"
    >
      {profile.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
          Loading your details
        </p>
      ) : profile.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Your details did not load. {loadErrorMessage(profile.error)}
        </p>
      ) : (
        <>
          <ProfileCard
            initial={{ fullName: profile.data?.fullName ?? '', phone: profile.data?.phone ?? '' }}
            onSave={(input) => save.mutateAsync(input)}
          />
          <MarketingCard
            isOptedIn={profile.data?.isMarketingOptIn ?? false}
            onChange={(next) => setMarketing.mutateAsync(next)}
          />
        </>
      )}
      <EmailChangeCard currentEmail={email} onSubmit={(next) => actions.changeEmail.mutateAsync(next)} />
      <PasswordChangeCard
        onSubmit={(currentPassword, newPassword) =>
          actions.changePassword.mutateAsync({ email, currentPassword, newPassword })
        }
      />
      <YourDataCard
        onExport={() => actions.exportData.mutateAsync()}
        onDelete={(password) => actions.deleteAccount.mutateAsync(password)}
      />
      <Button
        type="button"
        className={CTA_SECONDARY_SM}
        disabled={actions.signOut.isPending}
        onClick={() => actions.signOut.mutate()}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </Button>
    </AccountPageFrame>
  );
}
