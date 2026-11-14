# Ecosystem checklist: Stripe Checkout + Supabase + Resend + Cloudflare Pages + Turnstile

Researched 14 November 2026 against official docs. One line per item, source at the end.
Markers: **[VER]** depends on API, SDK or product version; **[PLAN]** depends on plan tier; **[SOLICITOR]** legal point to confirm with a solicitor; **[VERIFY]** an official source was unclear or contradicted itself.

## 1. Stripe Checkout (hosted)

### Webhook endpoint (Supabase Edge Function, Deno)
- [ ] Read the body with `await req.text()` and verify that exact string; never `req.json()` then re-stringify, or the signature check fails. https://docs.stripe.com/webhooks
- [ ] In Deno use `stripe.webhooks.constructEventAsync(body, sig, secret, undefined, Stripe.createSubtleCryptoProvider())`; the sync `constructEvent` relies on Node crypto. https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/stripe-webhooks/index.ts
- [ ] Deploy the webhook function with `verify_jwt = false` (Stripe sends no Supabase JWT); the Stripe signature is the only auth. https://supabase.com/docs/guides/functions/function-configuration
- [ ] Keep the default 5-minute timestamp tolerance; never pass tolerance `0` (disables replay protection). https://docs.stripe.com/webhooks
- [ ] Return 400 on bad signature, 2xx fast on success; do heavy work (emails, stock sync) via the outbox, not inline. https://docs.stripe.com/webhooks
- [ ] Return 5xx (not 2xx) if the DB write fails, so Stripe retries; a swallowed error loses the order. https://docs.stripe.com/webhooks
- [ ] Live-mode retries run for up to 3 days with backoff; sandbox retries only 3 times over a few hours, so test-mode resilience tests understate live behaviour. https://docs.stripe.com/webhooks
- [ ] Manual resend works from the Dashboard for 15 days and from the CLI for 30 days; write this into the runbook. https://docs.stripe.com/webhooks
- [ ] Stripe treats 3xx as failure: register the exact final URL (no trailing-slash or http→https redirect). https://docs.stripe.com/webhooks
- [ ] Separate signing secrets for test and live endpoints (and for `stripe listen`); store each as a separate edge function secret. https://docs.stripe.com/webhooks
- [ ] Roll the signing secret periodically and on suspicion; Stripe allows the old secret to stay valid for up to 7 days, so verify against both during rollover. https://docs.stripe.com/webhooks
- [ ] Subscribe only to the events you handle, not "all events". https://docs.stripe.com/webhooks

### Idempotency and ordering
- [ ] Store every processed `event.id` in a table with a UNIQUE constraint; insert first, skip on conflict. https://docs.stripe.com/webhooks
- [ ] Also dedupe on (`data.object.id`, `event.type`), because Stripe can occasionally emit two distinct Event objects for one change. https://docs.stripe.com/webhooks
- [ ] Do not assume order; never use `event.created` to order or dedupe (second resolution, can collide). https://docs.stripe.com/webhooks
- [ ] Make order state transitions monotonic in SQL (e.g. never move `refunded` back to `paid`) so out-of-order events are harmless. https://docs.stripe.com/webhooks
- [ ] Fulfilment function must be safe to run concurrently for the same session (webhook plus success page can race); use a row lock or `INSERT ... ON CONFLICT` on session id. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] When an event arrives for an object you have not seen, re-fetch it from the API rather than trusting the snapshot alone. https://docs.stripe.com/webhooks
- [ ] Send an `Idempotency-Key` (v4 UUID, up to 255 chars, no PII) on every POST to Stripe: session create, refund create, session expire. https://docs.stripe.com/api/idempotent_requests
- [ ] Idempotency keys can be pruned after 24 hours, and reusing a key with different params errors; derive keys from your own order/refund row id. https://docs.stripe.com/api/idempotent_requests
- [ ] A saved idempotent response includes 500 errors; on a retried 500 use a new key only after confirming no object was created. https://docs.stripe.com/api/idempotent_requests

