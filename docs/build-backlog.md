# Build Backlog — everything still to build

Living list, last updated 2026-07-22. Tick items off as they ship. The SEO/content
follow-ups also live in `artifacts/strike-arms/seo/changelist.md` — this file is the
superset view: site + commerce + admin + infrastructure.

Status key: **[decision]** = needs Phil/Alan to decide before work starts ·
**[alan]** = blocked on Alan's answers · **[legal]** = blocked on solicitor review ·
unmarked = buildable now.

---

## 0. Recover the stranded admin/Supabase branch (do this first)

A full admin + Supabase build already exists on **`claude/wonderful-cartwright-90d699`**
(9 commits, ~7,600 lines, forked from main 2026-05-16, last commit 2026-07-15, never
merged). It contains: `/admin` pages (Dashboard, Products, Orders, Categories, Inquiries,
Login, staff invite + password flows), repositories (orders, inventory, inquiries,
categories), Supabase migrations 001–005 (schema, RLS, functions, grants), seed.sql,
typed client, and Supabase auth.

- [x] ~~Port selectively~~ — **done 2026-07-22.** Ported: `supabase/` (migrations 001–005,
  config, seed), Supabase client + database types, 4 repositories (orders, inquiries,
  inventory, categories), admin product CRUD (`admin-products-repository.ts`), 5 admin
  hooks, 19 admin components/pages, `/admin` routes (lazy-loaded — own 552 kB chunk,
  public bundle untouched), robots.txt disallow. Branch's storefront versions and doc
  rewrites deliberately NOT taken — ours are newer.
- [x] ~~Auth reconciliation~~ — namespaced instead of merged: branch's admin auth
  (Supabase + TOTP) lives as `admin-auth-context` / `admin-auth-repository`; customer
  accounts (local adapter) untouched. Customer→Supabase swap is still a future task.
- [ ] **Seed data still has wrong brands** — warning header added; replace with the real
  ASG/CYMA/EVOLUTION catalogue before seeding production **[alan]**
- [ ] **Supabase project** — no real project exists; `.env` holds placeholders. Create
  project, run migrations, set env in Cloudflare Pages
- [ ] Re-check the schema against needs discovered since (service job tracker, gift
  cards, shipping — schema is click-and-collect only, no shipping states **[decision]**)
- [ ] Wire the branch's ContactForm → inquiries table once Supabase is live (deferred:
  form would error against placeholder env)
- [ ] Customer-owns-own-orders: schema has no customer↔order link (guests + email only);
  decide whether accounts get order history in v1 **[decision]**

Items in §1 and §2 below marked **(on branch)** are partially or fully done there —
"remaining work" means porting + adapting, not greenfield.

## 1. E-commerce core

The storefront UI exists; the backend exists only on the stranded branch (§0).

- [ ] **Supabase project setup** — **(on branch)** config + migrations exist; wire env + verify project state
- [ ] **Database schema** — **(on branch)** migrations 001–005 exist; review + extend
  (service_jobs, gift_cards likely missing) and check against `lib/taxonomy.ts`
- [ ] **RLS policies** — **(on branch)** written; re-audit against auth-roles.md
- [ ] **Real catalogue data** — **[decision] [alan]** the mock catalogue is 56 products across
  15 brands the shop mostly doesn't sell (real range: ASG, CYMA, EVOLUTION). This is 57% of
  the sitemap and a launch blocker. Options: gate `/products/*` from sitemap, reseed mock
  data with the real range, or go straight to Supabase. **Undecided.**
- [ ] **Swap repositories to Supabase** — `data/products-repository.ts` (mock) and
  `data/auth-repository.ts` (local adapter) are built for exactly this swap
- [ ] **Cart persistence** — cart page exists; persist per-user (guest = localStorage, logged-in = DB)
- [ ] **Checkout flow** — no checkout page exists at all. Stripe Checkout (hosted), per docs:
  session created server-side (Edge Function), success/cancel pages
- [ ] **Stripe webhook Edge Function** — signature validation, order creation on
  `checkout.session.completed`, stock decrement
- [ ] **Shipping** — **[alan]** rates, zones (IE only? NI? EU?), free-shipping threshold,
  click-and-collect option
- [ ] **VAT handling** — prices VAT-inclusive display, invoice/receipt content **[alan]**
- [ ] **Order confirmation emails** — transactional email provider undecided **[decision]**
  (Resend/Postmark/SES via Edge Function)
- [ ] **Order history in /account** — page exists but shows only the local-adapter profile;
  needs real orders once schema lands
- [ ] **Gift cards that actually work** — `/gift-cards` is a landing page; needs purchase flow,
  code generation, redemption at checkout **[decision]** (could launch without)
- [ ] **Age gate at checkout** — **[alan] [legal]** what does Strike Arms actually require
  (18+?), and how is it verified? Tied to the under-16 sale prohibition question
- [ ] **Stock states in UI** — out-of-stock, low-stock, pre-order behaviour on PDP/cards

## 2. Admin (exists on the stranded branch — see §0; port, then fill gaps)

Per `docs/auth-roles.md`: Admin, Staff/Technician, Customer roles.

- [ ] **Admin shell** — **(on branch)** AdminRoot + Login + invite/password flows exist;
  port, keep out of sitemap/robots
- [ ] **Dashboard home** — **(on branch)** DashboardPage exists; verify what it shows
- [ ] **Product management** — **(on branch)** ProductsPage exists; verify CRUD + image
  upload completeness
