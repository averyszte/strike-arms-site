import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { CartLineRow } from '@/components/cart/CartLineRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { FulfillmentChoice } from '@/components/cart/FulfillmentChoice';
import { useCart } from '@/hooks/use-cart';
import { useCartPricing } from '@/hooks/use-cart-pricing';
import { useCheckout } from '@/hooks/use-checkout';
import { SITE_URL } from '@/lib/site-config';

const TITLE = 'Your Cart — Strike Arms Airsoft Dublin';
const DESCRIPTION =
  'Review your cart, choose collection in Swords or delivery across Ireland, and check out securely.';

export default function Cart() {
  const { lines, basics, wantsDelivery, setWantsDelivery, setQuantity, removeLine } = useCart();
  const pricing = useCartPricing();
  const { startCheckout, isSubmitting, error } = useCheckout();

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/cart`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6 md:py-12">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Your cart</h1>

        {lines.length === 0 ? (
          <div className="mt-8">
            <EmptyCart />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <ul className="border-t border-border">
                {lines.map((line) => (
                  <CartLineRow
                    key={line.productId}
                    line={line}
                    wantsDelivery={wantsDelivery}
                    onQuantityChange={setQuantity}
                    onRemove={removeLine}
                  />
                ))}
              </ul>

              <div className="mt-8">
                <FulfillmentChoice
                  wantsDelivery={wantsDelivery}
                  hasShippableItems={basics.hasShippableItems}
                  hasPickupItems={basics.hasPickupItems}
                  onChange={setWantsDelivery}
                />
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <CartSummary basics={basics} pricing={pricing} wantsDelivery={wantsDelivery} />

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Checkout</h2>
                <CheckoutForm
                  wantsDelivery={wantsDelivery && basics.hasShippableItems}
                  isSubmitting={isSubmitting}
                  submitError={error}
                  onSubmit={(details) => startCheckout(lines, details)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
