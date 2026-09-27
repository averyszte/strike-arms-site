# Completion audit — the All Blooms view

Date: 2026-09-27   All Blooms commit: 310454d   Strike Arms commit: 7d0ce64

Read-only audit. Nothing in either repository was changed except this file. No
migration, deploy, Stripe call or dashboard change was made. Secrets are
referred to by variable name only.

---

## 1. Summary

Strike Arms is further along than All Blooms was at the same point, and in
several places it is better. The payment path is genuinely good: prices are
re-derived server-side, the webhook verifies the raw body before anything else,
event handling is claimed and released so Stripe's retries are not mistaken for
duplicates, stock is reserved with a hold that outlives the Stripe session, and
the refund endpoint authorises the caller as the caller rather than as the
service role. `_headers` and `_redirects` are ahead of All Blooms. The admin
back office is deeper than All Blooms' — bulk actions, CSV import, counter
orders, printing, orphan-image sweeping.

The gaps are not spread evenly. They cluster in three places. First, there is
no transactional email anywhere in the repository, and the checkout success
page tells the customer one is on its way; a paying customer currently ends the
transaction with no order number, no email, and no account. Second, customer
accounts are a localStorage placeholder that also collects an age confirmation
and throws it away. Third, a handful of security details that All Blooms fixed
the hard way are still open here — chiefly two SECURITY DEFINER functions with
no `search_path` that every RLS policy in the database depends on, and one
admin policy that cannot succeed at all.

The single most valuable finding is not a missing feature. It is that four
individually-defensible decisions — don't read the order back on the success
page, defer email, fake the accounts for now, keep signup disabled — combine
into a customer who has paid and has no record of it. Each is fine. Together
they are the launch blocker.

Counted another way: Strike Arms has built the hard parts and is missing the
parts that are only obvious once a real customer has paid.

---

## 2. Launch blockers

Most severe first.

**1. FV-C1 — No transactional email exists, and the success page promises one.**
`supabase/functions/` contains four functions and none of them sends mail; a
case-insensitive search of `supabase/` and `src/` for `resend`, `sendEmail`,
`EMAIL_FROM`, `OWNER_EMAIL`, `smtp` and `mailer` returns nothing.
`src/pages/CheckoutSuccess.tsx:56-57` tells the customer "A confirmation with
your order number is on its way to your inbox. Check your spam folder if it has
not arrived within a few minutes", and `:63` says "We will email you as soon as
it is ready to pick up." The page deliberately does not read the order back
(correct, and its comment explains why), so no order number is shown. There is
no working account and `supabase/config.toml:23` sets `enable_signup = false`.
A customer who has just paid therefore has no reference of any kind, and has
been told to blame their spam folder. Alan also gets no new-order alert.
**Why it blocks:** money is taken and neither side is told. **Size: L.**

**2. FV-E1 — Customer authentication is a browser placeholder, and the age
confirmation is discarded.** `src/data/auth-repository.ts` stores users and
sessions in `localStorage` under `sa_auth_users` / `sa_auth_session`; its own
header says "DEV ADAPTER ... NOT production auth". `signUp` accepts
`ageConfirmed` in `SignUpInput` and does not copy it onto the `StoredUser` it
builds, so the confirmation is collected and dropped. GDPR export and erase are
stubs. `supabase/config.toml:23` has `enable_signup = false`, so there is no
server-side account path to fall back to. **Why it blocks:** accounts that do
not survive clearing the browser are not accounts, and an age confirmation you
do not keep is not a record. **Size: L.**

**3. FV-H1 — Nothing is deployed and nothing is for sale.** No Cloudflare Pages
project exists, `strikearms.ie` is unconfirmed, there are zero published
products (migration `017` removed 56 demo rows; the 64 + 106 real products are
imported but unpublished), and every product row has `is_shippable = false`, so
even a test order cannot exercise the delivery path. **Why it blocks:** there is
no site to launch and no stock on it. **Size: M** for the deploy, **L** overall
once the catalogue decisions land (see section 8).

**4. FV-D3 — The Categories admin screen cannot write, and has never been able
to.** `supabase/migrations/005_subcategories.sql:18-22` is the only policy
governing admin writes to `subcategories`, and it inlines
`exists (select 1 from admins where id = auth.uid())` rather than calling the
SECURITY DEFINER helper. A policy expression runs with the caller's privileges,
so that subquery is itself subject to RLS on `admins` — and `admins` has RLS
enabled (`002_rls.sql:126`) with zero policies anywhere in the schema. The
subquery therefore returns no rows for everyone, and the policy is never
satisfied. Migration `014_grant_audit.sql:122` then ran
`revoke all on public.admins from anon, authenticated`, which changes the
symptom from a silent denial to a hard `permission denied for table admins`.
`014`'s own audit ledger (`014:133`) checks only the anon SELECT side of
`subcategories` and does not notice the admin policy. No later migration
revisits it. **Failure scenario:** Alan opens Admin -> Categories
(`src/pages/admin/CategoriesPage.tsx`), renames a subcategory, and the write
fails; `src/data/categories-repository.ts:33`/`:52`/`:70` are all affected.
**Verify in ten seconds** (read-only):
`select polname, pg_get_expr(polqual, polrelid) from pg_policy where polrelid = 'public.subcategories'::regclass;`
**Fix:** replace both clauses with `(select public.is_admin_aal2())`.
**Size: S.**

**5. FV-A1 — There is no admin password reset of any kind.** Searching `src/`
for `resetPasswordForEmail`, `recovery` and `forgot` returns nothing, and there
is no reset route in `src/pages/admin/AdminRoot.tsx`. Admin access is
invite-only and TOTP is mandatory. **Failure scenario:** Alan forgets his
password, or loses the phone holding the TOTP factor, and there is no path back
in that does not involve someone with the service role key editing
`auth.users` by hand. All Blooms hit this and built
`src/pages/admin/reset-password.tsx` (172 lines) plus an MFA-aware recovery fix
(`e509770`). **Size: M.**

