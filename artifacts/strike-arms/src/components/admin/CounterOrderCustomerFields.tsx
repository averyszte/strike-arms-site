import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckoutField } from '@/components/cart/CheckoutField';
import {
  COUNTER_CHANNELS,
  COUNTER_PAYMENT_METHODS,
  ORDER_CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/lib/order-display';
import type { CounterOrderFieldErrors } from '@/lib/counter-order-draft';
import type { CounterOrderDraft, OrderChannel, PaymentMethod } from '@/types/order';

/**
 * Who the sale is for and how it was paid.
 *
 * Email and the address block are only required once something is being
 * posted, which is the same line the database draws. A cash walk-in who gives
 * no details is a real sale, and a synthetic placeholder address would poison
 * the customer list to avoid saying so.
 *
 * CheckoutField is borrowed from the storefront rather than duplicated; it is
 * a labelled input with an error slot and nothing checkout-specific in it.
 */

type CounterOrderCustomerFieldsProps = {
  draft: CounterOrderDraft;
  errors: CounterOrderFieldErrors;
  hasDeliveryLines: boolean;
  onPatch: (update: Partial<CounterOrderDraft>) => void;
};

export function CounterOrderCustomerFields({
  draft,
  errors,
  hasDeliveryLines,
  onPatch,
}: CounterOrderCustomerFieldsProps) {
  return (
    <div className="space-y-4">
      <CheckoutField
        id="counter-customer-name"
        label="Customer name"
        value={draft.customerName}
        error={errors.customerName}
        required
        onChange={(customerName) => onPatch({ customerName })}
      />

      <CheckoutField
        id="counter-customer-email"
        label={hasDeliveryLines ? 'Email' : 'Email (optional)'}
        type="email"
        value={draft.customerEmail}
        error={errors.customerEmail}
        required={hasDeliveryLines}
        onChange={(customerEmail) => onPatch({ customerEmail })}
      />

      <CheckoutField
        id="counter-customer-phone"
        label="Phone (optional)"
        type="tel"
        value={draft.customerPhone}
        onChange={(customerPhone) => onPatch({ customerPhone })}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="counter-channel">Taken</Label>
          <Select
            value={draft.channel}
            onValueChange={(channel) => onPatch({ channel: channel as OrderChannel })}
          >
            <SelectTrigger id="counter-channel" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTER_CHANNELS.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {ORDER_CHANNEL_LABELS[channel]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="counter-payment-method">Paid by</Label>
          <Select
            value={draft.paymentMethod}
            onValueChange={(method) => onPatch({ paymentMethod: method as PaymentMethod })}
          >
            <SelectTrigger id="counter-payment-method" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTER_PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasDeliveryLines && (
        <fieldset className="space-y-3 rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-medium text-foreground">Deliver to</legend>

          <CheckoutField
            id="counter-shipping-line1"
            label="Address line 1"
            value={draft.shippingLine1}
            error={errors.shippingLine1}
            required
            onChange={(shippingLine1) => onPatch({ shippingLine1 })}
          />
          <CheckoutField
            id="counter-shipping-line2"
            label="Address line 2 (optional)"
            value={draft.shippingLine2}
            onChange={(shippingLine2) => onPatch({ shippingLine2 })}
          />
          <CheckoutField
            id="counter-shipping-city"
            label="Town or city"
            value={draft.shippingCity}
            error={errors.shippingCity}
            required
            onChange={(shippingCity) => onPatch({ shippingCity })}
          />
          <CheckoutField
            id="counter-shipping-county"
            label="County (optional)"
            value={draft.shippingCounty}
            onChange={(shippingCounty) => onPatch({ shippingCounty })}
          />
          <CheckoutField
            id="counter-shipping-eircode"
            label="Eircode"
            value={draft.shippingEircode}
            error={errors.shippingEircode}
            required
            onChange={(shippingEircode) => onPatch({ shippingEircode })}
          />
        </fieldset>
      )}

      <div>
        <Label htmlFor="counter-notes">Notes (optional)</Label>
        <Textarea
          id="counter-notes"
          value={draft.notes}
          rows={2}
          className="mt-1.5"
          onChange={(event) => onPatch({ notes: event.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="counter-age-verified"
          checked={draft.ageVerified}
          onCheckedChange={(checked) => onPatch({ ageVerified: checked === true })}
        />
        <Label htmlFor="counter-age-verified" className="text-sm font-normal">
          Age checked in person
        </Label>
      </div>
    </div>
  );
}
