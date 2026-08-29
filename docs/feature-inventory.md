# Feature Inventory — Strike Arms, whole site

Every major feature across the public site, customer accounts, commerce, admin dashboard
and platform. One row per feature; sub-features listed where they are substantial enough
to be built or researched separately.

This is the **build checklist**. `build-backlog.md` is the older, looser version of the
same idea and should be retired once this file is agreed.

Last surveyed: 2026-08-29, against the working tree. Merged with the All Blooms Florist
audit the same day — the transferable detail lives in `florist-lessons.md`, organised by
the item number it applies to. Rows below marked **[florist]** have a working reference
implementation to copy; rows marked **[no ref]** do not, and have to be designed from
scratch.

**The assumption that customer accounts are the only difference between the two projects
is wrong.** The florist has no accounts, no search, no real stock control and no VAT at
all. See the top of `florist-lessons.md`.

## Status key

| Tag | Meaning |
|---|---|
| **DONE** | Built, wired to real data, verified working |
| **DEPLOYED-UNTESTED** | Code written and deployed, never exercised against reality |
| **FAKE** | UI exists but runs on mock data or a localStorage stub — looks finished, is not |
| **PARTIAL** | Real but incomplete |
| **MISSING** | Does not exist |
| **[alan]** | Blocked on Alan's answers |
| **[legal]** | Blocked on solicitor review |
| **[decision]** | Blocked on a Phil decision |

The dangerous category is **FAKE** — those screens demo perfectly and will fail the moment
a real customer touches them.

---

## A. Storefront — browsing and discovery

| # | Feature | Status | Notes |
|---|---|---|---|
| A1 | **Product catalogue** | DONE | Storefront and admin now read the same `products` table. Migration 009 required. |
| A1.1 | Swap repository to Supabase | DONE | 2026-08-29. Storefront pins `is_published = true`; write stubs deleted (admin has its own repository). |
| A1.2 | Real catalogue data | MISSING **[alan]** | Brand range unknown. Plumbing can ship without it. |
| A2 | **Shop / category pages** | DONE | Now SQL-backed. Empty until products are added in the admin. |
| A2.1 | Filtering (category, subcategory, brand, price) | DONE | Server-side. Price filters compare list price, as the filter control does. |
| A2.2 | Sorting | DONE | Price sorts use the generated `effective_price_cents`; every sort has an `id` tiebreaker so load-more cannot duplicate or skip. |
| A2.3 | Pagination | DONE | `range(0, page * pageSize - 1)` with an exact count. |
| A3 | **Product detail page** | DONE | Real data. Unpublished products 404 for everyone, admins included — no draft preview. |
| A3.1 | Per-product fulfilment messaging | DONE | Built today — "Collect in store only" vs "Delivery across Ireland". |
| A3.2 | Stock states (in/low/out/pre-order) | PARTIAL **[no ref]** | UI exists; needs real stock and agreed thresholds. The florist has a single hand-set `in_stock` boolean — no decrement, no reservation, no check at checkout. We are ahead of them here. |
| A3.3 | Related / cross-sell products | MISSING | |
| A4 | **Site search** | PARTIAL **[no ref]** | The florist has no search at all — category then filters only. Header dropdown works: pool capped at 500 published products, fetched only once a query is 2+ characters. Store `?q=` does ilike on name/brand/blurb (not tags). No dedicated search page or route. Needs a server-side search RPC before the catalogue passes the cap. |
| A5 | **Brands hub** `/brands` | PARTIAL **[alan]** | Hub renders; per-brand pages `/brands/:slug` don't exist. |
| A6 | **New arrivals / Sale** | DONE | Real `is_new` / `sale_price_cents` queries. |
| A7 | **Product images** | MISSING **[florist]** | No Supabase Storage anywhere in the codebase. Admin product images are URL strings typed by hand. Their `storage-repository.ts` is a complete, copyable pipeline: browser-side compression, JPEG unless the source is PNG (Safari WebP is unreliable), unique never-rewritten paths with `upsert: false`, 1-year immutable cache. |
| A7.1 | Orphaned-image cleanup | MISSING **[no ref]** | Design this in from the start. The florist deletes the product row and leaves every image in the bucket forever — no sweep, no reconciler. A `storage.objects` cleanup path is cheap now and painful to retrofit. |