**6. FV-D1 — `is_admin()` and `is_admin_aal2()` are SECURITY DEFINER with no
`search_path`.** `supabase/migrations/002_rls.sql:9` and `:18`. Neither is
redefined by any later migration. Every RLS policy in the database, plus
`create_counter_order`, `applied_migrations` and the storage policies, resolves
admin identity through these two. Every other SECURITY DEFINER function in the
schema does set `search_path` — `008` (eight of them), `011`, `012`, `013`,
`014`, `015`, `016`, `019` — so these two are the omission, not the pattern.
`reserve_stock` (`003_functions.sql:58`) is the third, though `014` reduced its
exposure to `service_role` only. All Blooms fixed exactly this class in
`a8c43d6`. **Size: S.**

**7. FV-B1 — `create-checkout-session` is public with no bot protection and no
rate limit.** `supabase/config.toml:39-40` sets `verify_jwt = false` (correct —
an anonymous shopper has no JWT), and the function validates and re-prices
properly, but nothing throttles it. It reserves real stock for 35 minutes and
creates a Stripe session on every call. **Failure scenario:** a loop against the
public endpoint puts every one-off item — the pre-loved guns and the Jumble
shelf, which are quantity-one by nature — into reservation and holds them out
of stock for 35 minutes at a time, while filling the Stripe dashboard with
abandoned sessions. All Blooms has Turnstile on this endpoint, failing closed
(`ee1dbed`, hardened later). Note the deployment coupling: the frontend site
key and the backend secret key must be set together or checkout breaks.
Separately, `parse-request.ts`'s `readString` imposes no length cap, so
`customerName` and the address fields are unbounded. **Size: M.**

**8. FV-B2 — `refund-order` is not deployed, and `charge.refunded` may not be
enabled on the Stripe endpoint.** The function itself is good (see FV-B6). But
it deliberately does not write the order row: `record_refund`, called from the
`charge.refunded` webhook, is the single writer, so that an admin refund and a
refund issued from the Stripe dashboard converge on the same path. That design
is correct and it means the refund is invisible in the admin until the webhook
event is actually subscribed. **Failure scenario:** Alan refunds a customer, the
money leaves, and the order still reads as paid — which is All Blooms'
refund incident (`docs/launch-runbook.md:15`) arriving by a different route.
**Size: S** (deploy the function, add the event, place one test refund).

**9. FV-B3 — Two webhook paths take the money and stop.**
`supabase/functions/stripe-webhook/handlers.ts`: `HANDLED_EVENTS` covers
`checkout.session.completed`, `checkout.session.expired` and `charge.refunded`,
but not `checkout.session.async_payment_succeeded`. And
`handleCheckoutCompleted` returns HTTP 200 both when
`session.payment_status !== "paid"` and when no order matches the session,
while keeping the event claim. **Failure scenario:** a delayed payment method
settles, or a paid session's order row is missing; Stripe is told 200, will not
retry, the claim is held so a manual replay is treated as a duplicate, and the
order sits pending forever with nobody alerted. **Size: S.**

**10. FV-A2 — Every admin screen but two renders a confident empty state when
the query fails.** Only `MigrationStatusPanel.tsx:58` and `SettingsPage.tsx:29`
handle the error branch. Dashboard, Orders, Products, Inquiries, Categories,
Order detail and Order print all destructure `data` and `isLoading` only, with
`= []` defaults. **Failure scenario:** the free-tier project auto-pauses after
about seven idle days (documented in `docs/current-task.md`), or a GRANT
regresses; `DashboardPage.tsx:24` resolves to `orders = []` and the dashboard
reports EUR 0 revenue and zero orders today, in full confidence. Alan cannot
distinguish "quiet morning" from "database unreachable". A related instance:
`src/lib/admin-auth-context.tsx:35-37` discards the rpc error, so a transient
failure during sign-in resolves to `isAdmin: false` and Alan is told "Access
denied — this account is not an admin". All Blooms renders an error branch on
all six of its admin list pages. **Size: M.**

**11. FV-F1 — No legal pages, and the age question is unresolved.** There are no
terms and conditions, returns policy or shipping policy pages, and the age
confirmation that checkout collects (`parse-request.ts`, enforced server-side —
good) is not recorded against the customer. What age rules apply to airsoft
retail in Ireland, what has to be verified, and what has to be kept is **a
question for the owner and a solicitor** — this report does not state what the
law is. **Why it blocks:** it needs an answer before the first real order, and
the answer may change the schema. **Size: unknown until answered.**

---

## 3. Findings by area

### A. Admin dashboard

