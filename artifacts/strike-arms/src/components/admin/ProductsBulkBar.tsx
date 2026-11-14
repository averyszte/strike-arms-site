import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
  PackageCheck,
  PackageX,
  Star,
  StarOff,
  X,
} from 'lucide-react';

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
import { countIncomplete } from '@/lib/product-publish-readiness';
import type { Product, ProductBulkPatch } from '@/types/product';

/**
 * What you can do to a selection of products.
 *
 * Every action asks first, with the count (M-037): a selection is easy to get
 * wrong and the change goes live on the shop at once. Publishing also says how
 * many would go on the shop looking broken. Archiving offers Undo afterwards.
 *
 * In the archived view the only thing to do to a selection is restore it.
 */

type ProductsBulkBarProps = {
  selected: Product[];
  isPending: boolean;
  onClear: () => void;
  onPatch: (patch: ProductBulkPatch) => void;
  onArchive: () => void;
  onRestore: () => void;
  isArchivedView: boolean;
};

type BulkAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  verb: string;
  detail: string;
};

type Pending = BulkAction & { run: () => void };

const PATCH_ACTIONS: (BulkAction & { patch: ProductBulkPatch })[] = [
  { key: 'publish', label: 'Publish', icon: Eye, verb: 'Publish', patch: { isPublished: true }, detail: 'They go on the shop straight away.' },
  { key: 'unpublish', label: 'Unpublish', icon: EyeOff, verb: 'Unpublish', patch: { isPublished: false }, detail: 'They come off the shop straight away.' },
  { key: 'feature', label: 'Feature', icon: Star, verb: 'Feature', patch: { isFeatured: true }, detail: 'They show on the homepage.' },
  { key: 'unfeature', label: 'Unfeature', icon: StarOff, verb: 'Unfeature', patch: { isFeatured: false }, detail: 'They come off the homepage.' },
  { key: 'in-stock', label: 'In stock', icon: PackageCheck, verb: 'Mark in stock', patch: { inStock: true }, detail: 'Customers can buy them online.' },
  { key: 'out-of-stock', label: 'Out of stock', icon: PackageX, verb: 'Mark out of stock', patch: { inStock: false }, detail: 'Customers can no longer buy them online.' },
];

const ARCHIVE: BulkAction = {
  key: 'archive',
  label: 'Archive',
  icon: Archive,
  verb: 'Archive',
  detail: 'They come off the shop and out of this list. Their past orders are kept. Undo is offered straight after.',
};

const RESTORE: BulkAction = {
  key: 'restore',
  label: 'Restore as drafts',
  icon: ArchiveRestore,
  verb: 'Restore',
  detail: 'They come back unpublished and unfeatured, to be checked before they go live again.',
};

function publishWarning(selected: Product[]): string {
  const incomplete = countIncomplete(selected);
  if (incomplete === 0) return '';
  return ` ${incomplete} of them ${incomplete === 1 ? 'has' : 'have'} no image or no price, and will look broken.`;
}

export function ProductsBulkBar({
  selected,
  isPending,
  onClear,
  onPatch,
  onArchive,
  onRestore,
  isArchivedView,
}: ProductsBulkBarProps) {
  const [pending, setPending] = useState<Pending | null>(null);
  const count = selected.length;
  const word = count === 1 ? 'product' : 'products';

  const actions: Pending[] = isArchivedView
    ? [{ ...RESTORE, run: onRestore }]
    : [
        ...PATCH_ACTIONS.map(action => ({
          ...action,
          detail: action.key === 'publish' ? action.detail + publishWarning(selected) : action.detail,
          run: () => onPatch(action.patch),
        })),
        { ...ARCHIVE, run: onArchive },
      ];

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <p className="mr-1 text-sm font-medium text-foreground">
          {count} {word} selected
        </p>
        {actions.map(action => (
          <Button
            key={action.key}
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => setPending(action)}
          >
            <action.icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {action.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
          <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Clear
        </Button>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={open => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.verb} {count} {word}?
            </AlertDialogTitle>
            <AlertDialogDescription>{pending?.detail}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pending?.run();
                setPending(null);
              }}
            >
              {pending?.verb} {count} {word}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
