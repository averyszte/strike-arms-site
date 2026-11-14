# Launch runbook

The things to do by hand, in the dashboards and the terminal, when the site
goes live, and the procedures to keep afterwards (secret rotation, the MFA
reset, rollback). Phil does every step here: pushes, deploys,
`supabase db push` and dashboard changes. Tick each one off as it is done.

Rules for this file:

- **Names only, never secret values.** Secrets are pasted straight into the
  dashboard field they belong in, never into a terminal, a commit, chat or
  this file. No command below contains a secret.
- Commands are for PowerShell, one per block, run from the repo root unless
  the block says otherwise. In Windows PowerShell 5.1 `curl` is an alias for
  `Invoke-WebRequest`, so the checks below call `curl.exe`.
- Every step has a **Verify** line. A step is not done until its check passes.
- The audit items are in `docs/audit/findings.md` (M-numbers). Its "Hosted
  config for Phil" section is the same checklist in short form.

Supabase project ref: `cxnhkgndvzgyqhiwsvrr` (not a secret; it is in every
browser request). Functions base URL:
`https://cxnhkgndvzgyqhiwsvrr.supabase.co/functions/v1/`.

## 0. Before launch day

Do these in the days before. None of them changes what shoppers see.

- [ ] **Supabase Pro plan (D3, M-066).** Billing > upgrade to Pro. The free
      tier pauses the project after about a week idle, which takes the whole
      shop down (catalogue, checkout, webhook, email worker, admin).
  - *Verify:* Billing shows Pro; Database > Backups lists daily backups.
- [ ] **Test one backup restore** to a new branch or a scratch project, not
      over the live database.
  - *Verify:* the restored copy has today's `orders` and `products` rows.
- [ ] **All code waves merged and deployed by Phil.** Apply the migrations:

```powershell
npx supabase migration list
```

```powershell
npx supabase db push
```

  - *Verify:* `migration list` shows every local migration (039 plus the new
    ones from the fix programme) as applied on the remote.
- [ ] **Deploy every function.** `config.toml` holds each function's
      `verify_jwt` setting, so no extra flags are needed. Deploy each one that
      changed, for example:

```powershell
npx supabase functions deploy stripe-webhook
```

  The full set is `checkout-status`, `create-checkout-session`,
  `delete-account`, `notification-worker`, `order-lookup`, `refund-order`,
  `stripe-webhook`, `submit-inquiry` and `sweep-orphan-images`.
  - *Verify:*

```powershell
npx supabase functions list
```

    shows all nine, including `refund-order`.
- [ ] **Re-run `supabase/verify-rls.sql`** in the SQL editor after the L3
      database wave.
  - *Verify:* every check passes.
- [ ] **Resend domain (M-068).** Verify the store domain in Resend (SPF, DKIM
      and DMARC records at the DNS host) and create a **sending-only** API key.
  - *Verify:* Resend shows the domain "Verified"; a mail-tester score of 9 or
    more; the key's permission is "Sending access".
- [ ] **Supabase Auth custom SMTP (D3, M-068).** Authentication > Emails >
      SMTP Settings: host `smtp.resend.com`, port 465, user `resend`, the
      Resend API key as the password, a sender on the verified domain. The
      built-in sender allows only a few emails an hour and lands in spam.
  - *Verify:* a password reset sent to an address **outside** the Supabase team
    arrives from the store domain, and its headers show DKIM pass.
- [ ] **Supabase Auth settings (M-069).** Authentication > Sign In / Providers:
  - Confirm email ON (M-021).
  - Secure password change and secure email change ON (M-041). Caution:
    `docs/current-task.md` (2026-09-29) records that "Require current
    password when updating" was left OFF because it broke the password
    reset. Turn it on only once the M-041 change is deployed, then test a
    reset straight after.
  - Password policy: minimum 12, with lowercase, uppercase and digits,
    matching `src/lib/password-policy.ts`.
  - Leaked-password protection ON.
  - Sign-ups: decide with M-020 (see `docs/auth-roles.md`). Keep them closed
    until the SMTP check above passes.
  - Auth CAPTCHA (Turnstile): turn ON **only after** the M-056 code is
    deployed. The other way round breaks every sign-in.
  - *Verify:* a short password is refused at sign-up; a sign-in without a
    Turnstile token is refused once CAPTCHA is on.
