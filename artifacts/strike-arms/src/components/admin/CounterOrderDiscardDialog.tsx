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

type CounterOrderDiscardDialogProps = {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
};

/**
 * Asked before a half-rung counter sale is thrown away (N-079), so a click
 * outside the sheet or Escape with a customer waiting does not lose it.
 */
export function CounterOrderDiscardDialog({ open, onKeep, onDiscard }: CounterOrderDiscardDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onKeep()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard this sale?</AlertDialogTitle>
          <AlertDialogDescription>
            The products and customer details entered here will be lost. Nothing has been recorded yet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={onDiscard}>Discard sale</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