## B. Customer accounts

**The whole of section B is [no ref].** The florist has `enable_signup = false` — no
signup, no login, no profile, no order history, no saved addresses. Checkout is entirely
anonymous and `orders.customer_email` is the only link between a person and their orders.
Everything below has to be built from the Supabase Auth docs, not lifted.

| # | Feature | Status | Notes |
|---|---|---|---|
| B1 | **Customer auth** | **FAKE** | `auth-repository.ts` is a localStorage adapter. Passwords SHA-256'd in the browser. Signup, login, session, profile — all fake. Second-biggest blocker. |
| B1.1 | Swap to Supabase Auth | MISSING | `signUp` / `signInWithPassword` / `signOut` / `getUser` / `updateUser`. Signatures unchanged. |
| B1.2 | Email verification | MISSING | **Hard blocker, worse than assumed:** the default Supabase SMTP sends only to organisation team addresses and is capped at **2 emails/hour**. Customer signup verification will simply fail for real addresses until custom SMTP is configured. Do E3 before B1. |
| B1.3 | Password reset | MISSING | |
| B1.4 | `profiles` table + RLS | MISSING | `user_id = auth.uid()`. Doesn't exist in any migration. |
| B2 | **Account page** | FAKE | Profile edit, data export, account deletion — all against localStorage. |
| B2.1 | GDPR export | PARTIAL | Downloads JSON of the fake profile. Must include real orders. |
| B2.2 | Account deletion / erasure | PARTIAL | Must anonymise order rows but retain tax records. |
| B3 | **Order history** | MISSING | **Schema has no customer↔order link.** `orders` stores email only. Needs a nullable `user_id` and an RLS read policy. **[decision]** — is this v1? |
| B4 | **Saved addresses** | MISSING | |

## C. Commerce

| # | Feature | Status | Notes |
|---|---|---|---|
| C1 | **Cart** | DONE | Built today. localStorage, type-guarded, quantity clamps, live header badge. |
| C1.1 | DB-backed cart for logged-in users | MISSING | Depends on B1. |
| C2 | **Mixed fulfilment** | DONE | Migration 007 applied. Per-product `is_shippable` (default false), per-item and per-order method, postal states. |
| C3 | **Checkout** | DEPLOYED-UNTESTED | `create-checkout-session` live, v2, `verify_jwt: false`. Prices recomputed server-side; browser sends ids + quantities only. |
| C3.1 | Stock reservation + TTL | DEPLOYED-UNTESTED | 35-min hold vs 30-min session. |
| C3.2 | Retry hygiene (`checkout_attempt_id`) | DEPLOYED-UNTESTED | |
| C3.3 | Age confirmation at checkout | PARTIAL **[alan] [legal]** | 18+ checkbox stored as `age_verified`. Self-declared only. Is that Alan's actual policy? |
| C4 | **Stripe webhook** | DEPLOYED-UNTESTED | Live, v4. Handles completed / expired / refunded. DB-level idempotency, amount + currency verification. |
| C5 | **Order confirmation emails** | **MISSING [florist]** | `notification_jobs` table exists; **nothing reads or writes it**. No provider, no templates, no send. A shop that takes money and sends nothing. The florist's outbox is the single most copyable thing in that repo and matches our dormant table's shape exactly: triggers queue, a worker drains with `Promise.allSettled`, 3 attempts, exponential backoff, Resend `Idempotency-Key`. |
| C5.1 | Customer receipt | MISSING **[decision]** | |
| C5.2 | Owner "new order" alert | MISSING | Alan needs to know an order arrived. `recipient` should store the literal `owner` and resolve to a secret at send time, so changing Alan's address never touches queued rows. |
| C5.3 | Dispatch / ready-to-collect notification | MISSING | |
| C5.4 | Alert on exhausted retries | MISSING **[no ref]** | The florist has none, and cannot confirm their worker is even scheduled. An outbox nobody watches is a queue of silent failures. |
| C6 | **Shipping rates** | PARTIAL **[alan]** | €6.50 flat / free over €75 are placeholders I invented. Zones (IE only? NI? EU?) undecided. |
| C6.1 | Move rates out of duplicated code | **MISSING — act before launch** | `shipping.ts` exists twice (`src/lib/` and `supabase/functions/_shared/`) with only a comment holding them in sync. **The florist shipped this exact pattern and it drifted in production** — two Dublin zones overcharged, eight missing server-side, so Stripe charged a different amount than the customer was quoted. Their own verdict: put the fees in a table read by both sides. |
| C7 | **VAT** | PARTIAL **[alan] [no ref]** | 23% extracted from VAT-inclusive prices. Unconfirmed by accountant. No invoice/receipt document. The florist has no tax handling of any kind — no reference. |
| C8 | **Refunds** | PARTIAL | Webhook records them; deliberately does not restock. No admin-initiated refund. |
| C9 | **Discount codes / promotions** | MISSING **[decision]** | |
| C10 | **Gift cards** | MISSING **[decision]** | `/gift-cards` is a landing page. Needs purchase, code generation, balance, redemption. |
| C11 | **Bot protection on checkout** | MISSING **[florist]** | Public endpoint that writes order rows. No Turnstile, no rate limit. Copy their fail-closed verification with a local-dev escape hatch — but add the rate limit they skipped, and render the widget explicitly into a ref'd div after mount (the implicit widget causes a hydration mismatch that silently stops token production). |

