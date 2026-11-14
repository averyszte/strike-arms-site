import { AlertTriangle } from 'lucide-react';

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
import type { RateChange } from '@/lib/store-rates-form';

interface Props {
  changes: RateChange[] | null;
  warnings: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

/** Old against new before a rate goes live for every customer (M-029). */
export function StoreRatesConfirmDialog({ changes, warnings, onCancel, onConfirm }: Props) {
  return (
    <AlertDialog open={changes !== null} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change the rates?</AlertDialogTitle>
          <AlertDialogDescription>
            The new rates apply to every cart and checkout straight away.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 font-medium">Rate</th>
              <th className="py-1 font-medium">Now</th>
              <th className="py-1 font-medium">New</th>
            </tr>
          </thead>
          <tbody>
            {(changes ?? []).map(change => (
              <tr key={change.label} className="border-t border-border">
                <td className="py-1.5">{change.label}</td>
                <td className="py-1.5 text-muted-foreground">{change.from}</td>
                <td className="py-1.5 font-semibold text-foreground">{change.to}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {warnings.length > 0 && (
          <ul className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            {warnings.map(warning => (
              <li key={warning} className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                {warning}
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Save new rates</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