Reviewed screen by screen against All Blooms' `src/pages/admin/` (14 files) and
`src/components/admin/` (39 files). Strike Arms: 11 pages / 913 lines,
41 components plus `dashboard/` (7) and `print/` (4) / 4917 lines.

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-A1 | Admin password reset | `pages/admin/reset-password.tsx` (172), MFA-aware recovery (`e509770`) | MISSING | No reset route, no `resetPasswordForEmail` call anywhere. Invite-only + mandatory TOTP means a forgotten password or a lost phone is a permanent lockout needing manual `auth.users` surgery. | M |
| FV-A2 | Error state on admin reads | `pages/admin/{orders,products,inquiries,categories,cards,gallery}-page.tsx` all render `{error && …}` | MISSING | Only `MigrationStatusPanel:58` and `SettingsPage:29` do. Everything else silently renders empty. See blocker 10. | M |
| FV-A3 | Sign-in error is misreported | `lib/admin-auth-context` equivalent | BROKEN | `lib/admin-auth-context.tsx:35-37` — `const { data } = await supabase.rpc('is_admin')` discards `error`; `signIn` then signs the user out and throws "Access denied — this account is not an admin". A paused project or a network blip is reported as a permissions problem. | S |
| FV-A4 | Admin identity lookup | `2f6928a` had to scope the query to avoid PGRST116 | DONE | `admin-auth-context.tsx:33-37` calls `rpc('is_admin')` instead of selecting `admins`, so All Blooms' multi-admin PGRST116 bug cannot occur here. Structurally better. | — |
| FV-A5 | AAL2 enforced in the database, not the router | `is_admin_aal2()` in every write policy (`a8c43d6`, `ee1dbed`) | PARTIAL | Correct for products, orders, inquiries, `store_settings`, storage objects, `adjust_stock` and `create_counter_order` (`013:120-123`). **Not** for `subcategories` — see FV-D3. | S |
| FV-A6 | Dashboard | `pages/admin/dashboard-page.tsx`, `components/admin/dashboard-widgets.tsx` | DONE | `DashboardPage.tsx` splits money (all orders) from work queues (`workQueue(orders)`, archived excluded) — the All Blooms lesson already absorbed, and the comment says so. Loading state present. | — |
| FV-A7 | Dead component | — | PARTIAL | `components/admin/DashboardStats.tsx` (65 lines) is exported and imported by nothing. Either wire it up or delete it. | S |
| FV-A8 | Dashboard data volume | AB loads a bounded set | PARTIAL | `useAllOrdersWithItems` (`hooks/use-orders.ts:20-25`) has no limit, no `staleTime` and no date window; every dashboard mount pulls every order with its items into the browser to compute metrics client-side. Fine at a few hundred orders, not at a few thousand. | M |
| FV-A9 | Orders board / table / bulk actions | `orders-board.tsx`, `orders-table.tsx` | DONE | `OrdersView` (201), `OrdersBoard` (134), `OrdersToolbar` (167), `OrdersBulkBar` (120), `OrderDetailSheet` (239). View preference persisted (`use-orders-view.ts`). Deeper than All Blooms. | — |
| FV-A10 | Counter orders (in-shop sales) | N/A (florist has no counter) | DONE | `CounterOrderSheet` (227) + `create_counter_order` (`013:80`), AAL2-gated in the function, rates read from `store_settings`, not from the client. This is a real strength. | — |
| FV-A11 | CSV product import | N/A | DONE | `ProductImportDialog` + preview + `products-import-repository.ts`. Covered by the products AAL2 insert policy. | — |
| FV-A12 | Stock adjustment | `adjust_stock` equivalent | DONE | `StockAdjustDialog` (164) -> `inventory-repository.ts:44` -> `adjust_stock`, which since `014:33-42` requires `is_admin_aal2()`, sets `search_path`, and attributes the audit row to `auth.uid()`. | — |
| FV-A13 | Printing (invoice / packing slip) | N/A | DONE | `OrderPrintPage` routed outside `AdminLayout` but inside `AuthGuard` — deliberately, and the reasoning in `AdminRoot.tsx` is right. | — |
| FV-A14 | Migration visibility | N/A | DONE | `MigrationStatusPanel` + `applied_migrations()` (`016:21`), admin-gated, `search_path` set, and it fails loudly if not installed. All Blooms has no equivalent and would have benefited. | — |
| FV-A15 | Refunds from the admin | `75b91f5` partial refunds | PARTIAL | `OrderRefundDialog` (145+) is built and correct; the function it calls is not deployed. See FV-B2. | S |
| FV-A16 | Mobile | AB admin is desktop-first with responsive tables | PARTIAL | Grids are responsive (`grid-cols-2 lg:grid-cols-4`), but the wide tables (`ProductsTable` 213, `OrdersView`, `InquiriesTable` 166) have no equivalent of All Blooms' `components/admin/table-scroll-shadow.tsx`, so on a phone there is no affordance showing the table scrolls sideways. Worth checking on Alan's actual phone before launch. | S |

### B. Commerce and Stripe

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-B1 | Bot protection on checkout | `_shared/turnstile.ts` (56), fail-closed | MISSING | See blocker 7. | M |
| FV-B2 | Refund endpoint deployed + `charge.refunded` subscribed | `docs/launch-runbook.md:15` records the incident | PARTIAL | See blocker 8. | S |
| FV-B3 | Webhook event coverage | `stripe-webhook/index.ts` | PARTIAL | `async_payment_succeeded` absent; two silent 200s retain the claim. See blocker 9. | S |
| FV-B4 | Signature verification before parsing | same | DONE | Raw body, `constructEventAsync`, before anything else. | — |
| FV-B5 | Webhook idempotency | `c3bb887` added `stripe_event_log` | DONE | `claim_stripe_event` / `release_stripe_event` (`008:20`,`:38`). Crucially it **releases** on failure, so a retry is not dismissed as a duplicate. Better than a naive dedupe table. | — |
| FV-B6 | Refund authorisation | `refund` path in AB | DONE | `refund-order/index.ts` — `verify_jwt = true` at the gateway *and* `requireAal2Admin` building a client from the caller's own Authorization header, with the correct note that asking with the service key would answer a different question. Better than All Blooms. | — |
| FV-B7 | Price trust boundary | AB re-derives name + price server-side | DONE | `order-lines.ts` re-reads `PRODUCT_COLUMNS`, computes `effectivePriceCents`, rejects unpublished or missing products by name, and charges delivery only on `is_shippable` lines. | — |
| FV-B8 | Stranded paid order | `391da08` — required both `order_id` and `session_id` to match | DONE | Strike Arms looks up by `metadata.order_id` with a `stripe_session_id` fallback. It already has All Blooms' fix. | — |
| FV-B9 | Stock reservation vs the Stripe clock | AB: slot-based | DONE | `SESSION_MINUTES = 30`, `RESERVATION_MINUTES = 35` — the hold outlives the session, deliberately. This is the protection the brief asked about for a one-off pre-loved rifle, and it is present. | — |
| FV-B10 | Compensating rollback | — | DONE | `create-checkout-session` catch releases reservations then deletes the order; Stripe call uses `idempotencyKey: checkout-session:${orderId}`. | — |
| FV-B11 | Amount and currency verification | — | DONE | Webhook checks currency and `session.amount_total !== order.total_cents`. | — |
| FV-B12 | Deferred order numbers | `6717814` + `3f614af` | DONE | Assigned on payment success, so failed checkouts do not burn numbers. Same conclusion, reached independently. | — |
| FV-B13 | Input bounds | — | PARTIAL | `MAX_LINES = 50` and `MAX_QUANTITY_PER_LINE = 20` are enforced; `readString` caps nothing, so name and address fields are unbounded. | S |
| FV-B14 | Restock on refund | AB does not restock either | N/A | Deliberate and documented. Correct for pre-loved one-offs, which may not come back. | — |