## D. Admin dashboard

| # | Feature | Status | Notes |
|---|---|---|---|
| D1 | **Admin auth** | DONE | Supabase Auth + TOTP, `is_admin()` / `is_admin_aal2()`, AAL2 required for writes. Fixed and verified this session. |
| D1.1 | Invite flow | PARTIAL | `AcceptInvitePage` exists; untested end to end. |
| D1.2 | Change password | PARTIAL | Page exists; untested. |
| D2 | **Dashboard home** | PARTIAL | Stats cards + recent orders + delivery pipeline. Will be empty until real orders exist. |
| D3 | **Product management** | PARTIAL | CRUD against Supabase works. Gaps: no image upload (A7), no bulk actions, no CSV import. |
| D3.1 | "Can be posted" flag | DONE | Built today, off by default. |
| D4 | **Category / subcategory management** | DONE | |
| D4.1 | Brand management | MISSING **[alan]** | Brands are a hardcoded list in `lib/brands.ts`, not a table. |
| D5 | **Order management** | PARTIAL **[florist]** | Table, detail sheet, status transitions, mixed-fulfilment display all built. Never seen a real order. |
| D5.1 | Admin-initiated refund | MISSING | |
| D5.2 | Packing slip / invoice print | MISSING | |
| D5.3 | **Manual order entry** | MISSING **[florist]** | **Confirmed needed** (Phil, 2026-08-29): counter sales definitely happen, and a counter sale may still need delivering. So it takes the same fulfilment split as a web order, not a simpler "sold, done" record. Needs a product picker with search — a `select` of the whole catalogue is unusable with a customer at the counter. See D5.3a–d for the schema gaps. |
| D5.3a | Make `customer_email` nullable | MISSING | It is `not null` today, which blocks a cash walk-in who gives no email. A synthetic placeholder is the wrong fix — it pollutes D7 and breaks order lookup by email. Nullable, plus a constraint requiring it when `fulfillment_method <> 'pickup'`, since a delivery needs contactable details. |
| D5.3b | `channel` column on `orders` | MISSING | `web` / `counter` / `phone`. Without it, "what did the website make" vs "what did the shop make" is unanswerable and D2's figures silently blend the two. Same class of error as the florist's archived-orders-excluded-from-revenue bug. |
| D5.3c | `payment_method` column | MISSING | cash / card terminal / bank transfer, for reconciling against the till at close of day. Stripe is only one of several ways Alan gets paid. |
| D5.3d | Admin-callable path to `confirm_order_paid` | MISSING | The function itself needs **no change** — both Stripe arguments accept null, and it already draws the order number from the same sequence, decrements stock, writes the inventory adjustment and clears reservations, so counter and web orders share one numbering sequence. But it is granted to `service_role` only and an admin in the browser is `authenticated`. Needs an Edge Function or an `is_admin_aal2()`-guarded wrapper. |
| D5.4 | Archive / restore | MISSING **[florist]** | Never hard delete an order. Second-order lesson from theirs: **archived orders must still count towards revenue.** Archiving is workflow tidy-up, not a financial event; excluding them made all-time revenue shrink whenever the owner tidied up. |
| D5.5 | Kanban board view | MISSING **[florist]** | A table is for querying, a board is for working a shift. They kept both behind a persisted toggle, forced the table below 768px, and needed separate boards for delivery vs collection. |
| D5.6 | Bulk actions + CSV export | MISSING **[no ref]** | Missing from theirs too, and named as a gap. |
| D6 | **Inquiries** | PARTIAL | Admin side reads and updates. **The public contact form is not wired to it** — `createInquiry` has no caller. |
| D7 | **Customer list** | MISSING | Read-only view + per-customer order history. Depends on B3. |
| D8 | **Service job tracker** | MISSING **[no ref]** | The services pages promise "diagnose first, quote before work". Needs booked → diagnosed → quoted → approved → in progress → done, plus notes and photos. No table, no UI. Admin-managed (no technician login in v1). |
| D9 | **Inventory adjustments** | PARTIAL | `adjust_stock` RPC and table exist; unclear if any UI calls it. |
| D10 | **Gift card admin** | MISSING **[no ref]** | Only if C10 ships. |
| D11 | **Operational alerts** | MISSING **[florist]** | Failed orders, orders pending over 24h, surfaced on the dashboard. In their system it is the only thing that reports a problem without someone going looking for it. |
| D12 | Tap-to-call / tap-to-email in detail sheets | MISSING **[florist]** | Trivial; disproportionately useful on a phone behind a counter. |

