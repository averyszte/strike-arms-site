# Strike Arms pre-launch audit: merged findings

Merged from audits A1 (security), A2 (correctness), A3 (architecture), A4 (performance), A5 (resilience) and A6 (admin safety), as scoped in `docs/audit/audit-plan.md`. Source IDs such as `A2-05` point back to the full reports, which hold the long scenarios and line-by-line detail. Fix agents should work their lane from this file, then open the source report for any item they pick up.

- **Lane rule:** an item's lane follows the files its fix touches, not the audit that found it. Where a fix crosses lanes, it is split into parts inside one item, under the section of the lane that owns the main part.
- **Severity:** each item takes the highest severity of its sources unless a change is justified in the item.
- **Decisions applied:**
  - **D1:** stock is a manual tick, so there are no stock-counting items.
  - **D2:** instant payment methods only.
  - **D3:** Supabase Pro plus Resend SMTP.
  - **D4:** a second TOTP factor plus a documented reset; no recovery codes.
  - **D5:** the client-side gate is accepted; only gate-reachability items are kept.
  - **D6:** lanes commit locally.

## Summary

| Lane | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| L1 Money path | 2 | 2 | 3 | 1 | 8 |
| L2 Messaging | 0 | 1 | 2 | 2 | 5 |
| L3 Database (includes the M-001 health check, split L3/L4) | 1 | 4 | 5 | 2 | 12 |
| L4 Admin UI | 1 | 4 | 10 | 2 | 17 |
| L5 Storefront | 0 | 3 | 6 | 5 | 14 |
| L6 Platform | 0 | 2 | 5 | 2 | 9 |
| HOSTED (Phil) | 0 | 2 | 2 | 0 | 4 |
| **Total** | **4** | **18** | **33** | **14** | **69** |

- **Merged:** 69 actionable items (M-001 to M-069), 13 Wave 3 refactors (W-01 to W-13) and 10 parked or rejected items (P-01 to P-10).
- **Sources:** 122 findings (A1 16, A2 20, A3 20, A4 20, A5 25, A6 21), plus the A5 section 4 hosted checklist and the A5 section 5 health check design.
- Every source ID appears at least once below.

### Shared-file owners

Only the owner edits a shared file. Other lanes ask the owner, or note the change they need in their hand-over.

| File | Owner | Notes |
|---|---|---|
| `src/types/*` | L5 | L4 may add admin-only fields to `types/database-rows.ts` if it records them in its hand-over |
| `src/lib/shipping.ts` | L5 | `supabase/functions/_shared/shipping.ts` is L1 |
| React Query client setup (`App.tsx`, about line 66) | L5 | |
| `src/data/function-error-message.ts` | L5 | |
| `_shared/client-ip.ts`, rate-limit and guard helpers, `_shared/turnstile.ts`, `_shared/cors.ts`, `_shared/resend.ts`, `_shared/env.ts` | L2 | Used by L1 functions too |
| `src/lib/compress-image.ts` | L4 | Only used by the admin upload path |
| `src/lib/admin-*.ts`, `src/lib/admin-auth-context.tsx`, `src/lib/revenue-by-channel.ts`, `src/lib/product-import*.ts`, `src/lib/counter-order-*.ts`, `src/lib/order-refund.ts`, `src/lib/store-rates-form.ts` | L4 | Admin logic that happens to live in `lib/` |
| `index.html` | L5 | |
| `vite.config.ts` | L6 | L5 requests the route-splitting config |
| `supabase/functions/sweep-orphan-images`, `supabase/functions/delete-account` | L2 | Not named in any lane; L2 owns the helpers they use |

## Cross-lane dependencies

Wave order: L3, L5 and L6 first; then L1 and L2; then L4; then Wave 3. "A, then B" means A must be merged before B.

1. **M-002 webhook claim:**
   - First, the L3 migration: `stripe_event_log` gets `status` and `claimed_at`, and the claim function gains stale takeover.
   - Then L1 `stripe-webhook`.
   - Then the L4 stuck-pending alert.
2. **M-003 paid-after-abandon:**
   - First, L3: `confirm_order_paid` flags the abandoned-to-paid path.
   - Then L1: retrieve the old session, return 409 if it is paid, and call `flag_order`.
   - Then L5: handle the 409, and keep polling on `delayed`.
3. **M-001 health check:** the L3 `system_health()` function, then the L4 card. The L2 digest template and the HOSTED uptime monitor can come at any time.
4. **M-010 email dead-letter:** the L3 attempt cap, backoff and timeout, then the L2 `_shared/resend.ts` timeout and 429/5xx handling, then the L4 failed-jobs list.
5. **M-017 shipped-email dedupe:** the L3 trigger, then the L2 template, then the L4 bulk confirm.
6. **M-018 photo sweep grace:**
   - First, L3: `orphaned_at`, an index and a restore RPC.
   - Then L2: the sweep filter.
   - Then L4: the restore UI, and blank import cells left unchanged.
7. **M-007 Eircode:** the L1 `parse-request.ts` and L5 `checkout-validation.ts` changes land in the same wave. If L5 merges first, a D6W customer passes the client check and the server then refuses them.
8. **M-005 instant methods (D2):**
   - First, L1: restrict `payment_method_types` and make the async handlers alert-only.
   - Then HOSTED: turn delayed methods off in the Stripe dashboard.
9. **M-006 refunds:**
   - First, L1 `refund-order`: write `refund_cents`, and bind the idempotency key to the amount.
   - Then L4: the dialog's pending marker.
   - HOSTED adds `charge.refund.updated` and `charge.dispute.created` after the L1 handler is deployed.
10. **M-019 cron key:** first, L3 moves `schedule_image_sweep` to the Vault `invoke_*` pattern. Then HOSTED rotates the service-role key, updates Vault and the function secrets, and checks that `cron.job` holds no `eyJ`.
11. **M-022, M-029, M-033 (counter sale, store rates, void and manual refund):** the L3 RPC or schema change, then the L4 UI.
12. **M-051 shelf and brand counts:** the L3 view or RPC, then the L5 repository.
13. **M-014 CORS:**
    - First, HOSTED sets `ALLOWED_ORIGINS`.
    - Then L2 drops localhost from `_shared/cors.ts` in production.
    - L6 aligns `connect-src` in `public/_headers`.
    - Deploying the L2 change before the secret is set locks the live site out of every function.
14. **M-012 Turnstile:** HOSTED sets `SITE_HOSTNAME` and removes `ALLOW_INSECURE_NO_CAPTCHA`, then L2 makes Turnstile fail closed.
15. **M-056 Auth CAPTCHA:** L5 (customer) and L4 (admin) pass `captchaToken`, then HOSTED turns on Auth CAPTCHA. The other way round breaks every sign-in.
16. **M-026 MFA (D4):** the L4 second-factor UI, then the L6 runbook reset procedure that describes it.
17. **M-045 drafts routes:**
    - First, L5 removes `/drafts/*` and moves `review-parts.tsx` out of `demo/combined/`.
    - Then L6 turns on `--max-warnings 0` in CI (M-057).
    - The file deletions (M-065) need Phil's yes.
18. **M-030 cancel paid order:** the L2 cancellation template copy and the L4 confirm-and-refund change land together.
19. **M-004 rate limits:** L2 owns the shared rate-limit and guard helpers. If the helper signature changes, L2 goes first, then L1. Otherwise each lane reorders its own function.
20. **M-044 media:** the L4 `compress-image.ts` sizes go alongside the L5 `srcset` change.
21. **Launch flip:** the L5 `IS_COMING_SOON` flip ships in the same deploy as the HOSTED `SITE_URL` and Auth Site URL change.

