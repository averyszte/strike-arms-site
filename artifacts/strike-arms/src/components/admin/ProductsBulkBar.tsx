import { useState } from 'react';
import { Eye, EyeOff, Star, StarOff, Trash2, X } from 'lucide-react';

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
 * of them is sitting right beside it. Deleting asks first, and publishing asks
 * when the selection contains something that would go on the shop looking
 * broken -- no image, or no price.
 */

type ProductsBulkBarProps = {
  selected: Product[];
  isPending: boolean;
  onClear: () => void;
  onPatch: (patch: ProductBulkPatch) => void;
  onDelete: () => void;
};

export function ProductsBulkBar({
  selected,
  isPending,
  onClear,
  onPatch,
  onDelete,
}: ProductsBulkBarProps) {
  const [confirming, setConfirming] = useState<'publish' | 'delete' | null>(null);

  const count = selected.length;
  const word = count === 1 ? 'product' : 'products';
  const incomplete = countIncomplete(selected);

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
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirming('delete')}
        >
          <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Delete
        </Button>

        <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={onClear}>
          <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Clear
        </Button>
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
        open={confirming === 'delete'}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} {word}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Past orders keep their own copy of the name and price, so old
              orders stay readable — but the products themselves are gone. To take them off the shop
              without losing them, unpublish instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete();
                setConfirming(null);
              }}
            >
              Delete {count} {word}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
