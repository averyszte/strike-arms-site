# Current Task

Last updated: 2026-09-28 (handover at the end of Phase 1). Replaces the 2026-09-27 revision.

## Where the project is right now

The plan being followed is `docs/audit/completion-plan.md` (bring Strike Arms up to All Blooms'
standard). **Phase 1, the admin dashboard, is done in code**, items 1-12, migrations 022-027,
all applied by the user and checked with `supabase/verify-rls.sql` (the only review row left is
the expected `anon-insert-inquiries`, which goes in Phase 3). Admin sign-in works end to end:
invite email, set password, TOTP, admin access.

**Phase 1 leftover, needs the user:** item 9, deploy `refund-order`, confirm `charge.refunded`
is on the Stripe endpoint, and do one test refund end to end.

**Next: Phase 2, the money path**, starting with item 13, migration **028** checkout integrity.
027 went to `admin_invite_fix`, so every planned migration moved up one (028-033); the table
in section 4 of the plan is current.

Go-live dashboard steps that must not be forgotten (Site URL off localhost, redirect URLs,
SMTP) are in `docs/launch-runbook.md`. Nothing is in production.

Nothing has been pushed since `1dfc41a`; the branch is well ahead of `origin/main`. Push only
when the user asks, with `git push origin HEAD:main`.

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
- **C11 bot protection** on `create-checkout-session`: no Turnstile, no rate limit.
- **E3 transactional email / C5.x notifications.** Deferred, never chosen.
- **B1-B4 customer accounts.** B1.2 email verification needs real SMTP.
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
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Prettier: `node node_modules/.pnpm/prettier@3.8.1/node_modules/prettier/bin/prettier.cjs
  --single-quote --print-width 100 --write <files>`

## Suggested next step

Ask the user which item to take. One item at a time, back end before front end.
