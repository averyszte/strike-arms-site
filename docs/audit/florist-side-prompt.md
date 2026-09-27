# Prompt: the All Blooms side of the completion audit

Paste everything below the line into a Claude Code session opened on the
**all-blooms-florist** repository. A second session, opened on Strike Arms, is
running the same audit from the other direction. Both reports use the same
format so they can be merged into one completion plan.

---

## Who you are and what this is

You are working in the **All Blooms Florist** repository. It is a finished,
live e-commerce site, and you know it better than anyone because it's the repo
you're in.

A second site, **Strike Arms**, is being built by the same team, on the same
stack, with the same architecture. Strike Arms is an airsoft shop in Swords,
Co. Dublin. It is **not finished**. The goal is to get it to the same standard
as All Blooms and ready to take real money from real customers.

Your job: **look at Strike Arms through All Blooms' eyes.** You know what it took
to make All Blooms work in production: every table, every edge function, every
admin screen, every bug fixed after launch, every "we didn't think of that".
Go through Strike Arms and find every place where it falls short of that. That
covers what's missing, what's half-built, and what's built but wrong.

Another Claude session is doing the reverse at the same time. It's sitting in
Strike Arms and reading All Blooms. You'll catch different things. The reason to
do it from your side is that you can see what All Blooms does that isn't
obvious from the outside. That includes the reasons behind decisions, the order
things had to be built in, and the fixes that came after launch.

## Where things are

| | Path |
|---|---|
| All Blooms (you are here) | `C:/Users/Avery/Downloads/_Easywebs/_Repos/all-blooms-florist` |
| Strike Arms (repo root) | `C:/Users/Avery/Downloads/_Easywebs/_Repos/strike-arms-site/.claude/worktrees/strike-arms-continue-b175e3` |
| Strike Arms site code | `<Strike Arms root>/artifacts/strike-arms/src` |
| Strike Arms backend | `<Strike Arms root>/supabase` (migrations 001-021, all applied; functions: create-checkout-session, stripe-webhook, refund-order, sweep-orphan-images) |
| Where you write your report | `<Strike Arms root>/docs/audit/florist-view.md` |

Both use the same stack:
- Front end: React 18, Vite, TypeScript, Tailwind, shadcn/ui, wouter, React Query and react-helmet-async.
- Backend: Supabase (Postgres, Auth, Storage, RLS and Edge Functions).
- Payments: Stripe Checkout (hosted).
- Hosting: Cloudflare Pages.

Strike Arms is a pnpm monorepo. The live Supabase project ref is `cxnhkgndvzgyqhiwsvrr`.

## Hard rules for this session

1. **Read-only on both repos.** The one exception is the report file above.
   Don't edit code, commit, push, run migrations, run `supabase db push`, or call
   Stripe. Don't change anything in the Supabase or Stripe dashboards.
2. **Never print, copy or paste a secret.** That covers service role keys, Stripe
   secret keys, webhook secrets, Resend keys and SMTP passwords. Refer to env vars
   by **name** only. The Supabase anon key is public by design, but you don't need it.
3. **Don't invent law.** Airsoft in Ireland has legal questions, such as age
   limits and what counts as a firearm. If something looks like it needs a legal
   answer, flag it as "needs the owner / a solicitor". Don't state what the law is.
4. **Don't pad.** If something is fine, say it's fine in one line and move on. The
   value of this report is the gaps.
5. Use British/Irish English. No emojis.

## Read these first, in Strike Arms

They tell you what Strike Arms already thinks its status is. **Don't trust them.**
Check them against the code. Part of your job is to catch where the docs are
wrong or out of date.

- `CLAUDE.md` gives the coding rules. Strike Arms follows them strictly: files of
  300 lines or fewer, functions of 80 lines or fewer, Supabase calls only in
  `src/data/`, no `any`, and a one-way layer rule.
- `docs/current-task.md` is the latest handover.
- `docs/feature-inventory.md` is the master feature list with DONE, MISSING and
  PARTIAL statuses. It was built from an earlier All Blooms survey.
- `docs/florist-lessons.md` and `docs/ecommerce-playbook.md` are what's already been
  learnt from All Blooms.
- `docs/build-backlog.md` is the backlog.
- `skills/*.md` are domain rules covering dashboard, security, supabase, conversion,
  SEO, UI/UX and Cloudflare.

Then read your own `docs/` (launch-runbook.md, domain-go-live.md, auth-contract.md,
ecommerce-playbook.md and the rest) to remind yourself what All Blooms had to do
before launch.

