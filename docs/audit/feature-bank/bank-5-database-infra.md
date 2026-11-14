# Feature bank, section 5: database and platform/infra

Written 2026-11-14, from the worktree `confident-sammet-18385d` (HEAD bc14169). This is a read-only pass. It describes the end state after migrations 001-039, not the history of how it got there. No secret values appear anywhere in this file.

Abbreviations:
- **aal2** means `(select is_admin_aal2())`: the caller is in `admins` and the current session is TOTP-verified.
- **definer** means SECURITY DEFINER.
- **sp** means the function pins `search_path`.
- **SR** means `service_role`.
- `NNN:line` means `supabase/migrations/NNN_*.sql`, at that line.

Extensions:
- `pg_cron` (012, 030, 035)
- `pg_net` (012, 030)
- `pg_trgm` (015)
- Vault (secret `service_role_key`, read by 012 and 030)

One sequence, `order_number_seq`. It is used only by `confirm_order_paid`.

Blanket grants:
- 032 gives SR everything on public tables, sequences and functions, plus matching default privileges.
- 023 revokes TRUNCATE from anon and authenticated on every table and in default privileges.

---

## DB-T: tables (14 live, 3 dropped)

| ID | Table | Purpose and key columns | Constraints and indexes | RLS / grants | Watch |
|---|---|---|---|---|---|
| DB-T01 | `products` | Catalogue. Columns: `slug` (unique), name, category, subcategory, brand, `price_cents` >0, `sale_price_cents` (>0 and < price), `images text[]`, short and long descriptions, `is_new`, `is_featured`, `is_published` (default false), tags, `in_stock` (plain bool set by the admin since 038, default true), `is_shippable` (default false), `ship_weight_g` >=0, `condition` ('new' or 'pre-loved'), `is_archived` and `archived_at`. Generated columns: `effective_price_cents` = coalesce(sale, price); `search_text` (lower-cased name, brand, short description and tags); `type_rank` (a CASE on subcategory, unknown values get 1000). | `products_archived_not_published` check. Indexes: category, brand, is_published, is_shippable, effective_price, created_at desc, (is_published, category), (is_published, condition), (is_published, type_rank, created_at desc), and the trigram GIN `idx_products_search_trgm`. | RLS on. anon: SELECT. authenticated: everything except DELETE and TRUNCATE (026, 023). Policies DB-P01 to P04. | 038 dropped stock_count, reserved_count, low_stock_threshold and sellable_count, so nothing stops a one-off (a pre-loved gun, for example) being sold twice (038:77-110). `type_rank` is hard-coded to subcategory slugs, so a new subcategory sorts last (037). |
| DB-T02 | `admins` | Allow-list of admins. `id` references auth.users, on delete cascade. | PK only. | RLS on, no policies. All grants revoked from anon and authenticated (014). Written by the `handle_invited_admin` trigger and 027's backfill. | Any dashboard invite makes the invitee an admin (024:19, 027:22-26). |
| DB-T03 | `orders` | Web, counter and phone orders. Columns: `order_number` (unique, nullable, no default since 007), `stripe_session_id` (unique), `stripe_payment_intent`. `payment_status`: pending, paid, refunded, partially_refunded, failed, expired, abandoned. `fulfillment_status`: pending, ready_for_pickup, collected, packed, shipped, delivered, cancelled. `fulfillment_method`: pickup, delivery or mixed. Customer name, email and phone; `total_cents`, `vat_cents`, `refund_cents`, `shipping_cents`; shipping_name, line1, line2, city, county, eircode; `age_verified`, `notes`, `is_archived`, `checkout_attempt_id`, `paid_at`, `refunded_at`. `channel`: web, counter or phone. `payment_method`: stripe, cash, card_terminal or bank_transfer. `attention_reason` and `attention_raised_at`. `tracking_number`. `user_id` (references auth.users, on delete set null, 034). | Checks: `orders_payment_status_check`, `orders_customer_email_present` (pickup or email), `orders_shipping_address_present`, `orders_shipping_cents_pickup_zero`, and tracking_number must match `^[A-Za-z0-9 -]{4,40}$` (033). Indexes: stripe_session, customer_email, created_at desc, payment_intent, channel, checkout_attempt (partial, pending), user_id (partial). | RLS on. authenticated: SELECT, plus UPDATE on (fulfillment_status, notes, is_archived, tracking_number) only (034). Policies DB-P05 and P06. | `idx_orders_stripe_session` duplicates the unique index (003:286). The `attention_reason` flag cannot be cleared from the browser, because the column is not in the UPDATE grant. The app only reads it (`orders-repository.ts:34`). Order numbers share one global sequence behind the year prefix, so they never reset each year, and `lpad(…,4)` widens after 9999 (028:247). 014 says "No sequences", which is wrong. |
| DB-T04 | `order_items` | Snapshot of each order line. Columns: `order_id` (cascade), `product_id` (set null), slug, name, image, brand, `unit_price_cents` >0, `quantity` >0, `subtotal_cents` (generated), `fulfillment_method` (pickup or delivery). | Index on order_id. | RLS on. authenticated: SELECT only. Policy DB-P07. | 034:29 says SELECT is needed for the cancel-restock trigger. 038 dropped that trigger, so the comment is stale. |
| DB-T05 | `order_status_log` | Audit trail of status changes. Columns: `field` (payment_status or fulfillment_status), `from_status`, `to_status`, `changed_by` (default auth.uid() since 025), `note`. | | RLS on. authenticated: SELECT and INSERT. Policies DB-P08 and P09. | Written by `log_order_status_change`, which runs as invoker with no `search_path` set (003:125). |
| DB-T06 | `subcategories` | Category to subcategory taxonomy. Columns: category, slug, name, sort_order. Unique on (category, slug). Seeded by 005; the 'parts' rows were deleted by 021. | | RLS on. anon: SELECT. authenticated: everything. Policies DB-P10 to P13. | A trigger blocks deleting a subcategory still used by non-archived products (026:53). |
| DB-T07 | `store_settings` | Single row (id = 1). Columns: `shipping_flat_cents` (650), `free_shipping_threshold_cents` (7500), `vat_rate_basis_points` (2300), `updated_by`. | id = 1 check. | RLS on. SELECT for anon and authenticated; UPDATE for authenticated. Nobody can INSERT or DELETE. Policies DB-P14 and P15. | |
| DB-T08 | `orphaned_images` | Queue of storage objects waiting to be swept. Columns: `path` (PK), `orphaned_at`, `attempt_count`, `last_error`. | Partial index where attempt_count < 5. | RLS on, no policies. SR only. | Nothing drains the queue unless the C03 cron job was scheduled by hand. |
| DB-T09 | `stripe_event_log` | Webhook idempotency. Columns: `id` (Stripe event id, PK), `processed_at`, `type`. | | RLS on, no policies. Grants revoked (014). | No retention, so it grows forever. |
| DB-T10 | `notification_jobs` | Email outbox, rebuilt in 030. `event_type`: customer.order_confirmed, owner.order_paid, customer.status_changed, customer.refunded, owner.low_stock, owner.new_inquiry. Columns: `order_id`, `product_id` and `inquiry_id` (all cascade), `recipient` ('owner' or an email), `payload jsonb`, `status` (pending, sent or failed), attempt_count, next_attempt_at, last_error, sent_at. | `num_nonnulls(order_id, product_id, inquiry_id) = 1`. Indexes: due (partial), (order_id, created_at), product (partial), inquiry (partial). | RLS on. authenticated: SELECT. SR: everything. Policy DB-P16. | `owner.low_stock` can no longer be produced, because 038 dropped the queueing trigger; the value is still allowed by the check. No retention. |
| DB-T11 | `payment_alerts` | Payments that arrived with no matching order. Columns: `kind` ('no_order'), `stripe_event_id` (unique), session, payment_intent, amount_cents, currency, customer_email, detail, resolved_at. | Indexes: open (partial), payment_intent. | RLS on. authenticated: SELECT and UPDATE(resolved_at). Policies DB-P17 and P18. | |
| DB-T12 | `customer_profiles` | Customer accounts (034). Columns: `user_id` (PK, cascade), `full_name` (<=120), `phone` (<=30), `marketing_opt_in` and `marketing_opt_in_at`. | | RLS on. authenticated: SELECT and UPDATE(full_name, phone). SR: everything. Policies DB-P19 to P21. | The profile is created from `raw_user_meta_data`, which the client controls at signup. The length checks are the only guard (034:96). |
| DB-T13 | `rate_limit_hits` | Fixed-window counters (035). Columns: key, window_start, hits. PK on (key, window_start). | | RLS on, no policies. SR only. | Keys are HMAC'd with the SR key (`_shared/rate-limit.ts:29-38`). |
| DB-T14 | `inquiries` | Contact and service-quote forms. Columns: name, email, phone, subject, message, `status` (new, replied or archived), consent, source_page. | Index on status. | RLS on. anon: nothing (036). authenticated: SELECT and UPDATE(status). Policies DB-P22 and P23. | The only writer is the `submit-inquiry` Edge Function. Nothing ever deletes inquiries, so personal data piles up with no retention. |
| (dropped) | `checkout_reservations`, `inventory_adjustments` (038), and the 001 `notification_jobs` placeholder (030) | | | | `docs/database-plan.md` may still describe them. |

