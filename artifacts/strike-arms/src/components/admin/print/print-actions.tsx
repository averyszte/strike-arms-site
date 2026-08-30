import { FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  orderId: string;
}

/**
 * Both documents open in a new tab so the admin does not lose their place in
 * the orders list, and so closing the print view puts them back where they
 * were rather than at the top of a refetched table.
 */
export function PrintActions({ orderId }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/admin/orders/${orderId}/print`} target="_blank" rel="noreferrer">
          <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Packing slip
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`/admin/orders/${orderId}/print?doc=invoice`} target="_blank" rel="noreferrer">
          <FileText className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Invoice
        </a>
      </Button>
    </div>
  );
}