### Events to handle
- [ ] `checkout.session.completed`: retrieve the session with `expand: ['line_items']` and check `payment_status` before marking paid. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] `payment_status` can be `paid`, `unpaid` or `no_payment_required`; `completed` with `unpaid` means a delayed method still processing, so do not ship yet. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] `checkout.session.async_payment_succeeded`: fulfil delayed-method orders (e.g. SEPA Debit if enabled). https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] `checkout.session.async_payment_failed`: release stock and email the customer. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] `checkout.session.expired`: release the reserved stock for that session. https://docs.stripe.com/api/checkout/sessions/create
- [ ] `charge.refunded` fires for full and partial refunds; use `refund.created` / `refund.updated` / `refund.failed` for refund detail. https://docs.stripe.com/refunds
- [ ] `refund.failed`: alert the owner, the customer must be refunded another way. https://docs.stripe.com/refunds
- [ ] `charge.refund.updated` is deprecated; listen to `refund.updated` instead. [VER] https://docs.stripe.com/refunds
- [ ] `charge.dispute.created` / `.updated` / `.closed` / `.funds_withdrawn` / `.funds_reinstated`: alert the owner immediately; evidence has a hard deadline. https://docs.stripe.com/disputes
- [ ] Consider disabling delayed payment methods in the Dashboard if the owner cannot cope with "paid later" orders for one-off stock. https://docs.stripe.com/payments/payment-methods/overview

### Stock reservation vs session expiry (one-off items)
- [ ] `expires_at` must be 30 minutes to 24 hours after creation; default is 24 hours, which would lock a stock-of-1 item for a day. https://docs.stripe.com/api/checkout/sessions/create
- [ ] Reserve stock atomically in Postgres (conditional `UPDATE ... WHERE stock >= qty`) before creating the session; release on `checkout.session.expired`. https://docs.stripe.com/payments/checkout/managing-limited-inventory
- [ ] Set the reservation TTL slightly longer than `expires_at` and let a pg_cron sweeper release only reservations whose Stripe session is confirmed expired. https://supabase.com/docs/guides/cron
- [ ] If the cart changes or the customer abandons, call the Expire Session API so the item frees up early. https://docs.stripe.com/api/checkout/sessions/expire
- [ ] Do not enable `after_expiration.recovery` for one-off items without re-reserving stock, or a recovered session can sell an item already sold. https://docs.stripe.com/api/checkout/sessions/create
- [ ] Handle the "paid but stock gone" edge (async payment succeeding late, admin edited stock): auto-refund and email, never silently oversell. https://docs.stripe.com/refunds
- [ ] Never trust client-sent prices; build `line_items` server-side from the DB (or Stripe Price ids) inside the edge function. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page

### Success page, metadata, API version
- [ ] Use `success_url=...?session_id={CHECKOUT_SESSION_ID}`; the page may call fulfil, but webhooks remain the source of truth. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] Hosted Checkout waits up to 10 seconds for your `checkout.session.completed` response before redirecting, so slow webhooks delay customers. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] Put your order id in `client_reference_id` (max 200 chars) and `metadata`; also set `payment_intent_data.metadata` because session metadata does not copy to the PaymentIntent. https://docs.stripe.com/metadata
- [ ] Metadata limits: 50 keys, 40-char keys, 500-char values; no card, bank or sensitive data. https://docs.stripe.com/metadata
- [ ] Payment mode allows max 100 line items. https://docs.stripe.com/api/checkout/sessions/create
- [ ] Pin the API version explicitly in the SDK constructor (current at research time: `2026-10-28.endive`); do not rely on the account default. [VER] https://docs.stripe.com/upgrades
- [ ] Webhook payload shape follows the endpoint's own API version, not the SDK's; upgrade by creating a second endpoint and cutting over, keeping handlers idempotent. [VER] https://docs.stripe.com/upgrades
- [ ] Import Stripe in Deno via `npm:stripe@<exact version>`; pin it so a redeploy does not silently change the API version. [VER] https://supabase.com/docs/guides/functions/dependencies
- [ ] Redirect to `session.url` returned from the server; do not use the removed/deprecated Stripe.js `redirectToCheckout`. [VER] https://docs.stripe.com/payments/checkout/how-checkout-works

