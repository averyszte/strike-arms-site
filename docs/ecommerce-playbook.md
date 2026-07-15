# The E‑Commerce Build Playbook

**What this is:** everything learned building and shipping a real React + Supabase + Stripe
e‑commerce store (a boutique florist), distilled into a portable guide so the *next* store
starts where the last one finished. It is written to be dropped into a new repo as the seed
for its `CLAUDE.md`, `docs/`, and `skills/`. Florist‑specific details are marked
**[EXAMPLE — adapt]**. A dedicated "Adapting to a new domain (Airsoft)" section is at the end.

Read this top to bottom once. Then keep it as reference. The single most important idea:
**architecture is a system you set up so you can't *not* follow it** — rules in `CLAUDE.md`,
enforced by ESLint + pre‑commit + CI, backed by human review. Five layers of net.

> **Note on stale docs.** The original project's docs said "React 18", "Phase 1 = inquiries
> only, no orders/customers/payments". By launch that was all superseded: React 19, full
> Stripe checkout, orders, sized product variants, DB views, MFA. When you seed a new repo,
> write the docs to describe *the end state you intend*, not an early phase — early‑phase docs
> silently teach the AI wrong assumptions for the rest of the project.

---

## 0. Table of contents

1. The stack (current, real)
2. First principles
3. Folder structure & the layer rule
4. Hard rules (coding standards)
5. Naming, imports, comments, state, styling, perf
6. Tooling & enforcement
7. Money & the product model (the biggest lesson)
8. Supabase: auth, RLS, roles, MFA, storage, edge functions, secrets
9. Payments: Stripe Checkout end‑to‑end + go‑live
10. Email: Resend, verified domains, transactional vs auth SMTP
11. Bot protection: Turnstile (fail closed)
12. Frontend rendering: SPA + prerender + edge middleware
13. SEO playbook
14. Images: the registry pattern
15. Dates & timezones (get this wrong and you bill/deliver on the wrong day)
16. Admin dashboard conventions
17. Security checklist
18. Deploy (Cloudflare Pages)
19. Go‑live runbook (generic, ordered)
20. Verification practices
21. Git / workflow
22. Gotchas hall of fame (real bugs, root cause, the rule that prevents them)
23. Adapting to a new domain (Airsoft)
24. Suggested new‑repo file layout

---

## 1. The stack (current, real)

**Frontend**
- **React 19** + **Vite 7** + **TypeScript** (strict).
- **Tailwind CSS v4** (note: some arbitrary utilities behave differently from v3 — see §14 gotcha).
- **shadcn/ui** (Radix primitives) — vendor code in `src/components/ui/`, treated as generated.
- **wouter** for routing (`<Switch>`, `<Route>`) — tiny, no data‑router.
- **react-helmet-async** for per‑page `<head>` (but see §12 — middleware actually owns prod head meta).
- **@tanstack/react-query** for all server data caching.
- **react-hook-form + zod** for every form + validation.
- **framer-motion** for the few animations that earn their place.

**Backend / infra**
- **Supabase** — Auth, Postgres (with RLS), Storage, **Edge Functions** (Deno runtime).
- **Stripe Checkout** — hosted redirect page, dynamic `price_data` (no pre‑made Price objects).
- **Resend** — transactional email, called from edge functions.
- **Cloudflare Pages** — static SPA hosting + **Pages Functions** (edge middleware) + **Turnstile** (CAPTCHA).

**Tooling**
- **pnpm** (`pnpm run typecheck`, `pnpm run lint`, `pnpm run build`).
- ESLint (flat config) + Prettier + Husky + lint-staged + CI.

**Repo shape:** monorepo with the app under `artifacts/<project-name>/`. `docs/` and `skills/`
live at repo root. `supabase/` (functions, config, migrations) lives at repo root too.

---

## 2. First principles

Every rule below targets one of four decay sources. Name them so you can spot them:

1. **Files that grow without limit** — "just for now" becomes a 2000‑line monster.
2. **Dumping‑ground modules** — `utils.ts` / `helpers.ts` / `common.ts` accrete unrelated logic.
3. **Mixed concerns** — business logic in JSX, DB calls in components, types redefined everywhere.
4. **Inconsistent shape** — slow to navigate, predictable bugs, grep‑hostile.

Design goal: a new file's location, name, and contents should be *obvious* and *uniform*, so
both humans and AI drop code in the right place by default.

---

## 3. Folder structure & the layer rule

```
src/
  types/        # shared TS types, one domain per file (product.ts, order.ts, inquiry.ts)
  data/         # repository pattern — the ONLY place that talks to external services
  hooks/        # React hooks (state + side effects), one hook (or one domain group) per file
  lib/          # pure functions, named by purpose (price-format.ts, delivery-zones.ts)
  components/
    ui/         # shadcn primitives — DO NOT edit for feature work; exempt from size limits
    <feature>/  # feature-grouped components (checkout/, catalog/, admin/, product/, sections/)
  pages/        # route components, one per route
```

**The layer rule — dependencies flow ONE direction only:**

```
pages (routes) → hooks (React state/effects) → data (repository) → external services
```