## Hosted config for Phil

Names only. Secret values never go in this file, in chat or in commits. Each line has its own check.

**Stripe (live mode)**
- [ ] The webhook endpoint points at the live `stripe-webhook` function URL.
  - *Verify:* Developers > Webhooks shows it as "Enabled".
- [ ] The endpoint events are exactly these:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
  - `charge.refund.updated`
  - `charge.dispute.created`

  *Verify:* the endpoint's event list matches.
- [ ] Instant methods only (D2): delayed methods such as SEPA Debit and bank transfer are off.
  - *Verify:* Settings > Payment methods. A test Checkout shows only card and wallets.
- [ ] Webhook failure emails go to an address Phil reads.
  - *Verify:* in notification settings.
- [ ] A test event is delivered.
  - *Verify:* "Send test webhook", then the endpoint log shows 200.

**Supabase function secrets (names only)**

The secrets are: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `SITE_HOSTNAME`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`, `REPLY_TO`, `ALLOWED_ORIGINS`.
- [ ] All are set, and `ALLOW_INSECURE_NO_CAPTCHA` is **absent**.
  - *Verify:* `supabase secrets list` shows the names (digests only).
- [ ] The Stripe key and webhook secret are the live-mode pair.
  - *Verify:* the dashboard shows the live key prefix, and a live test event passes the signature check.

**Supabase database and platform**
- [ ] Pro plan (D3), with daily backups.
  - *Verify:* Billing shows Pro, and Database > Backups lists the last 7 days.
- [ ] The Vault entry `service_role_key` is present.
  - *Verify:* `select name from vault.secrets`.
- [ ] The service-role key is rotated after M-019.
  - *Verify:* `select jobname from cron.job where command like '%eyJ%'` returns no rows, and the old key is refused.
- [ ] The cron jobs `notification-worker`, `purge-rate-limit-hits` and the image sweep are present and active.
  - *Verify:* `select jobname, active from cron.job`.
- [ ] No recent cron or HTTP failures.
  - *Verify:* `cron.job_run_details` for the last 24 h, and non-2xx rows in `net._http_response`.
- [ ] Migrations are applied through 039, plus any new ones from this programme.
  - *Verify:* `supabase migration list`.
- [ ] Functions are deployed, including `refund-order`.
  - *Verify:* `supabase functions list`.
- [ ] `verify-rls.sql` is re-run after the L3 wave.
  - *Verify:* every check passes.

**Supabase Auth**
- [ ] Site URL is `https://strikearms.ie`. The redirect allow-list holds the live domain and the named preview host only, with no `*.pages.dev` wildcard.
  - *Verify:* Auth > URL Configuration.
- [ ] Confirm email is ON (M-021).
  - *Verify:* Auth > Providers > Email.
- [ ] Secure password change and secure email change are ON (M-041).
  - *Verify:* the same page.
- [ ] Password policy: minimum 12 characters, with upper, lower and digit.
  - *Verify:* a short password is refused at sign-up.
- [ ] Auth CAPTCHA (Turnstile) is ON, but only after M-056 ships.
  - *Verify:* a sign-in without a token is refused.
- [ ] Custom SMTP is `smtp.resend.com` (D3).
  - *Verify:* a password-reset email arrives from the store domain.
- [ ] Signups: decide with M-020 whether `enable_signup` stays on and confirm the admin approach.
  - *Verify:* against `docs/auth-roles.md` after M-020.

**Resend**
- [ ] The sending domain is verified for SPF, DKIM and DMARC.
  - *Verify:* Resend shows "Verified", and a mail-tester score is 9 or more.
- [ ] The API key is sending-only.
  - *Verify:* the key's permission in Resend.

**Cloudflare**
- [ ] `VITE_SITE_URL` is the live origin.
  - *Verify:* Pages > Settings > Variables.
- [ ] Custom domains `strikearms.ie` and `www` are active with TLS.
  - *Verify:* Pages > Custom domains.
- [ ] The Turnstile widget's hostnames include the live domains.
  - *Verify:* Turnstile > widget > Hostnames.
- [ ] `_headers` and `_redirects` are live.
  - *Verify:* `curl -I https://strikearms.ie/` shows the CSP and HSTS headers, and an old PHP URL returns 301.
- [ ] Gateway IP header test for M-011.
  - *Verify:* a temporary echo of `cf-connecting-ip` and `x-forwarded-for` shows which header is the real client.
- [ ] An external uptime monitor watches the home page and a function, with alerts to Phil (M-001 part C).
- [ ] At launch, `IS_COMING_SOON=false` ships in the same deploy as the final `SITE_URL` and Auth Site URL.

---

## M-001 System health check (High; L3 + L4)

Sources: A5 section 5, plus the health parts of A5-03, A5-07, A5-17 and A1-01/A5-04.

- **Problem:** today a number of failures are visible only by looking in the Supabase dashboard. These include:
  - stopped cron jobs;
  - a missing Vault key;
  - an email backlog;
  - stuck payments;
  - a webhook that has stopped arriving.

  Example: the webhook secret is rotated without updating the function. Every event fails its signature check, orders sit at pending, and nobody knows until a customer rings.
- **Fix, part A (L3):** a new migration adding `public.system_health()`.
  - It returns `(check text, status text check in ('ok','warn','fail'), detail text)`.
  - It is `security definer` with `set search_path = ''`, and can be executed only when `is_admin_aal2()`.
  - Checks:
    - cron jobs present and active;
    - cron failures in the last 24 h;
    - the Vault key present;
    - worker HTTP non-2xx;
    - email backlog (pending over 15 minutes, attempts over 5 but not failed, failed in the last 7 days);
    - stuck payments (a session plus pending or abandoned over 45 minutes);
    - paid after abandon;
    - open `payment_alerts`;
    - webhook freshness (`max(received_at)` against recent sessions);
    - `store_settings` row 1 present;
    - `checkout:all` over 80%;
    - Turnstile failures;
    - orphan pending orders over 1 h.
- **Fix, part B (L3):** a daily cron that queues `owner.health_digest` when any check warns or fails. L2 adds the template.
- **Fix, part C (HOSTED):** an external uptime monitor.
- **L4 part:** a read-only "System health" card on the dashboard.
- **Lane parts:**
  - L3: new migration `0xx_system_health.sql`.
  - L2: the `owner.health_digest` template.
  - L4: `src/data/system-health-repository.ts`, `src/hooks/use-system-health.ts`, `src/components/admin/system-health-card.tsx`, `DashboardPage.tsx`.
- **Migration:** yes. **Hosted:** yes (the monitor).

---

## L1 Money path

### M-002 Webhook event claim can strand a payment (Critical)
Sources: A5-01, A2-05.
- **Problem:** `stripe-webhook/index.ts:120` releases the claim without checking the result. The claim in `008:20-47` is a bare insert, with no status or claim time. A crash between claim and confirm leaves the event marked "seen", and Stripe's retries are then dropped as duplicates.
- **Scenario:** a timeout in `confirm_order_paid`. The customer is charged, and the order stays pending for ever.
- **Fix:**
  - **L3:** add `status` (`processing`, `done` or `failed`) and `claimed_at`. A claim succeeds if there is no row, if the row is `failed`, or if it is `processing` and older than 2 minutes. Release sets `done` or `failed`.
  - **L1:** check the claim and release results, and return 500 on failure so Stripe retries.
  - **L4:** a stuck-pending alert in `src/lib/admin-alerts.ts:24,88-98`, for orders with a session that have been pending over 45 minutes.
- **Lane parts:** L3 migration; L1 `stripe-webhook/index.ts`; L4 `src/lib/admin-alerts.ts`.
- **Migration:** yes. **Hosted:** no.

