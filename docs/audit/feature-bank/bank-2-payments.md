# Feature bank 2: Payments (Stripe Checkout money path)

Scope: create-checkout-session, checkout-status, stripe-webhook, refund-order and order-lookup Edge Functions, the `_shared` modules they use, the SQL behind them, and the client repositories, hooks and success-page polling. Read from code on branch `claude/confident-sammet-18385d` (2026-11-14). Paths are relative to the repo root. `fn/` = `supabase/functions/`, `mig/` = `supabase/migrations/`, `src/` = `artifacts/strike-arms/src/`.

Status key: **working** (code complete, and deployed per docs) / **partial** / **stub** / **not deployed** / **unknown** (deployment or live config not verifiable from the repo). Nothing on this path has had a real end-to-end payment: `docs/current-task.md` says "C3 / C3.1 / C3.2 / C4 are DEPLOYED-UNTESTED", and the one test payment per basket shape is still outstanding. Read "working" as "working in code", not "proven live".

Deployment notes from docs (these may be stale):
- create-checkout-session, stripe-webhook and checkout-status were deployed 2026-09-28. order-lookup was deployed 2026-09-29.
- refund-order is listed as "still outstanding" to deploy, and `charge.refunded` on the Stripe endpoint is still to be confirmed (current-task.md:316-317).
- The two async events have not been ticked on the Stripe endpoint (current-task.md:39).
- Migration 038 in the repo is `038_simple_stock`, but current-task.md:28 calls 038 "indexes". So whether simple stock has been applied to the remote is **unknown**.

---

## 1. Checkout request and guards

| ID | Feature | Files (function / RPC) | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-001 | POST-only endpoint: OPTIONS answered, non-POST gets 405 | fn/create-checkout-session/index.ts (`handle`) | Edge Function | working | verify_jwt=false in fn/config.toml; any origin can call it. Only CORS limits which browsers can read the reply. |
| P-002 | CORS allow-list (strikearms.ie, www, strike-arms-site.pages.dev, localhost:5173) | fn/_shared/cors.ts | - | working | An origin not on the list gets the apex echoed back, not a rejection. Pages preview subdomains (`*.strike-arms-site.pages.dev`) are not on the list. |
| P-003 | Request parsing and validation: attemptId UUID; email regex, lowercased, max 254; ageConfirmed === true | fn/create-checkout-session/parse-request.ts | - | working | The age gate is a client-asserted boolean only. It is stored, never verified. |
| P-004 | Delivery address validation when wantsDelivery: Eircode regex `^[A-Z]\d{2}\s?[A-Z0-9]{4}$`, uppercased; text max 200 | fn/create-checkout-session/parse-request.ts | - | working | Covers Irish Eircodes only. NI or EU addresses cannot be entered (shipping zones are undecided). |
| P-005 | Basket line limits: 1-50 lines, qty 1-20, productId UUID; token max 2048; phone optional | fn/create-checkout-session/parse-request.ts | - | working | Duplicate product lines are allowed. The stock RPC sums them. |
| P-006 | Rate limits: checkout:attempt 5 per 10 min, checkout:all 200 per hour, checkout:ip 20 per hour; over the limit gives 429 | fn/create-checkout-session/guard.ts; fn/_shared/rate-limit.ts (`hit_rate_limit`) | RPC hit_rate_limit, table rate_limit_hits (mig/035) | working | Fails closed: if the RPC errors, checkout gets a 500. The global 200/hour cap lets anyone lock out all checkouts for an hour. |
| P-007 | Rate-limit keys HMAC-SHA256 hashed with SUPABASE_SERVICE_ROLE_KEY | fn/_shared/rate-limit.ts | - | working | Rotating the service-role key resets every window. Harmless. |
| P-008 | Turnstile check, action "checkout" | fn/create-checkout-session/guard.ts; fn/_shared/turnstile.ts | Cloudflare siteverify | unknown | No TURNSTILE_SECRET_KEY gives 503 on every checkout unless ALLOW_INSECURE_NO_CAPTCHA=true. The keys were "done in code, not live" per docs, so checkout may be down live, or it may be running insecure. |
| P-009 | Turnstile hostname check against SITE_HOSTNAME (a comma list) | fn/_shared/turnstile.ts | - | partial | If SITE_HOSTNAME is unset, any hostname passes. |
| P-010 | Turnstile timeout of 8s; unreachable gives 503; rejection gives 403 | fn/_shared/turnstile.ts | - | working | A Cloudflare outage blocks all checkouts. That is fail-closed by design. |
| P-011 | Client IP from the first x-forwarded-for entry, otherwise cf-connecting-ip | fn/_shared/client-ip.ts | - | working | The first XFF entry can be spoofed by the client, so the per-IP limit can be dodged. The attempt limit and the global limit remain. |
| P-012 | Signed-in customer detection: the bearer JWT goes to `admin.auth.getUser`; anon key, anonymous user or error counts as guest | fn/create-checkout-session/signed-in-customer.ts | Supabase Auth | working | Checkout never fails on auth. Sets orders.user_id. |
| P-013 | Client Turnstile widget, token reset after each submit | src/hooks/use-turnstile.ts | VITE_TURNSTILE_SITE_KEY | unknown | Depends on the site key being set in Cloudflare Pages. |

