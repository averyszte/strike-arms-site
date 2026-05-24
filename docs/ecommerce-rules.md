# Ecommerce Rules

Non-negotiable parameters for building the Strike Arms ecommerce backend. Ecommerce is the easiest software to get catastrophically wrong because every bug shows up as either lost money, fraud, or a furious customer. Shopify spent ten years and a billion dollars making the boring parts work. We're building a focused click-and-collect version, so we need to be deliberate.

Most of these are not optional. The few that are will be flagged.

## 1. Money handling

Will break in horrifying ways if wrong.

- **Prices stored as integer cents.** Never floats. `0.1 + 0.2 !== 0.3` in JavaScript. €19.99 is `1999`, not `19.99`. Format to display only at the last moment.
- **All totals calculated server-side, never client-side.** The cart sends product IDs and quantities. The server looks up current prices, computes the total, and that's the only number that touches Stripe. Never trust a "total" sent from the browser.
- **Currency is locked.** Hardcode EUR. Even if multiple currencies are supported later, the server picks the currency, not the client.
- **VAT-inclusive display.** Irish consumers expect the price they see to be the price they pay. Display "€19.99" with "VAT included" somewhere. Stripe Tax handles the calculation; the display logic is on us.
- **Rounding rule.** Pick one (banker's rounding is standard) and use it everywhere. Inconsistent rounding causes €0.01 discrepancies that look like fraud.
- **Idempotency keys on every Stripe call.** If a network hiccup causes a retry, you must not charge twice. Stripe supports this natively. Use it.

## 2. Order integrity

Order data must be immutable after the customer pays.

- **Orders are write-once.** Once placed, do not edit line items, prices, or quantities. Refunds and cancellations are new records that reference the original order, not edits to it.
- **Snapshot product data at order time.** Don't store `order.product_id = 42` and look up `products[42].price` later. Copy the name, SKU, price, and image into the order_items table at creation. If the product gets edited, deleted, or repriced next week, the historical order is still correct.
- **Snapshot customer data at order time.** Same reasoning. If the customer changes their address tomorrow, last week's order still ships to where it was supposed to.
- **Order status is a state machine.** Define every legal transition: `pending → paid → ready_for_pickup → picked_up → completed`. Or `pending → cancelled`. Or `paid → refunded`. Reject any transition that isn't in the diagram. No "let me just update this field" admin operations.
- **Every status change is logged.** Who, when, why, from-state, to-state. Audit trail is non-negotiable.

## 3. Inventory

Where click-and-collect gets especially dangerous.

- **Inventory writes are atomic.** Database transaction or it doesn't happen. The classic bug: two customers buy the last item at the same time, both succeed, you have 1 customer with no product. Use `UPDATE inventory SET count = count - 1 WHERE product_id = X AND count > 0` (single SQL statement, conditional).
- **Reserve stock at the start of checkout, not at the end.** When a customer hits "checkout," decrement available stock. If they abandon, release it after 15-30 minutes. Otherwise customer A is paying Stripe while customer B grabs the last item.
- **Reserves expire.** Background job that releases stale reservations. Otherwise inventory drifts.
- **Stock count vs availability are different concepts.** `available = on_hand - reserved - allocated_to_pickup`. Display "available." Manage "on_hand" in admin.
- **For click-and-collect:** stock is physical. If two customers reserve the last one online, the second shows up to an apology. Reserve aggressively, release fast.
- **Show "Low stock" or "In stock" rather than exact counts** unless you trust the counts to be perfect. "3 left!" when there's actually 7 is worse than "In stock."

## 4. Cart handling

- **Cart is ephemeral until checkout.** Store in `localStorage`. Persisting carts to a database is mostly noise until you have abandoned-cart email recovery.
- **Re-validate at checkout entry.** The cart was filled an hour ago, a day ago, a week ago. Prices may have changed. Products may be gone. Stock may be zero. Before charging, re-fetch everything and show the customer any changes.
- **Cart-to-checkout transition is explicit.** "Review your order" page shows the current truth. Customer confirms. Then payment intent is created.
- **Handle removed products gracefully.** If a product in the cart no longer exists, remove it with a notice. Don't crash.
- **Two-tab problem.** A customer with two open tabs can add the same item twice. Cart UI should resync on focus, or quantities should be additive not destructive.

## 5. Payment flow (Stripe specifics)

- **Use Stripe Checkout (hosted page), not Elements.** Drastically reduces PCI scope. The customer leaves your site, pays on Stripe's, comes back. Less surface area for things to break.
- **Webhook is the source of truth, not the redirect.** When Stripe redirects the user back to your `/success` page, do NOT mark the order as paid. The redirect can be missed (user closes tab, network drops). Mark the order as paid only when Stripe's webhook fires `checkout.session.completed`.
- **Webhook signature verification is mandatory.** Otherwise anyone can POST a fake "this order was paid" event to your endpoint.
- **Webhooks must be idempotent.** Stripe will retry the same event multiple times under failure conditions. Receiving the same `event.id` twice must not double-credit anything. Store the event_id; ignore duplicates.
- **Webhook handlers must respond in <30 seconds.** Process async, respond fast. Stripe gives up and retries if you're slow.
- **3D Secure is automatic via Checkout** for EU cards. Don't disable.
- **Refunds go through Stripe.** Never just update your DB to say "refunded." Issue the refund via Stripe, listen for the `charge.refunded` webhook, update your DB from that event.

## 6. Click-and-collect specifics

The new layer Shopify doesn't fully solve.

- **Order has a fulfillment method:** `pickup` vs `delivery`. Routing logic depends on it.
- **Pickup-ready notification.** Email + (optional) SMS the moment the order is marked ready. Customer expectations: minutes to hours, not days.
- **Pickup window.** Decide: any time during store hours, or scheduled slot? "Any time during hours" is simpler. Slots add complexity (slot inventory, no-shows) but reduce in-store crowding.
- **Store hours validation.** Customer can't book a pickup outside hours. Frontend hides invalid slots; backend re-validates.
- **Order expiry policy.** If a customer doesn't pick up in N days, do you cancel and restock? Refund automatically or only on request? Document the policy and enforce it.
- **Identity verification at pickup.** Order number + customer name + photo ID. Especially for airsoft (18+ legal requirement). The staff process is part of the system.
- **Manual mark-as-ready by admin.** Store staff opens admin, finds order, clicks "Mark ready," customer auto-notified. Make this one click. If it's three clicks they'll forget.
- **Mark-as-collected workflow.** When customer picks up: staff confirms ID, marks order as collected. This closes the loop. Otherwise orders sit in "ready" forever.
- **No-show handling.** After N days of "ready, not collected," staff get a daily digest of stale orders. They decide to refund and restock or contact customer.

## 7. Security

Not optional.

- **HTTPS only. HSTS header.** Cloudflare handles this.
- **Rate limit checkout endpoints.** Stops credit card testing attacks where someone iterates stolen card numbers against your site.
- **Rate limit login.** Stops account takeover.
- **Server-side authorization on every action.** "Is this customer allowed to view this order?" "Is this admin allowed to refund?" Check on the server. Frontend hiding a button is not security.
- **RLS (Row Level Security) at the database level.** Customer A's query for `orders` should be physically incapable of returning customer B's data. Supabase RLS makes this clean.
- **Never trust the client for anything financial.** Repeat it. The client is hostile. The browser can be modified. The total comes from the server.
- **PCI compliance:** by using Stripe Checkout, you're in the smallest possible scope (SAQ A). Don't break that by accepting card info anywhere on your site.
- **CSRF protection** on cookie-based auth.
- **Don't log sensitive data.** No credit card numbers in logs (Stripe handles this). No customer passwords (you don't see them with Supabase Auth). No full session tokens.