- `lib/` = pure functions (no React, no side effects), usable from any layer.
  - **One allowed exception:** a single app‑wide React context provider (e.g. `lib/cart-context.tsx`)
    may live in `lib/` — cross‑cutting shared state with no home in `hooks/` or `components/`.
- `components/` used by pages and other components; rarely by hooks.
- **A component must never call an external service directly.** It calls a hook → the hook calls
  the repository → the repository calls Supabase/Stripe/etc. This makes backend swaps trivial:
  swap function *bodies* in `data/`, never the *signatures*.

**Repository pattern:** every external call lives in `data/*-repository.ts` (reads AND writes).
Signatures are stable. Mapping DB rows → app types happens in one place (`lib/mappers.ts`).
- **Allowed exception:** auth pages may import `auth-repository` directly. The Supabase auth SDK
  is a thin session/MFA boundary; one‑shot page actions (sign in/out, password update, MFA verify)
  gain nothing from a pass‑through hook. *Every other* external call routes through a hook.

---

## 4. Hard rules (coding standards)

Banned, non‑negotiable, enforced by lint where possible:

- **No file over 300 lines.** Pure data/registry files are exempt (mark them with an eslint‑disable
  comment explaining why).
- **No function over 80 lines of logic.** Presentational components that are pure JSX are exempt —
  the limit targets *logic density*; hoist logic into a hook or pure function.
- **No files named** `utils.ts` / `helpers.ts` / `common.ts` / `misc.ts`. Name by purpose.
- **No direct external‑service calls outside `src/data/`.**
- **No business logic inline in JSX** — compute above the `return`.
- **No relative imports past one level** — use `@/` aliases.
- **No `any`.** Use `unknown` and narrow, or model the type properly.
- **No `@ts-ignore` / `@ts-expect-error`.** Fix the type.
- **No `console.log`** in committed code.
- **No magic numbers/strings** in business logic — extract named constants
  (`MAX_PRICE_CENTS`, `SAME_DAY_CUTOFF_HOUR`).
- **No mutating props/state/arguments** — treat as readonly.
- **No new wrapper around a single primitive** that adds no behavior.

**Stop‑and‑split at 250 lines.** When a file approaches 250, ask: does it do more than one thing?
Split by concern. Half data + half logic? Data → `lib/foo-data.ts`, logic stays.

**Refactor signals:** function with 5+ args → config object; component with 10+ props → doing too
much; file importing 15+ things → too coupled; same value computed in 3 places → memoize once in a hook.

**Before finishing ANY task:**
1. `pnpm run typecheck` — must pass.
2. `pnpm run lint` — must pass with **zero** warnings.
3. If a created/grown file crosses 250 lines, propose how to split it.
4. If you added a dependency, justify it.

---

## 5. Naming, imports, comments, state, styling, perf

**Naming (pick once, never deviate — inconsistency is grep‑hostile):**
- File → kebab‑case (`product-card.tsx`, `price-format.ts`).
- Component → PascalCase (`ProductCard`). Hook file → `use-kebab.ts`; export → `useCamelCase`.
- Function → camelCase. Constant → SCREAMING_SNAKE_CASE. Type/Interface → PascalCase.
- Boolean → `is/has/should/can` (`isLoading`, `hasSizes`).

**Components:** one per file; props as `type FooProps = {…}` (not `interface` unless extending);
default values in destructuring; composition over config props (`<Card><CardHeader/></Card>`).

**Hooks:** one hook per file — **exception:** small query/mutation hooks for one domain may share
`use-<domain>.ts` (e.g. `use-orders.ts` exporting `useOrders`, `useUpdateDeliveryStatus`). Splitting
into 25 one‑line files is grep‑hostile churn. Follow rules of hooks; never conditional.

**Imports:** `@/` aliases beyond one folder up; group external → internal aliases → relative with a
blank line between groups; no barrel `index.ts` files except `components/ui/`.

**Comments:** default none (names explain *what*). Comment *why*, not *what*. No commented‑out code
(git remembers). No `TODO` without an issue number. **The most valuable comments are the ones that
warn the next dev about a non‑obvious coupling** — e.g. "this value is DUPLICATED in the edge
function; change both in the same commit." Write those liberally.

**State (source‑of‑truth hierarchy):**
- **URL** = shareable state (filters, pagination, tabs). Read/write search params; reload preserves.
- **React Query** = server data cache. Never mirror server data in `useState`.
- **Local `useState`** = ephemeral UI only (modal open, hover, input draft).
- Avoid global state managers unless a genuine cross‑cutting concern.

**Styling:** Tailwind utilities, not custom CSS; no inline `style` for static styles (see §14 for
the one legit dynamic exception); extract className strings >100 chars via `cva` or a wrapper; no
`!important`. **Import `cn` from `@/lib/class-names`, not `@/lib/utils`** (the latter is a vendor
shim for shadcn — leave it alone).

**Performance defaults:** below‑the‑fold images `loading="lazy" decoding="async"`; LCP image gets
`fetchpriority="high"` + preload; code‑split non‑critical routes via `React.lazy`; virtualize lists
above ~100 items; cache network calls via React Query.