- [ ] **Turnstile widget hostnames.** Cloudflare > Turnstile > the widget >
      Hostnames includes `strikearms.ie`, `www.strikearms.ie` and
      `strike-arms-site.pages.dev`.
  - *Verify:* the widget renders on the pages.dev checkout.
- [ ] **Uptime monitor (M-001 part C).** An external monitor (any free uptime
      service) on `https://strikearms.ie/` and on one cheap function or REST
      read, alerting Phil by email. It also keeps the project from idling.
  - *Verify:* pause it once and confirm the alert email arrives.

## 1. Function secrets (names only)

Set in Supabase > Edge Functions > Secrets, by pasting the value into the
dashboard field. `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase and are not set by hand.

| Name | What it is | Notes |
| ---- | ---------- | ----- |
| `STRIPE_SECRET_KEY` | Stripe secret key | Live-mode key at launch (section 3) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe endpoint | The live endpoint's own secret (section 3) |
| `SITE_URL` | The site origin | `https://strikearms.ie` at the launch flip (section 4) |
| `SITE_HOSTNAME` | Hosts Turnstile tokens may come from | Comma list, e.g. `strikearms.ie,strike-arms-site.pages.dev` |
| `ALLOWED_ORIGINS` | Origins allowed to call the functions (CORS, M-014) | Set **before** the L2 CORS change is deployed |
| `TURNSTILE_SECRET_KEY` | Turnstile secret | |
| `RESEND_API_KEY` | Resend sending-only key | |
| `EMAIL_FROM` | Sender address on the verified domain | |
| `OWNER_EMAIL` | Where Alan's alerts and the health digest go | |
| `REPLY_TO` | Reply-to on customer emails | |

- [ ] All of the above are set.
- [ ] `ALLOW_INSECURE_NO_CAPTCHA` is **absent** (it is for the local stack
      only; with it set, the bot check can be skipped).
  - *Verify:*

```powershell
npx supabase secrets list
```

    shows every name above (digests only) and not `ALLOW_INSECURE_NO_CAPTCHA`.

A changed secret reaches a function when it next starts. After changing one,
redeploy the functions that read it so no warm instance keeps the old value.

## 2. Email worker and scheduled jobs (Vault and cron)

Order matters: **never schedule the worker before the Resend secrets in
section 1 are set.** A worker without them fails every queued email five
times and marks it Failed, and each one then needs a manual Resend.

- [ ] **Vault entry `service_role_key`.** Supabase > Integrations > Vault (or
      Project Settings > Vault): add a secret named `service_role_key` and
      paste the service-role key from Project Settings > API keys into the
      value field in the dashboard.
  - *Verify (SQL editor):*

```sql
select name from vault.secrets;
```

    lists `service_role_key`.
- [ ] **Optional: drop an old backlog** so weeks-old confirmations do not go
      out at once (SQL editor):

```sql
delete from public.notification_jobs where status = 'pending';
```

- [ ] **Schedule the notification worker** (SQL editor). The URL is the
      project URL, not a secret:

```sql
select public.schedule_notification_worker('https://cxnhkgndvzgyqhiwsvrr.supabase.co');
```

- [ ] **Schedule the image sweep through Vault (M-019).** Use the scheduler
      that the M-019 migration adds, which reads the key from Vault at run
      time. Do **not** use the old `schedule_image_sweep(text, text)` form from
      migration 012: it writes the service-role key into `cron.job` in plain
      text.
- [ ] **Rotate the service-role key after M-019** (section 6), because the old
      one has sat in `cron.job`.
  - *Verify (SQL editor), all three:*

```sql
select jobname, active from cron.job;
```

    shows `notification-worker`, `purge-rate-limit-hits` and the image sweep,
    all active.