## 8. Legal & compliance (Ireland)

- **Irish VAT 23%** standard rate for most goods. Stripe Tax handles calculation; we handle display.
- **VAT-registered threshold:** €75k/year for goods. Once over, you need a VAT number on invoices. Below that, no VAT charged, but no VAT reclaim either.
- **14-day cooling-off period** for distance sales (online orders). Click-and-collect for in-store pickup may fall under different rules (in-person sale once collected). Worth getting actual legal advice.
- **Age verification: airsoft is 18+ in Ireland.** Confirm at checkout. Log the confirmation (timestamp, customer ID). Verify ID at pickup. Not optional.
- **GDPR:**
  - Privacy policy explaining what data you collect and why
  - Cookie consent (only required with tracking cookies; Cloudflare Web Analytics doesn't use any)
  - Right to access (customer can request their data)
  - Right to deletion (with exceptions: order records must be kept 6 years for Revenue)
  - Data Processing Agreement with Stripe, Supabase, Resend (sign their standard ones)
- **Terms of Service, Returns Policy, Privacy Policy** linked from every page footer. Real legal documents, not stubs. Termly or a solicitor.

## 9. Email & notifications

The customer experience.

- **Order confirmation: instant.** Triggered by webhook, sent via Resend. Order #, items, total, pickup instructions.
- **Pickup ready: instant when admin clicks ready.** Subject line "Your order is ready for collection."
- **Refund issued: instant when refund webhook fires.**
- **Order shipped (if delivery added later): on dispatch.**
- **SPF, DKIM, DMARC** on strikearms.ie. Without these, emails land in spam.
- **From address is a real domain you own.** Not `no-reply@strikearms.ie` (looks spammy). Use `orders@strikearms.ie` with replies going to a real inbox.
- **Email templates branded.** Logo, colors, tone. Generic "Order Confirmation" emails feel cheap.

## 10. Admin operations

- **Search orders by:** order #, customer name, email, phone, item SKU. Common workflow when someone calls the shop.
- **Single-click status updates.** Ready, collected, cancelled. No multi-step modals for routine actions.
- **Partial refund support.** Customer returns 1 of 3 items. Stripe supports this. Your UI should too.
- **Manual order creation.** For phone-in orders. Admin creates an order on behalf of a customer, marks it paid (cash/manual), enters details. Common for local shops.
- **Inventory adjustments with reason.** "Restock from supplier," "damaged," "found extra in back room." Don't allow silent stock edits.
- **Sales export (CSV).** For the accountant. Date range to CSV with order details, totals, VAT breakdown.
- **Audit log view.** Who refunded what, who marked which order ready, who adjusted inventory.

## 11. Reconciliation

The boring stuff that prevents disasters.

- **Daily: Stripe Dashboard total = sum of orders in DB.** If they diverge, something's wrong. Build a daily report.
- **Weekly: physical inventory count vs system inventory.** Cycle counts catch drift before it becomes a crisis.
- **Monthly: VAT total in system vs Stripe Tax report.** For Revenue filing.

## 12. Edge cases to consciously handle

These will happen. Plan responses now, not when they happen at 2 AM.

| Edge case | Required behavior |
|---|---|
| Stock runs out between cart-add and checkout | Re-validate at checkout entry, show "no longer available", offer cart adjustment |
| Customer pays, then store closes / can't fulfill | Manual cancellation + refund + apology email template |
| Webhook fires before customer sees /success page | Order is paid, /success page is informational only, don't depend on it |
| Two browser tabs of the same cart | Cart syncs on focus, or backend deduplicates by product_id |
| Logged-out user fills cart, then signs in | Merge anonymous cart into user's account on login |
| Customer didn't pick up for 2 weeks | Stale-order digest to admin, refund-and-restock workflow |
| Customer picks up wrong item | Manual order adjustment + audit log entry |
| Stripe disputes a charge (chargeback) | Webhook fires, order flagged, admin can respond with evidence |
| Customer says "I never got my order email" | Resend from admin panel button |
| Wrong product photo / description shown | Re-fetch on order display; snapshot is product name + image URL. If URL 404s, show placeholder |
| Currency precision | Use a money library or always use cents. Never `parseFloat(price.toString())` |

## 13. What Shopify does that we're consciously not building

Known scope cuts. If client asks for any of them, it's a Change Request with extra cost.

- Abandoned cart email recovery (skip v1)
- Discount codes (skip v1 unless client insists, then percentage-only)
- Bundles / variants (covered by simple product table)
- Subscriptions (skip, not relevant)
- Multi-channel (POS sync) (skip)
- Gift cards (skip v1)
- Wishlists (skip)
- Customer reviews on products (skip v1, review acquisition via post-purchase email instead)
- Affiliate tracking (skip)
- Advanced reporting (skip, basic sales export is enough)

## The "this can go very wrong" shortlist

If you only memorize five things from this entire document:

1. **Server-side total calculation, always.** Client sends product IDs + quantities. Server decides the price.
2. **Webhook is the source of truth for payment status.** Not the redirect URL.
3. **Atomic inventory writes.** Single SQL statement with conditional, in a transaction.
4. **Idempotency on all payment operations.** Stripe gives you the tools; use them.
5. **Snapshot order data at creation.** Don't reference live products/customers; copy.

Get those five right and you've avoided about 80% of the catastrophic failure modes.
