# Current Task

Last updated: 2026-09-02 (handover). The previous revision described migrations 007-008 as
unpushed and claimed there was no lint script. Both were out of date; corrected below.

## Where the project is right now

The Supabase backend is **fully migrated and live** — migrations `001` through `016` are all
applied and verified against the real project. The admin dashboard works. The public site is
largely built and the commerce path is written end to end. Nothing is in **production** yet:
there is no Cloudflare Pages project (G1) and the `strikearms.ie` domain is still unconfirmed
(G2). Those two are the launch blockers.

Branch: `claude/admin-login-500-diagnosis-67c091`, in a git worktree under `.claude/worktrees/`.
`origin/main` and `origin/claude/admin-login-500-diagnosis-67c091` are both at `1dfc41a`. The
worktree is clean.

Feature inventory (`docs/feature-inventory.md`), last counted: **51 DONE, 26 MISSING, 17 PARTIAL,
4 DEPLOYED-UNTESTED, 1 BLOCKED**. That file is the master list — read it before picking work.

## What landed in the last session

Three commits, all pushed:

- **`ff71e1e` fix(build): stop requiring Replit's PORT and BASE_PATH.** `vite.config.ts` had two
  module-scope `throw`s left over from Replit: it demanded a valid `PORT` and read `BASE_PATH`.
  Cloudflare Pages sets neither, so the build died before it started. Removed. Verified: a build
  with neither variable set emits root-absolute `/assets/...` URLs, which is what nested routes
  need. `verifySupabaseConfig` (`1c70556`) is deliberately untouched — that check is wanted.
- **`1250a5e` fix(db): make the search_text expression immutable (015).** `supabase db push`
  failed on 015 with `generation expression is not immutable (SQLSTATE 42P17)`. Cause:
  `array_to_string` is marked STABLE, not IMMUTABLE, because it takes `anyarray` and for some
  element types the output function reads session state (`timestamptz` reads `TimeZone`).
  Postgres has one volatility marking per function, so it takes the weakest case. Fix: a narrow
  wrapper `public.text_array_to_string(text[], text)` marked `immutable` — for `text[]` that is
  genuinely true, not a lie told to the planner. **Its body must never be edited in place.** A
  stored generated column is computed once and written to disk; `create or replace` does not
  recompute existing rows, so a changed body would silently leave old rows holding stale text.
  Granted to `authenticated, service_role` only: the column is evaluated by whoever writes the
  row, and reads do not evaluate it, so `anon` is correctly excluded.
- **`1dfc41a` fix(search): stop reporting a failed search as an empty one.** Found by actually
  running the dev server: typing "rifle" showed "No results for 'rifle'" while the RPC was
  404ing. `use-search-products.ts` destructured only `data`, and `data ?? NO_RESULTS` flattened
  a hard error into an empty array. It now surfaces `isError` and `isPending`, and skips React
  Query's retries for `PGRST*` codes (PGRST202 = function not in the exposed schema, PGRST204 =
  column missing — deterministic facts, so three more attempts cannot help). Without that skip
  the honest message took about seven seconds to appear. `SearchDropdown.tsx` gained a four-way
  panel (error, searching, results, no results) and `SearchResultRow.tsx` was extracted to keep
  it under the line limit. Verified live: search returns 6 real products, `/store?q=rifle`
  returns 8.

## YOU MUST RUN THESE

1. **Pull in the main checkout.** Local `main` in
   `C:\Users\Avery\Downloads\_Easywebs\_Repos\strike-arms-site` is around 50 commits behind
   `origin/main`. Nothing is stranded — it is an ancestor of HEAD — but it needs
   fast-forwarding. Run this in the **main checkout, not the worktree**:

```bash
git pull --ff-only
```

2. **Deploy the refund function.** `supabase/functions/refund-order/` was written in `1f769fd`
   but has never been deployed:

```bash
npx supabase functions deploy refund-order
```