```sql
select jobname from cron.job where command like '%eyJ%';
```

    returns no rows.

```sql
select status, count(*) from cron.job_run_details where start_time > now() - interval '24 hours' group by status;
```

    shows no failed runs. Then mark an order ready to collect in the admin:
    the customer email arrives within a minute and shows as Sent on the order
    sheet.

## 3. Stripe: test mode to live mode (M-067, D2)

Test and live mode are separate in Stripe: the test endpoint, test keys and
test webhook secret do **not** carry over. Do every step in **live** mode, and
do them together, because a live key with the test webhook secret makes every
webhook fail its signature check: customers pay, orders stay pending.

- [ ] **Live secret key.** Stripe > Developers > API keys (live mode): paste
      the secret key into the `STRIPE_SECRET_KEY` secret in Supabase.
- [ ] **Create the live webhook endpoint.** Stripe > Developers > Webhooks
      (live mode) > Add endpoint:
      `https://cxnhkgndvzgyqhiwsvrr.supabase.co/functions/v1/stripe-webhook`.
      Events, exactly these:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
  - `charge.refund.updated` and `charge.dispute.created`, **only once the
    M-006 webhook handler is deployed**
- [ ] **Live signing secret.** Copy the new endpoint's signing secret into the
      `STRIPE_WEBHOOK_SECRET` secret in Supabase.
- [ ] **Instant methods only (D2).** Stripe > Settings > Payment methods (live
      mode): cards, Apple Pay and Google Pay on; delayed methods such as SEPA
      Debit and bank transfers off.
- [ ] **Webhook failure emails** go to an address Phil reads (Stripe
      notification settings).
- [ ] **Redeploy the three functions that read the Stripe secrets:**

```powershell
npx supabase functions deploy stripe-webhook
```

```powershell
npx supabase functions deploy create-checkout-session
```

```powershell
npx supabase functions deploy refund-order
```

  - *Verify:* the endpoint shows "Enabled" with the event list above; "Send
    test webhook" gets a 200 in the endpoint log; the dashboard shows the
    live key prefix. A test Checkout shows only card and wallets. The real
    end-to-end payment is in section 5.

## 4. The launch flip (one deploy)

These go out together. If the gate opens first, emails and Stripe returns
still point at pages.dev; if the URLs move first, the live domain still shows
the holding page while links already point at it.

- [ ] **Domain live.** Cloudflare Pages > Custom domains: `strikearms.ie` and
      `www.strikearms.ie` active with TLS. Pointing the domain at Pages is
      also what turns on the old PHP 301s in `public/_redirects`.
- [ ] **`VITE_SITE_URL`** in Cloudflare Pages > Settings > Variables is
      `https://strikearms.ie` (Production).
- [ ] **Function secrets:** `SITE_URL` becomes `https://strikearms.ie`;
      `SITE_HOSTNAME` and `ALLOWED_ORIGINS` include the live domain(s).
- [ ] **Supabase Auth > URL Configuration:** Site URL `https://strikearms.ie`.
      Redirect URLs: the live domain's `/account/**` and
      `/admin/reset-password`, plus the named preview host only. No
      `*.pages.dev` wildcard. Invites and resets sent before this change still
      point at the old URL; send them again afterwards.
- [ ] **The gate flip, in the same deploy:** the commit that sets
      `IS_COMING_SOON = false` in
      `artifacts/strike-arms/src/lib/coming-soon-gate.ts` is pushed to `main`
      straight after the URL changes above, so Pages builds and deploys it
      with the new `VITE_SITE_URL`.
- [ ] **Redeploy the functions that build links from `SITE_URL`:**

```powershell
npx supabase functions deploy create-checkout-session
```

```powershell
npx supabase functions deploy notification-worker
```

  - *Verify:* `https://strikearms.ie/` shows the shop, not the holding page,
    in a private window without `?preview`; a password reset email links to
    `https://strikearms.ie`.

## 5. After the flip: verification

- [ ] **Headers on the home page** (CSP and HSTS):