## DB-F: functions (42 live; 6 dropped)

"Exec" is who can run the function. "Browser" means anon or authenticated.

| ID | Function | Type | Exec | Purpose | Watch |
|---|---|---|---|---|---|
| DB-F01 | `is_admin()` | sql stable, definer, sp (022) | public | The caller is in `admins`. | Used on its own only by `applied_migrations`. |
| DB-F02 | `is_admin_aal2()` | sql stable, definer, sp | public | `is_admin()` and `auth.sessions.aal = 'aal2'` for the JWT's session_id. | The basis of every admin policy. |
| DB-F03 | `set_updated_at()` | trigger, invoker | (trigger) | Stamps `updated_at`. | No `search_path`, so the Supabase linter warns (003:7). |
| DB-F04 | `log_order_status_change()` | trigger, invoker | (trigger) | Writes to `order_status_log`. | No `search_path` (003:125). |
| DB-F05 | `claim_stripe_event(text,text)` returns bool | definer, sp | SR | Webhook idempotency claim. | |
| DB-F06 | `release_stripe_event(text)` | definer, sp | SR | Releases the claim when the handler fails. | |
| DB-F07 | `reserve_order_stock(uuid,jsonb,timestamptz)` returns uuid | definer, sp | SR | Since 038, returns the first line with `in_stock = false`. Holds nothing. | Does not check is_published, but the web path checks it in `create-checkout-session/order-lines.ts:88`. No quantity limit (038:77-110). |
| DB-F08 | `release_order_reservations(uuid)` | definer, sp | SR | Does nothing since 038; kept for compatibility. | 038:65 |
| DB-F09 | `clear_stale_checkout_attempt(uuid)` returns setof text | definer, sp | SR | Abandons earlier pending orders from the same attempt and returns their Stripe sessions. | 028:166 |
| DB-F10 | `abandon_order(uuid)` returns bool | definer, sp | SR | Marks a pending order abandoned. | |
| DB-F11 | `confirm_order_paid(uuid,text,text)` returns text | definer, sp | SR | Marks a pending or abandoned order paid and gives it a number. | 038:112. Takes no stock. |
| DB-F12 | `expire_order(uuid)` returns bool | definer, sp | SR | Sets the order to 'expired' (029 also moved old 'failed' rows to expired). | |
| DB-F13 | `record_refund(text,int,bool)` returns bool | definer, sp | SR | Uses `greatest()` so the refund total never goes down. | 025:173 |
| DB-F14 | `flag_order(uuid,text)` | definer, sp | SR | Appends to `attention_reason`; safe to repeat. | No clear path exists (see T03). |
| DB-F15 | `resolve_payment_alert(text)` returns bool | definer, sp | SR | Resolves an alert. | |
| DB-F16 | `create_counter_order(jsonb, text x6, bool, text x5)` returns jsonb | definer, sp | authenticated (aal2 checked inside) | Till sale. Prices every line from the catalogue and store_settings, then calls `confirm_order_paid`. | Accepts unpublished products on purpose (038:244). It appears to accept archived ones too. There is no stock check and no row lock (038:239). |
| DB-F17 | `storage_path_from_public_url(text)` | immutable, sp '' | revoked from browser (022) | Turns a public image URL into a storage path. | |
| DB-F18 | `enqueue_orphaned_images()` | trigger, definer, sp '' | revoked (023) | Queues images dropped from a product. | |
| DB-F19 | `dequeue_reused_images()` | trigger, definer, sp '' | revoked | Removes an image from the queue when it is reused. | |
| DB-F20 | `bump_orphan_attempts(text[],text)` | definer, sp | SR | Records failed sweep attempts. | |
| DB-F21 | `schedule_image_sweep(text,text)` | definer, sp | revoked from browser | Creates cron job C03. | Copies the Vault SR key into the `cron.job.command` text (012:283-299). 030:191-193 says so itself. |
| DB-F22 | `text_array_to_string(text[],text)` | immutable | authenticated, SR | Helper for the generated `search_text` column. | |
| DB-F23 | `search_products(text,int)` | invoker, stable, sp | anon, authenticated | Trigram search over published products. Limit clamped to 1-50. | 015:119 |
| DB-F24 | `applied_migrations()` returns table(version) | definer, sp | authenticated | Feeds the admin Settings migration check. | Needs only `is_admin()` (aal1); everything else needs aal2 (016:33). |
| DB-F25 | `handle_invited_admin()` | trigger on auth.users, definer | (trigger) | Adds the user to `admins` when `invited_at` is set. | Any invite grants admin. A customer invited from the dashboard by mistake becomes an admin (027:22-26). |
| DB-F26 | `fulfillment_lanes(text)` returns text[] | immutable | public | The allowed status lane for each fulfilment method. | Harmless but still executable by public. |
| DB-F27 | `guard_fulfillment_status()` | trigger, invoker, sp '' | (trigger) | Refuses illegal fulfilment transitions. | 025:53 |
| DB-F28 | `guard_subcategory_delete()` | trigger, definer, sp | (trigger) | Blocks deleting a subcategory that is still in use. | |
| DB-F29 | `queue_order_notifications()` | trigger, definer, sp | (trigger) | Queues emails on forward steps only. Skips counter sales and never repeats a status email. | 033:59 |
| DB-F30 | `is_status_email_due(text x5)` | immutable | SR | Helper for F29. | |
| DB-F31 | `claim_notification_jobs(int)` | definer, sp | SR | Leases up to 50 jobs for 5 minutes with SKIP LOCKED. | 030:141 |
| DB-F32 | `complete_notification_job(uuid,text)` | definer, sp | SR | Backs off attempt squared minutes; marks the job failed at 5 attempts. | |
| DB-F33 | `invoke_notification_worker(text)` | definer, sp | SR / cron | Reads the Vault key at run time and calls `net.http_post` when a job is due. | Raises when the Vault secret is missing, so cron logs an error every minute once a job is queued (030:218-220). |
| DB-F34 | `schedule_notification_worker(text)` | definer, sp | revoked | Creates C04. | Must be run by hand (030:235). |
| DB-F35 | `resend_notification(uuid)` returns uuid | definer, sp | authenticated (aal2 inside) | Admin re-sends an email. | Order jobs only; inquiry jobs cannot be resent (031:97). |
| DB-F36 | `my_orders()` returns jsonb | definer, sp '' | authenticated | The customer's own orders. | |
| DB-F37 | `claim_my_guest_orders()` returns int | definer, sp '' | authenticated | Links guest orders by email; requires `email_confirmed_at`. | Depends on email confirmation staying on in the hosted project (034:185). |
| DB-F38 | `set_marketing_opt_in(bool)` | definer, sp '' | authenticated | Records consent with a timestamp. | |
| DB-F39 | `handle_new_customer()` | trigger on auth.users, definer | (trigger) | Creates the customer profile. | Also fires for admins, so admins get profiles. |
| DB-F40 | `hit_rate_limit(text,int,int)` returns bool | definer, sp | SR | Fixed-window counter. | 035:31 |
| DB-F41 | `purge_rate_limit_hits()` | definer, sp | revoked | Cron C02. | |
| DB-F42 | `queue_inquiry_notification()` | trigger, definer, sp | (trigger) | Queues `owner.new_inquiry`. | 039:38 |
| (dropped) | `reserve_stock`, `adjust_stock` (both signatures), `release_expired_reservations`, `order_stock_shortfall`, `restock_cancelled_order`, `queue_low_stock_notification` | | | All dropped in 038. | Cancelling an order now restocks nothing. That fits the in/out-of-stock model, but Alan has to re-tick `in_stock` himself. |

