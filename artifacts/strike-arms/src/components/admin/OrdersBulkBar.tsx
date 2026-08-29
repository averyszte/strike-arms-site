import { useState } from 'react';
import { Archive, ArchiveRestore, X } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FULFILLMENT_OPTIONS } from '@/lib/order-display';
import type { FulfillmentStatus } from '@/types/order';

/**
 * What you can do to a selection.
 *
 * Archiving is one click because it is reversible and the restore button is
 * right there. Changing fulfilment asks first: it writes a status log entry
 * per order and there is no single click that puts them all back.
 */

type OrdersBulkBarProps = {
  selectedCount: number;
  isArchivedView: boolean;
  isPending: boolean;
  onClear: () => void;
  onStatusChange: (status: FulfillmentStatus) => void;
  onToggleArchive: () => void;
};

export function OrdersBulkBar({
  selectedCount,
  isArchivedView,
  isPending,
  onClear,
  onStatusChange,
  onToggleArchive,
}: OrdersBulkBarProps) {
  const [pendingStatus, setPendingStatus] = useState<FulfillmentStatus | null>(null);

  const label = FULFILLMENT_OPTIONS.find((option) => option.value === pendingStatus)?.label ?? '';
  const orderWord = selectedCount === 1 ? 'order' : 'orders';

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <p className="mr-1 text-sm font-medium text-foreground">
          {selectedCount} {orderWord} selected
        </p>

        <Select
          value=""
          disabled={isPending}
          onValueChange={(value) => setPendingStatus(value as FulfillmentStatus)}
        >
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue placeholder="Set fulfilment to..." />
          </SelectTrigger>
          <SelectContent>
            {FULFILLMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onToggleArchive}>
          {isArchivedView ? (
            <ArchiveRestore className="mr-1.5 h-4 w-4" aria-hidden="true" />
          ) : (
            <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
          )}
          {isArchivedView ? 'Restore' : 'Archive'}
        </Button>

        <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
          <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Clear
        </Button>
      </div>

      <AlertDialog open={pendingStatus !== null} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Mark {selectedCount} {orderWord} as {label.toLowerCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Every selected order changes at once, and each change is written to its history.
              There is no single click that puts them back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingStatus) onStatusChange(pendingStatus);
                setPendingStatus(null);
              }}
            >
              Change {selectedCount} {orderWord}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
