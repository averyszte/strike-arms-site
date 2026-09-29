# Strike Arms: completion plan

Date: 2026-09-27. Strike Arms commit: 7d0ce64.

This plan merges two audits:

- **SV:** the Strike Arms view. Four audits of this repository, IDs SV-A…SV-H.
- **FV:** the All Blooms (florist) view, [`florist-view.md`](florist-view.md), IDs FV-A…FV-H.

Where the two disagreed, the code was checked and the verdict is recorded in
section 7. Sizes are S (hours), M (a day or two) and L (several days).

**The short version.** The payment path is solid, and the admin area is deeper
than All Blooms'. What's missing is everything that happens after a real
customer has paid:

- no email;
- no order number shown;
- accounts that are fake;
- no terms or returns pages;
- a few stock and webhook edge cases where money and stock can disagree.

Nothing is deployed yet.

---

## 1. Corrections to the florist report

Three of the florist report's claims were true when its source docs were
written, but are stale now:

| FV claim | Actual state (checked 2026-09-27) |
|---|---|
| FV-H1 "zero published products" | **173 published** (anon REST count, `Content-Range: 0-172/173`). The catalogue import is done. `is_shippable = false` on every row is still true. |
| FV-D14 "019, 020, 021 unapplied" | **All applied.** 021 was pushed and verified this session. |
| FV-F5 "sitemap lists deleted demo products and 15 dead brand pages" | **Wrong.** The sitemap was regenerated in eb99fc9 (240 URLs, no `/product/` entries). It is still kept out of `build`, so it goes stale again as products change. |

These came from `docs/current-task.md` and `docs/feature-inventory.md`, which are
themselves out of date (section 8).

---

## 2. Launch blockers (merged, most severe first)

| # | Blocker | Source | Size |
|---|---|---|---|
| 1 | **A card can be charged with no order.** See the note below the table. | SV (b), verified; FV-B3 | M |
| 2 | **A one-off item can be sold twice.** `confirm_order_paid` (012) decrements stock from `order_items` without checking that the hold still exists. If the sweeper has released it and someone else bought the item, `greatest(0, …)` hides the negative. Separately, `reserve_order_stock` (008) checks each line on its own, so two lines of the same product are not summed. | SV (a), (c), verified | M |
| 3 | **No transactional email, and the success page promises one.** `CheckoutSuccess.tsx:56-57,63`. `notification_jobs` exists with RLS and indexes, but nothing writes to it or drains it. | FV-C1/C2, SV-C | L |
| 4 | **Saving a product overwrites live stock.** The form's Stock Count field (`ProductFormFields.tsx:183`) writes `stock_count` directly (`admin-products-repository.ts:71`). This bypasses `adjust_stock` and the ledger, and restores a stale number if a sale happened while the form was open. | SV-A15, verified | S |
| 5 | **Orders after the 25th are unreachable.** `OrdersView.tsx:54` has no pager or search. Its footnote "Use the table to see the rest" (`:164`) is false. | SV-A26, verified | M |
| 6 | **Categories admin cannot write.** The 005 policy reads `admins`, which has RLS with no policies and no grant since 014. | FV-D3 = SV (d) | S |
| 7 | **Admin security gaps.** `is_admin()` / `is_admin_aal2()` have no `search_path`. PII reads (orders, inquiries, reservations) and `checkout_reservations` writes need only a password, not TOTP. Three maintenance functions are revoked from `public` but not from `authenticated`. | FV-D1, SV-D | S |
| 8 | **Admin login incomplete.** There is no password reset. An invite needs a hand-inserted `admins` row plus an undocumented `token_hash` email template. | FV-A1, SV-A2/A3 | M |
| 9 | **Failures look like empty data.** Admin screens show €0 and "no orders" when the database is paused or unreachable. A connection error at sign-in is reported as "not an admin" (`admin-auth-context.tsx:35-37`). | FV-A2/A3, SV-A1/A13 | M |
| 10 | **Refunds not live.** `refund-order` is not deployed and `charge.refunded` is not confirmed as subscribed. Since `record_refund` is the only writer, a refund would move the money and leave the order reading "paid". | FV-B2, SV-A32 | S |
| 11 | **Order status has no rules.** Any status can be set from any other, cancelling does not restock, and `changed_by` is never recorded. | SV-A30/A31 | M |
| 12 | **Fake customer accounts are live in the header.** `auth-repository.ts` stores accounts in localStorage. `Account.tsx:160-173` has a GDPR "delete" that deletes nothing, and signup discards `ageConfirmed`. | FV-E1, SV-E | S to hide, L to build (decision D1) |
| 13 | **No terms, returns or shipping pages.** The footer links are dead spans (`SiteFooter.tsx:81-82`), and checkout has no terms acceptance. Privacy is marked "Draft" and makes a false cookie claim. The age policy is an owner-and-solicitor question. | FV-F1/E8, SV-F | M plus owner |
| 14 | **Checkout is open to abuse.** There is no Turnstile or rate limit on `create-checkout-session`, so a loop can hold every one-off out of stock for 35 minutes at a time. `readString` caps no lengths, and the anon `inquiries` insert is open. | FV-B1/B13, SV-C | M |
| 15 | **Soft 404s risk de-indexing.** `_redirects` sends `/* / 200`, and `ProductDetail` renders a noindex 404 on a *fetch error*. Combined with the free-tier auto-pause, a paused database can noindex real product pages. | SV-F | S |
| 16 | **Nothing deployed.** There is no Cloudflare Pages project, the domain is unconfirmed, `is_shippable` is false everywhere, and there has been no end-to-end test order. | FV-H1, SV-H | M |