**Triggers:**
- `products_updated_at`
- `products_enqueue_orphaned_images` (after delete, or update of images)
- `products_dequeue_reused_images` (after insert, or update of images)
- `orders_updated_at`
- `orders_status_log`
- `orders_guard_fulfillment_status` (before update of fulfillment_status)
- `orders_queue_notifications`
- `subcategories_guard_delete`
- `store_settings_updated_at`
- `customer_profiles_updated_at`
- `inquiries_queue_notification`
- On auth.users: `handle_invited_admin` and `on_auth_user_created_profile`
- Dropped: `products_queue_low_stock` and `orders_restock_on_cancel` (038).

**Checked by:** `supabase/verify-rls.sql` (166 lines), a read-only script run by hand that asserts 13 rules:
- RLS is on everywhere.
- Every definer function sets `search_path`.
- No policy reads `admins` directly.
- Every write policy requires aal2.
- anon cannot read PII tables.
- anon has no write grants.
- Only allow-listed definer functions are callable from the browser.
- Admin PII reads need aal2.
- Policies without a TO clause are listed for review.
- inquiries, products and orders have no insert or delete grants.
- Column UPDATE grants match the agreed lists.

Its blind spot: rule 2 covers definer functions only, so the invoker functions F03 and F04 pass without a `search_path`.