## 2. Pricing, VAT and delivery

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-014 | Server-side basket pricing from products, which ignores client prices | fn/create-checkout-session/order-lines.ts (`priceBasket`) | products table | working | Rejects a product that is missing or `is_published=false` with "no longer available". It does not check `is_archived` here. |
| P-015 | Effective price: sale price if it is not null and less than the list price | order-lines.ts (`effectivePriceCents`); mig/009 effective_price_cents | - | working | Matches the generated column and create_counter_order (mig/038:256-261). |
| P-016 | Per-line fulfilment: delivery if wantsDelivery && is_shippable, otherwise pickup | order-lines.ts | - | working | Every product currently has is_shippable=false (A1.3), so delivery cannot be exercised yet. |
| P-017 | Shipping: 0 if the deliverable subtotal is ≤0 or ≥ threshold, otherwise flat; charged on deliverable lines only | fn/_shared/shipping.ts (`calculateShippingCents`) | store_settings | working | Duplicated in src/lib/shipping.ts and in create_counter_order SQL, so the logic exists in three copies. |
| P-018 | VAT extracted from the gross total: round(gross*rate/(10000+rate)) | fn/_shared/shipping.ts (`vatIncludedCents`) | - | working | The rate is a placeholder (P-019). |
| P-019 | Rates from store_settings row id=1: shipping 650, threshold 7500, VAT 2300 bp | fn/_shared/shipping.ts (`fetchStoreRates`); mig/010:37-41 | store_settings | partial | These are placeholders not confirmed by Alan or the accountant. If the row is missing, the code throws and checkout returns 500, with no fallback. |
| P-020 | Fulfilment method derived from the lines: pickup / delivery / mixed | fn/_shared/shipping.ts (`deriveFulfillmentMethod`) | - | working | |
| P-021 | Client mirror of the totals for the cart display | src/lib/cart-totals.ts, src/lib/shipping.ts, src/hooks/use-cart-pricing.ts | store_settings (public read) | working | Returns null if the rates fail to load. Check that the UI handles null. |
| P-022 | Cart freshness: re-reads price and shippability when the cart opens and says what changed | src/data/cart-freshness-repository.ts, src/hooks/use-cart-freshness.ts | products | partial | Does not read `in_stock`, so an out-of-stock item is only caught at checkout (P-025). |

## 3. Order creation and stock

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-023 | Stale attempt cleanup: abandons earlier pending orders that share the attemptId | fn/create-checkout-session/index.ts:68-85 (`abandonStaleAttempt`); RPC clear_stale_checkout_attempt (mig/028:166-185) | orders | working | Returns the Stripe session ids to expire. |
| P-024 | Expire the old Stripe session for an abandoned attempt | index.ts:68-85 (`stripe.checkout.sessions.expire`) | Stripe | partial | Best effort: an error is only logged. confirm_order_paid accepts 'abandoned' (mig/038:137), so if the old tab pays before or while the expire fails, BOTH orders end up paid. Nothing detects or alerts on this. |
| P-025 | In-stock check before the Stripe session | index.ts:34-56 (`requireInStock`); RPC reserve_order_stock (mig/038:77-110) | products.in_stock | working | 038 only checks the flag and holds nothing. A one-off can be sold twice at once, and nothing re-checks at payment (mig/038:126-138). |
| P-026 | Order row insert (pending/pending, attempt id, user id, address only if not pickup) | fn/create-checkout-session/build-order.ts (`buildOrderInsert`); index.ts | orders (mig/001, 007, 013) | working | order_number is null until paid (mig/007). DB constraints: orders_shipping_address_present, orders_shipping_cents_pickup_zero, orders_customer_email_present. |
| P-027 | order_items insert with snapshot name, slug, image, brand, unit price and per-line method | index.ts | order_items (subtotal_cents generated) | working | product_id is set to null if the product is deleted later, but the snapshot keeps the order readable. |
| P-028 | Abandon the order on any failure after insert | index.ts:159-163 (catch, RPC abandon_order mig/028:138-158) | orders | partial | The abandon_order error is ignored. If it fails, a pending order is left behind, and since 038 there is no sweeper. |
| P-029 | Partial index on checkout_attempt_id where pending | mig/007 | - | working | |

