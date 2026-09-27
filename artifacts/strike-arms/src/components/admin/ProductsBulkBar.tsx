import { useState } from 'react';
import { Archive, ArchiveRestore, Eye, EyeOff, Star, StarOff, X } from 'lucide-react';

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
 * Publishing and featuring are one click, because the button that undoes each
 * of them is sitting right beside it. Archiving asks first, because restoring
 * brings products back as unfeatured drafts rather than as they were, and
 * publishing asks when the selection contains something that would go on the
 * shop looking broken -- no image, or no price.
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

function ClearButton({ onClear }: { onClear: () => void }) {
  return (
    <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
      <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
      Clear
    </Button>
  );
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
  const [confirming, setConfirming] = useState<'publish' | 'archive' | null>(null);

  const count = selected.length;
  const word = count === 1 ? 'product' : 'products';
  const incomplete = countIncomplete(selected);

  if (isArchivedView) {
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <p className="mr-1 text-sm font-medium text-foreground">
          {count} {word} selected
        </p>
        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onRestore}>
          <ArchiveRestore className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Restore as drafts
        </Button>
        <ClearButton onClear={onClear} />
      </div>
    );
  }

  function handlePublish() {
    if (incomplete > 0) setConfirming('publish');
    else onPatch({ isPublished: true });
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
        <p className="mr-1 text-sm font-medium text-foreground">
          {count} {word} selected
        </p>

        <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={handlePublish}>
          <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Publish
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => onPatch({ isPublished: false })}
        >
          <EyeOff className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Unpublish
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => onPatch({ isFeatured: true })}
        >
          <Star className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Feature
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => onPatch({ isFeatured: false })}
        >
          <StarOff className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Unfeature
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => setConfirming('archive')}
        >
          <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Archive
        </Button>

        <ClearButton onClear={onClear} />
      </div>

      <AlertDialog
        open={confirming === 'publish'}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publish {count} {word}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {incomplete} of them {incomplete === 1 ? 'has' : 'have'} no image or no price, and
              will go on the shop looking broken. Everything published here is visible to customers
              straight away.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onPatch({ isPublished: true });
                setConfirming(null);
              }}
            >
              Publish anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirming === 'archive'}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {count} {word}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They come off the shop and out of this list. Their stock history and past orders are
              kept, and they can be restored from Archived as unfeatured drafts, to be checked
              before they go live again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onArchive();
                setConfirming(null);
              }}
            >
              Archive {count} {word}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