### C. Email and notifications

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-C1 | Any transactional email | `_shared/resend.ts` (38), `_shared/email-templates.ts` (470), `notification-worker/index.ts` (155) | MISSING | Nothing sends mail. See blocker 1. | L |
| FV-C2 | Outbox table with no worker and no producer | `notification_jobs` written in the same transaction as the event, drained by the worker | PARTIAL | The table exists (`001_schema.sql:150`), has RLS (`002:133`), is indexed on `(status, next_attempt_at)` (`003:159`), was granted (`004:29`) and revoked (`014:124`) — and **nothing in `supabase/` or `src/` reads or writes it**. The pattern was copied; the two halves that make it work were not built. The good news: the schema is already right, so FV-C1 is a matter of writing the producer and the worker, not redesigning. | L |
| FV-C3 | Owner alert on a new order | AB emails the owner | MISSING | Follows from FV-C1. Alan currently learns about an order by opening the dashboard. | — |
| FV-C4 | Null-safety in templates | `00d82e6` — `escapeHtml(null)` threw on an always-null field and every order email was swallowed | N/A | Nothing to break yet. Carry the lesson into the templates when they are written: make `escapeHtml` null-safe from line one. | — |
| FV-C5 | Inquiry notification | `submit-inquiry` edge function | MISSING | Inquiries are stored (`inquiries` table, anon insert policy) and visible in the admin, but nothing tells Alan one arrived. | M |

### D. Database, security, backend

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-D1 | `search_path` on SECURITY DEFINER | `a8c43d6`, `20260620000001_rls_optimization_and_search_path` | MISSING | `is_admin()` (`002:9`), `is_admin_aal2()` (`002:18`), `reserve_stock` (`003:58`). See blocker 6. | S |
| FV-D2 | `grant all … to authenticated` on core tables | AB never had customer accounts, so never faced this | PARTIAL — **latent** | `004_grants.sql` grants `all` on `products`, `orders`, `order_items`, `order_status_log`, `inventory_adjustments` to `authenticated`, and `006:12` does the same for `subcategories`. Today that is safe, because `authenticated` means admins only (`enable_signup = false`). **The moment FV-E1 lands and real customers can sign in, every signed-in shopper holds table-level INSERT/UPDATE/DELETE on products and orders with only RLS in the way** — and the first "customers can read their own orders" policy, being PERMISSIVE, ORs with the admin policies rather than narrowing them. Fix the grants in the same migration that enables customer signup, not after. | M |
| FV-D3 | `subcategories` admin policy | — | BROKEN | See blocker 4. | S |
| FV-D4 | `admins` table hardening | `c3bb887` | DONE | RLS on, zero policies, and `014:122` revokes all browser grants. Correct — and it is precisely why FV-D3's inline subquery cannot work. | — |
| FV-D5 | `adjust_stock` hardening | AB equivalent | DONE | `014:33-42`. Before it, the function was SECURITY DEFINER with no auth check and default PUBLIC EXECUTE — anyone holding the public anon key could have posted `{"p_product_id":"…","p_adjustment":-999}`. `014` is applied, so this is closed. | — |
| FV-D6 | Forged reservation exploit | — | DONE | `014` dropped the `anon insert … with check (true)` policy on `checkout_reservations` and revoked the grant. The exploit was forging an expired reservation so `release_expired_reservations` released genuine holds and the shop oversold. Good catch by whoever wrote `014`. | — |
| FV-D7 | Storage policies | AB product images | DONE | `011:64-78` — `to authenticated` plus `(select public.is_admin_aal2())`, in the subquery form that `florist-lessons.md` recommends and `002_rls.sql` does not use. | — |
| FV-D8 | Policy form and `TO` clauses | `a8c43d6` moved AB to `(SELECT is_admin_aal2())` and added `TO` | PARTIAL | `002_rls.sql` policies call bare `is_admin()` / `is_admin_aal2()` with no `TO` clause and no subquery wrapper, so the predicate is re-evaluated per row and is checked for `anon` too. Migrations from `010` onward use the good form. A single migration could bring `002`'s policies into line. | M |
| FV-D9 | An RLS verification script | `supabase/verify-rls.sql` | MISSING | Strike Arms has no equivalent. This is the tool that would have caught FV-D3 and FV-D1 without a human noticing. Highest value-per-hour item in this report. | S |
| FV-D10 | Edge function JWT posture | AB `config.toml` | DONE | `config.toml:39-55` — `verify_jwt = false` only for the two endpoints called by parties with no JWT, each with a comment explaining what authenticates instead; `true` for `refund-order` and `sweep-orphan-images`, each with a second check on top. Exemplary. | — |
| FV-D11 | Orphaned image cleanup | AB has none | DONE | `orphaned_images` + `enqueue_orphaned_images` / `dequeue_reused_images` / `bump_orphan_attempts` (`011`, all with `set search_path = ''`) + `sweep-orphan-images`. Ahead of All Blooms. | — |
| FV-D12 | Shipping rates in one place | `a2c6615` — two copies of the zone table drifted; two orders overcharged, eight wrongly rejected | DONE (structurally) | `010_store_settings.sql` puts rates in a single row; both `shipping.ts` copies hold no rates and take `rates: StoreRates`; the Deno copy's `fetchStoreRates` throws rather than defaulting. See FV-D13 for the part that is still exposed. | — |
| FV-D13 | Duplicated shipping *logic* | same | PARTIAL | The rates are shared; the two `shipping.ts` implementations are still independent function bodies. The file header claims a divergence is "a typecheck away from being caught" — that is not true. TypeScript cannot compare two function bodies, and with no test suite, changing `>=` to `>` in one copy ships silently and reproduces `a2c6615` with different numbers. Either import one from the other or add three assertions around the free-shipping threshold. | S |
| FV-D14 | Migrations written but not applied | — | PARTIAL | `019`, `020`, `021` exist and are unapplied. `019` and `020` are correct and small; `021` retires the parts category. Apply them before launch so the deployed schema and the repository agree. | S |