## 4. Stripe Checkout session

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-030 | `stripe.checkout.sessions.create`: mode payment, currency eur, customer_email, expires_at now+30 min | index.ts:134-149 | Stripe API (npm:stripe@17.3.1, apiVersion 2024-11-20.acacia, fetch client) | working | SESSION_MINUTES=30, which is Stripe's minimum. |
| P-031 | Line items via price_data, described "Collect in store" or "Delivered", plus a "Delivery" line if shipping > 0 | build-order.ts (`buildStripeLineItems`) | - | working | The Stripe total should equal orders.total_cents; P-041 checks this. |
| P-032 | success_url `${SITE_URL}/checkout/success?order=<id>&session={CHECKOUT_SESSION_ID}`, cancel_url `${SITE_URL}/cart` | index.ts:134-149 | SITE_URL secret | unknown | SITE_URL was localhost once (current-task.md:214). It must be the apex at launch (launch-runbook.md:28). |
| P-033 | Metadata `{order_id}` on the session AND on payment_intent_data | index.ts:134-149 | - | working | These are the only metadata keys. The refund also sets metadata.order_id. |
| P-034 | Idempotency key `checkout-session:${orderId}` | index.ts:147-148 | Stripe | partial | The comment says "A double-clicked checkout reuses one session". It does not: each request inserts a new order, so the key only covers SDK retries. A double submit makes two orders and two sessions; the client isSubmitting flag and the 5-per-attempt limit soften this. |
| P-035 | Save the session id onto the order | index.ts:153-156 | orders.stripe_session_id (unique) | partial | The update's error is not checked. If it fails, checkout-status never matches (it needs id + session), and the webhook falls back to metadata.order_id, which works. |
| P-036 | Generic failure reply 500 "Checkout is temporarily unavailable"; CheckoutRequestError gives 400 with its message | index.ts | - | working | |
| P-037 | Client: invoke create-checkout-session, then full-page navigate to the Stripe URL | src/data/checkout-repository.ts (`createCheckoutSession`), src/hooks/use-checkout.ts, CheckoutForm.tsx:156 | - | working | The client sets wantsDelivery only if some line is shippable. The shipping name falls back to the customer name. |
| P-038 | Checkout attempt id kept in sessionStorage `strike-arms:checkout-attempt`, with an in-memory fallback | src/data/checkout-attempt-repository.ts | - | working | Reused after a Stripe cancel. A new tab gets a new attempt, so P-024 does not cover two tabs. |

