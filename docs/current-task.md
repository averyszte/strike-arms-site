# Current Task

Last updated: 2026-09-28 (Phase 4 in progress, branch `claude/phase-2-money-path`). Replaces
the end-of-Phase-1 revision.

## Where the project is right now

The plan being followed is `docs/audit/completion-plan.md`. Phase 1 (admin dashboard) is done
and on `origin/main`. **Phase 2, the money path, is done in code except item 17**, on branch
`claude/phase-2-money-path`, not pushed:

- 13: migration 028 checkout integrity (applied by the user), plus the "paid for stock that had
  gone" flag in the admin.
- 14: migration 029 webhook alerts. Mismatched amounts confirm and flag instead of throwing;
  money with no order goes to `payment_alerts` and the dashboard's unmatched payments card;
  walked-away checkouts are `expired`, not `failed`. v1 is limited to instant payment methods
  (decision D4).
- 15-16: the success page polls the new `checkout-status` function, shows the order number, and
  says "do not pay again" if confirmation does not come. The checkout attempt id lives in
  sessionStorage, so a retry after Stripe's cancel link reuses it.
- 18: the cart re-reads price and postability when it opens and says what changed. It is
  cleared only on a confirmed payment.
- **17 (Turnstile and rate limit) is planned, not coded.** It needs keys from the Cloudflare
  dashboard. See "Item 17 plan" below.

Migrations renumbered again: 029 `webhook_alerts`, 030 notifications, 031 notification extras,
032 service_role grants, 033 rate limit, 034 inquiries lockdown, 035 indexes, 036 housekeeping. `db push` refuses a
file numbered below one already on the remote, so numbers follow the order they are written.

Push only when the user asks, with `git push origin HEAD:main`.

## NEEDS THE USER for Phase 2 (in this order)

1. DONE 2026-09-28 (push; verify-rls re-run not confirmed). `echo y | npx supabase db push` for **029**, then re-run `supabase/verify-rls.sql`
   (`payment_alerts` is new and should show no review rows).
2. DONE 2026-09-28. Deploy the three changed functions: `stripe-webhook`, `create-checkout-session`,
   and the new `checkout-status`.
3. **Still to do (user deferring it).** Stripe dashboard, webhook endpoint: tick `checkout.session.async_payment_succeeded` and
   `checkout.session.async_payment_failed`.
4. DONE 2026-09-28. Stripe dashboard, payment methods: leave only instant methods on (cards, Apple Pay,
   Google Pay). D4.
5. **Still to do.** One test payment end to end: the success page should show the order number within a few
   seconds and the cart should empty only then.

## Phase 3 (email): done in code except items 19 and 23

- 20: `_shared/resend.ts` (idempotency key, reply-to) and a null-safe `escapeHtml`.
- 21: migration 030. Triggers on orders queue emails in the same transaction as the change:
  confirmation, owner alert (web orders), ready to collect / posted, refund. A skip-locked
  claim with a lease, backoff to five attempts, and a cron job that calls the worker only when
  a job is due, reading the key from Vault at run time.
- 22: `notification-worker`, one template per email. `'owner'` resolves from `OWNER_EMAIL`.
- 24: migration 031. A low-stock email when `stock_count` falls to the product's threshold,
  and a Resend button per email on the order sheet (a fresh copy to the current address).
- 19 (DNS) is the user's. 23 (`submit-inquiry`) waits for the Turnstile keys, like item 17.

## NEEDS THE USER for Phase 3

Done 2026-09-28: 030 and 031 pushed, `verify-rls.sql` re-run. Its one fail row
(`resend_notification` callable from the browser) came from an older copy of the script; the
committed one allow-lists it, since it is the order sheet's Resend button and checks aal2 itself.
The other row (`anon-insert-inquiries`, review) stays until item 23.

Emails are queuing from now on (every paid order, status change, refund, low-stock drop) and
wait harmlessly until the worker is scheduled.

**Now:**

1. DONE 2026-09-28. Deploy `sweep-orphan-images` (its service-role check moved to `_shared`) and
   `notification-worker`. Safe without the secrets: nothing calls the worker until step 5.

**Later, in this order. Do not do step 5 before step 3:** a scheduled worker without secrets
fails every queued email five times over about 30 minutes and marks them Failed, and each one
then needs Resend on the order sheet.

