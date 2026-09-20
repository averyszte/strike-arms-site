import { MfaCodeForm } from '@/components/admin/MfaCodeForm';
import { useAdminMfa } from '@/hooks/use-admin-mfa';

/** The everyday half of the gate: an authenticator is already set up. */
export function MfaChallenge() {
  const { error, isPending, submitCode } = useAdminMfa();

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Open your authenticator app and enter the current six-digit code for Strike Arms Admin.
      </p>
      <MfaCodeForm
        label="Authentication code"
        submitLabel="Verify"
        isPending={isPending}
        error={error}
        onSubmit={submitCode}
      />
    </div>
  );
}