**Note on blocker 1.** `clear_stale_checkout_attempt` (008:137-140) deletes the
earlier pending order without expiring its Stripe session. If the shopper then
pays in that older Stripe tab, `handlers.ts:52` finds no order and returns 200.
Stripe will not retry, the claim is kept, and nobody is told. The same silent
200 fires for sessions that complete unpaid (`:54`), and
`async_payment_succeeded` is not handled at all.

---

## 3. Build order

The admin dashboard comes first, as asked. Phases 1-3 are the must-haves before
taking real money.

### Phase 1: admin dashboard (about 4-5 days)

1. **Migration 022, admin security** (S). This covers:
   - the subcategories policy, changed to `(select public.is_admin_aal2())`;
   - `set search_path` on `is_admin`, `is_admin_aal2` and `reserve_stock`;
   - revoking `authenticated` from `schedule_image_sweep`, `bump_orphan_attempts` and `storage_path_from_public_url`;
   - making `checkout_reservations` writes need aal2.
2. **Copy and extend `verify-rls.sql`** from All Blooms (S). It should also assert
   that every SECURITY DEFINER function sets `search_path`, and that every
   admin write policy calls `is_admin_aal2()`. Run it after 022; it becomes the
   standing check after every migration.
3. **Migration 023, admin reads need aal2** (M). This covers:
   - PII reads on orders, order_items, order_status_log, inquiries and reservations;
   - rewriting 002's policies in the `(select …)` + `TO authenticated` form.
4. **Remove Stock Count from the product form** (S). Stock changes only through
   `StockAdjustDialog`. New products get their opening stock through the same RPC
   with the reason "opening stock".
5. **Orders: paging and search** (M). Server-side paging (the repository already
   takes `page`/`pageSize`), plus search by order number, name and email. Fix
   the board footnote so it links to the table.
6. **Error states on every admin screen** (M). Pages keep their layout but show a
   clear "Can't reach the database" panel with a retry. Fix the `is_admin` error
   so it is reported as a connection problem.
7. **Auth completion** (M):
   - Password reset: port All Blooms' `reset-password.tsx` and its MFA-aware
     recovery (`e509770`).
   - An invite trigger that inserts the `admins` row.
   - The invite email template, documented.
   - A password policy in `config.toml`.
   - Moving `admin-auth-context.tsx` out of `lib/` so its Supabase calls go
     through `data/` (the 4 unused `admin-auth-repository` functions already
     exist for this).
