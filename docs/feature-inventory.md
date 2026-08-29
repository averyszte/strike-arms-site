# Feature Inventory — Strike Arms, whole site

Every major feature across the public site, customer accounts, commerce, admin dashboard
and platform. One row per feature; sub-features listed where they are substantial enough
to be built or researched separately.

This is the **build checklist**. `build-backlog.md` is the older, looser version of the
same idea and should be retired once this file is agreed.

Last surveyed: 2026-08-29, against the working tree.

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
| A3.2 | Stock states (in/low/out/pre-order) | PARTIAL | UI exists; needs real stock and agreed thresholds. |
| A3.3 | Related / cross-sell products | MISSING | |
| A4 | **Site search** | PARTIAL | Header dropdown works: pool capped at 500 published products, fetched only once a query is 2+ characters. Store `?q=` does ilike on name/brand/blurb (not tags). No dedicated search page or route. Needs a server-side search RPC before the catalogue passes the cap. |
| A5 | **Brands hub** `/brands` | PARTIAL **[alan]** | Hub renders; per-brand pages `/brands/:slug` don't exist. |
| A6 | **New arrivals / Sale** | DONE | Real `is_new` / `sale_price_cents` queries. |
| A7 | **Product images** | MISSING | No Supabase Storage anywhere in the codebase. Admin product images are URL strings typed by hand. Needs a bucket, upload UI, resizing, and the registry pattern from the playbook. |

## B. Customer accounts

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
| C5 | **Order confirmation emails** | **MISSING** | `notification_jobs` table exists; **nothing reads or writes it**. No provider, no templates, no send. A shop that takes money and sends nothing. |
| C5.1 | Customer receipt | MISSING **[decision]** | |
| C5.2 | Owner "new order" alert | MISSING | Alan needs to know an order arrived. |
| C5.3 | Dispatch / ready-to-collect notification | MISSING | |
| C6 | **Shipping rates** | PARTIAL **[alan]** | €6.50 flat / free over €75 are placeholders I invented. Zones (IE only? NI? EU?) undecided. |
| C7 | **VAT** | PARTIAL **[alan]** | 23% extracted from VAT-inclusive prices. Unconfirmed by accountant. No invoice/receipt document. |
| C8 | **Refunds** | PARTIAL | Webhook records them; deliberately does not restock. No admin-initiated refund. |
| C9 | **Discount codes / promotions** | MISSING **[decision]** | |
| C10 | **Gift cards** | MISSING **[decision]** | `/gift-cards` is a landing page. Needs purchase, code generation, balance, redemption. |
| C11 | **Bot protection on checkout** | MISSING | Public endpoint that writes order rows. No Turnstile, no rate limit. |

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
| D5 | **Order management** | PARTIAL | Table, detail sheet, status transitions, mixed-fulfilment display all built. Never seen a real order. |
| D5.1 | Admin-initiated refund | MISSING | |
| D5.2 | Packing slip / invoice print | MISSING | |
| D6 | **Inquiries** | PARTIAL | Admin side reads and updates. **The public contact form is not wired to it** — `createInquiry` has no caller. |
| D7 | **Customer list** | MISSING | Read-only view + per-customer order history. Depends on B3. |
| D8 | **Service job tracker** | MISSING | The services pages promise "diagnose first, quote before work". Needs booked → diagnosed → quoted → approved → in progress → done, plus notes and photos. No table, no UI. Admin-managed (no technician login in v1). |
| D9 | **Inventory adjustments** | PARTIAL | `adjust_stock` RPC and table exist; unclear if any UI calls it. |
| D10 | **Gift card admin** | MISSING | Only if C10 ships. |

## E. Platform and backend

| # | Feature | Status | Notes |
|---|---|---|---|
| E1 | **Supabase schema** | DONE | 10 tables, 15 functions, RLS throughout. Migrations 001–008 applied. |
| E2 | **Edge Functions** | PARTIAL | Two deployed. Secrets set. Needs: email sender, and anything for D8. |
| E3 | **Transactional email** | MISSING **[decision]** | Playbook says Resend. Needs a verified domain, `_shared/resend.ts`, and Supabase Auth custom SMTP (default is 2/hour, team addresses only). Optionally the Auth send-email hook so auth mail goes through Resend templates too. |
| E4 | **File storage** | MISSING | No bucket. Blocks A7 and D8 photos. |
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
| F10 | **SPA rendering for SEO** | OPEN **[decision]** | Meta and JSON-LD are client-injected. Prerender vs edge injection vs accept. |
| F11 | **301 migration from old PHP site** | PARTIAL **[alan]** | Redirects ready. Blocked on domain ownership. |

## G. Launch engineering

| # | Feature | Status | Notes |
|---|---|---|---|
| G1 | **Cloudflare Pages deploy** | MISSING | No project created. Env vars, build command, `_redirects`. |
| G2 | **Domain** | BLOCKED **[alan]** | Does Alan own `strikearms.ie`? Launch blocker. |
| G3 | **Analytics** | MISSING **[decision]** | Cloudflare Web Analytics (cookieless, no banner) vs GA4 (needs consent). |
| G4 | **Cookie consent** | MISSING | Only if G3 uses cookies. |
| G5 | **Error monitoring** | MISSING | Optional at this size. |
| G6 | **ESLint** | MISSING | CLAUDE.md's lint gate references a script that doesn't exist. |
| G7 | **Go-live runbook** | EXISTS | `ecommerce-playbook.md` §19. |

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

1. ~~A1.1 products → Supabase~~ — done
2. Test checkout end to end — three basket shapes, Stripe test mode
3. A7 + E4 image upload and storage (the catalogue is unusable without it)
4. E3 custom SMTP + Resend, then C5 order emails
5. B1.1 customer auth → Supabase, then B3 order history
6. D6 wire the contact form; D7 customer list
7. F7 policy pages **[alan] [legal]**
8. D8 service job tracker
9. E5 scheduled reservation release
10. C11 bot protection
11. G1 Cloudflare Pages + G2 domain + F11 cutover

Items 1–4 are the difference between a demo and a shop.

## Blocked-on-people, single view

**Alan:** brand/model list · delivery rates + zones + free-delivery threshold · which
products are postable · age policy · service prices/turnaround/warranty · shop address +
email + lat/long · venue re-verification · about-page questions · listicle questions ·
domain ownership.

**Accountant:** VAT rate and treatment · invoice/receipt requirements.

**Solicitor:** T&C, returns and shipping policy wording · 1 J threshold · under-16 sale
prohibition · two-tone position.

**Phil:** order history in v1? · gift cards in v1? · email provider · analytics choice ·
SPA prerendering · Supabase Pro vs keep-alive.