### E. Storefront and customer accounts

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-E1 | Customer accounts | N/A — AB has none, `config.toml:53` `enable_signup = false` | BROKEN | See blocker 2. Strike Arms has the *pages* (`pages/Account.tsx`, `pages/auth/Login.tsx`, `pages/auth/Signup.tsx`) sitting on a placeholder. This is worse than not having them: a shopper can create an account, see it work, and lose it. | L |
| FV-E2 | Age confirmation recorded | N/A | PARTIAL | Enforced server-side at checkout (`parse-request.ts` — `if (body.ageConfirmed !== true) fail(…)`, good) and stored on the order as `age_verified`. Dropped entirely on signup. What needs to be kept is FV-F1's question for the owner and a solicitor. | S |
| FV-E3 | Order lookup without an account | AB emails everything, so no lookup is needed | MISSING | With no email and no account, there is nothing. Even after FV-C1, a guest order-status page keyed on order number + email would be cheap and would take pressure off Alan's inbox. | M |
| FV-E4 | Cart | AB cart | DONE | `lib/cart-storage.ts` + `cart-context.tsx`; `types/cart.ts:9` explicitly notes a tampered basket changes only what the shopper sees, and the server re-prices. Right conclusion. | — |
| FV-E5 | Checkout success page | AB shows the order number | BROKEN | `CheckoutSuccess.tsx:56-57,63` — see blocker 1. The decision not to read the order back is sound; the copy has to stop promising things that do not happen. Minimum viable fix, independent of email: pass the order number through the Stripe success URL and show it. **Size: S** for that alone. | S |
| FV-E6 | Content pages | AB has fewer | DONE | `Brands`, `Glossary`, `AirsoftLaw`, `WhereToPlay`, `GiftCards`, `Jumble`, `PreLoved`, `guides/`, `services/`. Substantially richer than All Blooms. | — |
| FV-E7 | Product search ranking | AB has no search at all | PARTIAL | `search_products` (`015:119`) exists — ahead of All Blooms — but `docs/current-task.md` records a ranking bug where a scope can outrank a rifle for the query "rifle". Not a blocker; it is the first thing a customer does. | M |
| FV-E8 | Legal pages | AB has them | MISSING | No terms, returns or shipping policy page. See blocker 11. | M |

### F. SEO and content

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-F1 | Legal / age content | — | MISSING | See blocker 11. Owner and solicitor. | — |
| FV-F2 | Server-rendered head meta | AB: middleware owns head meta, plus build-time prerender (`e7d60f9`) | MISSING | No `functions/_middleware.js`, no `_routes.json`, no prerender step; `package.json` build is `generate-migration-manifest && vite build`. `react-helmet-async` is client-only, so every route serves one identical `index.html`. Googlebot renders JS and will mostly cope; **link unfurlers do not** — every product, guide and brand link shared on WhatsApp, Facebook, Slack or iMessage shows the same generic title, description and image. For a shop whose customers share gun listings, that is a real cost. All Blooms' prerender approach is directly copyable. | M |
| FV-F3 | Structured data | AB JSON-LD | DONE | `components/JsonLd.tsx` + `lib/structured-data.ts`, used across 14 page types including `ProductDetail` and `ProductListingPage`. Richer than All Blooms. Caveat: it is client-rendered (FV-F2). | — |
| FV-F4 | Canonical URLs hardcoded to an unconfirmed domain | AB's live SEO audit found canonicals pointing at a dead domain | PARTIAL | `lib/site-config.ts:9` defines `SITE_URL`, and then `pages/Home.tsx:37,42`, `pages/GiftCards.tsx:14,18` and `pages/ShopPage.tsx:153` hardcode `https://strikearms.ie` anyway. If the shop launches on a Pages subdomain first, or on a different domain, those canonicals point somewhere that does not serve the site — which is the exact failure All Blooms is still carrying. Route them all through `SITE_URL` and set it from an env var. | S |
| FV-F5 | Sitemap | AB sitemap returned 500 in its own audit | PARTIAL | `public/sitemap.xml` is committed but stale — it lists the deleted demo products and 15 brand pages that no longer exist. The `sitemap` script is deliberately kept out of `build`. Decide one way or the other before launch; a sitemap full of 404s is worse than none. | S |
| FV-F6 | robots.txt | AB | DONE | Correct disallows, sitemap reference. `/checkout` is covered by `X-Robots-Tag` in `_headers` rather than robots — fine, and arguably better. | — |

### G. Performance

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-G1 | Admin bundle split out of the storefront | `dea00c0` took AB's admin bundle from 226KB to 8KB | DONE | `App.tsx:47-49` lazy-loads `LoginPage`, `AcceptInvitePage` and `AdminRoot`. The lesson was already applied. | — |
| FV-G2 | Caching headers | AB `_headers` | DONE | Immutable `/assets/*`, `must-revalidate` on `/index.html`. | — |
| FV-G3 | Image compression | AB uses `browser-image-compression` | DONE | Own canvas-based `lib/compress-image.ts` — one fewer dependency. | — |
| FV-G4 | Responsive images | AB deliberately skipped `srcset` (needs a paid plan) | N/A | Same constraint, same answer. | — |
| FV-G5 | Dashboard query volume | — | PARTIAL | FV-A8. | M |
| FV-G6 | Query cache tuning | — | PARTIAL | No `staleTime` anywhere in the admin hooks, so every remount refetches. Minor, but it compounds with FV-A8. | S |

