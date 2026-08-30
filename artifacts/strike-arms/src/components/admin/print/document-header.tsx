import { format } from 'date-fns';
import { BUSINESS } from '@/lib/site-config';
import { formatOrderNumber } from '@/lib/order-display';
import { ORDER_DOCUMENT_LABELS, type OrderDocumentKind } from '@/lib/order-document';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  kind: OrderDocumentKind;
}

export function DocumentHeader({ order, kind }: Props) {
  return (
    <header className="flex items-start justify-between gap-8 border-b-2 border-black pb-4">
      <div>
        <p className="text-lg font-bold uppercase tracking-wide">{BUSINESS.name}</p>
        <p className="mt-1 text-xs leading-relaxed">
          {BUSINESS.streetAddress}
          <br />
          {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
          <br />
          {BUSINESS.telephone}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold uppercase tracking-wide">{ORDER_DOCUMENT_LABELS[kind]}</p>
        <p className="mt-1 text-xs">
          {formatOrderNumber(order.orderNumber)}
          <br />
          {format(new Date(order.createdAt), 'dd MMM yyyy')}
        </p>
      </div>
    </header>
  );
}
