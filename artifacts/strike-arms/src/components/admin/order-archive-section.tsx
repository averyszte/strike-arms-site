import { Archive, ArchiveRestore } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSetOrderArchived } from '@/hooks/use-set-order-archived';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types/order';

/** Archive or restore the order. There is deliberately no delete. */
export function OrderArchiveSection({ order }: { order: Order }) {
  const setArchived = useSetOrderArchived();
  const { toast } = useToast();

  async function handleToggleArchive() {
    const isArchived = !order.isArchived;
    try {
      await setArchived.mutateAsync({ orderId: order.id, isArchived });
    } catch {
      toast({
        title: 'Error',
        description: isArchived ? 'Failed to archive order' : 'Failed to restore order',
        variant: 'destructive',
      });
    }
  }

  return (
    <section className="border-t border-border pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={setArchived.isPending}
        onClick={() => void handleToggleArchive()}
      >
        {order.isArchived ? (
          <ArchiveRestore className="mr-1.5 h-4 w-4" aria-hidden="true" />
        ) : (
          <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
        )}
        {order.isArchived ? 'Restore order' : 'Archive order'}
      </Button>
      {/* There is no delete. An order is the record of money changing
          hands, and archiving is only the admin saying they are done
          with it. */}
      <p className="mt-2 text-xs text-muted-foreground">
        {order.isArchived
          ? 'Restoring puts it back in the working list.'
          : 'Takes it out of the working list. It still counts towards revenue.'}
      </p>
    </section>
  );
}
