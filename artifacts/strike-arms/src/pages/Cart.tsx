import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { CartChangesNotice } from '@/components/cart/CartChangesNotice';
import { CartLineRow } from '@/components/cart/CartLineRow';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { FulfillmentChoice } from '@/components/cart/FulfillmentChoice';
import { useCart } from '@/hooks/use-cart';
import { useCartFreshness } from '@/hooks/use-cart-freshness';
import { useCartPricing } from '@/hooks/use-cart-pricing';
import { useCheckout } from '@/hooks/use-checkout';
import { SITE_URL } from '@/lib/site-config';
import { CARD_TITLE, PAGE_WIDTHS, PANEL } from '@/lib/storefront-styles';

const TITLE = 'Your Cart — Strike Arms Airsoft Dublin';
const DESCRIPTION =
  'Review your cart, choose collection in Swords or delivery across Ireland, and check out securely.';

export default function Cart() {
  const { lines, basics, wantsDelivery, setWantsDelivery, setQuantity, removeLine } = useCart();
  const pricing = useCartPricing();
  const cartChanges = useCartFreshness();
  const { startCheckout, isSubmitting, error } = useCheckout();

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/cart`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageHero crumbs={[{ label: 'Cart' }]} eyebrow="Checkout" title="Your cart" isCompact />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <CartChangesNotice changes={cartChanges} />
        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <ul className="border-t border-border/60">
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

              <div className={`${PANEL} p-5`}>
                <h2 className={`${CARD_TITLE} mb-4 text-lg`}>Checkout</h2>
                <CheckoutForm
                  wantsDelivery={wantsDelivery && basics.hasShippableItems}
                  isSubmitting={isSubmitting}
                  submitError={error}
                  onSubmit={(details, turnstileToken) => startCheckout(lines, details, turnstileToken)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