3. **Confirm `charge.refunded` is in the Stripe endpoint's event list** in the Stripe dashboard.
   The webhook handles it, but if the endpoint is not subscribed to it the event never arrives.

`supabase db push` is blocked by the permission classifier — the **user** must run it, from the
worktree, as `echo y | npx supabase db push`. Nothing is currently pending: 001-016 are applied.

## BLOCKED on Alan / the accountant (do not guess these)

1. **Real brand/model list.** THE catalogue blocker. The 23 July meeting produced only a rough
   verbal note (Tokyo Marui, D-Boys, G&G, Specna Arms came up; the new vs pre-loved split was
   not pinned down). **Brand range is UNKNOWN.** 56 demo products are seeded and published — do
   not treat them as real. Do not reseed until Alan supplies the brands, new vs pre-loved per
   brand, and the always-stockable models.
2. **Delivery pricing.** `SHIPPING_FLAT_CENTS = 650` and `FREE_SHIPPING_THRESHOLD_CENTS = 7500`
   are **deliberate visible placeholders**, not Alan's numbers. Checkout cannot run without a
   figure, so they are named constants at the top of a named file rather than a guess buried in
   a component. Zones (IE only? NI? EU?) are also undecided.
3. **VAT rate.** `VAT_RATE_BASIS_POINTS = 2300` — displayed prices are VAT-inclusive, so the
   figure is *extracted* from the gross, not added to it. Confirm with the accountant. Alan's
   VAT registration number is also still needed for a printed invoice.
4. **Which products are postable.** Every product defaults to not-shippable. Alan must tick the
   ones he actually posts.
5. **Shop address + real email** — finishes `/about` and the Contact NAP/schema.
6. **Domain status** — does Alan own `strikearms.ie`, has it lapsed, who is the registrar? Gates
   the whole 301 migration. Launch blocker.

Lower urgency: repairs job list + turnaround, warranty scope on new electricals, per-tier
best-seller models, beginner site names, gift-card amounts/format.

## Known gaps, roughly in the order they matter

- **G1 Cloudflare Pages** — no project created. Env vars, build command, `_redirects`. The Vite
  config no longer blocks this (see `ff71e1e`).
- **C3 / C3.1 / C3.2 / C4 are DEPLOYED-UNTESTED.** Nothing has run against real Stripe. Take one
  end-to-end test payment for each basket shape — all-collect, all-delivery, mixed. That is the
  only thing that proves the webhook signing secret, `verify_jwt = false`, and the platform's
  raw-body handling together. `stripe listen` does not prove the deployed endpoint.
- **C11 bot protection** — `create-checkout-session` is a public endpoint that writes an order
  row. No Turnstile, no rate limit.
- **E3 transactional email / C5.x notifications** — no receipt, no owner "new order" alert, no
  dispatch notice, no alert on exhausted outbox retries. Resend with `EMAIL_FROM` as a secret is
  the reference pattern. An outbox nobody watches is the failure mode to avoid.
- **B1-B4 customer accounts** — still on the placeholder auth. B1.2 email verification is a hard
  blocker: default Supabase SMTP only sends to organisation team addresses and is rate-capped.
  B3 order history needs a nullable `orders.user_id` plus an RLS read policy; the schema
  currently stores email only.
- **Search ranking oddity, flagged not fixed.** Real data shows "ASG 3-9x40 Rifle Scope"
  outranking "G&G CM16 Raider AEG" for "rifle", because a name match scores 6 and a tag match
  only 2 — so an actual rifle whose name lacks the word ties with green gas. A category-match
  score would fix it in one migration, but the desired ordering needs a decision first.
- **Tidy-up carried over:** drop `p_adjusted_by` from `adjust_stock` and
  `inventory-repository.ts` now that 014 is applied; `listInquiries` is unpaged;
  `checkout_reservations.order_id` has a cascade leak; `ProductDetail.tsx` is at 259 lines
  (limit 300, split threshold 250); the orphan image sweeper's deploy and cron schedule are
  unverified.