### H. Deploy, go-live, ops

| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
|---|---|---|---|---|---|
| FV-H1 | A deployed site with published stock | AB is live | MISSING | See blocker 3. | M–L |
| FV-H2 | SPA fallback that does not break client routes | `1bd7bde` — Pages 308-redirects any `.html` path to its clean URL, so a `/spa-shell.html` rewrite became a visible redirect and every client-only route broke | DONE | `public/_redirects` uses `/* / 200` pointing at the clean `/`, and the comment cites the All Blooms trap explicitly. The lesson transferred. | — |
| FV-H3 | Security headers | `c3bb887` added AB's `_headers` | DONE | HSTS with `preload`, `X-Frame-Options: DENY`, COOP, a real CSP with `script-src 'self'` and no `unsafe-inline`, the project-ref origin written out rather than wildcarded, `X-Robots-Tag: noindex` on cart/checkout/account/admin. Ahead of All Blooms. | — |
| FV-H4 | Old-site redirects | — | DONE | Six 301s from the PHP site plus `/search -> /store`. | — |
| FV-H5 | Build-time config validation | AB was bitten by Cloudflare env vars | DONE | `vite.config.ts` runs `verifySupabaseConfig` and fails the build if the Supabase values are absent, placeholders, or from two different projects. Directly better than All Blooms, which discovered this at runtime. | — |
| FV-H6 | `.env.example` | `.env.example` at the AB root | MISSING | Strike Arms has none. For an EasyWebs handover, the list of required variable names is the difference between a ten-minute setup and a day of guessing. Names only — no values. | S |
| FV-H7 | Launch runbook / go-live checklist | `docs/launch-runbook.md`, `docs/domain-go-live.md` | MISSING | `docs/` has planning documents but nothing that says "do these things in this order to go live". Given FV-D14 (three unapplied migrations), an undeployed function and an unsubscribed webhook event, the ordering matters. | S |
| FV-H8 | Automated tests / CI | AB has neither | N/A | Parity. Worth saying once: with two `shipping.ts` implementations (FV-D13) and money involved, a handful of assertions would pay for themselves. Not a blocker. | — |
| FV-H9 | Free-tier auto-pause | AB is on a paid plan | PARTIAL | The project pauses after roughly seven idle days and the admin shows "Failed to fetch" (documented in `current-task.md`). Before a real shop depends on it, either upgrade the plan or accept that the first customer of the week waits for a cold start. Compounded by FV-A2 and FV-A3, which misreport the pause as "no data" and "not an admin". | S |

#### Stripe dashboard settings still to configure (names only)

- Webhook endpoint pointing at the deployed `stripe-webhook` function, with
  `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
  and `checkout.session.async_payment_succeeded` subscribed (FV-B3).
- The webhook signing secret set as the function's environment variable.
- Live-mode secret key set for the deployed functions, and a deliberate
  decision about when to switch from test mode.
- Statement descriptor and the business name shown on the Checkout page.
- Payment methods enabled for Ireland, and whether any of them settle
  asynchronously (which is what makes FV-B3 matter).
- Receipts: Stripe can email its own payment receipt. That is **not** an order
  confirmation and does not close FV-C1, but it is worth enabling as a stopgap
  so the customer has something with an amount and a date on it.

#### Migrations Strike Arms still needs, in order

1. `019_drop_adjusted_by_argument.sql` — already written; apply it.
2. `020_reservation_order_fk_restrict.sql` — already written; apply it.
3. `021_retire_parts_category.sql` — already written; apply it.
4. New: fix the `subcategories` admin policy to `(select public.is_admin_aal2())` (FV-D3).
5. New: add `set search_path = pg_catalog, public` to `is_admin()`, `is_admin_aal2()` and `reserve_stock()` (FV-D1).
6. New: persist the customer age confirmation, once the owner and a solicitor have said what must be kept (FV-E2, FV-F1).
7. New: narrow the `authenticated` grants — shipped **in the same migration** that enables customer signup, never after it (FV-D2).
8. New (optional, tidy-up): rewrite `002_rls.sql`'s policies into the `(SELECT …)` + `TO` form (FV-D8).

---

## 4. Lessons from All Blooms' history

| All Blooms commit | What went wrong | Does Strike Arms have the fix? |
|---|---|---|
| `391da08` | The webhook required **both** `metadata.order_id` and `stripe_session_id` to match. A failed session-id write stranded a genuinely paid order as pending forever — no email, and Stripe saw a 200 so never retried. | **YES** — `stripe-webhook/handlers.ts` looks up by `order_id` with a session-id fallback. But see FV-B3: two *other* silent-200 paths exist. |
| `a2c6615` | Two copies of the delivery-zone table drifted. Two zones overcharged, eight were wrongly rejected at checkout — a live revenue bug found only when customers complained. | **PARTIAL** — `010_store_settings.sql` moved the rates to one row and both `shipping.ts` files read them (FV-D12). The *logic* is still duplicated and the header's claim that a divergence is "a typecheck away" is false (FV-D13). |
| `00d82e6` | `escapeHtml(null)` threw on an always-null order-level field, inside a try/catch that swallowed it. Every order email silently stopped. | **N/A** — no email yet. Build `escapeHtml` null-safe on day one (FV-C4). |
| `1bd7bde` | Cloudflare Pages 308-redirects any `.html` path to its clean URL, so the `/spa-shell.html` rewrite became a visible redirect and every client-only route broke in production only. | **YES** — `public/_redirects` avoids it and cites the incident by name. |
| `c3bb887` | Pre-hardening: no webhook dedupe, no admin-only RLS, no CSP. | **YES** — `stripe_event_log` with claim/release (better than All Blooms' version), admin RLS, and a stronger CSP than All Blooms ships. |
| `2f6928a` | A bare `.from("admins").select("id").maybeSingle()` threw PGRST116 the moment a second admin existed, because two PERMISSIVE SELECT policies OR together and returned two rows. | **YES, structurally** — `admin-auth-context.tsx:33-37` never selects the table; it calls `rpc('is_admin')`. The comment shows the reasoning was understood. |
| `a8c43d6` | SECURITY DEFINER functions without `set search_path`; per-row re-evaluation of `is_admin_aal2()` in policies. | **NO** — `is_admin()` and `is_admin_aal2()` (`002_rls.sql:9,18`) still have neither, and `002`'s policies use the bare-call form. Every later migration got this right, so it is an omission in the oldest file rather than a misunderstanding (FV-D1, FV-D8). |
| `ee1dbed` / `75b91f5` | Turnstile on checkout, AAL2 in RLS, partial refunds, operational alerts. | **PARTIAL** — AAL2 yes (except FV-D3), partial refunds yes and better, operational alerts yes (`OperationalAlertsCard`). **Turnstile: no** (FV-B1). |
| `6717814` + `3f614af` | Order numbers assigned at insert, so every abandoned checkout burned a number and the sequence had visible gaps. | **YES** — deferred to payment success, reached independently. |
| Refund incident (`docs/launch-runbook.md:15`) | `refund_cents` / `refunded_at` were never applied to prod. The refund write failed on nonexistent columns **while returning 200**. Reconciled by hand across 35 migrations. | **PARTIAL and imminent** — Strike Arms has the columns and the function, but `refund-order` is not deployed and `charge.refunded` may not be subscribed, which produces the same outcome (money out, order unchanged) by a different route (FV-B2). `MigrationStatusPanel` + `applied_migrations()` is a genuinely better answer to the underlying problem than All Blooms has. |
| SEO audit 2026-07-05 | Canonicals pointed at a domain that no longer served the site. | **NO** — three pages hardcode `https://strikearms.ie`, a domain that is not yet confirmed (FV-F4). |
| `dea00c0` | Admin code shipped in the storefront bundle: 226KB. | **YES** — admin is lazy-loaded (FV-G1). |
| GRANT/RLS outages (three separate incidents) | Postgres checks table privileges **before** RLS, so a correct policy with a missing GRANT is a silent 401. | **YES in spirit, and then some** — `006_subcategories_grants.sql` exists precisely because of this, and `014_grant_audit.sql` is a full audit with a written ledger. **But the mirror case was missed:** FV-D3 is a policy that reads a table the caller has no privilege on. Same lesson, opposite direction. |