```powershell
curl.exe -I https://strikearms.ie/
```

  - *Verify:* `Content-Security-Policy` and `Strict-Transport-Security` are
    present.
- [ ] **Cache headers (M-059).** On a deep link:

```powershell
curl.exe -I https://strikearms.ie/store
```

  - *Verify:* `Cache-Control` is `max-age=0, must-revalidate` (or `no-cache`),
    not a long max-age. A file under `/assets/` shows
    `max-age=31536000, immutable`; a file under `/images/` shows
    `max-age=604800, stale-while-revalidate=86400`. No response shows two
    values joined by a comma.
- [ ] **Old PHP URLs redirect:**

```powershell
curl.exe -I https://strikearms.ie/Contact-us.php
```

  - *Verify:* `301` with `Location: /contact`.
- [ ] **No CSP errors** in the browser console on the home page, a product
      page, the cart, the contact form, the shop map and a checkout redirect.
- [ ] **One live end-to-end payment, then refund it.** Pay a small real order,
      check the success page shows the order number, the confirmation email
      arrives and the order shows paid in the admin. Then refund it from the
      admin order sheet.
  - *Verify:* the refund shows in Stripe and on the order, and the refund
    email arrives.
- [ ] **System health is all ok** (next section).

## 5a. Using the health check (M-001)

The admin dashboard's **System health** card shows each check as ok, warn or
fail. It reads `public.system_health()`, which only an admin signed in with
two-factor can run, so use the card, not the SQL editor. A daily digest email
goes to `OWNER_EMAIL` when any check warns or fails.

Look at it after every deploy, after any secret change, and whenever the
digest arrives. What a failing check usually means:

| Check | First thing to look at |
| ----- | ---------------------- |
| Cron jobs present and active, cron failures | Section 2 `cron.job` and `cron.job_run_details` queries |
| Vault key present | The `service_role_key` Vault entry (section 2) |
| Worker HTTP failures, email backlog | `RESEND_API_KEY` and `EMAIL_FROM`, then the failed jobs list in the admin |
| Webhook freshness, stuck payments | The Stripe endpoint log; `STRIPE_WEBHOOK_SECRET` matches the live endpoint (section 3) |
| Paid after abandon, open payment alerts | The unmatched payments card; contact the customer before refunding |
| `store_settings` row 1 | Restore the row from a backup; checkout cannot price delivery without it |
| Checkout rate limit near the cap, Turnstile failures | A traffic spike or a hostname missing from `SITE_HOSTNAME` |
| Orphan pending orders | Usually harmless walked-away checkouts; check none was paid |

## 6. Secret rotation

Rotate a secret when it may have leaked, when someone with access leaves, and
the service-role key once after M-019. Each rotation is: make the new value,
paste it where it is used, redeploy, check, then revoke the old one.

- [ ] **Service-role key.** Project Settings > API keys: create a new
      secret / service-role key. Paste it into the Vault entry
      `service_role_key` (section 2). Functions get the new key from Supabase
      automatically; redeploy them so none keeps the old one. Then revoke the
      old key.
  - *Verify:* the health card's Vault and cron checks are ok after the next
    worker run, the `eyJ` query in section 2 returns no rows, and a request
    with the old key is refused.
- [ ] **Stripe webhook secret.** Stripe > the live endpoint > Roll secret.
      Paste the new one into `STRIPE_WEBHOOK_SECRET`, then redeploy:

```powershell
npx supabase functions deploy stripe-webhook
```

  - *Verify:* "Send test webhook" gets a 200, and the health card's webhook
    freshness is ok.
- [ ] **Stripe secret key.** Stripe > API keys > Roll key. Paste into
      `STRIPE_SECRET_KEY` and redeploy `stripe-webhook`,
      `create-checkout-session` and `refund-order` (section 3 commands).
  - *Verify:* a test Checkout opens.