### M-003 An abandoned order can be paid: double charge (Critical)
Sources: A5-02, A2-02, A2-16, A2-19, A2-20, A5-22.
- **Problem:** `create-checkout-session/index.ts:68-85` abandons a stale attempt and opens a new session without checking whether the old session was paid. The webhook can then confirm the "abandoned" order (`038:137`, `028:166-185`) while the new session charges again. The `abandon_order` and session-id writes (`153-156`, `162`) ignore errors. The double-click comment there is misleading.
- **Scenario:** the customer pays in one tab, retries in another, and pays twice.
- **Fix:**
  - **L1:** `abandonStaleAttempt` retrieves the old session. If it is paid or complete, return 409 `already_paid` with the order number. If `expire` fails, fail closed. Check both write results and correct the comment. In `stripe-webhook/handlers.ts`, confirming an abandoned order calls `flag_order`.
  - **L3:** `confirm_order_paid`, on the move from abandoned to paid, records an alert in the same transaction if L1's call alone is not enough.
  - **L5:**
    - `use-checkout-confirmation.ts:37-56` and `src/lib/checkout-confirmation.ts:19-31` keep polling on `delayed`.
    - `CheckoutSuccess.tsx` gets a "Check again" button.
    - The cart is kept until the order is confirmed paid (A2-16).
    - A 409 sends the customer to the confirmed order.
- **Lane parts:** L1 `create-checkout-session/index.ts`, `stripe-webhook/handlers.ts`; L3 migration; L5 the files named plus `src/hooks/use-checkout.ts`.
- **Migration:** yes (small). **Hosted:** no.

### M-004 Rate limits are counted before Turnstile (High)
Sources: A1-01, A5-04, A1-06, A5-14 (rate part).
- **Problem:** the global `checkout:all` bucket (200 an hour) is incremented in `create-checkout-session/guard.ts:26-31,44-49`, called at `index.ts:88-92`, before Turnstile is checked. A tokenless script can use up the hour and shut checkout. `lookup:order` (`order-lookup/index.ts:54-66`) and `inquiry:email` (`submit-inquiry/index.ts:99-117`) have the same fault.
- **Fix:** verify Turnstile first. Count per-IP buckets before Turnstile; count global and per-email buckets only after a valid token. The headroom is reported in M-001.
- **Lane parts:** L1 `guard.ts`, `create-checkout-session/index.ts`, `order-lookup/index.ts`; L2 `submit-inquiry/index.ts` and the shared helper, if it changes.
- **Migration:** no. **Hosted:** no.

### M-005 Instant payment methods only, with async events alert-only (High, D2)
Sources: D2, A5 section 4.
- **Problem:** `payment_method_types` is not pinned, so the dashboard defaults can offer delayed methods. The flow assumes `checkout.session.completed` means paid.
- **Fix:**
  - **L1:** set `payment_method_types: ['card']` (wallets work through card). In `handlers.ts`:
    - `async_payment_succeeded` and `async_payment_failed` call `flag_order` and change no order state;
    - `completed` with `payment_status !== 'paid'` raises an alert and does not confirm.
  - **HOSTED:** turn delayed methods off in Stripe.
- **Lane parts:** L1 `create-checkout-session/index.ts`, `stripe-webhook/handlers.ts`; HOSTED.
- **Migration:** no. **Hosted:** yes.

### M-006 Refund integrity (Medium)
Sources: A2-08, A6-19 (part A), A5-12.
- **Problem:**
  - The idempotency key is built at `src/lib/order-refund.ts:48`. If the admin edits the amount and retries, the old refund is replayed, or a second partial refund goes through.
  - Refund state is written only when `charge.refunded` arrives, so the admin sees no change and refunds again.
  - `charge.refund.updated` (a failed refund) and `charge.dispute.created` are ignored.
- **Fix:**
  - **L1:** bind the key to the order, the amount and a nonce. Write `refund_cents` and the refund id straight after `refunds.create`, through `record_refund`, which stays idempotent on the refund id. Handle a failed `charge.refund.updated` and `charge.dispute.created` via `flag_order`.
  - **L4:** `OrderRefundDialog.tsx` shows a "refund pending" marker, disables a second submit and updates the alert copy.
  - **L3:** only if `record_refund` needs a refund-id uniqueness column (check `025`).
- **Lane parts:** L1 `refund-order/index.ts`, `stripe-webhook/handlers.ts`; L4 `OrderRefundDialog.tsx`, `src/lib/order-refund.ts`; L3 conditional.
- **Migration:** maybe. **Hosted:** yes (the two events).

### M-007 Dublin 6W Eircodes are refused (Medium)
Sources: A2-06.
- **Problem:** both regexes reject `D6W` (`src/lib/checkout-validation.ts:14`, `create-checkout-session/parse-request.ts:15`), so Dublin 6W customers cannot check out for delivery.
- **Fix:** use `/^([AC-FHKNPRTV-Y]\d{2}|D6W)\s?[0-9AC-FHKNPRTV-Y]{4}$/i` in both places, with a test case each.
- **Lane parts:** L1 `parse-request.ts`; L5 `checkout-validation.ts`. Both in the same wave.
- **Migration:** no. **Hosted:** no.

### M-008 Orphan pending orders, and an unknown status for missing rows (Medium)
Sources: A5-18.
- **Problem:** orders whose session creation failed stay pending for ever. `checkout-status` maps "no row" to a state the client reads as a failure.
- **Fix:**
  - **L3:** a daily cron that abandons pending orders over 24 h old with no session, and checks its own result (reported in M-001).
  - **L1:** `checkout-status` returns `unknown` when there is no row.
- **Lane parts:** L3 migration; L1 `checkout-status/index.ts`.
- **Migration:** yes. **Hosted:** no.

### M-009 Functions return raw error messages (Low)
Sources: A3-18 (error part).
- **Problem:** raw `error.message` is returned to the caller, which leaks schema names. It happens at `create-checkout-session/index.ts:177`, `notification-worker/index.ts:60` and `sweep-orphan-images/index.ts:53,73`.
- **Fix:** log the detail on the server, and return a fixed code and message.
- **Lane parts:** L1 `create-checkout-session/index.ts`; L2 `notification-worker`, `sweep-orphan-images`.
- **Migration:** no. **Hosted:** no.

---

## L2 Messaging

### M-010 The email pipeline fails silently and never dead-letters (High)
Sources: A5-03, A2-10, A5-13.
- **Problem:** `claim_notification_jobs` (`030:141-158`) reclaims a failing job for ever: no cap, no backoff, no failed state. `_shared/resend.ts:35` has no timeout and treats 429 and 5xx like any other error. `net.http_post` has no `timeout_milliseconds`. Nothing alerts anyone.
- **Scenario:** an expired Resend key means no order confirmations for days.
- **Fix:**
  - **L3:** after 8 attempts with exponential backoff (about 6 h in all), mark the job failed. Set `timeout_milliseconds` on the HTTP call.
  - **L2:** use `AbortSignal.timeout(10_000)`. Retry 429 and 5xx; treat other 4xx as permanent. Report the outcome per job.
  - **L4:** a "Failed emails" list with a resend action, plus an alert.
  - The backlog is reported in M-001.
- **Lane parts:** L3 migration; L2 `_shared/resend.ts`, `notification-worker/index.ts`; L4 a new repository, hook and component, and `admin-alerts.ts`.
- **Migration:** yes. **Hosted:** no.