### Tax, receipts, refunds, Radar
- [ ] Decide inclusive vs exclusive pricing: Irish B2C prices are normally shown VAT-inclusive, so set `tax_behavior=inclusive` on Prices or price_data. https://docs.stripe.com/tax/products-prices-tax-codes-tax-behavior
- [ ] If using Stripe Tax: register Ireland in Tax settings, set a product tax code per product, enable `automatic_tax[enabled]=true`; Stripe Tax is priced per transaction. [PLAN] https://docs.stripe.com/tax/checkout
- [ ] Irish standard VAT rate is 23% at research time; confirm rate per product type with the accountant. https://www.revenue.ie/en/vat/vat-rates/search-vat-rates/current-vat-rates.aspx
- [ ] Cross-border EU B2C sales above the EU-wide threshold need OSS; confirm with the accountant before shipping outside Ireland. https://www.revenue.ie/en/vat/vat-ecommerce/index.aspx
- [ ] Stripe Tax calculates and reports but does not file Irish VAT returns for you. https://docs.stripe.com/tax/supported-countries/european-union/ireland
- [ ] Turn on automatic receipts (Settings > Customer emails); test-mode payments do not send receipts automatically. https://docs.stripe.com/receipts
- [ ] Receipts require legal business name, support address, support email and privacy policy URL in Stripe public details. https://docs.stripe.com/receipts
- [ ] `invoice_creation[enabled]=true` gives an itemised VAT invoice PDF but is billed separately per invoice. [PLAN] https://docs.stripe.com/receipts
- [ ] Refunds use the available balance; if insufficient, card refunds sit pending up to 45 days then fail. https://docs.stripe.com/refunds
- [ ] Stripe processing fees are not returned on refund; reflect this in pricing and returns policy. https://docs.stripe.com/refunds
- [ ] Refunds can only go to the original payment method; card refunds can be cancelled in the Dashboard within 30 minutes only. https://docs.stripe.com/refunds
- [ ] Do not refund a payment that is already disputed (double payout risk); respond to the dispute instead. https://docs.stripe.com/refunds
- [ ] Review Radar default rules; consider blocking or reviewing on CVC/postcode failure and high risk score for high-value items. [PLAN] https://docs.stripe.com/radar
- [ ] Teach the owner the dispute flow and deadlines; keep proof of delivery (tracking) per order. https://docs.stripe.com/disputes

### Test to live switchover
- [ ] Live mode has separate keys, Prices, Products, Tax settings, webhook endpoints and signing secrets; recreate each, do not copy ids from test. https://docs.stripe.com/keys
- [ ] Use restricted keys (`rk_live_...`) with only the permissions the edge functions need. https://docs.stripe.com/keys
- [ ] After go-live, run one real low-value purchase and refund end-to-end, and confirm the webhook delivered in Workbench. https://docs.stripe.com/webhooks
- [ ] Assert `event.livemode` matches the environment in the handler, so a test event can never mark a live order paid. https://docs.stripe.com/api/events/object

## 2. Supabase

### API keys and service role
- [ ] Migrate to `sb_publishable_...` and `sb_secret_...` keys; legacy `anon`/`service_role` JWT keys are planned for deprecation by end of 2026. [VER] https://supabase.com/docs/guides/api/api-keys
- [ ] Creating new keys does not revoke legacy ones; disable legacy keys explicitly once migrated. https://supabase.com/docs/guides/api/api-keys
- [ ] Never ship a secret/service-role key to the browser (Vite exposes any `VITE_` variable). https://supabase.com/docs/guides/api/api-keys
- [ ] Use one secret key per backend component (webhook, outbox worker, admin functions) so a leak needs only one rotation. https://supabase.com/docs/guides/api/api-keys
- [ ] Service-role clients bypass RLS entirely; in edge functions acting for a user, create a second client with the user's JWT so RLS still applies. https://supabase.com/docs/guides/functions/auth
- [ ] For functions called with a secret key (cron, worker), set `verify_jwt = false` and authorise the key in code; platform `verify_jwt` does not authenticate the caller for new keys. [VER] https://supabase.com/docs/guides/api/api-keys

### RLS
- [ ] Enable RLS on every table in exposed schemas (`public`); advisor lint 0013 flags misses as ERROR. https://supabase.com/docs/guides/database/database-advisors
- [ ] Policies do not remove grants: revoke default privileges from `anon` and `authenticated` and grant back only what each needs. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Always name the role (`to authenticated` / `to anon`) on each policy. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] `auth.uid()` is null for anon; write `(select auth.uid()) is not null and ...` to avoid silent mismatches. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Wrap `auth.uid()`, `auth.jwt()` and helper functions in `(select ...)` so they evaluate once per statement (lint 0003). https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Index every column used in a policy filter; composite PKs only index the leading column. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Never authorise on `user_metadata` (user-editable, lint 0015); store roles in `app_metadata` or an admin table. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] JWT claims stay stale until refresh; for admin removal, check a DB table not just a claim. https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Views bypass RLS by default; create with `security_invoker = true` (Postgres 15+) or keep them out of exposed schemas (lint 0010). [VER] https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Materialised views and foreign tables cannot be protected by RLS; keep them unexposed (lints 0016, 0017). https://supabase.com/docs/guides/database/database-advisors
- [ ] `security definer` functions: `set search_path = ''`, schema-qualify everything, keep them in an unexposed schema (lint 0011). https://supabase.com/docs/guides/database/postgres/row-level-security
- [ ] Revoke `execute` on security definer functions from `anon`/`authenticated` unless intended (lints 0028, 0029); Postgres grants execute to PUBLIC by default. https://supabase.com/docs/guides/database/database-advisors
- [ ] Avoid multiple permissive policies per table/role/action (lint 0006) and always-true policies (lint 0024). https://supabase.com/docs/guides/database/database-advisors
- [ ] Do not enable anonymous sign-ins unless needed; they satisfy `to authenticated` policies (lint 0012). https://supabase.com/docs/guides/database/database-advisors
- [ ] Keep extensions out of `public` (lint 0014); pg_net and pg_cron live in their own schemas by default. https://supabase.com/docs/guides/database/database-advisors
- [ ] Test RLS as each role (anon, customer, admin aal1, admin aal2) with SQL `set role` / `request.jwt.claims` tests in CI. https://supabase.com/docs/guides/database/testing