- [ ] **Resend key, Turnstile secret.** Same pattern: new key in the provider,
      paste into `RESEND_API_KEY` or `TURNSTILE_SECRET_KEY`, redeploy the
      functions that use it, delete the old key in the provider.
  - *Verify:* an email sends; the contact form passes the bot check.

## 7. Admin MFA reset (D4)

Every admin should enrol **two** authenticator factors (for example the phone
and a password manager), named so they can be told apart. Removing a factor
in the admin settings is only allowed while another verified factor remains
(M-026).

**If the admin still has one working factor:** they sign in with it, remove
the lost factor in the admin settings, and enrol a replacement. No developer
step is needed.

**If the admin has lost every factor**, Phil resets it:

1. **Confirm who is asking** outside email: a call to a number already known,
   or in person. A reset hands over refunds and orders, so never act on an
   email or message alone.
2. **Find the factors** (SQL editor; replace the address, which is not a
   secret):

```sql
select f.id, f.friendly_name, f.status, f.created_at from auth.mfa_factors f join auth.users u on u.id = f.user_id where u.email = 'admin@example.com';
```

3. **Remove them.** In Authentication > Users > the user, remove the MFA
   factors if the dashboard offers it. Otherwise delete them by id from the
   list above (SQL editor), one row per factor:

```sql
delete from auth.mfa_factors where id = 'FACTOR_ID_FROM_STEP_2';
```

4. **Sign the account out everywhere** so no old session survives:

```sql
delete from auth.sessions where user_id = (select id from auth.users where email = 'admin@example.com');
```

5. **The admin signs in with their password** and is taken to two-factor
   enrolment, the same as a newly invited admin. They enrol two factors.
   Until they do, the account is at aal1 and the admin data stays closed
   (every admin read needs aal2).
6. **Log the reset** in the table below.

- *Verify:* the step 2 query shows the new verified factors only, and the
  admin can open orders.

| Date | Admin | Identity confirmed by | Reset by | Factors re-enrolled |
| ---- | ----- | --------------------- | -------- | ------------------- |
|      |       |                       |          |                     |

## 8. Rollback

- **The site.** Cloudflare Pages > Deployments > a previous production
  deployment > "Rollback to this deployment". Rolling back past the launch
  flip brings the holding page back; that is expected.
  - *Verify:* the previous version is served (check a changed page).
- **A function.** Deploy it again from the last good commit: check that
  commit out in a separate worktree, then run the deploy for that one
  function from there.

```powershell
npx supabase functions deploy stripe-webhook
```

  - *Verify:* the function log shows the redeploy, and its health check is ok.
- **The database.** Migrations only go forward. Fix a bad migration with a new
  one. If data is damaged, restore a backup to a branch first, copy back what
  is needed, and only restore over the live project as a last resort, after
  pausing checkout. Never run `supabase db reset` against the linked remote.
- **Stripe.** Do not delete the live endpoint during a rollback; Stripe
  retries failed events for up to three days, so they arrive once the
  function is fixed.

## Done already

Kept here so nobody redoes or second-guesses them. Details in
`docs/admin-auth-emails.md`.

| Date | What |
| ---- | ---- |
| 2026-09-28 | Migrations 024, 025 and 026 pushed; `verify-rls.sql` clean (only the expected `anon-insert-inquiries` review row) |
| 2026-09-28 | Invite and reset email templates pasted, with the Strike Arms subjects |
| 2026-09-28 | Site URL set to `http://localhost:5173` for testing |
| 2026-09-28 | Password policy set: minimum 12, lowercase, uppercase and digits |
| 2026-09-28 | Migration 027 pushed; an invited admin accepted, set a password, enrolled TOTP and signed in |
| 2026-09-29 | Site URL `https://strike-arms-site.pages.dev`, with `/account/**` and `/admin/reset-password` on the redirect list; leaked-password protection and Confirm email on |
| 2026-09-30 | Migration 036 pushed and `submit-inquiry` deployed; `verify-rls.sql` fully clean; Turnstile and the contact form confirmed live |
| 2026-09-30 | `SITE_URL` secret set to `https://strike-arms-site.pages.dev` |