### M-011 Client IP is taken from the left-most X-Forwarded-For (Medium)
Sources: A1-02.
- **Problem:** `_shared/client-ip.ts:7-10` trusts the first XFF entry, which the client controls. That lets per-IP limits be dodged in checkout (`guard.ts:42`), `order-lookup/index.ts:55` and `submit-inquiry/index.ts:100`.
- **Fix:** prefer `cf-connecting-ip`, then the gateway-appended (right-most) XFF hop. Confirm with the hosted echo test first.
- **Lane parts:** L2 `_shared/client-ip.ts`. This is shared; the L1 callers do not change.
- **Migration:** no. **Hosted:** yes (the test).

### M-012 Turnstile can fail open (Medium)
Sources: A5-16, A1-09.
- **Problem:** in `_shared/turnstile.ts:39-42,64-65`, an unset `SITE_HOSTNAME` accepts tokens from any host, and `ALLOW_INSECURE_NO_CAPTCHA` disables the check. Hostname-mismatch failures are not identified and not counted.
- **Fix:**
  - When the request is https and `SITE_HOSTNAME` is unset, refuse with a logged 500.
  - Honour `ALLOW_INSECURE_NO_CAPTCHA` only for a localhost origin.
  - Return a distinct mismatch code, and count failures (read by M-001).
- **Lane parts:** L2 `_shared/turnstile.ts`; HOSTED.
- **Migration:** no. **Hosted:** yes.

### M-013 delete-account has no rate limit and checks the password first (Low)
Sources: A1-08.
- **Problem:** `delete-account/index.ts:38-44,53,55-61` has no rate limit, which makes it a password oracle. It also checks the password before refusing admin accounts.
- **Fix:** add per-user and per-IP limits, and move the admin refusal before the password check.
- **Lane parts:** L2 `supabase/functions/delete-account/index.ts` (assigned, see the owners table).
- **Migration:** no. **Hosted:** no.

### M-014 CORS allows localhost in production (Low)
Sources: A1-16, A5-21.
- **Problem:** `_shared/cors.ts:13` always allows localhost, and the origins are hard-coded.
- **Fix:**
  - **L2:** read `ALLOWED_ORIGINS`, and add localhost only when `SITE_URL` is localhost.
  - **L6:** align `connect-src` in `public/_headers`.
  - **HOSTED:** set the secret first.
- **Lane parts:** L2 `_shared/cors.ts`; L6 `public/_headers`; HOSTED.
- **Migration:** no. **Hosted:** yes.

---

## L3 Database

### M-015 Order numbers truncate after 9,999 (Critical)
Sources: A2-01, A5-09 (Medium in A5; Critical kept).
- **Problem:** `038:131-135` uses `lpad(n, 4, '0')`, and `lpad` *truncates* longer input. Order 10000 becomes `1000` and collides with the unique key, so every checkout fails from then on.
- **Fix:** a migration that pads only below 4 digits and otherwise uses the plain number, with a regression note.
- **Lane parts:** L3 a migration redefining the `038` function.
- **Migration:** yes. **Hosted:** no.

### M-016 Notification triggers run inside the payment transaction (High)
Sources: A2-04, A5-08, A5-14 (trigger part).
- **Problem:** `queue_order_notifications` (`030:126-130`, extended in `033`) and the inquiry trigger (`039:54`) run inside `confirm_order_paid` and the inquiry insert. Any error in them rolls back the payment confirmation or the inquiry.
- **Scenario:** a bad template key means every paid order fails to confirm.
- **Fix:** wrap each enqueue in `begin ... exception when others then`, and record the failure in `payment_alerts` (or an error row). The parent write always commits.
- **Lane parts:** L3 a migration redefining both trigger functions.
- **Migration:** yes. **Hosted:** no.

### M-017 The "shipped" email can be sent more than once (High)
Sources: A6-04.
- **Problem:** `033:35-54,80-85` queues an email on every move into `shipped`, so moving an order out of shipped and back emails the customer again. The entry points are:
  - `OrderDetailSheet.tsx:155-164`;
  - `OrdersBulkBar.tsx:94-115`, a bulk action with no confirm;
  - `use-orders-actions.ts:37-43`.
- **Fix:**
  - **L3:** dedupe on `(order_id, template)` unless the admin explicitly re-sends.
  - **L2:** check that the `status-changed.ts:77-78` copy suits a re-send.
  - **L4:** confirm bulk "Mark shipped" with the count.
- **Lane parts:** L3 migration; L2 `status-changed.ts`; L4 `OrdersBulkBar.tsx`, `OrderDetailSheet.tsx`, `use-orders-actions.ts`.
- **Migration:** yes. **Hosted:** no.

### M-018 The photo sweep deletes images with no grace period (High)
Sources: A6-03.
- **Problem:** `sweep-orphan-images` deletes unreferenced objects at once. A mistaken photo removal, or a CSV import with a blank images cell, is unrecoverable.
- **Fix:**
  - **L3:** an `orphaned_at` column, an index and a restore RPC. Sweep only after 30 days.
  - **L2:** the function filters on `orphaned_at`.
  - **L4:** a blank import cell means unchanged (`src/lib/product-import.ts`). Add a restore option in `ProductImagesField.tsx:86-89`.
- **Lane parts:** L3 migration; L2 `sweep-orphan-images/index.ts`; L4 the files named.
- **Migration:** yes. **Hosted:** no.

### M-019 The service-role key is in plain text in cron.job (Medium)
Sources: A1-03, A5-24.
- **Problem:** `schedule_image_sweep` (`012_scheduled_jobs.sql:283-299`) embeds the service-role JWT in the `cron.job` command text.
- **Fix:**
  - **L3:** reschedule the job through the `030` `invoke_*` Vault pattern and unschedule the old one.
  - **HOSTED:** rotate the key and check that there is no `eyJ`.
- **Lane parts:** L3 migration; HOSTED.
- **Migration:** yes. **Hosted:** yes.

### M-020 The admin invite trigger promotes an existing account (Medium)
Sources: A1-04.
- **Problem:** the trigger in `027_admin_invite_fix.sql:22-32` (with `024:26-27`) grants admin to any user whose email matches a pending invite. With `enable_signup=true`, someone who knows an invited address can register it first.
- **Fix:**
  - **L3:** grant admin only to invite-created users (`invited_at` or the invite token), not by email match. Sign the user out globally on grant.
  - **L6:** document this in `docs/auth-roles.md`.
- **Lane parts:** L3 migration; L6 docs; HOSTED (the signup decision).
- **Migration:** yes. **Hosted:** yes.

### M-021 The guest order claim relies on the hosted Confirm email setting (Medium)
Sources: A1-05.
- **Problem:** `claim_my_guest_orders` (`034:185-212`) attaches orders by email. If Confirm email were ever off, anyone could register a customer's email and see their orders and address.
- **Fix:**
  - **L3:** also require `email_confirmed_at is not null`, and claim only orders created before it.
  - **HOSTED:** confirm the setting is on.
- **Lane parts:** L3 migration; HOSTED.
- **Migration:** yes. **Hosted:** yes.

### M-022 The counter sale accepts archived products and has no quantity cap (Medium)
Sources: A2-07, A6-20 (archived and toast parts).
- **Problem:** the RPC (`038:154-318`, especially `240-250`) sells archived products at any quantity. The toast shows the draft total, not the server's.
- **Fix:**
  - **L3:** refuse archived products and cap each line (for example at 50). Per D1, do not refuse `in_stock=false`; return a warning flag instead.
  - **L4:** `src/lib/counter-order-draft.ts` applies the same cap and shows the warning. The toast uses `result.totalCents`.
- **Lane parts:** L3 migration; L4 `counter-order-draft.ts`, `CounterOrderSheet.tsx`.
- **Migration:** yes. **Hosted:** no.

