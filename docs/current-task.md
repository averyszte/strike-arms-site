# Current Task

Last updated: 2026-08-28 (admin-login fix + mixed-fulfilment schema + Stripe checkout).

## Where the project is right now

The admin dashboard + Supabase backend are **live and working**. The public SEO site is
largely built. The **commerce path is now written end to end** — cart, checkout, Stripe
session, webhook, mixed fulfilment — but it is **not yet pushed to the database and not
deployed**. Nothing is in production. The `strikearms.ie` domain is **not secured** (launch
blocker).

Branch: `claude/admin-login-500-diagnosis-67c091` (a git worktree under `.claude/worktrees/`).

## What just happened (this session)

### 1. Admin login 500 — fixed, live, verified

Three stacked faults, not one:

- **Database side.** The admin's `auth.users` row had NULL token columns
  (`confirmation_token`, `recovery_token`, `email_change_token_*`). GoTrue scans those into
  non-nullable Go strings, so any lookup of that user 500'd with "Database error querying
  schema". Repaired in the database (set to empty string). An unknown email 400'd instead,
  which is what made the fault look user-specific.
- **Client side.** `checkIsAdmin` did a direct `select` on `admins`, but `002_rls.sql` enables
  RLS on that table with **no policies**, so the browser can never read it — the check returned
  false even for a real admin. Now routed through the existing `is_admin()` security-definer
  RPC, which keeps the table closed to browser reads as intended. (`0d8e593`)
- **The dev bypass is gone.** `DEV_BYPASS_ADMIN` / `FAKE_ADMIN_USER` removed in the same commit.
  Nothing of that stopgap remains on this branch.

Also added: `verifySupabaseConfig` (`1c70556`) — the Vite config now fails the build when the
URL/anon-key pair is missing, still a placeholder, unreadable, or belongs to two different
projects. That class of misconfiguration used to surface much later as an opaque "Invalid API
key" from an unrelated request.

### 2. Mixed fulfilment — schema + app (migration `007_mixed_fulfilment.sql`)

Alan posts gear/parts/BBs only; **guns are collect-in-store only**. The schema was
click-and-collect only.

- `products.is_shippable boolean not null default false` — **false is the safe default**: an
  item is never posted unless someone has explicitly ticked it. Plus `ship_weight_g`.
- `order_items.fulfillment_method` (`pickup|delivery`) per line.
- `orders.fulfillment_method` (`pickup|delivery|mixed`), `shipping_cents`, six `shipping_*`
  address columns, `paid_at`, `refunded_at`, `checkout_attempt_id`.
- `orders.fulfillment_status` stays **one flat enum**, extended with `packed|shipped|delivered`,
  so the existing admin UI keeps working. Per-item statuses were deliberately not built.
- Check constraints reject shipping data on a pickup order and require an address on a
  delivered one.
- **`order_number` is now deferred** — the DEFAULT and NOT NULL were dropped; the number is
  assigned by `confirm_order_paid` on payment success, so abandoned checkouts no longer burn
  numbers. Free to change now because there are zero real orders. It is `string | null`
  through the TS types; the admin UI shows "Not yet paid" via `formatOrderNumber`.

### 3. Stripe Checkout + webhook (migration `008_checkout_functions.sql`, two Edge Functions)

`supabase/functions/create-checkout-session/` — creates the pending order **before** the Stripe
session, prices every line from the database (the browser sends product ids and quantities
only, never a price), reserves stock, then creates the session. On any failure it releases the
reservation and deletes the order.

`supabase/functions/stripe-webhook/` — handles `checkout.session.completed`,
`checkout.session.expired`, `charge.refunded`; anything else returns 200 `ignored`.

Five hardening decisions worth not undoing:

1. **The database is the idempotency lock.** `claim_stripe_event` is
   `INSERT ... ON CONFLICT DO NOTHING`; a zero-row result means duplicate, bail with 200. On a
   handler throw, `release_stripe_event` runs in the catch — otherwise Stripe's retry would be
   dismissed as a duplicate and the event lost for good.
2. **`constructEventAsync` and `await req.text()`.** Web Crypto is async in Deno, so the sync
   `constructEvent` throws; and the signature must be checked against the raw body, before any
   parse.
3. **`verify_jwt = false`** for both functions in `supabase/config.toml`, or the gateway 401s
   Stripe before the handler ever runs.
