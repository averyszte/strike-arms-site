/**
 * Schema.org Product JSON-LD for a product page (N-006). A pure builder, like
 * the rest of structured-data.ts, which re-exports it.
 *
 * Only fields the catalogue really has are emitted:
 *   - no `image` when the product has no photos (an empty array is invalid);
 *   - no `brand` for the placeholder brands such as "unbranded";
 *   - no `sku`, because the only identifier is the row's UUID, which is not
 *     a merchant SKU;
 *   - no return policy until the Returns terms are signed off (N-103).
 *
 * Shipping follows the store rules: an item marked collection-only says it
 * does not ship; everything else ships to the Republic of Ireland only, at the
 * rates in the store_settings row, when the caller has them, within the
 * working days the Delivery page promises. While
 * delivery is paused (IS_DELIVERY_ENABLED false) every item is collect in
 * store, so every item says it does not ship.
 */
import type { Product } from '@/types/product';
import type { StoreRates } from '@/types/store-settings';
import type { JsonLdObject } from '@/lib/structured-data';
import { DELIVERY_WORKING_DAYS_MAX, SITE_URL, toAbsoluteUrl } from '@/lib/site-config';
import { IS_DELIVERY_ENABLED } from '@/lib/delivery-availability';
import { isPreLoved } from '@/lib/product-condition';
import { getBrandName, isListedBrand } from '@/lib/brands';
import { effectivePriceCents } from '@/lib/effective-price';
import { calculateShippingCents } from '@/lib/shipping';
import { formatCentsPlain } from '@/lib/format-price';

const SHIPPING_COUNTRY = 'IE';

/** Up to a day to dispatch, then 1 to 2 in transit: the 3 working days promised. */
const DELIVERY_TIME = {
  '@type': 'ShippingDeliveryTime',
  handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
  transitTime: {
    '@type': 'QuantitativeValue',
    minValue: 1,
    maxValue: DELIVERY_WORKING_DAYS_MAX - 1,
    unitCode: 'DAY',
  },
} as const;

const IRELAND_DESTINATION = {
  '@type': 'DefinedRegion',
  addressCountry: SHIPPING_COUNTRY,
} as const;

/**
 * One OfferShippingDetails, or undefined when it cannot be stated truthfully:
 * a postable item with no rates to hand says nothing rather than guess.
 */
export function buildShippingDetails(
  product: Product,
  priceCents: number,
  rates: StoreRates | undefined,
): JsonLdObject | undefined {
  if (!product.isShippable || !IS_DELIVERY_ENABLED) {
    return {
      '@type': 'OfferShippingDetails',
      shippingDestination: IRELAND_DESTINATION,
      doesNotShip: true,
    };
  }
  if (!rates) return undefined;
  return {
    '@type': 'OfferShippingDetails',
    shippingDestination: IRELAND_DESTINATION,
    shippingRate: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: formatCentsPlain(calculateShippingCents(priceCents, rates)),
    },
    deliveryTime: DELIVERY_TIME,
  };
}

export function buildProductSchema(product: Product, rates?: StoreRates): JsonLdObject {
  const priceCents = effectivePriceCents(product.price, product.salePrice);
  const shippingDetails = buildShippingDetails(product, priceCents, rates);

  const offer: JsonLdObject = {
    '@type': 'Offer',
    priceCurrency: 'EUR',
    price: formatCentsPlain(priceCents),
    availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    // Was hardcoded to NewCondition, which made every pre-loved rifle a false
    // claim in the rich result Google reads.
    itemCondition: isPreLoved(product.condition)
      ? 'https://schema.org/UsedCondition'
      : 'https://schema.org/NewCondition',
    url: `${SITE_URL}/products/${product.slug}`,
  };
  if (shippingDetails) offer.shippingDetails = shippingDetails;

  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
  };
  if (isListedBrand(product.brand)) {
    schema.brand = { '@type': 'Brand', name: getBrandName(product.brand) };
  }
  if (product.images.length > 0) {
    schema.image = product.images.map((image) => toAbsoluteUrl(image));
  }
  schema.offers = offer;
  return schema;
}