### MFA / AAL2 for admins
- [ ] Add a `restrictive` policy on every admin-writable table requiring `(select auth.jwt()->>'aal') = 'aal2'`. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] Restrictive policies are ANDed with permissive ones; a permissive policy alone will not enforce MFA. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] Enforce aal2 in admin edge functions too (parse the JWT `aal` claim), not only in the React route guard. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] Only act on `verified` factors; enrolled-but-unverified factors do not count. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] After unenrolling a factor the session drops to aal1 only at refresh; call `refreshSession()` to apply now. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] Have the owner enrol two TOTP factors (phone plus a backup device) and document a lost-device recovery path; MFA verify is rate-limited to 15/min per IP and not configurable. https://supabase.com/docs/guides/auth/rate-limits

### Auth email and rate limits
- [ ] Built-in Auth email is limited to 2 emails per hour per project; configure custom SMTP (e.g. Resend SMTP) before launch. https://supabase.com/docs/guides/auth/rate-limits
- [ ] Set the SMTP sender to the verified Resend domain and raise the Auth email rate limit once custom SMTP is in place. https://supabase.com/docs/guides/auth/auth-smtp
- [ ] Defaults: OTP/magic link 60 s per user, sign-in/sign-up 30 per 5 min per IP, token endpoint 150 per 5 min per IP. https://supabase.com/docs/guides/auth/rate-limits
- [ ] Enable CAPTCHA (Turnstile) on Auth sign-up/sign-in/reset in Auth settings, and pass `captchaToken` from the client. https://supabase.com/docs/guides/auth/auth-captcha
- [ ] Set Site URL and the redirect allow-list to the production domain only (plus explicit preview domains); avoid broad wildcards. https://supabase.com/docs/guides/auth/redirect-urls

### Edge functions
- [ ] Limits: wall clock 150 s Free / 400 s paid, CPU 2 s per request, 256 MB memory, 150 s idle timeout (504). [PLAN] https://supabase.com/docs/guides/functions/limits
- [ ] The 2 s CPU limit excludes I/O, but heavy JSON or image work can hit it; keep the webhook handler thin. https://supabase.com/docs/guides/functions/limits
- [ ] Cold starts exist; keep imports small and avoid top-level work so the Stripe 10-second redirect wait is not consumed. https://supabase.com/docs/guides/functions/limits
- [ ] Use `EdgeRuntime.waitUntil()` only for best-effort work; anything that must happen goes into the outbox table in the same transaction. https://supabase.com/docs/guides/functions/background-tasks
- [ ] Set secrets with `supabase secrets set`; never commit `.env`; different secrets per project (staging vs production). https://supabase.com/docs/guides/functions/secrets
- [ ] Set CORS headers explicitly for browser-called functions (and handle OPTIONS); the webhook function needs none. https://supabase.com/docs/guides/functions/cors