## DB-P: policies (23 on public tables + 4 on storage = 27)

| ID | Table | Policy | Role | Cmd | Predicate | Watch |
|---|---|---|---|---|---|---|
| DB-P01 | products | public read published products | anon, authenticated | SELECT | `is_published = true` | |
| DB-P02 | products | admin read all products | authenticated | SELECT | aal2 | |
| DB-P03 | products | admin insert products | authenticated | INSERT | check aal2 | |
| DB-P04 | products | admin update products | authenticated | UPDATE | using and check aal2 | There is no delete policy (026); products are archived instead. |
| DB-P05 | orders | admin read orders | authenticated | SELECT | aal2 | Customers read their orders through `my_orders()`, not RLS. |
| DB-P06 | orders | admin update orders | authenticated | UPDATE | using and check aal2 | Limited to the column grant in T03. |
| DB-P07 | order_items | admin read order items | authenticated | SELECT | aal2 | |
| DB-P08 | order_status_log | admin read order status log | authenticated | SELECT | aal2 | |
| DB-P09 | order_status_log | admin insert order status log | authenticated | INSERT | check aal2 | |
| DB-P10 | subcategories | public_read | anon, authenticated | SELECT | true | |
| DB-P11-13 | subcategories | admin insert / update / delete subcategories | authenticated | I/U/D | aal2 | These replaced `admins_all`, which never worked (022). |
| DB-P14 | store_settings | public read store settings | anon, authenticated | SELECT | true | |
| DB-P15 | store_settings | admin update store settings | authenticated | UPDATE | aal2 | |
| DB-P16 | notification_jobs | admin read notification jobs | authenticated | SELECT | aal2 | |
| DB-P17 | payment_alerts | admin read payment alerts | authenticated | SELECT | aal2 | |
| DB-P18 | payment_alerts | admin resolve payment alerts | authenticated | UPDATE | aal2 (resolved_at column only) | |
| DB-P19 | customer_profiles | customer read own profile | authenticated | SELECT | `user_id = auth.uid()` | |
| DB-P20 | customer_profiles | customer update own profile | authenticated | UPDATE | own row (full_name and phone columns only) | |
| DB-P21 | customer_profiles | admin read customer profiles | authenticated | SELECT | aal2 | |
| DB-P22 | inquiries | admin read inquiries | authenticated | SELECT | aal2 | |
| DB-P23 | inquiries | admin update inquiries | authenticated | UPDATE | aal2 (status column only) | anon insert was dropped in 036. |
| DB-P24 | storage.objects | public read product images | **no TO clause (public)** | SELECT | bucket = product-images | Lets anon list every object in the bucket, including archived and orphaned images (011:63-65). verify-rls rule 9 does not see it, because it checks only the `public` schema. |
| DB-P25-27 | storage.objects | admin insert / update / delete product images | authenticated | I/U/D | aal2 and bucket match | |