**Error handling:** validate at boundaries (user input, API responses); trust internal calls; don't
catch what you can't handle; don't add defensive checks for impossible states — trust the types.
**But never swallow a boundary error into a generic message** — surface what the user can act on
(see §22, the password bug).

---

## 6. Tooling & enforcement (the five layers)

1. **`CLAUDE.md` at repo root** — read every session. Contains stack, folder rules, hard‑rule
   highlights, the before‑finish checklist, "when in doubt, stop and ask." Non‑negotiable.
2. **ESLint** (fails the build). Key rules to configure:
   - `max-lines: 300`, `max-lines-per-function: 80`
   - `@typescript-eslint/no-explicit-any: error`
   - `@typescript-eslint/ban-ts-comment: error`
   - `import/no-cycle: error`
   - `import/no-relative-parent-imports: error`
   - `no-console: warn`
   - `@typescript-eslint/naming-convention` matching the naming rules above
3. **Prettier** — formatting is not a debate.
4. **Husky + lint-staged** — pre‑commit runs `eslint --fix` + `prettier --write` on staged files;
   bad code physically can't commit. (Heads‑up: lint‑staged reformats your staged files during the
   commit — expect the committed content to differ slightly from your working copy.)
5. **CI** — typecheck + lint on every PR.
6. **Human review** — catches scope creep, hallucinated APIs, architectural drift.

**Prompting the AI (this matters as much as the code rules):**
- One logical unit per task. Don't ask for "cart, checkout, account, and admin" at once.
- Always specify file paths and signatures: "add `formatPrice(cents: number): string` in
  `src/lib/price-format.ts`."
- Describe the *contract*, not the implementation.
- Ask for a plan before implementation on anything spanning >5 files.
- **Run lint/typecheck yourself. Never trust an "all good!" claim.**
- Refuse the classic anti‑patterns: "I'll just add `any` for now", "I'll make a `helpers.ts`",
  "I'll inline this in JSX", "I'll skip typecheck, small change", "I'll add this feature while I'm here."
- Run periodic (weekly) audits: files >250 lines, functions >50 lines, duplicated blocks,
  dumping‑ground filenames, logic in JSX, external calls outside `data/`, `any` usage, naming drift.

---

## 7. Money & the product model — the single biggest lesson

**Store ALL money as integer cents. Everywhere. Always.** €35.00 → `3500`. One formatter divides by
100 at the very edge:

```ts
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('en-IE', { style: 'currency', currency: 'EUR' });
}
```
If a component ever passes euros to `formatPrice`, you get €0.35. If it passes cents to something
expecting euros, you get €3500. Keep the unit in the *name* if there's any doubt (`priceCents`,
`fromPriceCents`).

**Product variants / sizes — the trap that cost us a visible bug:**
- Products can have **size variants** (Small/Large/Deluxe, or for Airsoft: different SKUs/editions),
  each with its own price in a **`product_sizes`** table (`price_cents`, `sale_price_cents`, `label`,
  `sort_order`).
- When a product has sizes, the **base `products.price` column becomes an unreliable placeholder**
  (it was literally `3500`/€35 on many rows). **Do not display it.**
- Expose a **DB view** (`product_card_view`) that computes, per product:
  - `has_sizes` (boolean)
  - `min_size_price_cents` (the cheapest variant → the "From" price)
  - `effective_price_cents` (cheapest size, else sale, else base — used for **filtering & sorting**)
- **Every card/carousel/list must use ONE shared price formatter**, never raw `price`:

```ts
// sized → "From €X" (cheapest size); else sale price if on sale, else base. All cents.
export function formatProductCardPrice(p: {
  price: number; salePrice?: number; hasSizes?: boolean; fromPriceCents?: number;
}): string {
  if (p.hasSizes) return `From ${formatPrice(p.fromPriceCents ?? p.price)}`;
  const sale = p.salePrice;
  if (sale !== undefined && sale < p.price) return formatPrice(sale);
  return formatPrice(p.price);
}
```
**Rule:** the catalog card and every carousel/upsell/related widget share this exact function.
If two places compute price independently, they *will* drift (they did — the carousels showed a flat
€35 while the catalog was correct). Single source of truth for the price *string*, not just the data.

**Cart line pricing:** the cart computes an `effectivePriceCents(item)` (chosen size's sale price →
size price → product sale → product base) and multiplies by quantity. Add‑ons (e.g. a greeting card)
are separate line modifiers with their own `priceCents`/`salePriceCents`.

**Row → type mapping** happens once in `lib/mappers.ts` (`mapProduct`, `mapProductSize`, `mapOrder`,
…). Views add derived fields (`min_size_price_cents`, `has_sizes`) onto the row type as optional
props. Parse DB enums through a `parseEnum(VALUES, raw, label)` helper so a bad value fails loudly
rather than silently mistyping.

---

## 8. Supabase: auth, RLS, roles, MFA, storage, edge functions, secrets

**Auth model:**
- Admin logs in with email + password → Supabase issues a JWT session.
- Admin‑ness is a row in an **`admins`** table (`id` FK → `auth.users.id`), checked via a
  **`is_admin()` security‑definer** Postgres function: `select exists (select 1 from public.admins
  where id = auth.uid())`.