- [ ] **Category/brand management** — **(on branch)** CategoriesPage exists; brand list
  must be editable once the catalogue is real
- [ ] **Order management** — **(on branch)** OrdersPage + orders-repository exist; verify
  status transitions (paid → processing → dispatched → complete)
- [ ] **Inquiries** — **(on branch)** InquiriesPage + repository exist; could become the
  intake for the service job tracker
- [ ] **Service job tracker** — the services cluster promises "diagnose first, quote before
  work": admin needs a job pipeline (booked → diagnosed → quoted → approved → done),
  Staff/Technician view for assigned jobs, job notes/photos per auth-roles.md
- [ ] **Customer list** — read-only view, order history per customer
- [ ] **Gift card admin** — issue/void codes, balance lookup (only if gift cards ship)
- [ ] **Content flags** — nice-to-have: toggle a product's "featured" state, homepage picks.
  A full CMS is out of scope; guides stay in code.

## 3. Site — public pages still missing or stubbed

- [ ] **Checkout + order-success pages** (also listed in §1 — the only missing core route)
- [ ] **Service booking / quote request form** — every service page CTA is currently
  tel/contact; a structured form (gun model, problem description, photos) feeding the
  admin job tracker would close the loop. Spam protection per api-plan.md
- [ ] **Terms & Conditions / Returns policy / Shipping policy pages** — **[alan]** required
  for e-commerce (EU consumer law: 14-day right of withdrawal); Privacy exists, these don't
- [ ] **Cookie consent** — only if analytics/marketing cookies are added; none currently
- [ ] **Per-brand pages** `/brands/{slug}` — **[alan]** hold until real range + model lines
  confirmed (ASG / CYMA / EVOLUTION — EVOLUTION is Italian, not E&L)
- [ ] **Best-of listicles** (5 drafted, unrouted) — **[alan]** 8 questions outstanding in
  `seo/drafts/best-of-listicles.md`
- [ ] **Airsoft-law spoke pages** — **[alan] [legal]** hub exists; per-topic pages need
  solicitor sign-off (1 J threshold, under-16, two-tone, imports)
- [ ] **/where-to-play venue list** — **[alan]** four venues sourced but unpublished;
  re-verify each site's operation + rules immediately before publishing
- [ ] **/about finish** — **[alan]** 5 questions in `seo/drafts/about-page-questions.md`
- [ ] **Remaining subcategory intros** (~20) — buildable now, promote as demand justifies
- [ ] **Search page / site search** — no search exists; consider once catalogue is real

## 4. Site — small fixes & data gaps

- [ ] Footer email `info@strikearms.ie` — **[alan]** confirm or remove
- [ ] Lat/long for LocalBusiness `geo` schema — **[alan]**
- [ ] Confirm NAP in `site-config.ts` still current — **[alan]**
- [ ] Service pages: real price ranges / turnaround once Alan supplies — **[alan]**
- [ ] Warranty position for service work — **[alan]**

## 5. Infrastructure / launch engineering

- [ ] **SPA rendering for SEO** — **[decision]** meta + JSON-LD are client-injected; choose
  prerender at build vs Cloudflare edge head-injection vs accept as-is. Needs sign-off
  before adding build tooling (CLAUDE.md rule)
- [ ] **Cloudflare Pages deploy** — project not yet created/wired; env vars, build command,
  `_redirects` verified in production
- [ ] **Sitemap automation** — interim script reads mock data by regex; move to reading
  Supabase (or a Pages Function) once catalogue is real
- [ ] **301 cutover plan execution** — redirects file is ready; DNS switch + old-PHP-site
  retirement checklist when launch date is set
- [ ] **Analytics** — **[decision]** nothing installed; options: Cloudflare Web Analytics
  (cookieless, no banner) vs GA4 (needs consent). Recommend Cloudflare to start
- [ ] **Error monitoring** — optional; Sentry or nothing at this size
- [ ] **ESLint setup** — CLAUDE.md's lint gate says "once ESLint is set up" — it isn't
- [ ] **Paid search-volume pull** (DataForSEO/Ahrefs) before locking SEO spend — **[decision]**
- [ ] **Backup/export routine** for Supabase once live

## 6. Blocked-on-people queue (single view)

**Alan:** about-page 5 questions · listicle 8 questions · brand model lines · service
prices/turnaround/warranty · shipping zones/rates · age policy · venue re-verification ·
email + NAP + lat/long · which sourced legal claims he wants pursued.

**Solicitor:** 1 J threshold · under-16 sale prohibition · two-tone position · anything on
law spoke pages.

**Phil (decisions):** mock catalogue handling (blocker) · SPA prerendering · transactional
email provider · analytics choice · gift cards in v1 or not · paid keyword-data spend.

---

## Suggested build order (once decisions land)

1. **Port the stranded branch (§0)** — Supabase layer + admin pages onto current main
2. Catalogue: fix seed to the real range (ASG/CYMA/EVOLUTION) → truthful brands hub,
   sitemap, PDPs
3. Auth reconciliation: Supabase auth + roles replaces the local adapter
4. Checkout: Stripe Checkout + webhook + orders (the site starts earning)
5. Admin gaps: service job tracker, staff/technician view
6. Policies/T&C + shipping + emails (launch requirements)
7. Prerendering decision + Cloudflare Pages wiring + cutover
