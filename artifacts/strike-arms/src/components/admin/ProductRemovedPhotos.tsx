import { useState } from 'react';
import { ChevronDown, ChevronRight, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useOrphanedImages, type OrphanedImage } from '@/hooks/use-orphaned-images';
import { useRestoreOrphanedImage } from '@/hooks/use-restore-orphaned-image';
import { useToast } from '@/hooks/use-toast';
import { adminErrorMessage } from '@/lib/admin-error-message';

const DAY = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short' });

/**
 * Photos removed from any product in the last 30 days, which the sweep has
 * not deleted yet (M-018). "Put back" adds one to this product.
 */
export function ProductRemovedPhotos({ onRestore }: { onRestore: (url: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const list = useOrphanedImages(isOpen);
  const restore = useRestoreOrphanedImage();
  const { toast } = useToast();
  const photos = list.data ?? [];

  function putBack(photo: OrphanedImage) {
    restore.mutate(photo.path, {
      onSuccess: isQueued => {
        if (!isQueued) {
          toast({ title: 'Already gone', description: 'That photo was swept or put back elsewhere.', variant: 'destructive' });
          return;
        }
        onRestore(photo.url);
        toast({ title: 'Photo put back', description: 'Save the product to keep it.' });
      },
      onError: error => toast({ title: 'Not put back', description: adminErrorMessage(error), variant: 'destructive' }),
    });
  }

  const Chevron = isOpen ? ChevronDown : ChevronRight;

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(open => !open)}
      >
        <Chevron className="h-3.5 w-3.5" aria-hidden="true" />
        Recently removed photos
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2">
          {list.isLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          {list.isError && <p className="text-xs text-destructive">{adminErrorMessage(list.error)}</p>}
          {list.isSuccess && photos.length === 0 && (
            <p className="text-xs text-muted-foreground">No removed photos are waiting to be deleted.</p>
          )}
          <ul className="grid grid-cols-4 gap-2">
            {photos.map(photo => (
              <li key={photo.path} className="space-y-1">
                <img src={photo.url} alt="" loading="lazy" className="aspect-square w-full rounded-md border border-border object-cover" />
                <p className="text-[10px] text-muted-foreground">Deleted after {DAY.format(new Date(photo.sweepAfter))}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-full text-xs"
                  disabled={restore.isPending}
                  onClick={() => putBack(photo)}
                >
                  <Undo2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  Put back
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
