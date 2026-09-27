# Current Task

Last updated: 2026-09-27 (handover). Replaces the 2026-09-02 revision, which predated
migrations 017-018, the TOTP flow and the real-catalogue import.

## Where the project is right now

The Supabase backend is live with migrations `001` through `018` applied and verified.
**`019` and `020` are written but NOT applied** -- the user runs `echo y | npx supabase db push`. The
admin dashboard works and now enforces TOTP (aal2) for writes. The public site is largely built
and the commerce path is written end to end. Nothing is in **production**: there is no
Cloudflare Pages project (G1) and the `strikearms.ie` domain is unconfirmed (G2).

**The shop currently has zero published products.** Migration 017 deleted the 56 demo rows.
Alan's 64 real products are imported but unpublished, pending the checks below.

Feature inventory (`docs/feature-inventory.md`), last counted: **51 DONE, 26 MISSING, 17 PARTIAL,
4 DEPLOYED-UNTESTED, 1 BLOCKED**. That file is the master list; read it before picking work.

Nothing has been pushed since `1dfc41a`. Unpushed on this branch, oldest first: `6bd9150`
services, `a722b4d` TOTP/MFA, `8e1d395` brand slugs, `0ea8b4d` migration 017, `7918ade` product
condition, then `56b8535` handover/mock-products, `b9c8ae1` ProductDetail split, `beeb667`
migration 019, `bfda5bd` inquiries paging, `e80ca32` migration 020. Push only when the user asks, with
`git push origin HEAD:main`.

## What landed recently

- **`7918ade` product condition, end to end.** Migration 018 added `products.condition` (text,
  check constraint, default `'new'`), backfilled from the `pre-loved-` slug prefix or the
  `pre-loved` tag. Storefront: Pre-loved badge on card and product page, a sold-as-seen notice
  in Alan's wording, a Condition filter, and a `/pre-loved` page with route and nav links. Wired
  through the admin form, CSV export/import (a bad Condition value is refused, not corrected)
  and the catalogue import scripts. schema.org `itemCondition` now branches instead of always
  saying `NewCondition`.
- **`0ea8b4d` migration 017** deleted the 56 demo products.
- **`a722b4d` TOTP/MFA** for the admin, matching the `is_admin_aal2()` RLS policies.
- **`8e1d395`** the CSV builder emits brand slugs, not display names.
- **`6bd9150`** the service pages were redesigned.
- **Tidy-up:** `src/data/mock-products.ts` deleted (nothing imported it; the sitemap already read
  Supabase since `75648a9`). `/pre-loved` added to the sitemap's static routes.
- **`b9c8ae1`** `ProductGallery` and `ProductInfo` moved to `components/catalog/`; the page is 132
  lines.
- **`beeb667` migration 019** drops `adjust_stock`'s ignored `p_adjusted_by`. The front end no
  longer sends it and works against either signature, so it can ship before the push.
- **`bfda5bd`** the admin inquiries list loads 50 at a time with "Load more"; the dashboard badge
  reads the exact count instead of the list length.
- **`e80ca32` migration 020** makes `checkout_reservations.order_id` ON DELETE RESTRICT, so
  deleting an order can no longer silently strand `reserved_count`. To delete an order by hand,
  run `release_order_reservations(id)` first.

## NEEDS THE USER (aal2 admin session)

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