---

## 5. Pieces Strike Arms can copy almost as-is

1. **The email stack.** `supabase/functions/_shared/resend.ts` (38 lines),
   `_shared/email-templates.ts` (470), `notification-worker/index.ts` (155).
   Strike Arms' `notification_jobs` table is already schema-compatible, so this
   is largely a port plus new copy. Make `escapeHtml` null-safe (`00d82e6`) and
   keep the Resend idempotency key from `c3bb887`. Biggest single win available.
2. **`supabase/verify-rls.sql`.** Copy it, extend it to assert that every
   SECURITY DEFINER function sets `search_path` and that every admin-write policy
   calls `is_admin_aal2()`. It would have found FV-D1 and FV-D3 unaided. Cheapest
   high-value item in this report.
3. **`_shared/turnstile.ts`** (56 lines), fail-closed. Drop it into
   `create-checkout-session` and the inquiry path. Deploy the frontend site key
   and the backend secret key together or checkout breaks.
4. **`src/pages/admin/reset-password.tsx`** (172 lines) plus the MFA-aware
   recovery handling from `e509770`.
5. **`docs/launch-runbook.md` and `docs/domain-go-live.md`** as templates. The
   ordering discipline in them is the point, not the content.
6. **`.env.example`.** Variable names only.
7. **The prerender step** (`e7d60f9`). Light-touch, build-time, leaves head meta
   where it is. Directly addresses FV-F2.
8. **The admin error-branch pattern** from any of All Blooms' six admin list
   pages. Three lines per screen, closes FV-A2.

Worth noting the traffic in the other direction: All Blooms should take Strike
Arms' `verify_jwt` documentation in `config.toml`, its `verifySupabaseConfig`
build gate, the `applied_migrations()` / `MigrationStatusPanel` pair, the
orphan-image sweeper, and the claim/release webhook lock.

---

## 6. Where Strike Arms' own docs are wrong

1. **`docs/florist-lessons.md`, section C6** says the duplicated shipping rates
   are "their exact bug, uncaught" and that they should be moved "to a table read
   by both sides" before rates go live. That was done —
   `010_store_settings.sql`. The document reads as an outstanding action and is
   not one. What *is* still outstanding is the duplicated logic (FV-D13).
2. **`docs/florist-lessons.md`** claims a divergence between the two
   `shipping.ts` files is "a typecheck away from being caught". False.
   TypeScript compares signatures, not function bodies; with no tests, flipping a
   comparison operator in one copy ships silently.
3. **`docs/florist-lessons.md`** advises writing admin predicates as
   `(SELECT public.is_admin_aal2())`. Not one policy in `002_rls.sql` does. The
   later migrations (`010`, `011`) do. The advice was written down and then not
   applied to the file that needed it most.
4. **`docs/florist-lessons.md`** recommends adopting "edge meta injection alone".
   Unimplemented — there is no middleware, no `_routes.json` and no prerender
   (FV-F2).
5. **`docs/feature-inventory.md`** marks A4, E1.1 and G8 "[needs db push]".
   `docs/current-task.md` states migrations 001–018 are applied and verified.
   Both cannot be true; `current-task.md` is the accurate one. Anyone reading the
   inventory would conclude `adjust_stock` is still unauthenticated in
   production, which it is not — `014` closed it. **In this repository,
   `current-task.md` is more current than `feature-inventory.md`.**