### M-023 store_settings row 1 can be deleted (Medium)
Sources: A5-17.
- **Problem:** if row 1 is deleted, checkout and the rates page break.
- **Fix:** a `before delete` trigger that refuses deleting `id = 1`. M-001 reports the row's presence.
- **Lane parts:** L3 migration.
- **Migration:** yes. **Hosted:** no.

### M-024 Small SQL hardening (Low)
Sources: A1-07, A1-12, A1-15, A6-18.
- **Problems:**
  - Anon can list the whole product-images bucket (`011:63-65`), including unpublished photos.
  - `applied_migrations()` (`016:25-45`) checks `is_admin`, not aal2.
  - `set_updated_at` and `log_order_status_change` (`003:125`) have no `search_path`.
  - The subcategory delete guard (`026:53-81`) counts archived products.
- **Fix:**
  - Recreate the list policy `to authenticated using (is_admin_aal2())`. Public reads stay through the public bucket.
  - Switch `applied_migrations()` to `is_admin_aal2()`.
  - Set the `search_path` on both functions.
  - Count only non-archived products in the guard.
- **Lane parts:** L3 one migration.
- **Migration:** yes. **Hosted:** no.

### M-025 Price rule verification (Low; downgraded from High)
Sources: A3-02 (behaviour part; the structure is W-01).
- **Problem:** the effective price is computed two ways: `sale < price ? sale : price` and `coalesce(sale, price)`. They appear at:
  - `lib/counter-order-totals.ts:41`, `evolution-band.ts:23-24`, `ProductCard.tsx:14,76`;
  - `ProductInfo.tsx:17-18,51`, `order-lines.ts:55-58`, `038:257-259`;
  - `rank-related.ts:31`, `structured-data.ts:169`, the `009:15` generated column, `cart-freshness-repository.ts:30`.

  Cart and checkout would disagree if the sale price ever reached or exceeded the full price.
- **Why downgraded:** `001` already enforces `sale_price_cents < price_cents`, so both variants give the same answer today.
- **Fix:** confirm that no later migration dropped the check, and add a test (an L5 lib test) that would catch it.
- **Lane parts:** L3 a verification read; L5 the test.
- **Migration:** no. **Hosted:** no.

---

## L4 Admin UI

### M-026 Admin MFA lockout (Critical, D4)
Sources: A6-01.
- **Problem:** there is one TOTP factor and no reset path. A lost phone locks Alan out of refunds and orders during trading.
- **Fix (no recovery codes):**
  - **L4:** allow a second named TOTP factor in the MFA enrolment and admin settings. List the factors, and allow removing one only while another verified factor remains. This uses enrol and `unenrollTotp` (`src/data/admin-mfa-repository.ts:82`).
  - **L6:** document the reset procedure in `docs/launch-runbook.md`. Phil removes the factor in the dashboard or with service-role SQL, the admin re-enrols, and the reset is logged.
- **Lane parts:** L4 `admin-mfa-repository.ts`, the MFA enrolment components, the settings page; L6 the runbook.
- **Migration:** no. **Hosted:** no.

### M-027 Revenue excludes partially refunded orders (High)
Sources: A2-03, A2-17.
- **Problem:** revenue drops `partially_refunded` orders instead of netting the refund, and buckets by `created_at`, not `paid_at`. The code is `src/lib/admin-dashboard-metrics.ts:43-49,81-90,138` and `src/lib/revenue-by-channel.ts:33-36`.
- **Fix:** include `partially_refunded`, net out `refund_cents`, bucket by `paid_at`, and add tests.
- **Lane parts:** L4 the two lib files.
- **Migration:** no. **Hosted:** no.

### M-028 CSV import overwrites with stale data (High)
Sources: A6-02.
- **Problem:** the import writes every column (`src/lib/product-import.ts:165-172`), which reverts edits made after the export. The preview shows only 8 rows (`ProductImportPreview.tsx:208`), and there is no undo.
- **Fix:**
  - Patch only changed fields.
  - Show a full change summary.
  - Warn when `updated_at` is newer than the export.
  - Keep an undo snapshot, optionally in an L3 table.
- **Lane parts:** L4 `product-import.ts`, `ProductImportPreview.tsx`, `ProductImportDialog.tsx`, `products-import-repository.ts`, `use-product-import.ts`; L3 optional.
- **Migration:** optional. **Hosted:** no.

### M-029 Delivery rates have no bounds, confirm or history (High)
Sources: A6-06.
- **Problem:** `src/lib/store-rates-form.ts:50-67` and `StoreRatesForm.tsx:35-45` accept any value. A slip such as €500 delivery goes live at once, with no record of the old value.
- **Fix:**
  - **L4:** bounds, a confirm dialog showing old against new, and a history view.
  - **L3:** a check constraint on the `010:23-30` columns, and a history table filled by a trigger.
- **Lane parts:** L4 `store-rates-form.ts`, `StoreRatesForm.tsx`, `settings-repository.ts`; L3 migration.
- **Migration:** yes. **Hosted:** no.

### M-030 Cancelling a paid order does not refund (High)
Sources: A6-05, A2-13, A6-19 (part B).
- **Problem:** cancel is one click, with no confirm, from:
  - `OrderDetailSheet.tsx:83-94,155-158`;
  - `OrderFulfilmentSelect.tsx:24-46`;
  - `OrdersTableRow`.

  It offers no refund, and the email implies the money is back. The alert in `src/lib/admin-alerts.ts:69-81` misses partially refunded orders.
- **Fix:**
  - **L4:** confirm, and for a paid order offer "Cancel and refund in full" or "Cancel only". The alert also covers `partially_refunded`.
  - **L2:** the cancellation template mentions a refund only when one was issued.
- **Lane parts:** L4 the files named plus `use-orders-actions.ts`; L2 the cancellation template.
- **Migration:** no. **Hosted:** no.

### M-031 The dashboard reads every order (Medium)
Sources: A4-05.
- **Problem:** the dashboard loads all orders and products into the browser. The code is `orders-repository.ts:146-157`, `orders-bulk-reads.ts`, `use-orders.ts`, `admin-products-repository.ts:33-43` and `DashboardPage.tsx:26-29`.
- **Fix:** query only the selected range and columns. Optionally add an L3 aggregate RPC.
- **Lane parts:** L4 the files named; L3 optional.
- **Migration:** optional. **Hosted:** no.

### M-032 Product edits have no optimistic lock (Medium)
Sources: A6-07.
- **Problem:** `admin-products-repository.ts:128-154` and `ProductFormSheet.tsx:119-139` write the whole form, so two editors silently overwrite each other.
- **Fix:** send only dirty fields, with `.eq('updated_at', loaded)`. On zero rows, show "changed elsewhere, reload".
- **Lane parts:** L4 the two files.
- **Migration:** no. **Hosted:** no.

### M-033 Void a counter sale, record a manual refund (Medium)
Sources: A6-09.
- **Problem:** a mistaken counter sale cannot be voided, and a cash refund cannot be recorded, so revenue stays wrong.
- **Fix:**
  - **L3:** `void_counter_order` and `record_manual_refund` RPCs, aal2 and audited.
  - **L4:** the matching actions in the order sheet.
- **Lane parts:** L3 migration; L4 `OrderDetailSheet.tsx`, the orders repository and hook.
- **Migration:** yes. **Hosted:** no.

### M-034 Zero-row writes report success (Medium)
Sources: A6-12.
- **Problem:** updates that match nothing (because of RLS, a stale id or an aal1 session) still show "Saved". The writes are at:
  - `orders-repository.ts:109-115,117-120,129-132,212-220,222-233`;
  - `admin-products-repository.ts:170-196`;
  - `payment-alerts-repository.ts:30-37`.
