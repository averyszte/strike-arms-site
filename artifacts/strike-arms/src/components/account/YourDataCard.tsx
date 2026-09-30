import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';

import { FormError } from '@/components/account/FormError';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadErrorMessage } from '@/lib/load-error-message';
import { CARD_TITLE, CTA_SECONDARY_SM, PANEL } from '@/lib/storefront-styles';

type YourDataCardProps = {
  onExport: () => Promise<void>;
  /** Throws when the password is wrong or the account could not be deleted. */
  onDelete: (password: string) => Promise<void>;
};

/** GDPR: a copy of what the account holds, and deleting it. */
export function YourDataCard({ onExport, onDelete }: YourDataCardProps) {
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  async function exportData() {
    setIsExporting(true);
    setExportError(null);
    try {
      await onExport();
    } catch (error: unknown) {
      setExportError(`The download did not work. ${loadErrorMessage(error)}`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className={`${CARD_TITLE} text-lg`}>Your data</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Download a copy of your details and orders, or delete your account. Deleting it does not
        delete your orders: the law requires us to keep sales records, so they stay with the shop
        but are no longer linked to an account.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          className={CTA_SECONDARY_SM}
          disabled={isExporting}
          onClick={() => void exportData()}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isExporting ? 'Preparing' : 'Download my data'}
        </Button>
        <DeleteAccountDialog onDelete={onDelete} />
      </div>
      <div className="mt-3">
        <FormError message={exportError} />
      </div>
    </section>
  );
}

function DeleteAccountDialog({ onDelete }: Pick<YourDataCardProps, 'onDelete'>) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirm() {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(password);
    } catch (caught: unknown) {
      setError(loadErrorMessage(caught));
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog onOpenChange={() => { setPassword(''); setError(null); }}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" className="text-destructive">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete my account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. Your sign-in, details and marketing choice go now. Enter your
            password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="delete-password">Password</Label>
          <Input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <FormError message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep my account</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting || !password}
            onClick={() => void confirm()}
          >
            {isDeleting ? 'Deleting' : 'Delete account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
