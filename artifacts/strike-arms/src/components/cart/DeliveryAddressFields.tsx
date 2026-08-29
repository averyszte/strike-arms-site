import { CheckoutField } from '@/components/cart/CheckoutField';
import type { CheckoutFieldErrors } from '@/lib/checkout-validation';
import type { CheckoutDetails } from '@/types/cart';

type DeliveryAddressFieldsProps = {
  details: CheckoutDetails;
  errors: CheckoutFieldErrors;
  onChange: (patch: Partial<CheckoutDetails>) => void;
};

export function DeliveryAddressFields({
  details,
  errors,
  onChange,
}: DeliveryAddressFieldsProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-foreground">Delivery address</legend>

      <CheckoutField
        id="shipping-name"
        label="Name on the parcel"
        value={details.shippingName}
        autoComplete="shipping name"
        onChange={(shippingName) => onChange({ shippingName })}
      />

      <CheckoutField
        id="shipping-line1"
        label="Address line 1"
        value={details.shippingLine1}
        error={errors.shippingLine1}
        autoComplete="shipping address-line1"
        required
        onChange={(shippingLine1) => onChange({ shippingLine1 })}
      />

      <CheckoutField
        id="shipping-line2"
        label="Address line 2"
        value={details.shippingLine2}
        autoComplete="shipping address-line2"
        onChange={(shippingLine2) => onChange({ shippingLine2 })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CheckoutField
          id="shipping-city"
          label="Town or city"
          value={details.shippingCity}
          error={errors.shippingCity}
          autoComplete="shipping address-level2"
          required
          onChange={(shippingCity) => onChange({ shippingCity })}
        />

        <CheckoutField
          id="shipping-county"
          label="County"
          value={details.shippingCounty}
          autoComplete="shipping address-level1"
          onChange={(shippingCounty) => onChange({ shippingCounty })}
        />
      </div>

      <CheckoutField
        id="shipping-eircode"
        label="Eircode"
        value={details.shippingEircode}
        error={errors.shippingEircode}
        autoComplete="shipping postal-code"
        required
        onChange={(shippingEircode) => onChange({ shippingEircode })}
      />
    </fieldset>
  );
}