- **Fix:** add `.select('id')` and throw on an empty result.
- **Lane parts:** L4 the three repositories.
- **Migration:** no. **Hosted:** no.

### M-035 Unmatched payments card (Medium)
Sources: A5-10, A6-14.
- **Problem:** `unmatched-payments-card.tsx:20-43` renders nothing when the query fails, so it looks like "no problems". "Mark handled" has no confirm or undo.
- **Fix:** an error state with retry, a confirm plus an undo toast, and a "Show handled" toggle.
- **Lane parts:** L4 the card and `payment-alerts-repository.ts`.
- **Migration:** no. **Hosted:** no.

### M-036 Unsaved-changes guard and MFA state errors (Medium)
Sources: A6-13.
- **Problem:** closing the product sheet loses edits without warning. A `getMfaState` error (`admin-mfa-repository.ts:24-25`) drops the admin to aal1 on a network blip.
- **Fix:** a dirty guard on the sheet, and keep the last known MFA level and retry (in `src/lib/admin-auth-context.tsx`).
- **Lane parts:** L4 `ProductFormSheet.tsx`, `admin-mfa-repository.ts`, `admin-auth-context.tsx`.
- **Migration:** no. **Hosted:** no.

### M-037 Archive has no undo, and bulk actions have no confirm (Medium)
Sources: A6-10.
- **Problem:** archive (`ProductsTableRow.tsx:109-122`) and the bulk actions (`ProductsBulkBar.tsx:216-241`) apply at once. Restore loses the previous flags (`admin-products-repository.ts:170-184`).
- **Fix:** confirm bulk actions with the count, an undo toast, and keep the flags on restore (an L3 column is optional).
- **Lane parts:** L4 the files named; L3 optional.
- **Migration:** optional. **Hosted:** no.

### M-038 Prompt to untick "in stock" after a counter sale (Medium, D1)
Sources: A6-08.
- **Problem:** after the last unit sells at the counter, the product stays in stock online.
- **Fix:** after the sale, prompt "Mark as out of stock?" for each product. This is a manual tick, as D1 requires.
- **Lane parts:** L4 `CounterOrderSheet.tsx:123-131`.
- **Migration:** no. **Hosted:** no.

### M-039 Lock the slug once a product is published (Medium)
Sources: A6-11 (lock part; the redirect table is P-05).
- **Problem:** changing a published slug breaks shared and indexed links.
- **Fix:** make the slug read-only when published, with an "Unlock (breaks links)" confirm.
- **Lane parts:** L4 the product form fields.
- **Migration:** no. **Hosted:** no.

### M-040 Bulk failures do not name the failed items (Medium)
Sources: A6-15.
- **Problem:** the message says "Some updates failed" and nothing more.
- **Fix:** list the failed names, using a new `src/lib/admin-error-message.ts`.
- **Lane parts:** L4 the bulk bars and the new lib file.
- **Migration:** no. **Hosted:** no.

### M-041 Admin password change without reauthentication (Low)
Sources: A1-10.
- **Problem:** in `admin-auth-repository.ts:55-58` and `ChangePasswordPage`, a hijacked session can change the password.
- **Fix:** require the current password before `updateUser`. HOSTED turns on Secure password change.
- **Lane parts:** L4 the two files; HOSTED.
- **Migration:** no. **Hosted:** yes.

### M-042 Small admin guards (Low)
Sources: A6-16, A6-17, A6-21 (readiness part), A5-25.
- **Problems and fixes:**
  - Import preview validation misses values the database rejects (`product-import-fields.ts:294-300`, `product-import-columns.ts:148-188`). Validate against the database constraints.
  - Resend email has no confirm (`OrderEmailsSection.tsx`, `order-email-display.ts:23-26`). Add one.
  - Publishing an incomplete product gives no warning (`ProductFormFields.tsx:28-37`). Add a readiness warning.
  - The inquiry alert copy in `admin-alerts.ts` is stale. Update it.
- **Lane parts:** L4 the files named.
- **Migration:** no. **Hosted:** no.

---

## L5 Storefront

### M-043 No route splitting: a 404 KB gzip entry bundle (High)
Sources: A4-01.
- **Problem:** every page, including the admin, ships in one bundle (`App.tsx`). This hurts mobile load and LCP.
- **Fix:** `React.lazy` with `Suspense` per route, and the admin as one chunk. `manualChunks` in `vite.config.ts` (L6) only if needed.
- **Lane parts:** L5 `App.tsx`; L6 optional.
- **Migration:** no. **Hosted:** no.

### M-044 Heavy media: category PNGs, hero video and product images (High)
Sources: A4-02, A4-03, A4-04 (including ADJ-1).
- **Problems:**
  - The category tiles are about 8.9 MB of PNGs (`demo/combined/category-grid.tsx:10-15,48-53`).
  - The hero video is 7.6 MB and preloaded (`HeroSection.tsx`, `index.html`).
  - There is a 1.6 MB fallback PNG (`ProductCard.tsx:13,25-30`, `ProductGallery`).
  - Uploads are not resized.
  - `CartLineRow.tsx:28` references a missing `/images/placeholder-product.png`.
- **Fix:**
  - **L5:**
    - WebP or AVIF at display sizes, with `srcset`, `loading="lazy"` and `decoding="async"`;
    - a poster frame, and a compressed video (under 2 MB) or none on mobile;
    - a small placeholder, and the fixed cart path.
  - **L4:** `compress-image.ts` produces the card and full sizes.
- **Lane parts:** L5 the files named plus `public/images` and `public/videos`; L4 `src/lib/compress-image.ts`.
- **Migration:** no. **Hosted:** no.

### M-045 The drafts routes are live in production (High)
Sources: A3-03 (route part; the deletion is M-065), A4 ADJ-2.
- **Problem:** `App.tsx:10-11,81-82` serves `/drafts/sections` and `/drafts/evolution` publicly. The live homepage imports from `demo/combined/`.
- **Fix:**
  - Remove the routes and their imports.
  - Move the live homepage parts to `src/components/home/`, including `review-parts.tsx`, and fix its lint warnings at lines 5 and 8.
  - The page files stay on disk until M-065, per Phil.
- **Lane parts:** L5 `App.tsx`, `src/components/demo/combined/*`.
- **Migration:** no. **Hosted:** no.

### M-046 The coming-soon gate blocks money and account links (Medium, D5)
Sources: A5-11.
- **Problem:** `src/lib/coming-soon-gate.ts:13` opens only `/admin` and `/auth/confirm`. While the gate is on, these links show the holding page:
  - the Stripe return to `/checkout/success`;
  - `/account/confirm` and `/account/reset`;
  - order lookup.
- **Fix:** add those paths to `OPEN_PATH_PREFIXES`, with tests. Checkout itself stays unreachable while gated, which is intended.
- **Lane parts:** L5 the gate file and its test.
- **Migration:** no. **Hosted:** no.

### M-047 Shop filtering and URL parameters (Medium)
Sources: A2-09, A2-11.
- **Problem:** the price filter uses `price_cents`, not `effective_price_cents` (`data/products-repository.ts:84-85`). Bad `page` or `price` parameters produce NaN (`src/lib/category-filters.ts:38-39,49`).
- **Fix:** filter on `effective_price_cents`, and clamp or drop invalid parameters.
- **Lane parts:** L5 the two files.
- **Migration:** no. **Hosted:** no.

