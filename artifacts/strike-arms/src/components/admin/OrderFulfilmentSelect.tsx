import { useState } from 'react';

import { OrderCancelDialog } from '@/components/admin/OrderCancelDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fulfillmentChoices } from '@/lib/order-transitions';
import type { FulfillmentStatus, Order } from '@/types/order';

interface Props {
  order: Order;
  onChange: (status: FulfillmentStatus) => void;
}

/**
 * The fulfilment status picker on the table and the detail sheet. Moves the
 * database would refuse (migration 025) are shown but disabled, so the admin
 * can see the state exists without being able to pick it. Steps that email
 * the customer say so, so a mis-click is not a surprise. Cancelling asks
 * first, and offers the refund for a paid order (M-030), wherever the picker
 * is used.
 */
export function OrderFulfilmentSelect({ order, onChange }: Props) {
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  function handleChange(status: FulfillmentStatus) {
    if (status === 'cancelled') setIsConfirmingCancel(true);
    else onChange(status);
  }

  return (
    <>
      <Select
        value={order.fulfillmentStatus}
        onValueChange={(value) => handleChange(value as FulfillmentStatus)}
      >
        <SelectTrigger className="h-7 w-48 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fulfillmentChoices(order).map((choice) => (
            <SelectItem
              key={choice.value}
              value={choice.value}
              disabled={!choice.isAllowed}
              className="text-xs"
            >
              {choice.label}
              {choice.isEmailed && choice.isAllowed && (
                <span className="ml-1.5 text-muted-foreground">(emails customer)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isConfirmingCancel && (
        <OrderCancelDialog
          order={order}
          open={isConfirmingCancel}
          onClose={() => setIsConfirmingCancel(false)}
          onCancel={() => onChange('cancelled')}
        />
      )}
    </>
  );
}
