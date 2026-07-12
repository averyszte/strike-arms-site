import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { formatBrand } from '@/lib/format-brand';
import { Button } from '@/components/ui/button';

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2)}`;
}

export function CartDrawer() {
  const { items, removeItem, setQuantity, totalCents, itemCount, isDrawerOpen, closeCart } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
          />

          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-background z-[80] flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-base">Cart ({itemCount})</h2>
              <button
                onClick={closeCart}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                  <Button variant="outline" size="sm" onClick={closeCart} asChild>
                    <Link href="/store">Start shopping</Link>
                  </Button>
                </div>
              ) : (
                items.map(item => {
                  const effectivePrice = item.salePriceCents ?? item.priceCents;
                  return (
                    <div key={item.productId} className="flex gap-3">
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="shrink-0">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1">
                        <Link href={`/products/${item.slug}`} onClick={closeCart}>
                          <p className="text-sm font-medium text-foreground leading-snug hover:text-accent transition-colors line-clamp-2">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatBrand(item.brand)}
                        </p>

                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center border border-border rounded text-xs">
                            <button
                              onClick={() => setQuantity(item.productId, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors leading-none"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-2 select-none">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-muted transition-colors leading-none"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-accent">
                              {formatPrice(effectivePrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(totalCents)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxes and shipping calculated at checkout
                </p>
                <Button className="w-full" size="lg" onClick={closeCart} asChild>
                  <Link href="/cart">View Cart & Checkout</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