2. Item 19: verify the sending domain in Resend (SPF, DKIM, DMARC records at the DNS host).
3. Function secrets: `RESEND_API_KEY`, `EMAIL_FROM` (an address on the verified domain) and
   `OWNER_EMAIL` (where Alan's alerts go). `SITE_URL` is already set for checkout.
4. Optional: if the backlog is old, drop it so weeks-old confirmations do not go out at once:
   `delete from public.notification_jobs where status = 'pending';`
5. In the SQL editor: make sure Vault has a secret named `service_role_key` (Project Settings,
   API, service_role key), then run
   `select public.schedule_notification_worker('https://cxnhkgndvzgyqhiwsvrr.supabase.co');`
6. Test: mark an order ready to collect in the admin; the customer email should arrive within
   a minute and show as Sent on the order sheet.

## Phase 4 (storefront): 25, 27, 29, 30 done in code

- 29-30: zoom allowed; canonicals and `og:url` go through `SITE_URL` (`lib/site-config.ts`),
  which reads `VITE_SITE_URL` and defaults to `https://strikearms.ie`.
- 27: a failed product, brand or listing read shows a retryable "Could not load" state, with no
  noindex. Only a read that succeeded and found nothing is a 404. `AppErrorBoundary` around the
  router turns a render crash into a reload page instead of a blank screen.
- 25 (decision D1, guest): the fake localStorage accounts are gone (`auth-repository`,
  `auth-context`, `RequireAuth`, Login, Signup, the fake GDPR delete). `/account` is now "Track
  your order": order number plus checkout email, via the new `order-lookup` function, which
  returns status, items and totals but never name, address or phone. A wrong email answers the
  same as a missing order. `/login` and `/signup` redirect to `/account`. The header and utility
  bar say "Track an Order". Real accounts come later, in the same migration that narrows the
  `authenticated` grants (FV-D2).
- **Not rate limited yet.** Order numbers run in sequence, so the email is the only secret. Key
  `order-lookup` into the 033 rate limit when item 17 is built.
- Still open in Phase 4: 26 (legal pages, needs Alan and a solicitor; the Privacy draft still
  has the "keep you signed in" cookie line and a marketing preference), 28 (stock display, needs
  D3).

## NEEDS THE USER for Phase 4

1. DONE 2026-09-29: `order-lookup` deployed. It answered 500, and so did `checkout-status`:
   004 never granted anything to `service_role`, so no Edge Function could read a table.
   **`npx supabase db push` for migration 032 `service_role_grants`.** No redeploy needed.
   Checkout, the webhook and the notification worker were broken the same way, so do this
   before the Phase 2 test payment.
2. Optional, Cloudflare Pages env var `VITE_SITE_URL` only if the site is served somewhere other
   than `https://strikearms.ie` (for example while on `pages.dev`).
3. Test: look up a real paid order on `/account` with its number and email; a wrong email
   should say it could not find the order.

## Item 17 plan (not started)

- `_shared/turnstile.ts` ported from All Blooms, fail-closed (missing secret means refuse,
  `ALLOW_INSECURE_NO_CAPTCHA=true` only for local), with a `SITE_HOSTNAME` check.
- The Turnstile widget on the checkout form; the token goes in the create-checkout-session body.
- Length caps in `readString`/`readOptionalString` in `parse-request.ts`.
- Migration 033 `checkout_rate_limit`: a per-IP and per-attempt counter the function checks
  before reserving stock.
- CSP: `challenges.cloudflare.com` in `script-src` and `frame-src` in `public/_headers`.
- The inquiry form has no function to verify a token in yet. It gets Turnstile with item 23
  (`submit-inquiry`) and migration 034, not here.
- Needs the user: a Turnstile site in Cloudflare, `VITE_TURNSTILE_SITE_KEY` in `.env.local` and
  Pages, and `TURNSTILE_SECRET_KEY` plus `SITE_HOSTNAME` as Supabase function secrets, all in
  the same deploy as the code.

## What landed in Phase 1

- 022 admin security, 023 admin reads need aal2, `verify-rls.sql` extended.
- Stock left the product form (ledger only). Orders page and search on the server. Error states
  on every admin screen.
- Auth: password reset, token_hash invite and reset links, one password policy
  (`lib/password-policy.ts`), templates in `supabase/templates`, dashboard steps in
  `docs/admin-auth-emails.md`. 024 plus 027: an invited user gets an `admins` row (024's
  trigger missed because Supabase writes `invited_at` in a later UPDATE; 027 fixed and
  backfilled).
- 025 order status rules, restock on cancel, insert-only ledger.
- 026 product archive: products list pages on the server, stock filter, archive not delete.
- Tidy-ups: `lib/utils.ts` is now `lib/class-names.ts`; `ProductsTable` and `OrdersView` split
  into hooks and panels.

## NEEDS THE USER (aal2 admin session)

0. **Import batch 2 (106 new products, emails of 19 and 27 Sep).** Run `upload-images.mjs`,
   then `build-csv.mjs --batch=2`, then import `products-batch-2.csv`, then import
   `safety-tags.csv` (moves the live masks onto `/safety-equipment`). Never re-import the full
   `products.csv`: it would unpublish everything. See `scripts/catalogue-import/README.md`.

1. **Confirm the 018 backfill count of 14** in the admin product list. Anon cannot see
   unpublished rows, so this was not verifiable from REST.
2. **Set stock to 1 on the 14 pre-loved rifles.** They are one-offs; the importer always writes
   0, so each needs one `adjust_stock`.
3. **Spot-check 3 imported products** for photo and price before anything is published.
4. **A1.3, a testing blocker:** every row is `is_shippable = false`. Flip 2-3 so the delivery
   and mixed-basket flows can be exercised.
5. **Regenerate the sitemap after publishing.** `public/sitemap.xml` still lists the demo products
   and 15 brand pages that now 404. The script refuses to write when nothing is published, by
   design:

```bash
pnpm --filter @workspace/strike-arms run sitemap
```

Also still outstanding: delete the orphan storage image `ce710cbd-de92-446f-875e-4985ba0635ed.jpg`,
deploy `refund-order` (`npx supabase functions deploy refund-order`), and confirm
`charge.refunded` is in the Stripe endpoint's event list.

## BLOCKED on Alan / the accountant (do not guess these)

1. **Which items are postable.** The unblocking question in `docs/alan-catalogue-questions.md`
   is "which items do you actually post?". That doc still needs forwarding to Alan.
2. **The 22 "unbranded" rows.** Decide before launch; as-is they generate `/brands/unbranded`.
3. **Delivery pricing.** `SHIPPING_FLAT_CENTS = 650` and `FREE_SHIPPING_THRESHOLD_CENTS = 7500`
   are deliberate visible placeholders. Zones (IE only? NI? EU?) are undecided.
4. **VAT rate.** `VAT_RATE_BASIS_POINTS = 2300`, extracted from VAT-inclusive prices. Confirm with
   the accountant; Alan's VAT number is needed for a printed invoice.
5. **Shop address + real email** for `/about` and the Contact NAP/schema.
6. **Domain status** of `strikearms.ie`. Gates the 301 migration; launch blocker.

## Open items, roughly in order

- **Decide whether the sitemap runs inside `build`.** Pro: a deploy can never ship a stale
  sitemap. Con: the build fails while nothing is published, which would block a Cloudflare
  preview deploy. Not decided.
- **G1 Cloudflare Pages** project: env vars, build command, `_redirects`.
- **C3 / C3.1 / C3.2 / C4 are DEPLOYED-UNTESTED.** One real test payment per basket shape
  (all-collect, all-delivery, mixed). Needs A1.3 first.
- **C11 bot protection** on `create-checkout-session`: Phase 2 item 17, planned above.
- **E3 transactional email / C5.x notifications.** Deferred, never chosen.
- **B1-B4 customer accounts.** Not in v1 (D1, guest lookup instead). When built, narrow the
  `authenticated` grants in the same migration.
- **Search ranking:** a name match scores 6 and a tag match 2, so a scope can outrank a rifle for
  "rifle". Needs a decision on desired ordering before a migration.
- **Content clusters, later:** the guides (10 pages + GuidesHub), then the bespoke pages
  About, AirsoftLaw, WhereToPlay, Glossary, Privacy, GiftCards.
- Tidy-up: the orphan image sweeper's deploy and cron schedule are unverified.

## Key gotchas / rules (read before working)

- **Free-tier auto-pause** every ~7 idle days. "Failed to fetch" on admin login means restore it
  from the Supabase dashboard.
- **A fresh worktree has no `.env.local`, `node_modules` or `supabase/.temp/`.** Copy `.env.local`
  into `artifacts/strike-arms/` from a sibling worktree and run `pnpm install` at the root (it
  installs, then the root preinstall hook reports a failure; the packages are there).
- **Gates:** `pnpm --filter ... run typecheck/lint` fails on the root preinstall hook. Run the
  binaries directly from `artifacts/strike-arms`:

```bash
../../node_modules/.bin/tsc -p tsconfig.json --noEmit
```

```bash
./node_modules/.bin/eslint .
```

- `supabase db push` is blocked for Claude. The user runs it from the worktree as
  `echo y | npx supabase db push`.
- **`shipping.ts` exists twice**: `artifacts/strike-arms/src/lib/shipping.ts` and
  `supabase/functions/_shared/shipping.ts`. Change both in the same commit.
- **No emojis anywhere.** lucide-react icons only. Irish/British English.
- **Never invent Irish airsoft/firearms law.** Question-framed, primary-source-cited, flagged for
  a solicitor.
- **No secrets in chat.** The Supabase anon key and project ref `cxnhkgndvzgyqhiwsvrr` are the
  only exceptions. Never put a placeholder secret inside a runnable bash fence.
- **Stay lean.** No multi-agent workflows, no deep-research harness.
- CLAUDE.md hard rules: 300-line files, 80-line functions, `@/` aliases, no `any`, no
  `console.log`, layer rule.
- Commits: write the message to a file and `git commit -F`, ending with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Prettier: `node node_modules/.pnpm/prettier@3.8.1/node_modules/prettier/bin/prettier.cjs
  --single-quote --print-width 100 --write <files>`

## Suggested next step

The user deploys `order-lookup` and works through the NEEDS THE USER lists. Then item 17
and 23 once the Turnstile keys exist (and key `order-lookup` into the rate limit), then the
remaining Phase 4 items as Alan answers D3 and the legal questions. One item at a time, back end
before front end.