### pg_cron, pg_net, Vault
- [ ] pg_net requests are sent only after the transaction commits, are fire-and-forget, and have no built-in retries. https://supabase.com/docs/guides/database/extensions/pg_net
- [ ] pg_net default timeout is 2000 ms; raise `timeout_milliseconds` when calling an edge function worker. https://supabase.com/docs/guides/database/extensions/pg_net
- [ ] pg_net queue and response tables are unlogged (lost on crash) and responses are kept 6 hours; record your own attempt status in the outbox row. https://supabase.com/docs/guides/database/extensions/pg_net
- [ ] pg_net is designed for up to 200 requests per second; batch work, do not fire one request per row. https://supabase.com/docs/guides/database/extensions/pg_net
- [ ] Store the worker's secret key/URL in Vault and read it in the cron job, not as a literal in `cron.schedule`. https://supabase.com/docs/guides/database/vault
- [ ] Monitor `cron.job_run_details` for failures and prune it (it grows unbounded). https://supabase.com/docs/guides/cron
- [ ] Prevent overlapping worker runs (claim rows with `FOR UPDATE SKIP LOCKED`), since a cron tick can fire while the previous run is still going. https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE

### Connections, backups, pausing, plan
- [ ] Use the Supabase client (HTTP via PostgREST) from edge functions; if using a direct Postgres driver, use the transaction-mode pooler and close connections. https://supabase.com/docs/guides/database/connecting-to-postgres
- [ ] Free projects pause after about a week of low activity; a live shop must be on a paid plan. [PLAN] https://supabase.com/docs/guides/platform/free-project-pausing
- [ ] Restore window for paused Free projects differs between official pages (90 days vs 1 year). [VERIFY] https://supabase.com/docs/guides/platform/free-project-pausing
- [ ] Daily backups: Pro 7 days, Team 14, Enterprise up to 30; no automatic backups documented for Free. [PLAN] https://supabase.com/docs/guides/platform/backups
- [ ] PITR is a paid add-on (worst-case RPO 2 minutes); enabling it replaces daily backups. [PLAN] https://supabase.com/docs/guides/platform/backups
- [ ] Database backups do not include Storage objects; back up product images separately. https://supabase.com/docs/guides/platform/backups
- [ ] The project is offline during a restore; take your own `supabase db dump` off-site on a schedule as well. https://supabase.com/docs/guides/platform/backups
- [ ] Enable spend cap / usage alerts deliberately; a spend cap can throttle a live shop at the worst moment. [PLAN] https://supabase.com/docs/guides/platform/cost-control
- [ ] Work through the official production checklist (SSL enforcement, network restrictions, MFA on the Supabase org account, ownership by more than one person). https://supabase.com/docs/guides/deployment/going-into-prod

### Storage
- [ ] Storage access is controlled by RLS on `storage.objects`; write explicit insert/update/delete policies for admin (aal2) only. https://supabase.com/docs/guides/storage/security/access-control
- [ ] A public bucket serves files to anyone with the URL but uploads still need policies; avoid broad SELECT policies that make it listable (lint 0025). https://supabase.com/docs/guides/database/database-advisors
- [ ] Set bucket `file_size_limit` and `allowed_mime_types` (images only) server-side. https://supabase.com/docs/guides/storage/buckets/fundamentals
- [ ] Image transformations are not available on Free; Pro/Team include 100 origin images then charge per 1,000. [PLAN] https://supabase.com/docs/guides/platform/billing-on-supabase
- [ ] If not paying for transforms, generate resized WebP/AVIF variants at upload time instead. https://supabase.com/docs/guides/storage/serving/image-transformations
- [ ] Use cache-busting file names for replaced images; Storage responses are CDN cached. https://supabase.com/docs/guides/storage/cdn/fundamentals

### Advisors
- [ ] Run Security and Performance Advisors before launch and after every migration; treat all ERROR-level lints as blockers. https://supabase.com/docs/guides/database/database-advisors
- [ ] Key performance lints: unindexed FKs (0001), auth RLS initplan (0003), duplicate indexes (0009), table bloat (0020). https://supabase.com/docs/guides/database/database-advisors
- [ ] Key security lints: auth.users exposed (0002), security definer view (0010), RLS disabled (0013), sensitive columns exposed (0023). https://supabase.com/docs/guides/database/database-advisors
- [ ] Watch the named health checks for error-rate spikes on Data API, Auth, Storage and Edge Functions. https://supabase.com/docs/guides/database/database-advisors

## 3. Resend