- Frontend check: `getSession()`, then query `admins` (`.select('id').eq('id', uid).maybeSingle()`).
  `data === null` → not an admin even with a valid session.
- All `admins`/auth SDK calls live in `data/auth-repository.ts`
  (`signIn`, `signOut`, `getSession`, `isAdminUser`, MFA helpers). Components/hooks never call
  `supabase.auth` directly (except the auth‑pages exception in §3).

**Auth guard / routing:**
- `/admin/login` lives **outside** the auth guard (inside it → redirect loop).
- The guard handles a **`loading`** state (spinner) before deciding — no redirect flash.
- Use a `/admin/:rest*` catch‑all wrapping `<AuthGuard><AdminLayout/></AuthGuard>` so `App.tsx`
  stays stable while admin sub‑routes evolve.

**MFA / AAL2 (do this if the admin panel touches money or PII):**
- Enroll TOTP via `supabase.auth.mfa.enroll` / `challengeAndVerify`.
- Enforce it **in RLS**, not just the UI — e.g. an `is_admin_aal2()` function that requires the JWT's
  assurance level to be `aal2`. Because it's DB‑enforced, MFA can't be bypassed by poking the client.
- Password‑recovery flow: the recovery link establishes an **AAL1** session; if the user has MFA,
  check `getAuthAssuranceLevel()` and show the **TOTP step before** the password form, or writes fail
  with `insufficient_aal` (401).
- Trade‑off to know: DB‑enforced MFA means you can't "just skip it" for a new admin — they must
  enroll. Budget for that in onboarding.

**RLS patterns (every table gets policies):**
- Public read of published/in‑stock rows; admin full CRUD.
- Public **INSERT‑only** on lead/enquiry tables (anyone submits, nobody reads); admin SELECT/UPDATE;
  often **no DELETE** (keep an audit trail).
- Service‑role key bypasses RLS — **server‑side only**, never in the frontend bundle.
- Any table the admin UI writes should be behind the AAL2 admin check if MFA is in play. Watch for
  gaps — secondary tables (gallery, add‑ons) are easy to forget.

**Storage:**
- Public bucket for product/site media (`product-images`), path `/{product-slug}/{filename}`, URLs
  stored in `products.images[]`. Public read, admin‑only write.
- Private buckets for anything sensitive.
- Truly static site imagery (hero, decorative) is just files in `public/`, served by the CDN — not
  in Storage. Only user/admin‑uploaded media goes in Storage.

**Edge Functions (Deno):**
- Live in `supabase/functions/<name>/`, shared code in `supabase/functions/_shared/`.
- Per‑function `verify_jwt` is set in `supabase/config.toml`:
  ```toml
  [functions.stripe-webhook]
  verify_jwt = false        # Stripe calls it with no JWT
  [functions.create-checkout-session]
  verify_jwt = false        # public site calls it with the anon key only
  ```
  Public‑facing functions and webhooks must be `verify_jwt = false` (a deploy respects config, so a
  plain `supabase functions deploy` preserves it — but verify after).
- **Deno can't import from the Vite `src/` tree.** So any constant shared between frontend and an
  edge function (delivery fees, tax rates, shipping bands) gets **duplicated** — once in
  `src/lib/…` and once in the function. **Comment both copies loudly** ("DUPLICATED — change both in
  the same commit"). A mismatch bills the customer a different amount than they were quoted.

**Secrets & the cold‑start gotcha (this bit us more than once):**
- Function secrets are set in the dashboard (or `supabase secrets set`), read at **boot**.
- **Changing a secret does NOT affect running instances** until they cold‑start. To force new
  values, **redeploy the function** (`supabase functions deploy <names>`). "I updated the secret but
  nothing changed" = you didn't redeploy.
- `supabase secrets list` shows each secret's **name + a SHA‑256 digest** of the value (not the
  plaintext) + last‑updated time. Use it to confirm a secret *exists* and *when it changed*; you
  cannot read the value back. You *can* confirm a known value by hashing it yourself and comparing
  the digest (great for non‑secret values like `SITE_URL`) — but don't brute‑force guess sensitive
  ones; that reads as credential exfiltration and will (rightly) be blocked.

**Env var naming discipline:** frontend gets `VITE_`‑prefixed public vars only
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Edge functions read their own secrets. A subtle bug
class: a Pages Function that reads `SUPABASE_URL` when only `VITE_SUPABASE_URL` is bound → 500.
Read both names with a fallback, and give a static fallback where possible (see the sitemap function).

---

## 9. Payments: Stripe Checkout end‑to‑end

**Flow (hosted Checkout, no client‑side card handling):**
1. Client builds a cart, calls the **`create-checkout-session`** edge function with line items +
   fulfilment details (+ Turnstile token, see §11).
2. The function **recomputes prices server‑side from the DB** (never trust client prices), creates a
   pending order row, then a Stripe Checkout Session with **dynamic `price_data`** (unit_amount in
   cents), `mode: 'payment'`, `metadata: { order_id }`, `payment_intent_data: { metadata: { order_id }}`,
   and `success_url`/`cancel_url` built from the **`SITE_URL`** secret.