8. **Migration 025, order status rules** (M). 024 went to admin invites (item 7), so every later number in section 4 moved up by one:
   - an allowed-transitions guard;
   - restock on cancel, through `adjust_stock` so the ledger records it;
   - `changed_by` defaults to `auth.uid()`;
   - `inventory_adjustments` becomes insert-only.

   The history panel should show the full log, not only the last 8.
9. **Deploy `refund-order`, subscribe `charge.refunded`, and do one test refund
   end to end** (S). Add `greatest()` to `record_refund`.
10. **Products list** (M):
    - server-side search and paging, to lift the 1000-row cap;
    - a low-stock filter that the dashboard card links to;
    - fixes to the validation gaps;
    - allow clearing the description.
11. **Soft delete, migration 026** (S). Archive products instead of hard-deleting them, which
    cascades away their stock history. Deleting a subcategory reassigns or
    blocks its products. 026 is `product_archive`, so the Phase 2 and later
    migrations moved up by one again (027 onwards). 027 then went to
    `admin_invite_fix` (the 024 trigger never fired), so Phase 2 starts at 028.
12. **Tidy-ups** (S):
    - Rename `lib/utils.ts`.
    - Split `ProductsTable` and `OrdersView` (each over 80 lines).
    - Delete or wire up `DashboardStats.tsx` (unused).
    - Add horizontal-scroll hints on the wide tables for phones.

### Phase 2: the money path (about 3 days)

13. **Migration 028, checkout integrity** (M):
    - `reserve_order_stock` sums duplicate lines;
    - `confirm_order_paid` re-checks that stock is available and, if it is not,
      marks the order `needs_attention` instead of hiding a negative;
    - `clear_stale_checkout_attempt` marks the old order `abandoned` instead of
      deleting it, and `create-checkout-session` expires the old Stripe session.

    A late payment then always finds its order. If the item has gone, the order
    is flagged for a refund and Alan is alerted.
14. **Webhook fixes** (S):
    - Handle `checkout.session.async_payment_succeeded` / `_failed`, or limit v1
      to instant methods in the Stripe dashboard (decision D4).
    - "No order found" alerts the owner rather than returning a silent 200.
    - An amount mismatch alerts rather than looping.

    Done as migration 029, `webhook_alerts`, so the rate limit and every later
    migration moved up by one again.
15. **Persist the checkout attempt id** (S). It currently lives in a `useRef` in
    `use-checkout.ts`, so a retry after cancel can lock the shopper out. Put it
    in sessionStorage.
16. **Show the order number on the success page** (S). Pass it through the
    success URL and fix the copy so it doesn't promise an email that doesn't
    exist yet. This ships before the email work, not after.
17. **Turnstile and limits** (M):
    - Port `_shared/turnstile.ts`, failing closed, onto checkout and the inquiry
      form.
    - Add length caps in `readString`.
    - Migration 032 adds a rate limit per IP and attempt.
    - Add `challenges.cloudflare.com` to the CSP.
    - Set the site key and secret key in the same deploy.
18. **Cart freshness** (S). Re-read price and `is_shippable` when the cart opens,
    and only clear the cart on a confirmed success.

### Phase 3: email (about 3-4 days)

19. **DNS and sending domain** (depends on the owner: domain and mailbox). Set up
    Resend with SPF/DKIM/DMARC, plus the matching Supabase Auth SMTP settings.
20. **Port All Blooms' `_shared/resend.ts`** (S). Keep its idempotency key and
    make `escapeHtml` null-safe from day one (`00d82e6`).
21. **Migration 030, the notification producer** (M):
    - `confirm_order_paid` enqueues `notification_jobs` in the same transaction;
    - a claim function using `for update skip locked`;
    - a `pg_cron` schedule for the worker.