- **D8 service job tracker** has no agreed spec. **G9 automated tests** would be a stack
  decision — CLAUDE.md forbids picking one unilaterally, so ask before adding vitest.

## Key gotchas / rules (read before working)

- **Free-tier auto-pause** recurs every ~7 idle days. If admin login dies with "Failed to fetch",
  that is it: restore from the Supabase dashboard. Before launch: Pro plan or a keep-alive ping.
- Real Supabase credentials live in `artifacts/strike-arms/.env.local`; the committed `.env`
  holds placeholders only. **`.env.local` is NOT committed, so a freshly created worktree will
  not have it** — copy it in from a sibling worktree. Since `1c70556` the build fails loudly in
  that state rather than producing a broken bundle. `supabase/.temp/` is also local-only.
- A fresh worktree also has **no `node_modules`** — run `pnpm install` in it first.
- **`shipping.ts` exists twice** — `artifacts/strike-arms/src/lib/shipping.ts` and
  `supabase/functions/_shared/shipping.ts`. Deno cannot import from the Vite `src/` tree. Both
  carry a boxed warning: **change both copies in the same commit.** If they drift, the price in
  the cart stops matching what Stripe charges — a billing bug the customer sees first.
- **No emojis anywhere** — lucide-react icons only. Irish/British English.
- **Never invent Irish airsoft/firearms law.** Legal content stays question-framed,
  primary-source-cited, and flagged for a solicitor.
- **Do not paste secrets into the chat.** No service-role key, no Stripe secret key, no webhook
  signing secret, no `.env` contents. The Supabase anon key and the project ref
  (`cxnhkgndvzgyqhiwsvrr`) are public by design and are the only exceptions. Never put a
  placeholder secret inside a runnable bash fence — the app renders a Run button on those.
- **Stay lean** — do NOT run big multi-agent workflows or the deep-research harness. A prior
  106-agent run torched the user's usage.
- CLAUDE.md hard rules: no file over 300 lines, no function over 80 lines, `@/` aliases, no
  `any`, no `console.log`, layer rule (pages to hooks to data to Supabase; components never
  import from `data/`). Both gates exist and must pass:

```bash
pnpm --filter @workspace/strike-arms run typecheck
```

```bash
pnpm --filter @workspace/strike-arms run lint
```

- Commits end with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`; write the message to
  a file and use `git commit -F`, never `-m` with a here-string. Push with
  `git push origin HEAD:main`.
- Prettier lives at the worktree root:
  `node node_modules/.pnpm/prettier@3.8.1/node_modules/prettier/bin/prettier.cjs --single-quote --print-width 100 --write <files>`

## Relevant files

- `docs/feature-inventory.md` — the master status list, read this first
- `supabase/migrations/001-016` · `supabase/config.toml` · `supabase/seed.sql` (WRONG brands,
  dev/demo only, never seed production)
- `supabase/functions/{create-checkout-session,stripe-webhook,refund-order,sweep-orphan-images}/`
  · `supabase/functions/_shared/**`
- `artifacts/strike-arms/src/lib/{cart-context,cart-totals,cart-storage,shipping,order-display}`
- `artifacts/strike-arms/src/pages/admin/**` · `src/data/*-repository.ts` · `src/hooks/use-*`
- `artifacts/strike-arms/seo/alan-interview-answers.md` (the 23 July block at the top is
  authoritative)
- `docs/build-backlog.md` · `docs/auth-roles.md`

## Suggested next step

Ask which of these the user wants first:

1. **Prove the money path.** Deploy `refund-order`, confirm the Stripe event list, then take one
   test payment per basket shape. This is the largest block of DEPLOYED-UNTESTED work and the
   part most likely to be quietly broken.
2. **Create the Cloudflare Pages project (G1).** The build blocker is gone, so this is now
   unblocked, and it is a launch blocker.

The user's stated method is: work through the list one item at a time, back end before front end.