- [ ] Verify the sending domain (SPF and DKIM DNS records) on a subdomain such as `mail.` or `send.` to protect the root domain reputation. https://resend.com/docs/dashboard/domains/introduction
- [ ] Publish a DMARC record (start `p=none` with reporting, move to `quarantine`); Gmail/Yahoo require DMARC for bulk senders. https://support.google.com/a/answer/81126
- [ ] Send `Idempotency-Key` (1-256 chars) on every send; keys are kept 24 hours. https://resend.com/docs/dashboard/emails/idempotency-keys
- [ ] Use the outbox row id plus template as the key; a 409 `invalid_idempotent_request` means a key was reused with a different payload (a bug, do not retry). https://resend.com/docs/dashboard/emails/idempotency-keys
- [ ] A 409 `concurrent_idempotent_requests` is safe to retry later. https://resend.com/docs/dashboard/emails/idempotency-keys
- [ ] Default rate limit is 10 requests per second per team, shared across keys; throttle the worker and honour `retry-after` on 429. https://resend.com/docs/api-reference/rate-limit
- [ ] Free plan has a daily quota (resets midnight UTC) and a monthly quota; a 429 `daily_quota_exceeded` would block order emails. [PLAN] https://resend.com/docs/api-reference/rate-limit
- [ ] Received emails also count towards quotas. [PLAN] https://resend.com/docs/api-reference/rate-limit
- [ ] Verify Resend webhooks with the Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`) against the raw body. https://resend.com/docs/webhooks/verify-webhooks-requests
- [ ] Subscribe to bounce and complaint events; stop sending marketing to those addresses and flag the order for manual contact. https://resend.com/docs/webhooks/introduction
- [ ] Dedupe Resend webhook deliveries on `svix-id`; webhooks can be replayed. https://resend.com/docs/webhooks/introduction
- [ ] Use a sending-only API key for the worker, separate from any full-access key. https://resend.com/docs/dashboard/api-keys/introduction

### Outbox pattern
- [ ] Write the outbox row in the same transaction as the order state change, so an email cannot be lost or sent for a rolled-back order. https://microservices.io/patterns/data/transactional-outbox.html
- [ ] Columns: status, attempts, next_attempt_at, last_error, idempotency_key, provider_message_id; claim with `FOR UPDATE SKIP LOCKED`. https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE
- [ ] Exponential backoff with jitter on 429/5xx/network; no retry on 4xx validation errors. https://resend.com/docs/api-reference/rate-limit
- [ ] After N attempts move to `dead` and alert the owner; provide an admin "resend" action. https://microservices.io/patterns/data/transactional-outbox.html
- [ ] Reclaim rows stuck in `sending` past a timeout (worker died mid-send); the idempotency key prevents a duplicate within 24 hours. https://resend.com/docs/dashboard/emails/idempotency-keys

## 4. Cloudflare Pages and Turnstile

### Routing and headers
- [ ] With no top-level `404.html`, Pages already serves the SPA root for unknown paths; adding `/* /index.html 200` is usually unnecessary. https://developers.cloudflare.com/pages/configuration/serving-pages/
- [ ] Unknown URLs then return 200 with the app shell (soft 404s); render a noindex 404 view client-side for unknown routes. https://developers.cloudflare.com/pages/configuration/serving-pages/
- [ ] `_redirects` limits: 2,000 static plus 100 dynamic (2,100 total), 1,000 chars per line; static first; top-most match wins. https://developers.cloudflare.com/pages/configuration/redirects/
- [ ] Above the limit (e.g. many legacy PHP URLs for the 301 migration) use Bulk Redirects. https://developers.cloudflare.com/pages/configuration/redirects/
- [ ] `_redirects` and `_headers` do not apply to responses from Pages Functions. https://developers.cloudflare.com/pages/configuration/headers/
- [ ] `_headers` limits: 100 rules, 2,000 chars per line; repeated headers are comma-joined, so a CSP set twice becomes two merged policies. https://developers.cloudflare.com/pages/configuration/headers/
- [ ] Use `! Header-Name` to detach a header from a broader rule; detaches only affect rules earlier in the file. https://developers.cloudflare.com/pages/configuration/headers/
- [ ] Pages sends `Cache-Control: public, max-age=0, must-revalidate` plus ETag by default, so `index.html` revalidates; good. https://developers.cloudflare.com/pages/configuration/serving-pages/
- [ ] Add `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` (Vite hashed files) only, never for `index.html`. https://developers.cloudflare.com/pages/configuration/headers/
- [ ] Avoid custom Cache Rules on the proxied domain; they can serve stale HTML after a deploy. https://developers.cloudflare.com/pages/configuration/serving-pages/
- [ ] After a deploy, an open tab may request old chunk hashes; handle dynamic-import failures by reloading once. https://vite.dev/guide/build#load-error-handling

### CSP
- [ ] Turnstile needs `script-src https://challenges.cloudflare.com` and `frame-src https://challenges.cloudflare.com`. https://developers.cloudflare.com/turnstile/reference/content-security-policy/
- [ ] Supabase needs `connect-src https://<ref>.supabase.co wss://<ref>.supabase.co` (wss only if Realtime) and `img-src` for Storage. https://supabase.com/docs/guides/api
- [ ] Hosted Checkout is a top-level navigation to checkout.stripe.com, so no Stripe CSP entries are needed unless Stripe.js is loaded; if it is, follow Stripe's CSP list. https://docs.stripe.com/security/guide
- [ ] Add `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'`, `form-action 'self'`; start with `Content-Security-Policy-Report-Only` on a preview first. https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- [ ] Static `_headers` cannot inject per-request nonces; use hashes or host allow-lists, and avoid inline scripts in `index.html`. https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- [ ] Also send HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy`. https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html

### Preview deployments and env vars
- [ ] Production and Preview have separate environment variables; Vite inlines `VITE_*` at build time, so a preview build must point at test Stripe/Supabase. https://developers.cloudflare.com/pages/configuration/build-configuration/
- [ ] Preview URLs (`*.pages.dev`) are public by default; protect them with Cloudflare Access or keep them on test data only. https://developers.cloudflare.com/pages/configuration/preview-deployments/
- [ ] Add `X-Robots-Tag: noindex` for `*.pages.dev` hosts so previews do not get indexed. https://developers.cloudflare.com/pages/configuration/preview-deployments/
- [ ] Add preview hostnames to the Turnstile widget hostnames and Supabase redirect URLs only if previews must work end-to-end. https://developers.cloudflare.com/turnstile/concepts/hostname-management/

### Turnstile server-side validation
- [ ] Always validate tokens server-side via siteverify in the edge function; the client widget alone proves nothing. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Tokens expire after 300 seconds and are single-use; call `turnstile.reset()` after a failed submit or a slow form. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Redemption tracking is eventually consistent; near-simultaneous replays may both pass, so keep your own rate limits and idempotency. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Check `success`, `hostname` and `action` in the response; reject tokens over 2048 chars. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Use `idempotency_key` when retrying siteverify after a network error. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Decide fail-open vs fail-closed per form (Cloudflare does not prescribe one); for checkout, fail closed with a clear "try again" message and an alert. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Use the official test sitekeys/secrets in dev and preview; dummy tokens fail against production secrets. https://developers.cloudflare.com/turnstile/troubleshooting/testing/

## 5. Cross-cutting

### Monitoring and alerting (tiny shop)
- [ ] Alert on: any webhook delivery failure in Stripe Workbench (Stripe also emails on repeated failures). https://docs.stripe.com/webhooks
- [ ] Alert on: paid Stripe sessions with no matching paid order after 15 minutes (reconciliation cron that lists recent sessions). https://docs.stripe.com/api/checkout/sessions/list
- [ ] Alert on: outbox rows in `dead` or older than 30 minutes unsent. https://microservices.io/patterns/data/transactional-outbox.html
- [ ] Alert on: dispute created, refund failed, payout failed. https://docs.stripe.com/disputes
- [ ] Alert on: failed `cron.job_run_details` entries and edge function error-rate spikes. https://supabase.com/docs/guides/cron
- [ ] Alert on: Resend bounce/complaint rate rising and quota near limit. https://resend.com/docs/api-reference/rate-limit
- [ ] Uptime check on the homepage and a health endpoint; route alerts to the owner's phone and the developer, not only email. https://developers.cloudflare.com/notifications/
- [ ] Log enough to debug without PII (order id, event id), per OWASP logging guidance. https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- [ ] Log drains to an external tool are plan-gated on Supabase. [PLAN] https://supabase.com/docs/guides/telemetry/log-drains

### Secrets and rotation
- [ ] Inventory every secret (Stripe secret/restricted key, two webhook secrets, Supabase secret keys, Resend key, Resend webhook secret, Turnstile secret) with owner and rotation date. https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- [ ] Rotate on staff/contractor change and on any suspected leak; rehearse one rotation before launch. https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- [ ] Turn on 2FA for the Stripe, Supabase, Cloudflare, Resend, domain registrar and GitHub accounts, with more than one trusted owner. https://supabase.com/docs/guides/deployment/going-into-prod
- [ ] Scan the repo and build output for leaked keys (e.g. GitHub secret scanning). https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning

### GDPR and Irish law basics
- [ ] Non-essential cookies (analytics, ads) need prior consent under Reg. 5(3) of S.I. 336/2011; strictly necessary ones are exempt. https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies
- [ ] Details such as reject-as-easy-as-accept and re-ask intervals are in the full DPC guidance note PDF; read it before designing the banner. [SOLICITOR] https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies
- [ ] Turnstile and Stripe set their own cookies/storage; list them in the cookie policy and document why they are strictly necessary. [SOLICITOR] https://www.cloudflare.com/turnstile-privacy-policy/
- [ ] Keep business and VAT records (orders, invoices) for six years per Revenue; account deletion must anonymise, not delete, those order rows. https://www.revenue.ie/en/starting-a-business/starting-a-business/keeping-records.aspx
- [ ] Support the right to erasure for accounts (delete auth user, PII, marketing consent) with the tax-record exception documented. https://www.dataprotection.ie/en/individuals/know-your-rights/right-erasure-articles-17-19-gdpr
- [ ] Personal data breaches must be reported to the DPC within 72 hours where required; keep a breach log and a contact plan. https://www.dataprotection.ie/en/organisations/know-your-obligations/breach-notification
- [ ] Sign/accept Data Processing Agreements with Stripe, Supabase, Resend and Cloudflare, and list them as processors in the privacy policy. https://www.dataprotection.ie/en/organisations/know-your-obligations
- [ ] Check data-residency choices (Supabase region in the EU) and international transfer terms of each processor. [SOLICITOR] https://supabase.com/docs/guides/platform/regions
- [ ] Distance-selling cancellation rights, returns and pre-contract info are governed by the Consumer Rights Act 2022; get wording checked. [SOLICITOR] https://www.irishstatutebook.ie/eli/2022/act/37/enacted/en/html
- [ ] Any age or sale restrictions on airsoft/realistic imitation firearms and delivery rules. [SOLICITOR] (no official source located in this research)
- [ ] Define a retention schedule for abandoned carts, Turnstile/IP logs, outbox payloads and edge function logs. [SOLICITOR] https://www.dataprotection.ie/en/organisations/know-your-obligations

### Backup and restore drills
- [ ] Restore a backup (or `db dump`) into a scratch project quarterly and time it; that number is your real RTO. https://supabase.com/docs/guides/platform/backups
- [ ] Back up the Storage bucket (product images) separately and test re-upload. https://supabase.com/docs/guides/platform/backups
- [ ] Keep migrations in git so schema, RLS, functions and cron jobs can be recreated from scratch. https://supabase.com/docs/guides/deployment/database-migrations
- [ ] After any restore, reconcile orders against Stripe (Stripe is the record of payment) and re-send missed webhooks within the resend window. https://docs.stripe.com/webhooks

### Pre-launch game day (rehearse each in test mode)
- [ ] Webhook endpoint returns 500 for an hour, then recovers: orders complete via retries, no duplicates. https://docs.stripe.com/webhooks
- [ ] Same event delivered twice and two events out of order (`stripe events resend`). https://docs.stripe.com/webhooks
- [ ] Customer closes the tab right after paying: order still completes and email still sends. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] Two customers try to buy the same stock-of-1 item at the same moment. https://docs.stripe.com/payments/checkout/managing-limited-inventory
- [ ] Session expires with stock reserved: stock is released by the `expired` event and by the sweeper if the event is lost. https://docs.stripe.com/api/checkout/sessions/expire
- [ ] Delayed payment succeeds after stock has been released: auto-refund path works. https://docs.stripe.com/checkout/fulfillment.md?ui=full-page
- [ ] Full refund, partial refund, and a failed refund (test card) from the admin. https://docs.stripe.com/testing#refunds
- [ ] Dispute test card: owner gets alerted and knows where to submit evidence. https://docs.stripe.com/testing#disputes
- [ ] Resend returns 429 or is down: outbox backs off, then drains; dead-letter alert fires. https://resend.com/docs/api-reference/rate-limit
- [ ] Turnstile siteverify times out: the form shows a clear message and logs it. https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- [ ] Admin loses their TOTP device: recovery path works without disabling MFA for everyone. https://supabase.com/docs/guides/auth/auth-mfa
- [ ] Rotate the Stripe webhook secret and a Supabase secret key with zero dropped orders. https://docs.stripe.com/webhooks
- [ ] Deploy a new build while a customer has the old tab open: lazy chunks still load or the page reloads cleanly. https://vite.dev/guide/build#load-error-handling
- [ ] Restore the database into a scratch project and confirm the shop runs against it. https://supabase.com/docs/guides/platform/backups
- [ ] Switch to live keys: one real purchase and refund, webhook delivered, receipt received, VAT shown correctly. https://docs.stripe.com/keys