22. **`notification-worker`** (M). Port it from All Blooms, with templates split
    into one file per email so each stays under the line limit. Emails:
    - order confirmation to the customer;
    - new-order alert to Alan;
    - ready-for-collection and dispatched status emails;
    - a refund notice.
23. **`submit-inquiry` function plus Turnstile** (M). It emails Alan. Migration
    033 then drops the anon insert on `inquiries` and adds length limits.
24. **Low-stock alert, and a "resend email" action on the order sheet** (S).

### Phase 4: storefront and legal (in parallel, gated on owner answers)

25. **Accounts** (decision D1). The recommendation for v1 is:
    - hide the account links;
    - remove `auth-repository.ts` and the fake GDPR delete;
    - give `/account` a **guest order lookup** by order number and email (FV-E3).

    Real accounts come later, and **in the same migration** that narrows the
    `authenticated` grants on products and orders (FV-D2), never after.
26. **Legal pages** (M plus owner):
    - terms, returns, shipping, and a final privacy page;
    - a terms checkbox at checkout;
    - working footer links;
    - no false cookie claims.

    The wording comes from Alan and a solicitor. Nothing about age law is
    invented.
27. **Soft 404 fix** (S). A fetch error renders a retryable error, not a noindex
    404. Only a confirmed missing product gets a 404. Add a React error boundary.
28. **Stock display** (S). Show "Only 1 left" or "Sold", and decide what happens
    to sold pre-loved items (decision D3).
29. **Allow zoom** (S). Remove `maximum-scale=1`.
30. **Canonicals** (S). Route `Home.tsx:37,42`, `GiftCards.tsx:14,18` and
    `ShopPage.tsx:153` through `SITE_URL`, and set it from an env var.
31. **Gift cards** (S). Hide `/gift-cards` until they can be bought, or make it
    an in-shop-only page (decision D6).

### Phase 5: go-live (about 1-2 days once the owner answers are in)

32. **Cloudflare Pages project** (see section 5). Add `_redirects` entries for
    `/index.php` and lowercase variants, and fix the CORS origin (it hard-codes
    `strike-arms-site.pages.dev`).
33. **Set `is_shippable` per product** once Alan has answered (D2), then run one
    test order each for collection, delivery, refund and cancel.
34. **`.env.example` and `docs/launch-runbook.md`** (S). Use All Blooms' runbook
    as the template. The runbook is already started, with the Supabase Auth
    go-live steps (Site URL, redirects, SMTP); extend it rather than replace it.
35. **Supabase plan** (decision D8). The free tier auto-pauses. At minimum, add
    an uptime ping and a weekly backup export.

### Should have soon after launch

- **Performance** (M):
  - Recompress the 14 PNGs (31 MB total). The ProductCard fallback alone is
    1.6 MB.
  - Poster-first hero video.
  - Width and height attributes on images.
  - Lazy-load the storefront routes: the admin is already split off, but the
    main chunk is still 1.1 MB.
  - Add `manualChunks`.
  - Self-host or preconnect the fonts.
  - QueryClient `staleTime`.
- **Dashboard query** (M). Bound it by date and aggregate on the server
  (FV-A8). It currently pulls every order with items.
- **Migration 034, query indexes** (S). The full list is in section 4.
- **Shipping logic, deduplicated or asserted** (S). Add three tests around the
  free-shipping threshold (FV-D13).
- **Build meta** (M). Generate the sitemap in `build`, and add prerender or edge
  meta so shared links unfurl properly (FV-F2).
- **Structured data** (S). Product schema `shippingDetails` / `hasMerchantReturnPolicy`,
  and a complete LocalBusiness.
- **Inquiries** (M). Search, notes and delete.
- **Order internal notes** (S). Kept in a separate column so they cannot
  overwrite the customer's note.

### Later

- An audit log screen, a customers screen, and GDPR export and erasure (after
  accounts).