Tables with RLS on and no policies: admins, orphaned_images, stripe_event_log, rate_limit_hits (SR only).

**Storage bucket:** `product-images`. Public, 5 MiB limit, jpeg, png and webp only (011). `config.toml` sets the storage file size limit to 10MiB for the local stack only.

## DB-C: pg_cron jobs

| ID | Job | Schedule | Created by | State | Watch |
|---|---|---|---|---|---|
| DB-C01 | `release-expired-reservations` | `*/5 * * * *` | 012:228 | Unscheduled by 038, so gone. | Check `cron.job` in prod to confirm it really is gone. |
| DB-C02 | `purge-rate-limit-hits` | `17 3 * * *` | 035:93 | Created by the migration. | |
| DB-C03 | `sweep-orphan-images` | default `17 3 * * *` | `schedule_image_sweep()` run by hand (012:283) | Unknown: it exists only if someone ran it. | The SR key is in plain text in `cron.job.command` and in `cron.job_run_details`. Redo it with the 030 pattern (read the key from Vault at run time). |
| DB-C04 | `notification-worker` | `* * * * *` | `schedule_notification_worker()` run by hand (030:248) | Unknown: it exists only if someone ran it. | If it was never scheduled in prod, no order or inquiry email is ever sent, and nothing reports it. The launch runbook does not mention it. |

Calls through pg_net: C03 posts to `sweep-orphan-images` and C04 posts to `notification-worker`. Both use verify_jwt = true, and `_shared/service-role-caller.ts` then checks the caller is the service role.

---

## INF: platform and infrastructure

