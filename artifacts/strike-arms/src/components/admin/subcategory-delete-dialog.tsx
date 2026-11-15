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
import { useDeleteSubcategory } from '@/hooks/use-delete-subcategory';
import { useToast } from '@/hooks/use-toast';
import { adminErrorMessage } from '@/lib/admin-error-message';
import type { Subcategory } from '@/types/category';

type Props = {
  deleting: Subcategory | null;
  onClose: () => void;
};

/** Confirms a subcategory delete; the database refuses it while a product still uses it. */
export function SubcategoryDeleteDialog({ deleting, onClose }: Props) {
  const deleteSubcategory = useDeleteSubcategory();
  const { toast } = useToast();

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSubcategory.mutateAsync(deleting.id);
      toast({ title: 'Subcategory deleted' });
    } catch (error) {
      toast({
        title: 'Not deleted',
        description: adminErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      onClose();
    }
  }

  return (
    <AlertDialog open={!!deleting} onOpenChange={o => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete subcategory?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{deleting?.name}&rdquo; will be removed. If any product still uses it, the
            delete is refused: move those products to another subcategory, or archive them,
            first.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void handleDelete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