- Search ranking (the query "rifle" can rank a scope above a rifle).
- A small CI and test suite around money.
- Invoices and a VAT number on receipts.

---

## 4. Migrations, in order

| # | Name | Contents | Phase |
|---|---|---|---|
| 022 | `admin_security` | subcategories policy; `search_path` on 3 functions; function revokes; aal2 on reservations writes | 1 |
| 023 | `admin_reads_aal2` | PII reads need aal2; 002 policies moved to `(select …)` + `TO` | 1 |
| 024 | `admin_invites` | invited users get an `admins` row (item 7) | 1 |
| 025 | `order_status_rules` | transition guard; restock on cancel; `changed_by`; insert-only ledger; `record_refund` `greatest()` (moved up from checkout_integrity) | 1 |
| 026 | `product_archive` | `sellable_count`; `is_archived`; products not deletable from the browser; subcategory delete refused while in use (items 10, 11) | 1 |
| 027 | `admin_invite_fix` | 024's trigger also fires on the update that sets `invited_at`; backfill invited users | 1 |
| 028 | `checkout_integrity` | summed lines; re-check in `confirm_order_paid`; abandon instead of delete | 2 |
| 029 | `webhook_alerts` | `expire_order` sets `expired`; `flag_order`; `payment_alerts` for money with no order | 2 |
| 030 | `notification_producer` | outbox filled by triggers on orders; skip-locked claim; cron that calls the worker only when a job is due | 3 |
| 031 | `notification_extras` | low-stock alert to the owner; `resend_notification` for the order sheet (item 24) | 3 |
| 032 | `checkout_rate_limit` | per-IP and per-attempt throttle (written after 031, so numbered after it) | 2 |
| 033 | `inquiries_lockdown` | length limits; drop the anon insert (after `submit-inquiry` is deployed) | 3 |
| 034 | `query_indexes` | orders `(is_archived, created_at)`, payment and fulfilment status; `order_items(product_id)`; `order_status_log(order_id, created_at)`; `inventory_adjustments(product_id, created_at)`; `checkout_reservations(product_id)`; `inquiries(status, created_at)`; products `(is_published, is_featured, created_at)` and `(is_published, category, subcategory)` | after launch |
| 035 | `housekeeping_cron` | stale attempts, old event log rows, orphan sweep schedule | after launch |
| later | `customer_accounts` | profiles, order link, age record, **plus narrowed `authenticated` grants in the same file** | later |

Also in Phase 1: `config.toml`, covering `site_url`, a password policy, an MFA
section and SMTP.

---

## 5. Go-live configuration (names only, no values)

**Cloudflare Pages**
- Build command: `pnpm --filter @workspace/strike-arms run build`
- Output directory: `artifacts/strike-arms/dist/public`
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`, `VITE_SITE_URL`

**Supabase function secrets**
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`
- `TURNSTILE_SECRET_KEY`, `SITE_HOSTNAME`

**Stripe**
- Webhook events: `checkout.session.completed`, `checkout.session.expired`,
  `charge.refunded`, and the async pair if kept (D4).
- Statement descriptor, and the business name on Checkout.
- Enable Stripe's own receipts as a stopgap. They do not replace an order
  confirmation.

**Supabase Auth**
- Site URL and redirect URLs on the real domain.
- Custom SMTP.
- The invite and recovery email templates.

**DNS**
- The domain, plus SPF/DKIM/DMARC for the sending domain.
- Old-site 301s are already in `_redirects`.

---

## 6. Decisions and questions for Alan

