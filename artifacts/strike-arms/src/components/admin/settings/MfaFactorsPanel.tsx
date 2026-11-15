import { useState } from 'react';
import { Plus, Smartphone, Trash2 } from 'lucide-react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { MfaAddFactorForm } from '@/components/admin/settings/MfaAddFactorForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAdminMfaFactors } from '@/hooks/use-admin-mfa-factors';
import { useRemoveMfaFactor } from '@/hooks/use-remove-mfa-factor';
import { useToast } from '@/hooks/use-toast';
import type { TotpFactor } from '@/types/auth';
import { adminErrorMessage } from '@/lib/admin-error-message';

const DATE = new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium' });

function factorLabel(factor: TotpFactor, index: number): string {
  return factor.name || (index === 0 ? 'First authenticator' : `Authenticator ${index + 1}`);
}

/**
 * The authenticators on this account (M-026). A second, named device is the
 * recovery route for a lost phone, so the last one can never be removed here.
 */
export function MfaFactorsPanel() {
  const factors = useAdminMfaFactors();
  const remove = useRemoveMfaFactor();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [toRemove, setToRemove] = useState<{ id: string; label: string } | null>(null);
  const list = factors.data ?? [];
  const canRemove = list.length > 1;

  function confirmRemove() {
    if (!toRemove) return;
    remove.mutate(toRemove.id, {
      onSuccess: () => toast({ title: `${toRemove.label} removed` }),
      onError: (error: Error) =>
        toast({ title: 'Not removed', description: adminErrorMessage(error), variant: 'destructive' }),
    });
    setToRemove(null);
  }

  return (
    <section className="max-w-md space-y-3">
      <h2 className="text-base font-semibold text-foreground">Two-factor devices</h2>
      <p className="text-sm text-muted-foreground">
        Add a backup device so a lost or broken phone does not lock you out. A code from any
        device on this list works at sign-in.
      </p>

      {factors.isError && (
        <AdminLoadError
          what="the two-factor devices"
          error={factors.error}
          isRetrying={factors.isFetching}
          onRetry={() => void factors.refetch()}
        />
      )}

      <ul className="divide-y divide-border rounded-md border border-border">
        {list.map((factor, index) => (
          <li key={factor.id} className="flex items-center gap-3 px-3 py-2">
            <Smartphone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{factorLabel(factor, index)}</p>
              <p className="text-xs text-muted-foreground">Added {DATE.format(new Date(factor.createdAt))}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canRemove || remove.isPending}
              title={canRemove ? 'Remove this device' : 'Add another device before removing this one'}
              onClick={() => setToRemove({ id: factor.id, label: factorLabel(factor, index) })}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Remove</span>
            </Button>
          </li>
        ))}
        {factors.isLoading && <li className="px-3 py-2 text-sm text-muted-foreground">Loading...</li>}
      </ul>

      {list.length === 1 && (
        <p className="text-xs text-amber-500">
          Only one device is set up. If it is lost, Phil has to reset two-factor before you can
          get back in.
        </p>
      )}

      {isAdding ? (
        <MfaAddFactorForm existingNames={list.map(f => f.name)} onDone={() => setIsAdding(false)} />
      ) : (
        <Button type="button" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add a backup device
        </Button>
      )}

      <AlertDialog open={toRemove !== null} onOpenChange={open => !open && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toRemove?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Codes from that device will stop working. The other devices on this list keep
              working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>Remove device</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