4. **Reservation TTL outlives the Stripe session** — `RESERVATION_MINUTES = 35` vs
   `SESSION_MINUTES = 30`. If it were the other way round a shopper could pay for stock already
   resold. Stripe requires a session expiry of at least 30 minutes, so 35 is the floor, not a
   preference.
5. **The amount is verified, not trusted** — currency must be `eur` and `session.amount_total`
   must equal the stored `order.total_cents`, else the handler throws rather than fulfilling.
   `apiVersion` is pinned to `2024-11-20.acacia` so an SDK bump and an API-version bump stay two
   separate, reviewable decisions.

Also: `checkout_attempt_id` retry hygiene — `clear_stale_checkout_attempt` releases the previous
attempt's stock-holding order, so a shopper who backs out and retries does not hold two lots.

Refunds deliberately **do not restock**: a refunded item may have been damaged, kept, or never
collected. Restocking is a human decision in the admin.

### 4. Front end — cart and checkout

- `src/lib/cart-context.tsx` + `src/hooks/use-cart.ts` — guest cart in localStorage
  (`strike-arms:cart:v1`), read back through a field-by-field type guard because localStorage is
  untrusted input on the way in.
- `src/components/cart/` — line rows, summary, fulfilment choice (the delivery radio is disabled
  when nothing in the basket is shippable), address fields, checkout form with the 18+
  confirmation.
- `src/pages/Cart.tsx` (was a "Coming soon." stub) and `src/pages/CheckoutSuccess.tsx`.
- `src/data/checkout-repository.ts` is the only caller of the Edge Function.
- The header cart badge is live; `ProductDetail` now says "Collect in store only — we do not
  post this item" per product instead of the old blanket "Ships across Ireland".

**The success page deliberately does not read the order back.** Orders have no public RLS read
path, and the webhook can land after the browser does — a page that fetched status could
honestly show "not paid" to someone who has just paid.

### 5. Admin

Mixed-fulfilment support: fulfilment method with a Store/Truck icon, a packing warning on mixed
orders, the delivery address block, a Post/Collect suffix per item, a Delivery row in the
totals, the three new pipeline stages on the dashboard card, and a "Can be posted" checkbox on
the product form (off by default). The three duplicated `FULFILLMENT_OPTIONS` blocks were
collapsed into `src/lib/order-display.ts`.

## YOU MUST RUN THESE — nothing above is live yet

```bash
echo y | npx supabase db push
```

Then set the Edge Function secrets and deploy. **Secrets are read at boot, so the functions must
be redeployed after any secret change:**

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... SITE_URL=https://...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform. Then deploy both
functions and point a Stripe webhook endpoint at the deployed URL for the three handled events.
Use **test keys first** — the signing secret from `stripe listen` is a different secret from the
dashboard endpoint's.

```bash
npx supabase functions deploy create-checkout-session
```

```bash
npx supabase functions deploy stripe-webhook
```

## BLOCKED on Alan / the accountant (do not guess these)

1. **Real brand/model list.** THE catalogue blocker. In the 23 July meeting Alan gave only a
   rough, incomplete verbal brand note (Tokyo Marui, D-Boys, G&G, Specna Arms came up; some
   brands new, some pre-loved only — the split was not pinned down). **Brand range is currently
   UNKNOWN.** Do not reseed the catalogue until Alan supplies which brands, new vs pre-loved per
   brand, and the always-stockable models.
2. **Delivery pricing.** `SHIPPING_FLAT_CENTS = 650` and `FREE_SHIPPING_THRESHOLD_CENTS = 7500`
   are **deliberate visible placeholders**, not Alan's numbers. Checkout cannot run without a
   number, so they are named constants at the top of a named file rather than a guess buried in
   a component. Confirm the courier rate and the free-delivery threshold before go-live.
3. **VAT rate.** `VAT_RATE_BASIS_POINTS = 2300` — displayed prices are VAT-inclusive, so the
   figure is *extracted* from the gross, not added to it. Confirm the applicable rate with the
   client's accountant; do not infer it.
4. **Which products are postable.** Every real product defaults to not-shippable. Alan needs to
   tick the ones he actually posts.