## The two businesses are different, so compare like with like

| All Blooms (florist) | Strike Arms (airsoft) |
|---|---|
| Delivery dates, delivery slots, recipient name/phone/message, colours | None of that. Plain shipping or click-and-collect in Swords |
| Perishable, made to order | Stock items, many **one-offs** (pre-loved guns, the "Jumble" shelf) |
| Local delivery zones | Nationwide shipping in Ireland, and some items may be collection only |
| Gift messages | Possibly age checks on some products (flag, don't decide) |

Don't report florist-only features as gaps. **Do** report them when the
underlying need carries over. For example, All Blooms stops two people buying
the last bouquet for the same slot, and Strike Arms needs the same protection
for a one-off pre-loved rifle.

## How to work

For each area below:

1. **Start from All Blooms.** List what All Blooms has in that area: the files,
   tables, functions and screens. Include the fixes and hardening added after
   launch.
2. **Find the Strike Arms equivalent.** Open the actual files. Don't go on names
   alone.
3. **Grade it:**
   - `DONE` means it matches the All Blooms standard.
   - `PARTIAL` means it exists but is missing pieces. Say which.
   - `MISSING` means it isn't there at all.
   - `BROKEN` means it exists but is wrong. Give file:line and the failure scenario.
   - `N/A` means it's florist-only and there's no airsoft need.
4. **Size the fix:**
   - `S` is under an hour.
   - `M` is half a day.
   - `L` is a day or more.

**Mine your own git history.** Run `git log --oneline` in All Blooms and look for
commits with `fix`, `harden`, `race`, `idempot`, `retry`, `RLS`, `security`,
`webhook`, `stock` or `order` in them. Each one is a lesson All Blooms learnt the
hard way. For each, check whether Strike Arms already has the fix, or is set up
to make the same mistake. This is the most valuable part of the audit, because
the other session can't see those reasons from the code alone.

## The areas

### A. Admin dashboard (TOP PRIORITY: do this area first and most thoroughly)

This is what the owner, Alan, uses every day. Go screen by screen.

Cover:
- **Access:** login, invites, password change and reset, 2FA/TOTP, and session expiry.
- **Home screen:** stats and what needs attention today.
- **Products:**
  - The list: search, filter, sort and paging.
  - Create and edit: validation, images (upload, reorder, delete, orphans), draft/publish.
  - Bulk actions, CSV import and export.
- **Stock:** adjustments, history and low-stock warnings.
- **Categories.**
- **Orders:**
  - The list, filters and detail view.
  - Status changes and fulfilment.
  - Packing slips and printing.
  - Refunds (full and partial), notes, resending emails, export.
- **Inquiries and contact messages.**
- **Other management:** customers (if All Blooms has them), settings, audit logs.
- **Every screen:** empty, loading and error states, and whether it works on a phone.

For every write in the Strike Arms admin, check that the database really
enforces admin + 2FA (aal2) in RLS or the RPC, and not only in the UI.

Say which All Blooms admin features turned out to matter most in daily use, and
which were built and never used.

### B. Commerce and Stripe

Follow a sale from start to finish in both codebases:

1. **Cart:** where it's stored, how it's validated, and what happens when stock or price changes.
2. **Checkout page.**
3. **`create-checkout-session`:**
   - The server must be the source of truth for price.
   - Stock reservation must be atomic.
   - Idempotency, metadata, shipping options and collection.
4. **Stripe Checkout.**
5. **`stripe-webhook`:**
   - Signature verification and which events it handles.
   - Replays and duplicates (idempotency).
   - Order finalisation and order numbering.
   - Expired and failed sessions, and releasing reservations.
6. **Confirmation page.**
7. **Refunds:** full and partial, and whether stock is returned.
8. **The cron sweepers.**

Also check:
- VAT and tax display.
- Discounts and gift cards.
- Bot protection (Turnstile or similar).
- Rate limiting.
- Stripe API version pinning.

List every Stripe dashboard setting and every webhook event Strike Arms must
have configured. Give **names only**.

`shipping.ts` exists twice in Strike Arms: `src/lib/shipping.ts` and
`supabase/functions/_shared/shipping.ts`. Check they agree.

### C. Email and notifications

All Blooms has a `notification-worker` edge function and `submit-inquiry`.
Strike Arms has **neither**. Map in full what All Blooms sends:
- Every email, with its trigger, recipient and contents.
- The queue table, retries, dedupe and the provider.
- Sending-domain setup (SPF, DKIM, DMARC).
- Whether Supabase Auth uses custom SMTP.
- Owner alerts: new order, new inquiry, low stock.

Then say exactly what Strike Arms needs to get to the same place, in what order,
and which pieces can be copied almost as-is.

### D. Database, security and backend

Compare migration by migration:
- Tables, constraints and indexes.
- SECURITY DEFINER functions: `search_path` set? EXECUTE revoked from public/anon?
- Triggers.
- RLS on **every** table for anon, authenticated, admin and aal2.
- Storage buckets and their policies.
- pg_cron jobs, audit logs, rate-limit tables and GDPR export/deletion.

All Blooms has `supabase/verify-rls.sql`. Does Strike Arms have an equivalent?

Also check:
- `supabase/config.toml`: auth settings, password policy, MFA, redirect URLs and SMTP.
- Edge function settings: JWT verification flags, CORS and error handling.

List the migrations Strike Arms still needs, in order, with a one-line purpose
each.

### E. Storefront and customer accounts

Compare:
- Catalogue, filters, sort, paging, search and the product page.
- Stock display, including "only 1 left" and sold-out behaviour for one-offs.
- Images.
- Customer sign-up and verification, password reset, profile and order history.
- Addresses.
- GDPR self-service.
- Cookie consent and analytics.
- Legal pages: terms, returns, privacy and shipping. Flag missing ones; don't write legal text.

### F. SEO and content

Compare:
- Meta, canonical, OG and structured data (Product, Offer, BreadcrumbList, LocalBusiness).
- The sitemap, and how it's generated and deployed.
- robots.txt.
- 301 redirects from the old site. Strike Arms is replacing an old PHP site at
  strikearms.ie.
- 404 handling.
- Anything All Blooms did after its SEO audit (`docs/seo-audit-*.md`) that Strike
  Arms should copy.

### G. Performance and efficiency

Compare:
- Route code-splitting and bundle size.
- Image formats, sizes and lazy loading.
- React Query caching (staleTime, keys, invalidation).
- Over-fetching: `select('*')`, N+1 patterns and missing pagination.
- Database indexes behind the queries the storefront actually runs.
- Cold starts and response times on edge functions.

Point to evidence, such as a file, a query or a build output. Don't give generic
advice.

### H. Deploy, go-live and operations

Walk through All Blooms' `launch-runbook.md` and `domain-go-live.md` step by step.
For each step, say whether Strike Arms has done it, can do it as-is, or needs
something first. Strike Arms currently has **no Cloudflare Pages project** and its
domain isn't confirmed.

Cover:
- Env vars on Cloudflare and on Supabase (names only).
- `_redirects` and `_headers` (security headers, CSP).
- DNS and the email domain.
- Monitoring, error reporting and uptime.
- Backups.
- A test-order checklist before switching Stripe to live mode.
- A rollback plan.

## What to write

Write your report to `<Strike Arms root>/docs/audit/florist-view.md`, and create
the `docs/audit/` folder if it's missing. Use exactly this structure, so it can be
merged with the other session's report.

```
# Completion audit — the All Blooms view
Date: <today>   All Blooms commit: <short sha>   Strike Arms commit: <short sha>

## 1. Summary
Five to ten lines. How close is Strike Arms to launch-ready, what are the
biggest holes, and what would you do first.

## 2. Launch blockers
Things that must be fixed before taking real money. Numbered, most severe first.
Each one: ID, one-line problem, file:line or area, why it blocks, fix size.

## 3. Findings by area
One section per area A–H. In each, a table:
| ID | Feature | All Blooms (files) | Strike Arms status | Gap / what exactly is wrong | Size |
IDs: FV-A1, FV-A2 ... FV-B1 ... (FV = florist view).

## 4. Lessons from All Blooms' history
Each hard-won fix from the git log that matters to Strike Arms:
| All Blooms commit | What went wrong | Does Strike Arms have the fix? (YES/NO/PARTIAL + file) |

## 5. Pieces Strike Arms can copy almost as-is
Files or functions from All Blooms that can be ported with light changes
(e.g. the notification worker). Say what needs changing for airsoft.

## 6. Where Strike Arms' own docs are wrong
Claims in feature-inventory.md / current-task.md that the code contradicts.

## 7. Recommended build order
Numbered steps from now to launch, admin dashboard first, noting which step
depends on which. Group into: must-have for launch / should-have / later.

## 8. Questions for the owner
Anything that needs a business or legal decision rather than code.
```

Be exhaustive in the tables and brief in the prose. Put file paths in wherever
you can. When you're done, reply with the report's path and the launch-blocker
list only.