6. **`docs/current-task.md`** lists `019` and `020` as the written-but-unapplied
   migrations. `021_retire_parts_category.sql` also exists and is unmentioned, so
   the document is itself one migration behind.
7. **`supabase/migrations/004_grants.sql:26`** carries the comment "Admins,
   stripe log, notification jobs: service role only (no browser grants)" and is
   immediately followed by three `grant all … to authenticated` statements. The
   comment describes the intention; the SQL did the opposite. `014` later fixed
   the SQL. Correct the comment so the next reader is not misled about what `004`
   actually did.
8. **`supabase/migrations/014_grant_audit.sql:133`** signs off `subcategories` in
   its "CHECKED AND CORRECT" ledger, having audited only the anon SELECT side. The
   admin write policy on that table is broken (FV-D3). A ledger entry that reads
   as a full clearance is worse than no entry.

---

## 7. Recommended build order

Admin dashboard first, as the brief asks — but note that three of the four
admin items are small, so "admin first" costs about a day, not a week.

**Must have before taking real money**

1. FV-D3 — fix the `subcategories` policy. One migration, and it restores a
   screen Alan needs. **S**
2. FV-D1 — add `set search_path` to `is_admin()`, `is_admin_aal2()`,
   `reserve_stock`. Same migration. **S**
3. FV-D9 — copy and extend `verify-rls.sql`, then run it. Do this third so it
   confirms 1 and 2 and catches anything else of the same shape. **S**
4. FV-A2 + FV-A3 — error branches on the admin screens, and stop reporting a
   connection failure as "not an admin". **M**
5. FV-A1 — admin password reset. Alan cannot be one lost phone away from a
   locked shop. **M**
6. FV-E5 — show the order number on the success page and fix the copy. Ship
   this *before* the email work, not after: it is an hour and it stops the worst
   of the damage on its own. **S**
7. FV-C1 + FV-C2 — the email stack: a producer writing `notification_jobs` in the
   same transaction as the order, plus the worker. **L**
8. FV-E1 — real customer accounts on Supabase Auth, with `ageConfirmed`
   persisted. **L**
9. FV-D2 — tighten the `authenticated` grants **in the same migration** as item
   8. Not after. **M**
10. FV-B1 — Turnstile on `create-checkout-session` and the inquiry form, plus a
    length cap in `readString`. **M**
11. FV-B2 — deploy `refund-order`, subscribe `charge.refunded`, place one test
    refund end to end. **S**
12. FV-B3 — add `async_payment_succeeded`; return 500 and release the claim on
    the two silent-200 paths. **S**
13. FV-D14 — apply `019`, `020`, `021`. **S**
14. FV-F1 / FV-E8 — legal pages and the age decision. Owner and solicitor;
    start the conversation now because the answer may change the schema. **?**
15. FV-H1 — Cloudflare Pages project, domain, publish the catalogue, set
    `is_shippable` correctly per product. **M–L**, gated on section 8.

**Should have soon after**

16. FV-F4 — route every canonical through `SITE_URL`, set from an env var. **S**
17. FV-F5 — regenerate the sitemap and decide whether it belongs in `build`. **S**
18. FV-H6 + FV-H7 — `.env.example` and a launch runbook. **S**
19. FV-C5 — inquiry notification. **M**
20. FV-D13 — deduplicate the shipping logic, or add three assertions around the
    free-shipping threshold. **S**
21. FV-E3 — guest order lookup by order number plus email. **M**
22. FV-H9 — decide on the Supabase plan. **S**

**Later**

23. FV-F2 — prerender or edge meta injection. **M**
24. FV-D8 — bring `002_rls.sql`'s policies to the `(SELECT …)` + `TO` form. **M**
25. FV-A8 + FV-G5 + FV-G6 — bound the dashboard query, add `staleTime`. **M**
26. FV-E7 — search ranking. **M**
27. FV-A7 — wire up or delete `DashboardStats.tsx`. **S**
28. FV-A16 — check the admin tables on Alan's phone; add scroll shadows. **S**
29. FV-H8 — a small test suite around money. **M**

---

## 8. Questions for the owner

1. **Age.** What age rules apply to airsoft retail in Ireland, what has to be
   verified at the point of sale, and what has to be kept afterwards? This needs
   the owner and a solicitor — this report does not state what the law is. The
   answer determines whether a tick-box is sufficient or whether identity has to
   be recorded, and that changes the schema, so it should be asked first.
2. **Postable items.** Which products can be posted and which are
   collection-only? Every product row currently has `is_shippable = false`, so
   the delivery path cannot be tested until this is answered. (Already flagged as
   blocked on Alan in `current-task.md`.)
3. **Delivery pricing.** Flat rate and free-shipping threshold are seeded at
   EUR 6.50 and EUR 75.00. Are those the real numbers?
4. **VAT.** The rate is seeded at 23% extracted from gross. Confirm the rate,
   the VAT number, and whether every category is standard-rated.
5. **The 22 unbranded rows.** Still outstanding from
   `docs/alan-catalogue-questions.md`.
6. **Domain.** Is `strikearms.ie` available and pointed where it needs to be? The
   canonical URLs currently assert it (FV-F4).
7. **Shop address and a real business email.** Needed for the footer, the
   structured data, the invoices and the Resend sending domain.
8. **Refunds and returns.** What is the policy, in Alan's words? It drives both
   the legal page and whether refunded stock should return to the shelf —
   currently it deliberately does not, which is right for one-off pre-loved
   items and may be wrong for new stock.
9. **Pre-loved and Jumble.** Are these always quantity-one? The reservation
   design assumes they can be, and that assumption is load-bearing.
10. **Who is on call?** With the free tier, the project pauses after about a week
    idle. Once real orders arrive, someone has to notice a failed webhook. What
    should the alerting be, and to whom?