| ID | Item | Detail | Watch |
|---|---|---|---|
| INF-01 | Hosting | Cloudflare Pages. No `wrangler.toml` or `_routes.json`; everything is set in the dashboard. Planned build command: `pnpm --filter @workspace/strike-arms run build`. Output directory: `artifacts/strike-arms/dist/public` (`docs/audit/completion-plan.md:296-297`). | Not recorded in the repo. Confirm the Node version and the pnpm detection in the Pages settings. |
| INF-02 | `_headers`, global `/*` | HSTS (2 years, includeSubDomains, preload), nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (accelerometer, camera, geolocation, gyroscope, magnetometer, microphone, payment and usb all denied), COOP same-origin. | Preload commits every subdomain to HTTPS (`_headers:16`). |
| INF-03 | CSP | `default-src 'self'`; `script-src 'self' challenges.cloudflare.com`; `frame-src challenges.cloudflare.com www.google.com`; `style-src 'self' 'unsafe-inline' fonts.googleapis.com`; `font-src 'self' data: fonts.gstatic.com`; `img-src 'self' data: blob: cxnhkgndvzgyqhiwsvrr.supabase.co`; `media-src 'self'`; `connect-src 'self'` plus the project's https and wss origins and challenges.cloudflare.com; `form-action 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `object-src 'none'`; `upgrade-insecure-requests`. | The project ref is hard-coded and must change with `VITE_SUPABASE_URL` (`_headers:30`). Any third-party analytics, pixel or Stripe.js will be blocked until it is added. `form-action 'self'` is fine for Checkout only while the redirect is done in JS. |
| INF-04 | `_headers` caching and robots | `/assets/*` immutable for a year. `/index.html` max-age=0 with must-revalidate. Sitemap and robots cached for 1 hour. `X-Robots-Tag: noindex, nofollow` on /cart, /checkout/*, /account, /account/*, /admin and /admin/*. | Only `/index.html` gets no-cache. Deep routes served by the SPA fallback may get Pages' default caching; check after deploy. |
| INF-05 | `_redirects` | 7 rules, all 301: six old `.php` pages (Airsoft-and-the-Law, Where-to-Play, Care-for-your-Rifle, About-Airsoft, guns-n-gear, Contact-us) and `/search` to `/store`. There is deliberately no `/*` SPA rule, because Pages serves index.html for any path that is not a file (`_redirects:20-26`). | Missing: `/index.php`, lower-case variants, and any old product or category URLs (completion-plan item 32). Do not add a 404.html. |
| INF-06 | `robots.txt` | Allows everything. Disallows /cart, /account, /admin and /auth/. Points at `Sitemap: https://strikearms.ie/sitemap.xml`. | Does not disallow /checkout (the noindex header covers it). |
| INF-07 | `sitemap.xml` | 241 URLs: 173 products, 19 brands, 17 store, 12 guides, 7 services and others. Generated by `scripts/generate-sitemap.mjs` from the static path list plus published products and brands, read with the anon key. The script fails loudly and never falls back to an old copy. | Run by hand only (`pnpm … run sitemap`), not part of `build`. Last committed 2026-10-17, so it is stale: `/evolution` (in STATIC_PATHS) and the Evolution and later batches are missing. No `<lastmod>`. |
| INF-08 | `scripts/generate-migration-manifest.mjs` | Runs inside `build`. Writes `src/lib/migration-manifest.ts` from `supabase/migrations`, for the admin Settings comparison with `applied_migrations()`. | Writes only to the repo, not prod. |
| INF-09 | `scripts/catalogue-import/*` (root) | Alan's stock transcribed into data modules, then: `build-csv` and `build-safety-tags` (write CSVs locally); `process-photo-sets`, `photo-framing` and `background-cleanup` (local sharp image processing); `reframe-live-photos` (reads live products with the anon key, writes local files). | Local writes only. |
| INF-10 | `upload-images.mjs`, `upload-photo-sets.mjs` | **Write to prod** with the service-role key. The first uploads to the `product-images` bucket. The second, with `--write`, replaces product `images`; without it, it only checks. The key comes from the git-ignored `service-role-key.txt` or `SUPABASE_SERVICE_ROLE_KEY` (`read-credentials.mjs:31`). | Replacing images fires the orphan trigger, so the old files are queued for the sweep. Confirm `service-role-key.txt` is not left on shared machines. |
| INF-11 | `scripts/post-merge.sh` (Replit `[postMerge]`, `.replit:18-19`) | Runs `pnpm install --frozen-lockfile` then `pnpm --filter db push`, which is `drizzle-kit push` against `DATABASE_URL`, with an **empty** schema (`lib/db/src/schema/index.ts`). | A Replit leftover. If DATABASE_URL ever points at the Supabase database, drizzle may propose dropping every public table. Remove it, or the `.replit` hook. |
| INF-12 | Leftover Replit packages | `lib/db`, `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` (the app's tsconfig references it), `artifacts/api-server` (unused, per CLAUDE.md), `artifacts/mockup-sandbox`, `.replit`, `.replit-artifact`, `replit.md`. `vite.config.ts:46` always loads `@replit/vite-plugin-runtime-error-modal`. | The runtime error overlay plugin also runs in production builds. Check that it adds nothing to the bundle. |
| INF-13 | `vite.config.ts` | `verifySupabaseConfig` fails the build on missing, placeholder or mismatched URL and key (lines 35-39). PORT defaults to 5173, BASE_PATH to "/". Aliases `@` and `@assets`. Output directory `dist/public`. Dev and preview use `allowedHosts: true` and host 0.0.0.0. | `allowedHosts: true` is dev-only, so fine. |
| INF-14 | `package.json` scripts | App: dev, build (manifest then vite build), serve, manifest, sitemap, `typecheck` (`tsc -p tsconfig.json --noEmit`), `lint` (`eslint .`), lint:fix. Root: a preinstall check that enforces pnpm; `build` runs typecheck then each package's build; `typecheck` uses `tsc --build` on the libs, then each package. | Root `build` runs every artifact's build, including api-server and mockup-sandbox. Pages should use the filtered command. |
| INF-15 | ESLint (`eslint.config.js`) | Flat config: js and typescript-eslint recommended, react-hooks, react-refresh. Rules: max-lines 300; complexity 20; max-depth 3; no-explicit-any; no-console (warn and error allowed); unused vars; max-lines-per-function 80 in lib, data and hooks. The layer rule is enforced with no-restricted-imports per folder. Exceptions: the 3 context providers in lib, and glossary and taxonomy (no max-lines). | Ignores `components/ui/**`. Deno functions are not linted, and there is no `deno lint` or `deno check` script. |
| INF-16 | tsconfig | The app extends `tsconfig.base.json`; includes `src/**`, excludes `**/*.test.ts`; moduleResolution bundler; `@/*` paths. | Edge Functions are never type-checked by any script. |
| INF-17 | pnpm workspace | `minimumReleaseAge: 1440` (supply-chain delay), with `@replit/*` excluded. Catalog pins (react 19.1.0, vite ^7.3.2 and others). Many platform binary overrides; win32 ones are kept. | CLAUDE.md says React 18, but the catalog pins 19.1.0. Fix the docs. |
| INF-18 | CI | None. There is no `.github/`, nothing else runs, and there is no pre-commit hook. | Typecheck, lint and verify-rls depend on people remembering to run them. |
| INF-19 | Tests | None: no `*.test.*`, `*.spec.*` or vitest config anywhere. | Money paths (pricing, VAT, shipping, webhook handlers) have no tests. |
| INF-20 | Coming-soon gate | `src/lib/coming-soon-gate.ts:8` sets `IS_COMING_SOON = true`. It gates strikearms.ie and www.strikearms.ie only; pages.dev and localhost stay open. `/admin` and `/auth/confirm` are always open. `?preview` stores a localStorage pass (`hooks/use-coming-soon.ts`). | Client-side only: the full bundle, the API and the Edge Functions are reachable behind it. The pass never expires. Stripe success pages and order-email links (when SITE_URL is the apex) land on the holding page unless the visitor has the pass. |
| INF-21 | `supabase/config.toml` (local stack only) | project_id cxnhkgndvzgyqhiwsvrr; API max_rows 1000; Postgres 15. Auth: site_url localhost:5173; enable_signup true; password minimum 12 (lower, upper and digits); confirmations on. Templates for invite, recovery, confirmation and email-change. | None of the auth settings reach the hosted project; they must be set by hand (`config.toml:20,28`; `docs/admin-auth-emails.md`). |
| INF-22 | Edge Function JWT settings | `verify_jwt = false`: create-checkout-session, stripe-webhook, checkout-status, order-lookup, submit-inquiry. `verify_jwt = true`: refund-order, sweep-orphan-images, delete-account, notification-worker. | Each public function must do its own Turnstile and rate limiting; the checkout section should verify that. |
| INF-23 | `_shared/env.ts` | `requireEnv` and `optionalEnv`. Secrets are read at boot, so a function must be redeployed after a secret changes. | |
| INF-24 | `_shared/cors.ts` | Allowed origins: strikearms.ie, www.strikearms.ie, strike-arms-site.pages.dev, localhost:5173. Unknown origins get the apex in the header, so the browser blocks them. The webhook uses `*`. | localhost stays allowed in prod (low risk). Pages preview subdomains (`*.strike-arms-site.pages.dev`) are not allowed (cors.ts:7-14). |
| INF-25 | `_shared/client-ip.ts` | Takes the first `x-forwarded-for` entry, falling back to `cf-connecting-ip`. | The first XFF entry may be set by the client, so per-IP limits could be dodged by spoofing it (client-ip.ts:8). The comment admits per-order and per-attempt limits are the backstop. |
| INF-26 | `_shared/rate-limit.ts` | Calls `hit_rate_limit` with an HMAC-SHA-256 key and fails closed. | Rotating the SR key resets the counters. |
| INF-27 | `_shared/turnstile.ts` | Fails closed when `TURNSTILE_SECRET_KEY` is missing, unless `ALLOW_INSECURE_NO_CAPTCHA=true`. Checks the action and the hostname list. Timeout 8s. | If `SITE_HOSTNAME` is unset, any hostname passes (turnstile.ts:41). Make sure `ALLOW_INSECURE_NO_CAPTCHA` is never set in prod. |
| INF-28 | `_shared/service-role-caller.ts` | Accepts a constant-time match on the SR key, or any JWT with role=service_role that `/auth/v1/admin/users` accepts. | Fine. It costs one Auth call per cron run when the keys differ. |
| INF-29 | `_shared/resend.ts`, `escape-html.ts`, `shipping.ts`, `supabase-admin.ts` | Resend sender with idempotency key = job id; HTML escaping; flat-rate shipping, free-over-threshold and VAT-inclusive maths using store_settings; SR client with no session persistence. | `EMAIL_FROM` has no fallback, so it needs a verified Resend domain (SPF, DKIM, DMARC). |
| INF-30 | Browser env (VITE_*) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY` (without it no widget renders, `use-turnstile.ts:50`), `VITE_SITE_URL` (defaults to production, `site-config.ts:14`). Vite also reads `BASE_PATH` and `PORT`. | No `.env.example`; the tracked `artifacts/strike-arms/.env` holds placeholders only (checked: the anon value is a placeholder, not a JWT). If the site key is missing in prod, checkout and forms fail the server-side Turnstile check. |
| INF-31 | Function secrets (Deno.env) | Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (all injected by Supabase), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`, `SITE_URL`. Optional: `TURNSTILE_SECRET_KEY` (in effect required), `SITE_HOSTNAME`, `REPLY_TO`, `ALLOW_INSECURE_NO_CAPTCHA`. Vault: `service_role_key`. | Stripe test keys must be swapped for live ones at launch, and the webhook re-created in live mode. |
| INF-32 | Stripe webhook events handled | `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`. | The Stripe dashboard endpoint must subscribe to exactly these. Stripe API version is pinned to `2024-11-20.acacia`. |
| INF-33 | `seed.sql` | 334 lines, 56 demo products with the wrong brands. Header warns it must not be seeded into prod. | `supabase db reset` against a linked project would be disastrous; this is local only. |
| INF-34 | `verify-rls.sql` | See the end of DB-F. Last recorded clean run: 2026-09-30 (after 036). | Not recorded as re-run after 037, 038 or 039. Run it before launch. |
| INF-35 | `docs/launch-runbook.md` | Lists: Supabase Site URL to the live domain, redirect URLs, custom SMTP (Resend), recheck the password policy, the `SITE_URL` secret to the apex, `SITE_HOSTNAME` including the apex. "Done already" log runs to 2026-09-30. | Missing: flipping `IS_COMING_SOON`; Stripe live keys and webhook; scheduling C03 and C04 and the Vault secret; Pages env vars and custom domain; the CSP ref; regenerating the sitemap; activating the redirects and checking the CORS list; Supabase plan and backups (D8); DNS email records; running verify-rls. |
| INF-36 | Supabase plan | The free tier auto-pauses (completion-plan item 35). | No uptime ping and no backup export in the repo. |

---

## Cross-area hand-offs

- **Checkout and payments:**
  - With no stock counts (038), concurrent buyers can both pay for a one-off pre-loved item. Decide whether that is acceptable or whether to add a quantity-1 guard.
  - Confirm `create-checkout-session` refuses archived products. It checks `is_published` (`order-lines.ts:88`), and the archive constraint implies unpublished.
  - Confirm the Stripe endpoint's event list matches INF-32.
- **Admin dashboard:**
  - Make sure no UI writes `attention_reason` (the grant would refuse it); a "clear flag" feature would need an RPC.
  - Counter sales accept unpublished, and apparently archived, products with no stock check (038:239-244).
  - `resend_notification` cannot resend inquiry emails.
  - `applied_migrations` works at aal1.
- **Auth and accounts:**
  - Signup is open and invites grant admin. Audit how invites are sent.
  - Hosted auth settings (site URL, confirmations, password policy) must be checked by hand. `claim_my_guest_orders` relies on email confirmation being on.
- **Email / notifications:** Check that cron C04 and the Vault `service_role_key` exist in prod. Without them nothing sends, and nothing reports it. Resend domain DNS is needed for `EMAIL_FROM`.
- **Security:**
  - The SR key sits in `cron.job` if C03 was ever scheduled (012:283-299); rotate it after moving C03 to the Vault-at-run-time pattern.
  - The storage read policy has no TO clause, so anyone can list the bucket.
  - XFF spoofing could weaken the per-IP rate limits.
  - Remove the Replit `post-merge.sh` drizzle push.
  - Add `search_path` to F03 and F04.
- **SEO:**
  - The sitemap is stale (no /evolution, missing recent products) and is not regenerated on build.
  - `_redirects` lacks `/index.php`, lower-case variants and old product URLs.
  - robots and noindex coverage is otherwise sound.
- **Launch / ops:**
  - The runbook is incomplete (INF-35).
  - There is no CI and there are no tests.
  - verify-rls has not been re-run since 036.
  - The coming-soon gate is cosmetic, and order-email and success links will hit it.
  - Supabase free-tier pausing and backups are unresolved.
- **Docs:** Several are stale:
  - CLAUDE.md (React 18; the actual pin is 19.1.0).
  - 014's "No sequences".
  - The 034:29 and 012 sweeper comments.
  - `database-plan.md`, which may still describe the reservation tables.