## 5. Webhook

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-039 | Signature verification: raw text body, `constructEventAsync` with STRIPE_WEBHOOK_SECRET; missing or bad signature gives 400 | fn/stripe-webhook/index.ts | Stripe | working | verify_jwt=false (required). |
| P-040 | Event allow-list: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded. Anything else gets 200 `{ignored}` | fn/stripe-webhook/index.ts:29-35 | - | partial | Not handled: charge.refund.updated / refund.failed (a failed refund), charge.dispute.*, payment_intent.*. The two async events are not ticked in the dashboard. |
| P-041 | Event idempotency: claim_stripe_event inserts the id, skipping duplicates; a duplicate gets 200 | index.ts; RPC claim_stripe_event (mig/008) | stripe_event_log | working | |
| P-042 | Release the claim on handler failure, then 500 so Stripe retries | index.ts:~120 (RPC release_stripe_event) | stripe_event_log | partial | The release result is not checked. If the delete fails, Stripe's retry is seen as a duplicate, gets 200, and the event is lost silently. |
| P-043 | Find the order for a session: metadata.order_id first, then stripe_session_id | fn/stripe-webhook/handlers.ts (`findOrderForSession`) | orders | working | |
| P-044 | checkout.session.completed: if payment_status != "paid", wait for the async event | handlers.ts:54-105 (`handleCheckoutCompleted`) | - | working | The async events are not subscribed. That is harmless only while instant methods alone are on (D4). |
| P-045 | Confirm paid: confirm_order_paid(order, payment intent, session) sets paid, paid_at, PI, session and order number | handlers.ts; RPC confirm_order_paid (mig/038:112-150) | orders, order_number_seq | working | Accepts pending OR abandoned. It is also the trigger point for the outbox (P-075). |
| P-046 | Late completed on an expired or failed order goes to an unmatched-payment alert ("its order had already expired") | handlers.ts | payment_alerts | working | Money is taken with no live order. Needs a manual refund from the dashboard card. |
| P-047 | Completed with no order found goes to an unmatched-payment alert (kind no_order) | fn/stripe-webhook/payment-alerts.ts (`recordUnmatchedPayment`) | payment_alerts (mig/029), upsert on stripe_event_id | working | |
| P-048 | Amount or currency mismatch check (eur, amount_total == total_cents), then flag_order | payment-alerts.ts (`mismatchReasons`); RPC flag_order (mig/029) | orders.attention_reason | working | The order is still confirmed paid. The fulfilment guard (mig/025) does not block a flagged order, so it can be shipped. |
| P-049 | checkout.session.expired and async_payment_failed go to expire_order (pending becomes expired) | handlers.ts (`handleCheckoutExpired`); RPC expire_order (mig/029) | orders | working | Failed async payments are recorded as 'expired', not 'failed'. |
| P-050 | charge.refunded goes to record_refund(PI, cumulative amount_refunded, fully refunded = amount_refunded ≥ amount) | handlers.ts (`handleChargeRefunded`); RPC record_refund (mig/025) | orders.refund_cents, refunded_at, status | unknown | Uses greatest(), so it is safe if events arrive out of order. Matches on stripe_payment_intent, which is NOT unique (mig/001). Whether charge.refunded is subscribed is unconfirmed. |
| P-051 | Refund with no matching order goes to resolve_payment_alert(PI) | handlers.ts; RPC resolve_payment_alert (mig/029) | payment_alerts | working | Closes an unmatched-payment alert once it has been refunded in Stripe. |
| P-052 | Audit line per event via console.info | fn/stripe-webhook/index.ts | Supabase logs | working | Not a console.log, so the hard rule is not broken. |

## 6. Order states and numbers

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-053 | payment_status values: pending, paid, refunded, partially_refunded, failed, expired, abandoned | mig/028:70-73 | orders | working | 'failed' is never written by the current code. |
| P-054 | Order number `SA-YYYY-NNNN` assigned at payment from order_number_seq | mig/038:131-135 | order_number_seq | partial | `lpad(x,4,'0')` TRUNCATES values over 4 digits. Sequence value 10000 gives "1000", a duplicate. The unique violation makes confirm_order_paid throw, the webhook 500s on every retry, and a paid order stays pending. The sequence is shared with counter orders and never resets by year. |
| P-055 | Redelivered completed on an already-paid order returns the existing number with no change | mig/038:140-146 | - | working | For a refunded order it returns null, so a late completed does not resurrect it (intended). |
| P-056 | Status change log (payment and fulfilment) | mig/003 `log_order_status_change` trigger | order_status_log | working | changed_by defaults to auth.uid() (mig/025), so it is null for webhook writes. |
| P-057 | Fulfilment guard: cancelled is final, cancel only from pending/ready/packed, lane must match the method, forward moves need paid/partially_refunded | mig/025 `guard_fulfillment_status` | orders | working | Allows fulfilling a fully 'refunded'? No: it needs paid/partially_refunded. A flagged order passes. |
| P-058 | Payment columns are server-only: authenticated may update only fulfillment_status, notes, is_archived, tracking_number | mig/034 | grants | working | |
| P-059 | Attention flag: attention_reason appended and de-duplicated with strpos; attention_raised_at | RPC flag_order (mig/029); columns mig/028 | orders | working | |