3. Returns the session URL; client redirects to Stripe's hosted page.
4. **`stripe-webhook`** edge function handles `checkout.session.completed` (mark paid, send emails),
   `checkout.session.expired` (mark abandoned), `charge.refunded` (mark refunded, record
   `refund_cents`/`refunded_at`, matched by `stripe_payment_intent_id`).
5. Webhook verifies the signature with `constructEventAsync` and the **`STRIPE_WEBHOOK_SECRET`**;
   keep an **event‑log table for idempotency** so a redelivered event isn't processed twice.

**Secrets:** `STRIPE_SECRET_KEY` (the `sk_…`, server‑side only), `STRIPE_WEBHOOK_SECRET` (`whsec_…`).
The publishable key (`pk_…`) is the only Stripe key that may reach the client.

**Test → live go‑live (order matters):**
1. Build & test everything in **test/sandbox mode** first (test key `sk_test_…`, test webhook, card
   `4242 4242 4242 4242`).
2. Flip to live: put the **live** `sk_live_…` in `STRIPE_SECRET_KEY`.
3. Create a **live** webhook endpoint → it has its **own** `whsec_…`, **different from the test one**.
   Put that in `STRIPE_WEBHOOK_SECRET`.
4. **Set the secrets first, THEN redeploy** the functions (cold‑start rule, §8).
5. `SITE_URL` must be the production apex (`https://yourdomain`), or Stripe redirects users back to
   the wrong (staging) host after payment.
6. Smoke‑test with a real card on the live site: pay → land on `/order/success` → both emails arrive
   → order shows paid in admin → refund it → order flips to refunded + refund email.
7. Verify live‑vs‑test quickly: in **live** mode Stripe **declines** the `4242` test card.

**Webhook URL never changes** across domain moves — it's the Supabase function URL
(`https://<ref>.supabase.co/functions/v1/stripe-webhook`), not your site URL.

---

## 10. Email: Resend + verified domains

- Transactional email (order confirmations to customer + owner) sent from edge functions via Resend.
- **The FROM address must be on a Resend‑verified domain**, or Resend returns **403** and nothing
  sends. Verifying a domain = adding DKIM/SPF (and ideally DMARC) TXT records in DNS.
- Keep the FROM in one shared module (`_shared/resend.ts`) behind an env override:
  ```ts
  const FROM_ADDRESS = Deno.env.get("EMAIL_FROM") ?? "Store <orders@yourdomain>";
  ```
  Changing it requires a **function redeploy** (cold‑start rule again).
- `OWNER_EMAIL` secret = where owner notifications go. Flip it from your address to the client's at
  go‑live.
- **Two totally separate email systems — don't confuse them:**
  1. **Transactional** (Resend, your code) — order emails.
  2. **Supabase Auth emails** (password reset, invites, magic links) — these go through **Supabase's
     own SMTP**, which is rate‑limited to a couple per hour and is *not* for production. Fix:
     configure **custom SMTP = Resend** in Supabase Auth settings (host `smtp.resend.com`, port 465,
     user `resend`, password = a Resend API key, sender on your verified domain), then raise the Auth
     email rate limit. "Email rate limit exceeded" on a reset/invite = you hit Supabase's shared SMTP
     cap and haven't set custom SMTP yet.

---

## 11. Bot protection: Turnstile (fail closed)

- Cloudflare Turnstile on the public write paths (checkout, enquiry form). Frontend renders the
  widget with the **site key**; the edge function verifies the token with the **secret key**.
- **Fail closed:** if verification fails or the secret isn't configured, **reject** the request. The
  consequence: the frontend site key and the backend secret key must be set **together** in prod, or
  those flows break entirely. Add both as a single go‑live checklist item.

---

## 12. Frontend rendering: SPA + prerender + edge middleware

The site is a client‑rendered SPA, but search engines and link previews need real HTML. Two pieces:

- **Build‑time prerender** (`react-dom/static`): static pages are rendered to HTML at build so the
  body content + JSON‑LD exist without JS. A flag (e.g. `__ABF_NO_HYDRATE__`) marks pages that ship
  as static HTML only.
- **Edge middleware** (Cloudflare Pages Function, `functions/_middleware.js`): owns the per‑route
  **`<head>`** (title, meta description, canonical, OG). This is the *source of truth* for head meta
  in production — `react-helmet-async` is the dev/runtime fallback. When you add a route, add its
  head entry to the middleware.