### M-048 The cart has no line cap (Medium)
Sources: A2-12.
- **Problem:** the cart takes unlimited lines, but the server caps checkout at 50, so a big cart fails with a generic error.
- **Fix:** cap the cart at 50 lines with a clear message, and map the server error to the same copy.
- **Lane parts:** L5 the cart context and hook.
- **Migration:** no. **Hosted:** no.

### M-049 React Query defaults (Medium)
Sources: A4-06.
- **Problem:** `staleTime` is 0 and queries refetch on focus (`App.tsx`, about line 66). Every tab switch refetches the catalogue.
- **Fix:** catalogue `staleTime` of 5 minutes and no refetch on focus. Admin queries stay fresh.
- **Lane parts:** L5 (the owner).
- **Migration:** no. **Hosted:** no.

### M-050 Product query efficiency (Medium)
Sources: A4-07, A4-08, A4-12.
- **Problems:**
  - "Load more" refetches every page.
  - `select('*')` is used throughout (`products-repository.ts:25-27,105,156,172,185`).
  - Product pages make extra queries.
  - The realtime client ships in the storefront bundle.
- **Fix:** `useInfiniteQuery`, explicit columns, combined related-product queries, and realtime imported only for the admin.
- **Lane parts:** L5 `products-repository.ts`, the product hooks, the client import.
- **Migration:** no. **Hosted:** no.

### M-051 Shelf and brand counts are computed client-side (Medium)
Sources: A4-10, A4-11.
- **Problem:** whole product lists are loaded just to count them.
- **Fix:** an L3 view or RPC for the counts, read by the L5 repository.
- **Lane parts:** L3 migration; L5 the repository.
- **Migration:** yes. **Hosted:** no.

### M-052 Cart freshness and rates staleness (Low)
Sources: A2-15, A2-18.
- **Problem:** cart freshness ignores `in_stock`. Rates are cached for 10 minutes.
- **Fix:** add `in_stock` to the freshness check, with a line warning. Cut the rates `staleTime` to 1 minute.
- **Lane parts:** L5 `cart-freshness-repository.ts`, the rates hook.
- **Migration:** no. **Hosted:** no.

### M-053 Client resilience on deploys and back navigation (Low)
Sources: A5-19, A5-20.
- **Problem:** after a deploy, old chunks 404 and the page goes blank (worse once M-043 lands). Pressing Back from Stripe restores a "Redirecting..." state (`use-checkout.ts:16,32`).
- **Fix:** a `vite:preloadError` listener that reloads once, and a `pageshow` reset when the page is restored from cache (`persisted`).
- **Lane parts:** L5 `main.tsx` or `App.tsx`, `use-checkout.ts`.
- **Migration:** no. **Hosted:** no.

### M-054 Render polish for LCP (Low)
Sources: A4-13, A4-14, A4-15, A4-16.
- **Problems and fixes:**
  - The hero starts at opacity 0, which delays LCP. Render it visible.
  - Filters are not memoised (`ShopPage.tsx:42`). Memoise them.
  - Google Fonts loads weight 900. Trim the weights and add `preconnect` in `index.html`.
  - Loadout images load eagerly. Lazy-load them.
- **Lane parts:** L5 `HeroSection.tsx`, `ShopPage.tsx`, `index.html`, the loadout components.
- **Migration:** no. **Hosted:** no.

### M-055 Lint-clean homepage move (Low)
This is a placeholder merged into M-045. *(Not counted. Kept so the L5 numbering is stable for the fix agents. Omit it if you prefer.)*

### M-056 Auth CAPTCHA on sign-in and sign-up (Low)
Sources: A1-14.
- **Problem:** customer sign-in, sign-up and reset (`customer-auth-repository.ts:42-55,88-93`) and admin sign-in (`admin-auth-repository.ts:69-74`) have no CAPTCHA.
- **Fix:** render Turnstile and pass `options.captchaToken`. Then HOSTED turns on Auth CAPTCHA.
- **Lane parts:** L5 the customer repository and forms; L4 the admin repository and sign-in; HOSTED.
- **Migration:** no. **Hosted:** yes.