## E. Platform and backend

| # | Feature | Status | Notes |
|---|---|---|---|
| E1 | **Supabase schema** | DONE | 10 tables, 15 functions, RLS throughout. Migrations 001–008 applied; 009 written and **not yet pushed**. |
| E1.1 | GRANT audit | MISSING **[florist]** | Postgres checks GRANTs *before* RLS. Three separate silent-401 production outages on the florist traced to a missing GRANT with a perfectly correct policy — including a public contact form that 401'd on every submission while showing a success message. Worth one pass over our tables. |
| E1.2 | Never author policies in the dashboard | — | Permissive policies combine with OR, so one loose policy added in the UI defeats every tight one on the table. They needed a migration purely to reconcile the drift. |
| E2 | **Edge Functions** | PARTIAL | Two deployed. Secrets set. Needs: email sender, and anything for D8. |
| E3 | **Transactional email** | MISSING **[decision] [florist]** | Confirmed by their build: Resend, with `EMAIL_FROM` as a secret so the sender address never needs a code deploy. Playbook says Resend. Needs a verified domain, `_shared/resend.ts`, and Supabase Auth custom SMTP (default is 2/hour, team addresses only). Optionally the Auth send-email hook so auth mail goes through Resend templates too. |
| E4 | **File storage** | MISSING **[florist]** | No bucket. Blocks A7 and D8 photos. |
| E5 | **Scheduled jobs** | MISSING | `release_expired_reservations()` exists but nothing calls it on a schedule. Expired holds never release. |
| E6 | **Free-tier auto-pause** | OPEN **[decision]** | Project pauses after ~7 idle days. Pro plan or keep-alive ping before launch. |
| E7 | **Backups** | MISSING | |

