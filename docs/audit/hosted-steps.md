# Hosted steps for Phil: pre-launch audit (2026-11-14)

This is the ordered list of everything the audit fixes need outside the code. Do it top to bottom, because the order matters. Each step has its own check. The detailed procedures are in `docs/launch-runbook.md`; the section numbers below point there.

- **Branch:** `claude/confident-sammet-18385d`. Every commit is local; nothing is pushed or deployed yet.
- **Names only.** No secret value goes in this file, in chat or in a commit. Paste values into the dashboard or your own terminal.
- **The three ordering rules:**
  1. `supabase db push` comes before any function deploy.
  2. `ALLOWED_ORIGINS` and `SITE_HOSTNAME` are set before the functions are deployed.
  3. Auth CAPTCHA goes on only after the new site is deployed.

Commands are for PowerShell, run from the repo root, one per block.

---

## Stage 0: account and provider setup (any time before stage 1)

- [ ] **Supabase Pro plan, with backups (M-066, D3).**
  - *Check:* Billing shows Pro, and Database > Backups lists recent days.
  - Test one restore to a branch once (runbook section 0).
- [ ] **Resend domain verified, with a sending-only API key (M-068).**
  - *Check:* Resend shows SPF, DKIM and DMARC as "Verified", and the key's permission is "Sending access".
- [ ] **Vault entry `service_role_key` exists (runbook section 2).** The email worker and the photo sweep read it at run time.
  - *Check (SQL editor):* `select name from vault.secrets;` lists `service_role_key`.

## Stage 1: database (before any function deploy)

- [ ] **Apply migrations 040 to 049.** The webhook needs 040; refund-order and the webhook need 041. Without them, every Stripe event and every refund returns 500.

```powershell
npx supabase migration list
```

```powershell
npx supabase db push
```

  - *Check:* `migration list` shows 040 to 049 as applied on the remote.
  - *Check:* read the 045 NOTICE lines in the push output. If one says it could not read the old sweep URL, or that no sweep job exists, run this in the SQL editor (the project URL is not a secret):

```sql
select public.schedule_image_sweep('https://cxnhkgndvzgyqhiwsvrr.supabase.co');
```

- [ ] **The service-role key has left `cron.job` (M-019).**
  - *Check (SQL editor):* `select jobname from cron.job where command like '%eyJ%';` returns no rows.
  - *Check:* `select jobname, active from cron.job;` shows `notification-worker`, `purge-rate-limit-hits`, `sweep-orphan-images`, `abandon-orphan-orders` and `health-digest`, all active.
- [ ] **Rotate the service-role key (M-019, runbook section 6).** The old key sat in plain text in `cron.job`. Make a new key, paste it into the Vault entry `service_role_key`, and revoke the old key after stage 3.
  - If your project still uses the legacy JWT keys, rotating them changes the anon key too. In that case, put the new anon key in Cloudflare Pages (`VITE_SUPABASE_ANON_KEY`) before stage 4, so the site ships with it.
- [ ] **Run the health check and the RLS check.**
  - *Check (SQL editor):* `select * from system_health_checks();`. Before launch, some rows may be `warn` (no orders or webhooks yet). None should be `fail` except checks for things later stages set up.
  - *Check:* run `supabase/verify-rls.sql` in the SQL editor. Every check passes.

## Stage 2: function secrets (before any function deploy)

- [ ] **Set the two new secrets.** Without them the new CORS and Turnstile code refuses every request, so checkout returns 500. The values are hostnames, not secrets.

```powershell
npx supabase secrets set "ALLOWED_ORIGINS=https://strikearms.ie,https://www.strikearms.ie,https://strike-arms-site.pages.dev"
```

```powershell
npx supabase secrets set "SITE_HOSTNAME=strikearms.ie,strike-arms-site.pages.dev"
```

- [ ] **Remove the local-only bypass.** Turnstile now fails closed on the hosted project; this flag is only honoured on the local stack, but it must not be set on the hosted one.

```powershell
npx supabase secrets unset ALLOW_INSECURE_NO_CAPTCHA
```