## 7. Counter orders (admin, non-Stripe)

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-060 | Counter, phone or till sale: AAL2 check, unpublished products allowed, prices from the catalogue, no delivery of non-shippable items | RPC create_counter_order (mig/038:154-318); src/data/orders-repository.ts:181; src/hooks/use-create-counter-order.ts; components/admin/CounterOrderSheet.tsx | orders, order_items, store_settings | working | Marked paid immediately through confirm_order_paid(null, null), so it shares the number sequence (P-054). Payment methods: cash, card_terminal, bank_transfer, so nothing is reconciled. |
| P-061 | Stale "takes stock" comment | src/hooks/use-create-counter-order.ts:9-11 | - | partial | The comment is wrong since 038. It is cosmetic. |

## 8. Success page polling

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-062 | checkout-status endpoint: UUID orderId plus session `^cs_(test\|live)_...`; the order must match both | fn/checkout-status/index.ts | orders | working | verify_jwt=false, with NO rate limit and NO Turnstile. It needs the order uuid and the session id, so guessing is impractical. Only the number is returned. |
| P-063 | Status mapping: paid (paid, partially_refunded or refunded, plus order_number) / pending (pending or abandoned) / closed / unknown; DB error gives 500 | fn/checkout-status/index.ts | - | working | |
| P-064 | Client poll every 2000 ms, max 30 polls (about 60 s), retry 2 | src/data/checkout-status-repository.ts; src/hooks/use-checkout-confirmation.ts | - | working | |
| P-065 | Confirmation state rules: closed gives unconfirmed; error gives delayed; after 30 polls, unknown gives unconfirmed, otherwise delayed | src/lib/checkout-confirmation.ts | - | working | |
| P-066 | Clear the cart and the attempt id only when the state is paid | use-checkout-confirmation.ts | - | working | A customer who closes the tab before paid keeps the cart. They could pay again through a new attempt; the page warns "do not pay again". |
| P-067 | Success page states: confirming / paid / delayed / unconfirmed, with the order number and a "do not pay again" warning | src/pages/CheckoutSuccess.tsx | - | working | The paid state says "We have emailed your order confirmation", but the email is async through the outbox and Resend is not set up (parked). |
| P-068 | Create-account nudge for guests | CheckoutSuccess.tsx (CreateAccountNudge) | - | working | Hand-off to accounts. |

## 9. Order lookup and tracking

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-069 | Guest order lookup by number `^SA-\d{4}-\d{4,8}$` plus email | fn/order-lookup/index.ts; src/data/order-lookup-repository.ts | orders, order_items, order_status_log | working | Deployed 2026-09-29. A wrong email returns the same as not found. The regex allows 4-8 digits, but P-054 caps numbers at 4. |
| P-070 | Lookup limits: lookup:order 10 per hour, lookup:ip 10 per 10 min; Turnstile action "order-lookup" | fn/order-lookup/index.ts | rate_limit_hits | unknown | Depends on the Turnstile key (P-008). |
| P-071 | Response: status, totals, refund, tracking_number, items, fulfilment history. Never name, address or phone | fn/order-lookup/index.ts | - | working | toLookedUpOrder is shared with my_orders (mig/034). |

## 10. Refunds

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-072 | Admin refund endpoint, verify_jwt=true, `requireAal2Admin` via is_admin_aal2 with the caller token (SUPABASE_ANON_KEY client) | fn/refund-order/index.ts | Supabase Auth, RPC is_admin_aal2 | not deployed | Listed as outstanding (current-task.md:316). |
| P-073 | Refundable check: payment_method stripe, PI present, status paid or partially_refunded, total - refund_cents > 0 | fn/refund-order/index.ts (`loadRefundableOrder`) | orders | not deployed | Counter or cash orders cannot be refunded here (by design). |
| P-074 | Amount: null means the full balance; over the refundable amount is refused, not clamped; reasons duplicate / fraudulent / requested_by_customer; integer > 0 | refund-order/parse-request.ts (`resolveRefundAmount`) | - | not deployed | |
| P-075 | `stripe.refunds.create({payment_intent, amount, reason, metadata:{order_id}})` with idempotency key `refund:${orderId}:${attemptId}` | fn/refund-order/index.ts | Stripe | not deployed | Does NOT write the order. The webhook (P-050) is the only writer, so without charge.refunded the money leaves and the order still reads paid. |
| P-076 | Error mapping: Stripe error gives 400 with its message, Forbidden 403, request 400, anything else 500 | fn/refund-order/index.ts | - | not deployed | |
| P-077 | Admin refund dialog: attemptId from useState(randomUUID) per mount; sends null amount when it equals the full balance; invalidates the orders queries | components/admin/OrderRefundDialog.tsx:46; OrderRefundSection; src/data/refunds-repository.ts; src/hooks/use-refund-order.ts | - | partial | Retrying with a CHANGED amount in the same dialog reuses the key, so Stripe returns an idempotency error. The order view only updates once the webhook lands, so the UI can show stale "paid" briefly. |

