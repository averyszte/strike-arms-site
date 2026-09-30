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
 * the customer say so, so a mis-click is not a surprise.
 */
export function OrderFulfilmentSelect({ order, onChange }: Props) {
  return (
    <Select
      value={order.fulfillmentStatus}
      onValueChange={(value) => onChange(value as FulfillmentStatus)}
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
  );
}