## F. Content and SEO

| # | Feature | Status | Notes |
|---|---|---|---|
| F1 | **Guides cluster** (10 pages) | DONE | |
| F2 | **Services cluster** (6 pages + hub) | PARTIAL **[alan]** | Prices, turnaround, warranty missing. |
| F2.1 | Service booking / quote form | MISSING | Every CTA is tel/contact. Should feed D8. |
| F3 | **Airsoft law hub** | PARTIAL **[legal]** | Hub exists; spoke pages need solicitor sign-off. |
| F4 | **Where to play** | PARTIAL **[alan]** | Four venues sourced, unpublished, need re-verification. |
| F5 | **About** | PARTIAL **[alan]** | 5 questions outstanding. |
| F6 | **Glossary, Privacy** | DONE | |
| F7 | **T&C / Returns / Shipping policy** | **MISSING [alan] [legal]** | Legally required for EU e-commerce (14-day withdrawal right). Cannot launch a shop without these. |
| F8 | **Best-of listicles** (5 drafted) | MISSING **[alan]** | Written, unrouted. |
| F9 | **Sitemap** | **BROKEN** | `generate-sitemap.mjs` still parses `mock-products.ts`, which is now dead to the app. The sitemap advertises 56 products that do not exist. Must read Supabase before launch. |
| F10 | **SPA rendering for SEO** | OPEN **[decision] [florist]** | Meta and JSON-LD are client-injected. **The florist's evidence points one way: edge meta injection only, no prerendering.** They prerender and would not do it again — eight commits to stop it breaking the site, an unresolved React #418, and data-driven pages re-render from scratch on the client anyway, so it is a crawler snapshot rather than a performance win. Their Cloudflare `_middleware.js` half is cheap, works, and catches a 404 on a product URL to re-serve the shell with a 200 so newly published products still render. |
| F11 | **301 migration from old PHP site** | PARTIAL **[alan]** | Redirects ready. Blocked on domain ownership. |

## G. Launch engineering

| # | Feature | Status | Notes |
|---|---|---|---|
| G1 | **Cloudflare Pages deploy** | MISSING **[florist]** | No project created. Env vars, build command, `_redirects`. |
| G1.1 | `_headers` — CSP and security headers | MISSING **[florist]** | We have none. Copy theirs and adapt: full production CSP (with `worker-src 'self' blob:` for image compression), HSTS preload, `X-Frame-Options: DENY`, noindex on `/checkout` and `/order/*`, immutable caching on `/assets/*`. |
| G1.2 | `_redirects` ordering | MISSING **[florist]** | `_redirects` wins over static assets, so no rule may shadow a prerendered route, and the SPA shell destination must be extensionless (`/spa-shell`, not `.html`) — Pages 308-redirects `.html` to the clean URL, which broke every client-only route on their site. |
| G2 | **Domain** | BLOCKED **[alan]** | Does Alan own `strikearms.ie`? Launch blocker. |
| G3 | **Analytics** | MISSING **[decision]** | Cloudflare Web Analytics (cookieless, no banner) vs GA4 (needs consent). |
| G4 | **Cookie consent** | MISSING | Only if G3 uses cookies. |
| G5 | **Error monitoring** | MISSING | Optional at this size. |
| G6 | **ESLint** | MISSING **[florist]** | CLAUDE.md's lint gate references a script that doesn't exist. Theirs enforces the architecture as a machine check — `max-lines: 300`, `no-explicit-any`, `no-console`, and a `no-restricted-imports` rule banning `@/data` imports from `src/components/**`, which is our layer rule exactly. It landed late for them and forced a round of file splitting; ours should land early. |
| G7 | **Go-live runbook** | EXISTS | `ecommerce-playbook.md` §19. |
| G8 | **Verify migrations are actually applied** | MISSING **[florist]** | Their worst production incident: a migration was committed but never pushed, so refunds silently failed while returning HTTP 200. Nothing linked "in the repo" to "in the database". They now maintain a 35-row manual reconciliation table. We already have one unapplied migration (009). |
| G9 | **Automated tests** | MISSING **[no ref]** | The florist has none and names it as their main regret: every regression on their incident list was found by a human. |