## 11. Payment alerts

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-078 | payment_alerts table (kind no_order, unique stripe_event_id, resolved_at); RLS lets AAL2 admins select and update resolved_at | mig/029 | payment_alerts | working | Only one kind exists. A double payment (P-024) does not raise one. |
| P-079 | Dashboard unmatched-payments card: list open alerts, resolve manually | src/data/payment-alerts-repository.ts (`listOpenPaymentAlerts`, `resolvePaymentAlert`); src/hooks/use-payment-alerts.ts; components/admin/dashboard/unmatched-payments-card.tsx | payment_alerts | working | The card was not read in detail. The resolve is a direct table update under RLS. |

## 12. Env, Stripe calls, metadata and idempotency (reference)

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| P-080 | Function secrets (names only): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (refund-order), SITE_URL, TURNSTILE_SECRET_KEY, SITE_HOSTNAME (optional), ALLOW_INSECURE_NO_CAPTCHA (local only). Client: VITE_TURNSTILE_SITE_KEY | fn/_shared/env.ts (`requireEnv`, `optionalEnv`); fn/_shared/supabase-admin.ts | Supabase secrets | unknown | Secrets are read at boot, so a change needs a redeploy. Test and live keys must be switched together (STRIPE_SECRET_KEY plus a webhook secret for the live endpoint). |
| P-081 | Every Stripe API call: checkout.sessions.create, checkout.sessions.expire, refunds.create, webhooks.constructEventAsync | as above | Stripe | - | The only idempotency keys are `checkout-session:<orderId>` and `refund:<orderId>:<attemptId>`. sessions.expire has none (it is idempotent anyway). |
| P-082 | Service-role grants for the Edge Functions | mig/032 | grants | working | Was a past outage: every function returned 500 until 032. |
| P-083 | RPC grants: payment RPCs to service_role only; create_counter_order to authenticated (AAL2 checked inside) | mig/008, 028, 038:347-370 | grants | working | |
| P-084 | Rate-limit purge cron, daily at 03:17 | mig/035 | pg_cron | unknown | Whether the cron is live is unverified. |

## 13. Historic or removed (do not audit as live)

| ID | Feature | Files | Status | Watch |
|---|---|---|---|---|
| P-085 | Stock reservations (checkout_reservations), stock_count, reserved_count, inventory_adjustments, adjust_stock, reserve_stock | mig/012, 020, 026, 028; dropped in mig/038 | removed | Docs (current-task.md:301-302 "adjust_stock") still refer to them. |
| P-086 | Five-minute reservation sweeper release-expired-reservations | mig/012; unscheduled in mig/038:47-55 | removed | Nothing now closes a pending order that never got a session (P-028, P-035). |
| P-087 | Paid-but-stock-gone shortfall flag (order_stock_shortfall) | mig/028:192-219; dropped in mig/038 | removed | The current-task "Phase 2 item 13" still describes it as a feature. |
| P-088 | Restock on cancel, low-stock email, orders.stock_taken_at | mig/025, 028, 031; dropped in mig/038 | removed | |

**Feature count: 88 (P-001 to P-088), of which 4 are historic.**

---

## Happy-path sequence (web order, card, instant)

1. The cart page loads. use-cart-freshness re-reads price and shippability; use-cart-pricing shows the totals from store_settings.
2. The customer fills in CheckoutForm. use-turnstile gets a token. getOrCreate attemptId is taken from sessionStorage.
3. use-checkout calls checkout-repository `createCheckoutSession`, which invokes `create-checkout-session` (POST, with the bearer if signed in).
4. The function does the following, in order:
   1. `parseCheckoutRequest`;
   2. `guardCheckout`: three `hit_rate_limit` calls, then Turnstile siteverify;
   3. `abandonStaleAttempt`: `clear_stale_checkout_attempt`, then `sessions.expire` for each id;
   4. `priceBasket` and `signedInCustomerId` in parallel;
   5. insert `orders` (pending);
   6. `reserve_order_stock` (in-stock check);
   7. insert `order_items`;
   8. `stripe.checkout.sessions.create` (metadata order_id, idempotency key `checkout-session:<id>`);
   9. update `orders.stripe_session_id`.