- **Hydration discipline:** any content that differs between server render and first client render
  (random shuffles, `Date.now()`, locale) causes a **React hydration mismatch (#418)** and can break
  things downstream (e.g. Turnstile). Make such content **deterministic** — seed shuffles, render the
  same server set until an `isHydrated` flag flips. We hit a benign #418 and it's a persistent smell;
  avoid from the start.

---

## 13. SEO playbook

- **One `<h1>` per page**, correct `h2/h3` hierarchy, semantic HTML.
- **[EXAMPLE — adapt] Hero convention on important landing pages:** the small **eyebrow is the `<h1>`**
  and the big display line beneath is an **`<h2>`**. (Keeps the keyword‑rich phrase as the H1 while
  the visual hero line stays a subhead.) Decide your convention and keep it consistent.
- **Structured data (JSON‑LD):** `LocalBusiness`/`Organization` with real NAP (name/address/phone),
  hours, geo. `Product` schema on product pages. `AggregateRating` **only with real numbers** — never
  invent a rating or review count.
- **Canonicals** point at the live apex domain, never a staging `.pages.dev` or a dead domain.
- **`sitemap.xml`** generated by an edge function that reads published rows from the DB, with a static
  fallback and correct env‑var names (see §8). **`robots.txt`** references it.
- **URL / slug changes** must ship **301 redirects** (in `_redirects`) so link equity and bookmarks
  survive.
- Compress images (WebP), lazy‑load below the fold, minimize JS, watch LCP/CLS.

---

## 14. Images: the registry pattern

- **One registry file** (`src/lib/site-images.ts`) is the single source of truth for every
  non‑product image. Every slot has its **own entry** (`src`, `alt`, optional `label`/`description`),
  grouped by page (`homepage`, `aboutPage`, `weddingPage`…). Changing one slot never changes another;
  want two slots to share a photo? Type the same filename in both. Truly shared things (the storefront
  photo) are defined once and referenced.
- All images **WebP**, descriptive filenames (`hero-homepage.webp`, `section-wedding-arch.webp`),
  stored in `public/gallery/` (or similar). Product images come from the DB/Storage, not this file.
- Standardize aspect ratios in one place (e.g. product imagery `aspect-[3/4]`) so cards, galleries,
  and skeletons match.
- **[GOTCHA] Tailwind v4:** arbitrary `object-[40%_center]` position classes don't apply reliably.
  Using an inline `style={{ objectPosition: '40% center' }}` is the intentional, documented exception
  to the "no inline styles" rule. Leave a comment saying why.

---

## 15. Dates & timezones

Get this wrong and you deliver/charge on the wrong day. Rules that came out of real bugs:

- **Compute "today" and any cutoff in the *business* timezone** (e.g. `Europe/Dublin`), never the
  customer's device tz. Someone ordering from abroad must not get a same‑day slot that's already past
  the cutoff locally. Derive the business‑local Y/M/D/hour via `Intl.DateTimeFormat` with
  `timeZone`.
- **Parse `YYYY-MM-DD` form values as LOCAL dates**, not UTC. `new Date("2026-07-03")` is UTC
  midnight and, compared to a local‑midnight "today," flips a day depending on tz/season. Build from
  parts: `new Date(y, m-1, d)`.
- **Fulfilment windows:** encode business hours and prep time as named constants
  (`CLOSING_HOUR`, `PREP_HOURS`), and make "earliest available date" **skip closed days** so the
  calendar, the hint text, and the schema validation all agree. If the hint says "tomorrow" but the
  calendar greys out tomorrow (a closed day), you have drift — one shared function must produce the
  earliest date for all three consumers.
- **Validate on both client and server.** Client for UX, server (schema/edge function) because the
  client can be bypassed.
- **Single source of truth** for these helpers (`lib/delivery-zones.ts` or `lib/fulfilment.ts`),
  imported by the date picker, the timeslot picker, and the zod schema. Never re‑derive the rule in
  the component.

---

## 16. Admin dashboard conventions

- Simple, scalable, fast. Sidebar nav, clear hierarchy, responsive.
- Role‑based access (RLS + UI), loading states, error handling, search/filter, efficient tables.
- **Minimize Supabase requests** — no polling loops; share query cache keys across widgets that need
  the same rows (e.g. two carousels use the same `['showcase-products', 10]` key so the rows fetch
  once). Paginate long lists.
- Mobile: wide tables need a scroll affordance (edge fade/shadow) or a card view at small widths.
- Admin theme should inherit the design tokens so a palette change cascades with zero per‑component
  edits.
- **Don't overwrite live data you're only inspecting.** If the owner might be editing the same record
  while you verify, don't "restore" values that merely look changed.

---

## 17. Security checklist

- Never expose secret/service‑role keys; only `VITE_`‑public vars reach the client.
- RLS on every table; public vs admin access separated; sensitive tables INSERT‑only for the public.
- Protect admin routes (guard + RLS); check permissions before sensitive actions; **never trust
  client‑side checks alone**.
- Stripe secret key server‑side; **validate webhook signatures**; never trust payment status from the
  client — the webhook is the source of truth.
- Validate all user input at the boundary (zod); don't leak sensitive error details, but **do** give
  users an actionable message.
- Turnstile fail‑closed on public write paths.
- MFA/AAL2 enforced in RLS for money/PII admin actions.

---

## 18. Deploy (Cloudflare Pages)

- SPA on Cloudflare Pages; **`public/_redirects` is required** for client routing (`/* /index.html
  200`) and for any 301s. **`_redirects` wins over static assets** — order/precedence matters.
- Verify env vars are set in the Pages project (build‑time `VITE_*`).
- Pages Functions provide the edge middleware (§12) and utility endpoints (sitemap).
- After every push: confirm the build is green, the site loads, forms/API work, mobile is intact.
- Custom domains + automatic SSL handled by Cloudflare; add both apex and `www`.

---

## 19. Go‑live runbook (generic, ordered)

Do these roughly in order; several have hidden ordering dependencies (noted).

1. **Domain → Cloudflare:** add the zone, point DNS, add apex + `www` as Pages custom domains, SSL
   auto‑provisions. Confirm `http→https` 301 and `www→apex` (or your canonical choice).
2. **Resend:** add + verify the production domain (DKIM/SPF/DMARC in DNS). *Blocks* the FROM change.
3. **Code:** set the transactional FROM to the verified domain.
4. **Supabase secrets:** `SITE_URL=https://yourdomain`, `OWNER_EMAIL=client@…`, Stripe **live** keys,
   Turnstile keys. (Set *before* deploying — cold‑start.)
5. **Deploy all edge functions** (respecting `verify_jwt` config). Verify each is alive.
6. **Supabase Auth → URL config:** Site URL + redirect URLs = the production domain (fixes
   invite/reset links that otherwise point at staging).
7. **Supabase Auth → SMTP:** custom SMTP = Resend, on the verified domain (after step 2). Raise the
   Auth email rate limit.
8. **Stripe:** live keys + live webhook (its own `whsec_`), confirm webhook still points at the
   Supabase function URL.
9. **Smoke test live:** real‑card order → success page → both emails → admin shows paid → refund →
   refunded state + email. Enquiry form → owner email. Password reset → arrives via Resend.
10. **SEO:** submit sitemap in Search Console, verify canonicals resolve to the live apex, connect the
    Google Business Profile, wire the "leave a review" link to the GBP deep link
    (`g.page/r/<id>/review`).
11. **Handover:** move ownership of Stripe/Supabase/Resend/Cloudflare/DNS to the client; rotate any
    keys the outgoing agency held.

---

## 20. Verification practices

- **Always** run `pnpm run typecheck` + `pnpm run lint` before declaring done.
- **`tsx` one‑off scripts** are the fastest way to prove *pure logic* (date math, price formatting,
  error mapping) without spinning a browser — import the real module, assert outputs at controlled
  inputs (e.g. a fixed "now"). Do it whenever the tricky part is a calculation. (`Date.now()` /
  `Math.random()` are non‑deterministic — pass a fixed `now` into functions instead.)
- **Query the live DB read‑only** via the anon key + PostgREST to confirm data assumptions before
  coding a fix (e.g. "are all showcase products sized? what are the real `min_size_price_cents`?").
- **Browser preview** for anything visual; check console + network for errors, read the accessibility
  tree for structure, screenshot for proof. Test responsive + dark mode.
- Verify the *observable behavior*, not just that it compiles.

---

## 21. Git / workflow (adapt to your setup)

- Commit in coherent units; **push in batches**, not after every commit.
- Keep security/bug fixes as **separate commits** so diffs stay reviewable.
- **[EXAMPLE — this project's quirks; may not apply]** Work sometimes happens in a git *worktree*
  that drifts behind `main`; the deployed site builds from `main`. Before editing, confirm which tree
  is live and whether the worktree has the latest commits. Files (e.g. dropped images) sometimes land
  in the *main* checkout, not the worktree — check `git status` there. Fast‑forwarding `main` from a
  worktree used an explicit `git push origin <sha>:refs/heads/main`.
- **Windows/Git Bash:** `curl` needs `--ssl-no-revoke`; expect CRLF↔LF warnings.

---

## 22. Gotchas hall of fame (real bugs → root cause → rule)

1. **Every carousel showed €35.** Root: products are sized; base `products.price` is a placeholder;
   carousels rendered raw `price` while the catalog used the "From" logic. **Rule:** one shared
   `formatProductCardPrice` for *all* product summaries (§7).
2. **Checkout redirected to the staging `.pages.dev` after payment.** Root: `SITE_URL` secret still
   pointed at staging. **Rule:** `SITE_URL` = prod apex before go‑live; secrets take effect only after
   redeploy (§8/§9).
3. **Order emails 403'd / didn't send.** Root: FROM was on an unverified domain in the new Resend
   account. **Rule:** FROM must be a verified domain; changing it needs a redeploy (§10).
4. **"Email rate limit exceeded" sending an invite/reset.** Root: Supabase's built‑in Auth SMTP cap.
   **Rule:** configure custom SMTP (Resend) for Auth; it's separate from transactional email (§10).
5. **Password change failed with a useless "Could not update."** Root: Supabase `weak_password` (422,
   needs a digit) was swallowed by a bare `catch`. **Rule:** mirror the provider's password policy
   client‑side for instant, specific feedback, and surface the server error code — never swallow a
   boundary error (§5).
6. **Date hint said "tomorrow" but the calendar greyed tomorrow out.** Root: "earliest date" didn't
   skip closed days, so hint/calendar/schema disagreed. **Rule:** one shared earliest‑date function,
   closed‑day aware, feeds all three (§15).
7. **Could pick a same‑day slot minutes before closing.** Root: no prep‑time buffer. **Rule:** encode
   `PREP_HOURS`/`CLOSING_HOUR`; filter unfulfillable windows in the business tz (§15).
8. **Sitemap 500.** Root: function read un‑prefixed `SUPABASE_*` when only `VITE_SUPABASE_*` was
   bound. **Rule:** read both names + static fallback (§8/§13).
9. **Refund didn't update the order.** Root/likely: missing `refund_cents`/`refunded_at` columns +
   transient email failure. **Rule:** the webhook is the source of truth; keep an event log; match
   refunds by `stripe_payment_intent_id` (§9).
10. **A hydration #418 warning** that risked Turnstile. Root: nondeterministic first render. **Rule:**
    deterministic SSR/CSR output; seed randomness; gate client‑only content behind `isHydrated` (§12).

---

## 23. Adapting to a new domain (Airsoft)

Most of this playbook is domain‑agnostic. What actually changes for an Airsoft store:

- **Age verification / restricted sales.** Airsoft (and RIFs — realistic imitation firearms) have
  legal age gates (18+) and, in some jurisdictions, defence/eligibility requirements at checkout.
  Add an **age‑gate** and an eligibility/consent step, capture it on the order, and treat it as a
  boundary validation (client + server). This replaces nothing in the florist flow — it's *added*.
  Treat any legal/compliance copy as **client‑supplied** and don't invent the rules — confirm them.
- **Shipping vs florist delivery zones.** Replace the same‑day / eircode delivery‑fee model with a
  **shipping model** (courier bands by weight/price, flat rate, or free‑over‑threshold). Same pattern:
  a single `lib/shipping.ts` source of truth, **duplicated in the checkout edge function** with the
  loud "change both" comment (§8). Some items may be **carrier‑restricted** (batteries/LiPo, gas,
  pyro) — model per‑product shipping flags.
- **Product attributes.** Airsoft products have structured specs (FPS/energy in joules, calibre/BB
  weight, magazine capacity, powerplant: AEG/GBB/spring/HPA, fps‑at‑which‑BB). Model these as typed
  product fields and/or a spec table; drive faceted filtering off them via a `product_card_view`‑style
  view (`effective_price_cents` still applies for sort/filter).
- **Variants.** Colour/edition/package variants map cleanly onto the `product_sizes` pattern — keep
  the "**From** price" rule; the €35 bug will happen to *any* variant model that shows base price.
- **Stock is real.** Florist stock was soft; airsoft retail usually tracks real inventory counts.
  Add `stock_qty`, decrement on paid orders (in the webhook, idempotently), and block over‑selling
  server‑side.
- **Currency/locale.** Swap `en-IE`/`EUR` in the formatter and the business timezone in the date
  helpers. Everything else (cents, `formatPrice`, `formatProductCardPrice`) is unchanged.
- **Everything else is the same:** repository/layer rules, RLS, admin + MFA, Stripe Checkout + webhook,
  Resend, Turnstile, prerender + middleware head meta, image registry, Cloudflare Pages, the go‑live
  runbook, and the verification practices.

---

## 24. Suggested new‑repo file layout

```
CLAUDE.md                      # stack + hard-rule highlights + before-finish checklist + "stop and ask"
docs/
  architecture.md              # folder shape, layer rule, size limits, refactor signals (§3–§5 here)
  database-plan.md             # tables, RLS policies, views, storage buckets, money-in-cents rule
  auth-contract.md             # admins table, is_admin(), guard, routes, MFA/AAL2 (§8)
  payments.md                  # Stripe Checkout flow, webhook events, test→live (§9)
  fulfilment.md                # shipping/delivery + date/timezone rules (§15) — or delivery-zones
  seo.md                       # head/middleware ownership, JSON-LD, canonicals, sitemap (§12–§13)
  go-live-runbook.md           # the ordered checklist (§19)
  client-context.md            # business, brand, audience, compliance constraints
  current-task.md              # live task log: current, shipped, blockers, known issues, gotchas
skills/
  coding-rules.md              # the full hard-rules list (§4–§5)
  ai-pairing-skill.md          # how to prompt + the five enforcement layers (§6)
  supabase-skill.md  security-skill.md  cloudflare-skill.md
  seo-skill.md  ui-ux-skill.md  dashboard-skill.md  conversion-skill.md
supabase/
  config.toml                  # per-function verify_jwt
  functions/<name>/  functions/_shared/
  migrations/
```

**CLAUDE.md must include, at minimum:** the stack (one line), the layer rule (one line), 3–5 hard
rules verbatim, the before‑finish checklist (`typecheck` + `lint` zero warnings), the "when in doubt,
stop and ask / don't invent paths / don't add unasked features" clause, and a pointer to
`docs/architecture.md` + `skills/coding-rules.md`. Have the AI read all of `docs/` and `skills/` on
session start and reply with a short confirmation before writing any code.

---

*End of playbook. Keep `docs/current-task.md` and this file updated as the new project teaches you
new lessons — the whole point is that the docs describe the end state, not an early guess.*