---

## The things that make everything else testable

1. ~~A1.1 products repository → Supabase~~ **done 2026-08-29.** Checkout is now testable as
   soon as real products exist in the admin.
2. **E3 — transactional email.** Promoted above customer auth by research: Supabase's default
   mailer only delivers to team addresses at 2/hour, so email verification cannot work for a
   real customer until a custom SMTP provider is wired up. It blocks B1 *and* C5.
3. **B1.1 — customer auth → Supabase Auth.** Everything in section B is theatre until then,
   and it needs E3 first.
4. **C5 — order emails.** A shop that charges a card and tells nobody, including Alan, is not
   shippable regardless of how correct the payment code is.

## Suggested build order

0. **Push migration 009** (`npx supabase db push`) — price sorting errors until it lands,
   and G8 says an unapplied migration is the single most expensive kind of bug on this
   stack.
1. ~~A1.1 products → Supabase~~ — done
2. Test checkout end to end — three basket shapes, Stripe test mode
3. **C6.1 shipping rates into a table** — small, and it removes a bug the florist actually
   shipped to real customers. Do it before rates go live rather than after.
4. G6 ESLint with the layer rule as `no-restricted-imports` — cheap now, forces a
   refactor later
5. A7 + E4 image upload and storage (the catalogue is unusable without it), with A7.1
   cleanup designed in
6. E3 custom SMTP + Resend, then C5 order emails (+ C5.4 failure alert)
7. B1.1 customer auth → Supabase, then B3 order history — **no reference implementation,
   budget accordingly**
8. D5.3 manual order entry, D5.4 archive/restore, D11 alerts — the admin work the florist
   only discovered once the shop was in daily use
9. D6 wire the contact form; D7 customer list
10. F7 policy pages **[alan] [legal]**
11. D8 service job tracker
12. E5 scheduled reservation release
13. C11 bot protection
14. G1 + G1.1 + G1.2 Cloudflare Pages, headers and redirects; G2 domain; F11 cutover

Items 1–6 are the difference between a demo and a shop.

## Where the florist helps and where it doesn't

**Copy from it:** the email outbox (C5), the image pipeline (A7/E4), Turnstile (C11),
Cloudflare headers and redirects (G1.1/G1.2), the ESLint guardrails (G6), the RLS and GRANT
discipline (E1.1), and the admin screens they added under real use (D5.3–D5.5, D11, D12).

**No reference exists for:** customer accounts (all of B), search (A4), real stock control
(A3.2, C3.1), VAT (C7), age verification (C3.3), gift cards (C10), and the service job
tracker (D8). These are genuinely new builds, and they are where the estimate should go.

**Already converged independently:** deferred order numbers, `checkout_attempt_id` retry
reuse, server-side repricing, webhook dedupe after successful handling, and the
effective-price column. We are not off-course on commerce.

## Blocked-on-people, single view

**Alan:** brand/model list · delivery rates + zones + free-delivery threshold · which
products are postable · age policy · service prices/turnaround/warranty · shop address +
email + lat/long · venue re-verification · about-page questions · listicle questions ·
domain ownership · **does he take orders over the phone as well as at the counter?** ·
**does he want counter sales recorded in the system at all, or only ones he's delivering?**
(the second changes how much D5.3 has to do — a full till replacement is a much bigger
build than "record the ones that need posting").

**Accountant:** VAT rate and treatment · invoice/receipt requirements.

**Solicitor:** T&C, returns and shipping policy wording · 1 J threshold · under-16 sale
prohibition · two-tone position.

**Phil:** order history in v1? · gift cards in v1? · email provider (florist evidence says
Resend) · analytics choice · SPA prerendering (florist evidence says edge injection only,
no prerender) · Supabase Pro vs keep-alive · does Alan take phone and counter orders — if
yes, D5.3 manual order entry is not optional.