5. It returns `{url}`. The browser does a full navigation to Stripe-hosted Checkout.
6. The customer pays, and Stripe redirects to `/checkout/success?order=<id>&session=cs_...`.
7. In parallel, Stripe sends `checkout.session.completed` to `stripe-webhook`. The webhook:
   1. verifies the signature;
   2. checks the event is on the allow-list;
   3. runs `claim_stripe_event`;
   4. runs `findOrderForSession`;
   5. runs `confirm_order_paid`, which marks the order paid and assigns its number;
   6. in the same transaction, `log_order_status_change` and `queue_order_notifications` fire, inserting customer.order_confirmed and owner.order_paid jobs;
   7. runs `mismatchReasons`, then `flag_order` if needed;
   8. returns 200.
8. CheckoutSuccess runs use-checkout-confirmation, which calls `checkout-status` every 2 s. When the status is paid, it shows the order number, clears the cart and the attempt id, and offers the create-account nudge.
9. The notification worker (outbox, another area) sends the emails later.
10. Later, the admin moves fulfilment forward (guarded by mig/025), and the customer.status_changed emails queue. The customer tracks the order via `order-lookup` or `/account`.
11. Refund (if any):
    1. the admin uses OrderRefundDialog, which calls `refund-order`;
    2. `refund-order` runs `requireAal2Admin` and `loadRefundableOrder`, then `stripe.refunds.create`;
    3. Stripe sends `charge.refunded` to the webhook, which calls `record_refund`;
    4. `record_refund` updates the order status, and the customer.refunded job queues.

---

## Failure branches

| # | Scenario | What happens | Outcome | Ref |
|---|---|---|---|---|
| F-01 | Webhook handler throws (DB blip) | release_stripe_event, then 500, then Stripe retries with backoff for up to 3 days | Recovers | fn/stripe-webhook/index.ts |
| F-02 | release_stripe_event itself fails | Its result is unchecked. The retry hits claim, finds a duplicate, gets 200 | **Event lost silently** | index.ts:~120 |
| F-03 | Duplicate delivery of the same event | claim returns false, so 200 duplicate | Correct | mig/008 |
| F-04 | Events out of order (expired arrives after completed) | expire_order only moves pending, so a paid order is untouched | Correct | mig/029 |
| F-05 | Completed arrives after expired | confirm returns null, which raises an unmatched-payment alert ("already expired") | Money taken with no order; manual refund needed | handlers.ts |
| F-06 | Completed arrives after a refund | confirm returns null for a refunded order, so nothing happens | Correct | mig/038:144-145 |
| F-07 | Two partial refund events out of order | record_refund uses greatest() on the cumulative amount, and refunded is sticky | Correct | mig/025 |
| F-08 | Refund fails at the bank after creation | charge.refund.updated is not handled | **The order may show refunded while the money did not go** | index.ts:29-35 |
| F-09 | Chargeback or dispute | No handler | **Admin is not told by the site** | index.ts:29-35 |
| F-10 | Async payment method (SEPA etc.) | completed with unpaid status waits, but async_succeeded is not subscribed | The order would stay pending forever. Safe only while D4 (instant methods only) holds | current-task.md:39 |
| F-11 | Customer walks away from Stripe | Session expires after 30 min, then expire_order | Pending becomes expired | handlers.ts |
| F-12 | Customer clicks cancel, returns to the cart, retries | Same attemptId: the old order is abandoned and its session expired | Correct, unless F-13 | index.ts:68-85 |
| F-13 | Old tab pays while sessions.expire failed or raced | confirm accepts 'abandoned', so both orders are paid | **Double charge, no alert** | index.ts:68-85; mig/038:137 |
| F-14 | Double-click or two concurrent submits | Two orders and two sessions; only one is visited; the other stays pending until the next attempt clears it | Mostly harmless; misleading comment | index.ts:147 |
| F-15 | Item marked out of stock mid-session, or one-off bought twice | No re-check at confirm | Both paid; Alan finds out manually | mig/038:112-150 |
| F-16 | Stripe API down at session create | Catch, then abandon_order, then 500 "temporarily unavailable" | Clean, though abandon's error is ignored | index.ts:159-163 |
| F-17 | DB down at checkout | hit_rate_limit throws, so 500 | Fail closed | fn/_shared/rate-limit.ts |
| F-18 | DB down at the webhook | 500, Stripe retries | Recovers when the DB is back | index.ts |
| F-19 | Outbox insert fails inside confirm | The whole confirm transaction rolls back, giving a webhook 500 loop | **Payment confirmation is blocked by an email-queue problem** | mig/030 trigger |
| F-20 | Order-number sequence passes 9999 | lpad truncates, the number collides, there is a unique violation and the webhook 500 loop begins | **Every subsequent paid order is stuck pending** | mig/038:131-135 |
| F-21 | Turnstile secret missing | 503 on every checkout | Checkout down (or insecure, if the bypass flag is set) | fn/_shared/turnstile.ts |
| F-22 | Turnstile or siteverify unreachable | 503 | Checkout down for the outage | turnstile.ts |
| F-23 | Rate-limit table or RPC down | 500 | Checkout and lookup down | rate-limit.ts |
| F-24 | Global limit of 200/hour exhausted by a bot | 429 for everyone | Checkout denial of service for up to an hour | guard.ts |
| F-25 | store_settings row missing | fetchStoreRates throws, so 500 | Checkout down | fn/_shared/shipping.ts |
| F-26 | stripe_session_id update fails | The webhook still matches via metadata. checkout-status never matches | Success page shows "unconfirmed" while the order is paid | index.ts:153-156 |
| F-27 | Webhook confirms but the poll times out (more than 60 s) | delayed/unconfirmed shows with "do not pay again"; the cart is not cleared | Customer confusion; a risk of paying again | src/lib/checkout-confirmation.ts |
| F-28 | Amount or currency mismatch | Confirmed and flagged | It can still be fulfilled | handlers.ts; mig/025 |
| F-29 | Payment with no order (metadata lost, or a test from the dashboard) | payment_alerts no_order | Shown on the dashboard card | payment-alerts.ts |
| F-30 | Refund retried with an edited amount | Same idempotency key with different params, so Stripe returns 400 | The admin must close and reopen the dialog | OrderRefundDialog.tsx:46 |
| F-31 | refund-order not deployed, or charge.refunded not subscribed | 404 from the function, or the money leaves while the order stays paid | **State drift** | current-task.md:316-317 |