5. **Shop address + real email** — finishes `/about` and the Contact NAP/schema.
6. **Domain status** — does Alan own `strikearms.ie`, has it lapsed, who's the registrar? Gates
   the entire 301 migration / cutover. Launch blocker.

Lower urgency: repairs job list + turnaround, exact warranty scope on new electricals, per-tier
best-seller models, beginner site names, gift-card amounts/format.

## Known gaps in what was just built

- **Not bot-gated.** Turnstile is not wired — Strike Arms has no Turnstile keys configured and
  no widget rendered, so a fail-closed gate would break checkout until keys exist.
  `create-checkout-session` is a public endpoint that writes an order row; add rate limiting or
  Turnstile before launch.
- **`shipping.ts` exists twice** — `artifacts/strike-arms/src/lib/shipping.ts` and
  `supabase/functions/_shared/shipping.ts`. Deno cannot import from the Vite `src/` tree. Both
  files carry a boxed warning: **change both copies in the same commit.** If they drift, the
  price quoted in the cart stops matching the amount Stripe charges — a billing bug the customer
  sees before we do.
- **Nothing has run against real Stripe.** Typecheck and the production build pass; no live or
  test payment has been taken. `stripe listen` will not prove the deployed endpoint's signing
  secret, the `verify_jwt` setting, or the platform's raw-body handling — test the deployed URL.
- **Logged-in cart is still localStorage-only.** DB-backed carts for signed-in customers were
  not built.

## Key gotchas / rules (read before working)

- **Free-tier auto-pause** recurs every ~7 idle days. If admin login dies with "Failed to fetch",
  that's it: restore from the Supabase dashboard. Before launch: Pro plan or a keep-alive ping.
- Real Supabase credentials live in `artifacts/strike-arms/.env.local`; the committed `.env`
  holds placeholders only. **`.env.local` is NOT committed, so a freshly-created git worktree
  won't have it** — copy it in from a sibling worktree, or the app boots against the placeholder
  host. Since `1c70556` the *build* fails loudly in that state instead of producing a broken
  bundle. `supabase/.temp/` (CLI link) is also local-only.
- A fresh worktree also has **no `node_modules`** — run `pnpm install` in it first.
- `supabase db push` is blocked by the permission classifier — the **user** must run it
  (`echo y | npx supabase db push`, from the worktree). A non-interactive run needs `echo y |`.
- **No emojis anywhere** — lucide-react icons only. Irish/British English.
- **Never invent Irish airsoft/firearms law.** Legal content stays question-framed /
  primary-source-cited / flagged for a solicitor. See the publication warning in
  `alan-interview-answers.md`.
- CLAUDE.md hard rules: no file >300 lines, no function >80 lines, `@/` aliases, no `any`,
  no `console.log`, layer rule (pages→hooks→data(repository)→Supabase; components never import
  data/). There is **no lint script yet** — typecheck is the gate:
  `npx tsc -p tsconfig.json --noEmit` from `artifacts/strike-arms/`.
- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`; push with
  `git push origin HEAD:main`.
- **Stay lean** — do NOT run big multi-agent workflows or the deep-research harness (a prior
  106-agent run torched the user's usage).

## Relevant files

- `supabase/migrations/001–008` · `supabase/config.toml` · `supabase/seed.sql` (WRONG brands —
  dev/demo only, do not seed production)
- `supabase/functions/create-checkout-session/**` · `supabase/functions/stripe-webhook/**` ·
  `supabase/functions/_shared/**`
- `artifacts/strike-arms/src/lib/{cart-context,cart-totals,cart-storage,shipping,order-display}`
- `artifacts/strike-arms/src/components/cart/**` · `src/pages/{Cart,CheckoutSuccess}.tsx`
- `artifacts/strike-arms/src/pages/admin/**` · `src/data/*-repository.ts` · `src/hooks/use-*`
- `artifacts/strike-arms/seo/alan-interview-answers.md` (23 July block at top = authoritative)
- `docs/build-backlog.md` · `docs/auth-roles.md`

## Suggested next step

Push migrations 007–008, deploy both Edge Functions against **Stripe test keys**, and take one
end-to-end test payment for each of the three basket shapes: all-collect, all-delivery, mixed.
That is the only thing that proves the webhook secret, `verify_jwt = false`, and the raw-body
signature check together. After that: Alan's real numbers (delivery rate, threshold, VAT), then
a bot gate on the checkout endpoint.