- [ ] **Confirm every other secret is present (runbook section 1):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`, `REPLY_TO`.

```powershell
npx supabase secrets list
```

  - *Check:* every name above is listed, including the two new ones, and `ALLOW_INSECURE_NO_CAPTCHA` is not.

## Stage 3: deploy the functions

- [ ] **Deploy all nine functions:** stripe-webhook, create-checkout-session, refund-order, order-lookup, checkout-status, notification-worker, submit-inquiry, sweep-orphan-images and delete-account. With no name, the command deploys every function folder.

```powershell
npx supabase functions deploy
```

```powershell
npx supabase functions list
```

  - *Check:* all nine show a new version and an updated time.
  - Redeploy after any later secret change; a running function keeps the old value.
- [ ] **Import map.** `supabase/functions/deno.json` pins supabase-js and stripe. Every import already carries a full `npm:` specifier, so the deploy works either way. To be sure the pin is used, check the deploy output for the deno.json. If it is not used, add a per-function `import_map` in `supabase/config.toml` later; this is not a launch blocker.
- [ ] **Revoke the old service-role key** now that every function runs with the new one (runbook section 6).
  - *Check:* after the next worker run, the health card's Vault and cron checks are ok.

## Stage 4: deploy the site (same wave as stage 3)

The site and the functions must go out together: the M-007 Eircode rule (Dublin 6W) and the new refusal codes match on both sides.

- [ ] **Merge the branch into `main` and push.** Cloudflare Pages builds `main`.

```powershell
git checkout main
```

```powershell
git merge --ff-only claude/confident-sammet-18385d
```

```powershell
git push origin main
```

  - If `--ff-only` refuses, `main` has moved since the branch was cut. Stop and ask for a rebase rather than forcing it.
  - *Check:* the Pages deployment for the new commit succeeds, and `https://strikearms.ie/?preview` loads the shop with no console errors.
- [ ] **CI.** Once the GitHub Actions deno check is green on `main`, remove `continue-on-error` from the edge-functions job in `.github/workflows/`.

## Stage 5: Stripe (after stages 3 and 4)

- [ ] **Turn off delayed payment methods (D2):** SEPA Debit, bank transfer and similar.
  - *Check:* Settings > Payment methods. A test Checkout shows only card and wallets.
- [ ] **Webhook endpoint events, exactly these seven.** Add the last two only now that the new webhook is live, because the old code does not handle them:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
  - `charge.refund.updated`
  - `charge.dispute.created`
  - *Check:* "Send test webhook" returns 200, and the endpoint log shows no 500s.
- [ ] **Webhook failure emails** go to an address you read.
- [ ] The live-mode switch itself (live key pair, live endpoint) is runbook section 3.

## Stage 6: Supabase Auth (after stage 4)

- [ ] **Confirm email ON (M-021).** The guest order claim relies on it.
  - *Check:* Auth > Providers > Email.
- [ ] **Secure password change and secure email change ON (M-041).** The admin password change now sends the current password.
- [ ] **Password policy:** minimum 12 characters, with upper, lower and digit.
  - *Check:* a short password is refused at sign-up.
- [ ] **Custom SMTP `smtp.resend.com` (M-068, D3).**
  - *Check:* a password-reset email arrives from the store domain, and its headers show DKIM pass.
- [ ] **Admin invites (M-020).** The invite trigger now promotes only fresh invites. Keep `enable_signup` as it is unless you decide otherwise; see `docs/auth-roles.md`.
  - *Check:* signing up with a new address does not create an admin.
- [ ] **Site URL and redirect list** with no `*.pages.dev` wildcard. These change at the launch flip (runbook section 4).
- [ ] **Auth CAPTCHA ON, last (M-056).** Turnstile, with the same site key as the storefront. Both the customer and the admin sign-in now send a captcha token, but only the newly deployed site does. Turning CAPTCHA on before stage 4 breaks every sign-in.
  - *Check:* customer sign-in and admin sign-in both still work, and a sign-in without a token is refused.

## Stage 7: checks after the deploy

- [ ] **Client IP header (M-011).** The functions take the client address from `cf-connecting-ip`. A temporary echo of `cf-connecting-ip` and `x-forwarded-for` confirms which one is the real client on the hosted gateway.
- [ ] **Cloudflare (runbook sections 4 and 5):** `VITE_SITE_URL` is the live origin; custom domains are active with TLS; the Turnstile widget's hostnames include the live domains; `curl -I https://strikearms.ie/` shows the CSP and HSTS headers; an old PHP URL returns 301.
- [ ] **Health card.** Admin > Dashboard shows the system health card all ok, or with only expected pre-launch warnings. The daily owner digest (08:07 UTC) emails only when a check is not ok.
- [ ] **Uptime monitor (M-001 part C).** An external monitor watches the home page and one function, with alerts to you.
- [ ] **End-to-end in Stripe test mode:** one card order paid; one refund, partial then full; one counter sale voided on the same day; a status change that sends the customer email after the 5-minute hold.

## At launch

- [ ] The launch flip is runbook section 4: `IS_COMING_SOON=false` ships in the same deploy as the final `SITE_URL`, `VITE_SITE_URL` and the Auth Site URL. Then redeploy `create-checkout-session` and `notification-worker`.