---

## Cross-area hand-offs

**Email / outbox**
- `queue_order_notifications` (mig/030, mig/033) fires inside the confirm and refund transactions. It queues:
  - customer.order_confirmed (paid from pending or abandoned, email present);
  - owner.order_paid (web channel);
  - customer.status_changed (`is_status_email_due`: forward moves, not the counter channel, deduped);
  - customer.refunded (refund_cents increase).
- Bank owner for email should check:
  - the abandoned-to-paid double payment in F-13, which sends two confirmations;
  - that an outbox failure blocks payment (F-19);
  - the success page claiming "we have emailed" while Resend is parked.

**Admin**
- The admin side covers: the refund dialog and section, the counter-order sheet (create_counter_order), the unmatched-payments card, the attention_reason display, the fulfilment status picker (guard in mig/025) and tracking_number (mig/033 check `^[A-Za-z0-9 -]{4,40}$`).
- AAL2 is required for refunds, counter orders and payment_alerts.
- The admin also manages store_settings rates and products.in_stock.

**Accounts**
- orders.user_id is set from the checkout JWT (signed-in-customer.ts).
- `my_orders()` and `claim_my_guest_orders()` (mig/034) reuse `toLookedUpOrder`.
- The success-page CreateAccountNudge and the checkout prefill of name, email and phone from the profile also belong here.
- The delete-account flow leaves orders with user_id null.

**DB / migrations**
- Confirm on the remote:
  - whether 038_simple_stock is applied (the docs call 038 "indexes");
  - that 032 grants and the 035 cron are live.
- Fix candidates:
  - lpad truncation in confirm_order_paid;
  - a non-unique stripe_payment_intent used by record_refund and resolve_payment_alert;
  - no sweeper for orphan pending orders;
  - shipping and VAT logic duplicated in three places (edge, client, counter SQL).

**Ops / Stripe dashboard**
- Webhook endpoint events: tick the async pair; confirm charge.refunded; consider charge.refund.updated and charge.dispute.created.
- Only instant payment methods should be on (D4).
- Switch test and live keys and the webhook secret together.
- SITE_URL and SITE_HOSTNAME must be set to the production domain.
- Turnstile keys must be set, and ALLOW_INSECURE_NO_CAPTCHA must be absent in production.