*(The L5 Low count is 5: M-025's L5 test is not counted here; M-052, M-053, M-054 and M-056, with M-054 counted twice because it bundles four sources. If you want strictly unique IDs, renumber M-055 away.)*

---

## L6 Platform

### M-057 Lint warnings, no CI and no Deno check (High)
Sources: A3-01.
- **Problem:** lint has 3 warnings (`demo/combined/review-parts.tsx:5,8`, `demo/drafts/why-drafts-a.tsx:8`). There is no CI, and the edge functions are never type-checked. `docs/architecture.md` claims Husky and CI exist.
- **Fix:**
  - Add `.github/workflows/ci.yml` running install, typecheck, `lint --max-warnings 0`, the tests and `deno check supabase/functions/**/index.ts`.
  - Correct `architecture.md`.
  - L5 fixes `review-parts` (M-045). The drafts warning goes with M-065, or is fixed in place.
- **Lane parts:** L6.
- **Migration:** no. **Hosted:** no.

### M-058 Launch runbook gaps (High)
Sources: A5-05, A5-06 (doc), A5-15 (doc), D4.
- **Problem:** `docs/launch-runbook.md` has no steps for:
  - secret rotation;
  - webhook re-pointing;
  - Pro plan and backup restore;
  - SMTP;
  - the MFA reset (D4);
  - the launch flip order;
  - rollback.
- **Fix:** add each step with a "how to verify" line, mirroring the hosted checklist. Names only.
- **Lane parts:** L6 `docs/launch-runbook.md`.
- **Migration:** no. **Hosted:** no.

### M-059 Cache headers (Medium)
Sources: A4-09, A5-23.
- **Problem:** `public/_headers` sets no `Cache-Control` for `/images/*` and `/videos/*`, and HTML is not `no-cache`. A stale `index.html` can point at deleted chunks.
- **Fix:**
  - `/assets/*`: `public, max-age=31536000, immutable`.
  - Images and video: one week with `stale-while-revalidate`.
  - HTML: `no-cache`.
- **Lane parts:** L6 `public/_headers`.
- **Migration:** no. **Hosted:** no.

### M-060 Unused Replit and Express scaffold (Medium)
Sources: A3-04, A1-13.
- **Problem:** `artifacts/api-server/`, `lib/db`, the drizzle config and `scripts/post-merge.sh:4` are unused. The script runs `drizzle push` against any `DATABASE_URL`.
- **Fix:** delete them, and remove them from the workspace.
- **Lane parts:** L6 those paths, `pnpm-workspace.yaml`, `scripts/`.
- **Migration:** no. **Hosted:** no.

### M-061 Unused and misclassified dependencies (Medium)
Sources: A3-05, A4-18.
- **Problem:** there are unused packages, packages filed as dev and runtime the wrong way round, and the Replit Vite plugins (including `runtimeErrorOverlay`) are still loaded.
- **Fix:** remove the unused packages, reclassify the rest, and drop the plugins.
- **Lane parts:** L6 the `package.json` files, `vite.config.ts`.
- **Migration:** no. **Hosted:** no.

### M-062 TypeScript strictness gaps (Medium)
Sources: A3-13.
- **Problem:** the strict flags listed in A3-13 are missing (for example `noUncheckedIndexedAccess`).
- **Fix:** enable them in L6. Each lane fixes the fallout in its own files.
- **Lane parts:** L6 tsconfig.
- **Migration:** no. **Hosted:** no.

### M-063 Documentation drift and housekeeping (Medium)
Sources: A3-14, audit-plan section 6.
- **Problems:**
  - CLAUDE.md says React 18; the project is on 19.1.
  - `architecture.md` has drifted.
  - `docs/feature-inventory.md` should be retired.
  - The migration names in `docs/current-task.md` do not match (038 is `simple_stock`).
  - The "Stay lean" note in `current-task.md` needs tidying.
- **Fix:** correct each document, and retire `feature-inventory.md` with a pointer to `build-backlog.md`.
- **Lane parts:** L6 `CLAUDE.md`, the docs named.
- **Migration:** no. **Hosted:** no.

### M-064 Edge function hygiene (Low)
Sources: A3-18 (hygiene part).
- **Problem:** `supabase-js` is unpinned, there is no `deno.json`, and the caller-client code is duplicated.
- **Fix:** add `supabase/functions/deno.json` with a pinned import map (L6). Move the caller client into one `_shared` helper (L2).
- **Lane parts:** L6; L2.
- **Migration:** no. **Hosted:** no.

### M-065 Delete the dead drafts and about 25 MB of unused images (Low; needs Phil's yes)
Sources: A3-03 (deletion part), A4-19.
- **Problem:** about 4,000 lines of drafts and about 25 MB of unused images remain. Phil chose to keep the demo page files hidden.
- **Fix:** with Phil's agreement, delete the drafts pages, `evolution-drafts-a.tsx`, `evolution-drafts-d.tsx` and the images listed in A4-19. Until then, keep them lint-clean.
- **Lane parts:** L6.
- **Migration:** no. **Hosted:** no.

---

## HOSTED (Phil, no code)

### M-066 Supabase Pro plan and backups (High, D3)
Sources: A5-06.
- **Problem:** the free tier pauses on inactivity and has no point-in-time backups.
- **Fix:** upgrade to Pro, confirm backups, and test one restore to a branch. M-058 documents the steps.
- **Verify:** Billing shows Pro, and Backups lists recent entries.

### M-067 Stripe live configuration (High)
Sources: A5-07 (hosted part), D2, A5-12 (events part).
- **Problem:** the endpoint, events, secret and payment methods are invisible to the code. One wrong setting silently stops orders confirming.
- **Fix:** work through the Stripe section of the checklist, after M-005 and M-006 are deployed.
- **Verify:** per the checklist, and M-001's webhook freshness check shows ok.

### M-068 Resend SMTP for Supabase Auth (Medium, D3)
Sources: A5-15.
- **Problem:** the built-in mailer is heavily rate-limited and lands in spam.
- **Fix:** use `smtp.resend.com` with a sender on the store domain.
- **Verify:** a reset email arrives, and its headers show DKIM pass.

### M-069 Supabase Auth settings (Medium)
Sources: the hosted parts of A1-04, A1-05, A1-10 and A1-14, plus the A5 section 4 Auth items.
- **Fix:**
  - Confirm email ON.
  - Secure password change and secure email change ON.
  - Password policy: 12 characters with upper, lower and digit.
  - Site URL and redirect list with no wildcard.
  - Auth CAPTCHA ON, after M-056.
  - Decide the signup setting with M-020.
- **Verify:** per the checklist.

---

## Parked / rejected

| ID | Source | Item | Reason |
|---|---|---|---|
| P-01 | A1-11 | A server-side `store_settings.is_open` gate | Rejected under D5. Link reachability is covered by M-046. |
| P-02 | A2-14 | Fully refunded orders cannot move to another status | Needs a business rule from Alan or Phil. |
| P-03 | A4-17 | Marquee filter and animation cost | Cosmetic; phase 2. |
| P-04 | A4-20 | Order search indexes | Not needed at current volume; revisit at about 5,000 orders. |
| P-05 | A6-11 (part) | A `slug_redirects` table and redirect route | New feature. M-039 locks the slug instead. |
| P-06 | A6-20 (part) | An age check on counter sales | A legal and product decision for Alan. |
| P-07 | A6-21 (part) | An invite-admin screen | New feature. Invites stay a runbook step. |
| P-08 | A6-01 (option) | MFA recovery codes | Rejected under D4. |
| P-09 | A2-07 (option) | Refuse `in_stock=false` sales, or count stock | Rejected under D1. M-022 warns only. |
| P-10 | Phase 2 | SEO, accessibility and content notes from any audit | Out of scope for this programme. The SEO research is in `artifacts/strike-arms/seo/`. |

---

## Wave 3 refactors (from A3)

These run after the lane waves. Behaviour must not change, and each step passes typecheck, lint and tests.

| ID | Source | Refactor | Owner |
|---|---|---|---|
| W-01 | A3-02 | One `effectivePriceCents()` in `src/lib/` (sale-below-price semantics) used at every TypeScript site in M-025. `FulfillmentMethod` is declared once in `src/types/` (it is currently also at `types/database-rows.ts:14`, `lib/shipping.ts:18` and `_shared/shipping.ts:30`; the Deno copy stays, with a comment). | L5 (L4 and L1 adopt it) |
| W-02 | A3-06 | A query-key factory, so that admin edits invalidate the storefront keys | L5 owner; L4 adopts |
| W-03 | A3-07 | One money format and parse module. `ProductFormSheet.tsx:69-71` uses `parseFloat * 100`; check it for rounding bugs. | L5 owner; L4 adopts |
| W-04 | A3-08 | Share the duplicated customer and admin auth plumbing | L4 + L5 |
| W-05 | A3-09 | Move React and side-effect code out of `lib/`, and drop the stale eslint exception for `src/lib/auth-context.tsx` | L6 rule; L4/L5 moves |
| W-06 | A3-10 | 59 functions over 80 lines: extract helpers | Each lane |
| W-07 | A3-11 | One hook per file | L4 + L5 |
| W-08 | A3-12 | Generate the DB types with `supabase gen types` | L6 (L5 owns `src/types`) |
| W-09 | A3-15 | Naming clean-up | Needs Phil's decision |
| W-10 | A3-16 | Remove dead functions, but **keep `unenrollTotp`** (M-026) | Each lane |
| W-11 | A3-17 | Break the `review-bank`/`google-reviews` type cycle | L5 |
| W-12 | A3-19 | The slider bypass: use the shadcn primitive | L5 |
| W-13 | A3-20 | Thin out `App.tsx`: move the route tables (after M-043) | L5 |

**File split plan (files over 250 lines)**

| File | Lines | Plan | Owner |
|---|---|---|---|
| `glossary.ts` | 323 | Ratify as data, or split a-m and n-z | L5 |
| `taxonomy.ts` | 298 | Split into data and lookup | L5 |
| `site-navigation.ts` | 270 | Split into shop, info and footer, plus `types/navigation.ts` | L5 |
| `evolution-drafts-a.tsx`, `evolution-drafts-d.tsx` | 264, 262 | Delete (M-065) | L6 |
| ui `sidebar`, `chart`, `carousel`, `menubar` | over 250 | Delete if unreachable | L6 |
| `lib/api-client-react/custom-fetch.ts` | 371 | Delete with the scaffold (M-060) | L6 |
| `index.css` | 267 | Optional split into tokens and components | L5 |
| Migrations, `seed.sql` | any | Exempt (immutable) | none |

**Watch list (near 250 lines)**
- `products-repository.ts` (247): split into read and admin; L5, with L4 for the admin half.
- `CounterOrderSheet.tsx` (239): L4.
- `CategoriesPage.tsx` (234): L4.
- `orders-repository.ts` (233): L4.

---

**Note on the numbering above:** M-055 is an empty placeholder and can be deleted. Removing it, the totals stand: 69 counted items, where M-024, M-042, M-047, M-050, M-052, M-053 and M-054 each bundle several source findings but count once. If you want the table to match exact unique IDs, recount after you delete M-055. The real count of items with content is 68, so L5 is 13 and the total is 68.