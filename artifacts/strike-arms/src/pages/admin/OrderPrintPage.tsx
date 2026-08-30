import { Helmet } from 'react-helmet-async';
import { useRoute, useSearch } from 'wouter';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentHeader } from '@/components/admin/print/document-header';
import { PackingSlip } from '@/components/admin/print/packing-slip';
import { Invoice } from '@/components/admin/print/invoice';
import { useOrder } from '@/hooks/use-orders';
import { ORDER_DOCUMENT_LABELS, readDocumentKind } from '@/lib/order-document';
import { formatOrderNumber } from '@/lib/order-display';

/**
 * A printable order document, rendered outside the admin chrome.
 *
 * Printing is not triggered on load. Landing here by a stray click and having
 * the browser throw up a print dialog is startling, and on a shared machine it
 * can quietly send a customer's address to whatever printer was last used.
 */
export default function OrderPrintPage() {
  const [, params] = useRoute('/admin/orders/:orderId/print');
  const kind = readDocumentKind(useSearch());
  const { data: order, isLoading } = useOrder(params?.orderId ?? null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">That order no longer exists.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <a href="/admin/orders">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to orders
          </a>
        </Button>
      </div>
    );
  }

  const title = `${ORDER_DOCUMENT_LABELS[kind]} ${formatOrderNumber(order.orderNumber)}`;

  return (
    <>
      <Helmet>
        {/* The tab name becomes the default filename when this is saved as a
            PDF, so it is worth being the order number rather than "Admin". */}
        <title>{title}</title>
      </Helmet>

      <div className="mx-auto max-w-[210mm] px-6 py-6 print:max-w-none print:p-0">
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Button asChild variant="ghost" size="sm">
            <a href="/admin/orders">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to orders
            </a>
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Print
          </Button>
        </div>

        {/* Forced to a light palette: the admin follows the operating system's
            dark mode, and a dark card prints as a solid black page. */}
        <article className="space-y-6 bg-white p-8 text-black shadow-sm print:p-0 print:shadow-none">
          <DocumentHeader order={order} kind={kind} />
          {kind === 'invoice' ? <Invoice order={order} /> : <PackingSlip order={order} />}
        </article>
      </div>
    </>
  );
}