| # | Question | Blocks |
|---|---|---|
| D1 | Customer accounts in v1, or guest checkout with order lookup? (Recommend guest.) | Phase 4 item 25 |
| D2 | Which products can be posted, and which are collection-only? | is_shippable; test orders |
| D3 | When a pre-loved or Jumble item sells, should it show "Sold" for a while or vanish? Are they always quantity one? | Stock display; reservation assumptions |
| D4 | Which payment methods? Card-only avoids async settlement. | Webhook scope |
| D5 | What age rules apply, and what must be checked and kept? (Owner and solicitor, not us.) | Checkout, schema |
| D6 | Gift cards: sell online, in-shop only, or drop the page? | /gift-cards |
| D7 | Domain, business mailbox, and the confirmed address, hours and phone. | Email, canonicals, schema |
| D8 | Supabase paid plan (no auto-pause, backups) or free tier plus pings? | Reliability |
| D9 | Is 23% VAT right, what is the VAT number, and are there any reduced-rate items? | Invoices |
| D10 | Delivery pricing: are €6.50 flat and free over €75 right? | Checkout |
| D11 | Returns and refunds policy in Alan's words. Should refunded new stock go back on the shelf? | Legal page; restock rule |
| D12 | Analytics tool, if any (drives the cookie banner). | Privacy page |
| D13 | `/brands/unbranded`, and the 22 unbranded rows. | Catalogue |
| D14 | Who gets alerts when a webhook or email fails? | Ops |

---

## 7. Where SV and FV disagreed, and what the code says

| Topic | SV said | FV said | Verdict |
|---|---|---|---|
| Published products | 173 | zero | **SV.** Live count is 173. |
| Migrations 019-021 | applied | unapplied | **SV.** All applied. |
| Sitemap | clean | lists dead demo pages | **SV.** 0 product URLs, regenerated in eb99fc9. |
| Admin bundle | main chunk 1.1 MB | admin lazy-loaded, DONE | **Both right.** Admin is split out (`App.tsx:47-49`), but the storefront pages are not lazy, so the main chunk is still large. |
| Webhook claim | released on crash? | released on failure; retained on silent 200s | **FV.** `index.ts:110-116` releases on a throw. The real hole is the handlers *returning* at `handlers.ts:52,54`, which keeps the claim. Combined with SV (b), that is blocker 1. |
| Stock hold | holds can lapse | hold outlives session, DONE | **Both.** The 35/30-minute timing is right, but SV (a) is what happens after the hold is released: the webhook decrements anyway. |
| Accounts | hide for v1 | build real accounts (L) | **Decision D1.** Hiding is S and removes the FV-D2 risk. Building is L and must ship with narrowed grants. |
| srcset | worth doing | N/A (paid plan) | **FV** for srcset. **SV** still stands on the 31 MB of static PNGs, which need no paid plan to compress. |

**Only SV found:**
- the stock-integrity bugs (a), (b), (c);
- the stock overwrite in the product form;
- orders after 25 unreachable;
- status rules;
- the fake GDPR delete;
- the soft 404;
- dead footer links;
- the image weight;
- the open inquiry insert.

**Only FV found:**
- latent `authenticated` grants (FV-D2);
- the false "typecheck away" claim about `shipping.ts` (FV-D13);
- hardcoded canonicals (FV-F4);
- the unused `DashboardStats`;
- the unbounded dashboard query;
- no `.env.example` or runbook;
- the order number on the success page as a quick win.

---

## 8. Docs to correct

- `docs/current-task.md`: 173 products are published, 019-021 are applied, and
  the sitemap is clean.
- `docs/feature-inventory.md`:
  - A4, E1.1 and G8 are marked "needs db push" but are applied.
  - A1.2/A1.3, A3.2, F6, D1, D3, D5.6 and E1/E2 are inaccurate.
- `docs/florist-lessons.md`:
  - C6 (rates) is done; what remains is the duplicated logic.
  - The "a typecheck away" claim is false.
  - The `(select …)` advice was never applied to 002.
- `docs/database-plan.md`: an empty template. Fill it in from section 4.
- `docs/site-migration-redirects.md`: the guide path is wrong.
- `supabase/migrations/004_grants.sql:26`: the comment contradicts the SQL below
  it. Fix it with a comment-only edit, or note it in 022.
- `supabase/migrations/014_grant_audit.sql:133`: its ledger clears
  `subcategories` wrongly. Record the correction in 022.
