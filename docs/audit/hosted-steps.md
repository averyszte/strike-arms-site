# Hosted steps for Phil: pre-launch audit (2026-11-14)

This is the ordered list of everything the audit fixes need outside the code. Do it top to bottom, because the order matters. Each step has its own check. The detailed procedures are in `docs/launch-runbook.md`; the section numbers below point there.

- **Status (2026-11-14):** stages 0 to 7 are done. The site is live behind the coming-soon gate, on the Strike Arms Stripe sandbox. Only the launch-day steps at the end remain.
- **Skipped on purpose:** rotating the service-role key. A scan of every tracked file and the full git history found no key; it only ever sat in `cron.job`, which only the database superuser can read.
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

Do these in one sitting, in this order. Full detail is in `docs/launch-runbook.md` sections 3 to 5.

### 1. Stripe live mode (runbook section 3)

Test and live mode are separate in Stripe: nothing from the sandbox carries over. Do every step with the **live** toggle on, and do them together: a live key with the sandbox webhook secret fails every webhook signature, so customers pay and orders stay pending.

- [ ] **Live secret key.** Stripe > Developers > API keys (live). Set it in your own terminal, pasting the `sk_live_` value after the `=`:

```
npx supabase secrets set STRIPE_SECRET_KEY=PASTE_LIVE_SECRET_KEY
```

- [ ] **Live webhook endpoint.** Stripe > Developers > Webhooks (live) > Add endpoint: `https://cxnhkgndvzgyqhiwsvrr.supabase.co/functions/v1/stripe-webhook`, with exactly these seven events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
  - `charge.refund.updated`
  - `charge.dispute.created`
- [ ] **Live signing secret.** Copy the new endpoint's `whsec_` value:

```
npx supabase secrets set STRIPE_WEBHOOK_SECRET=PASTE_LIVE_WHSEC
```

- [ ] **Instant methods only (D2).** Settings > Payment methods (live): cards, Apple Pay and Google Pay on; SEPA Debit, bank transfer and other delayed methods off.
- [ ] **Webhook failure emails** go to an address you read.

### 2. Final site URL

Everything becomes `https://strikearms.ie`: no `www`, no trailing slash.

- [ ] **Function secret:**

```powershell
npx supabase secrets set "SITE_URL=https://strikearms.ie"
```

- [ ] **Supabase > Authentication > URL Configuration > Site URL:** `https://strikearms.ie`. Leave the redirect list as it is.
- [ ] **Cloudflare Pages `VITE_SITE_URL`:** nothing to do. When it is unset, the site already uses `https://strikearms.ie`.

### 3. Redeploy the functions

One command picks up both the Stripe and the `SITE_URL` changes:

```powershell
npx supabase functions deploy
```

### 4. Open the gate

- [ ] Set `IS_COMING_SOON = false` in `artifacts/strike-arms/src/lib/coming-soon-gate.ts`, commit, and push to `main`. It is a line of code, not a Supabase or Cloudflare setting. Cloudflare rebuilds and the shop is open a minute after the build.

### 5. Check it

- [ ] In a private window without `?preview`, `https://strikearms.ie/` shows the shop.
- [ ] In the live endpoint, "Send test webhook" returns 200.
- [ ] **One real order:** pay a small amount with a real card. The success page shows the order number, the confirmation email arrives and the admin shows it paid. Then refund it from the admin order sheet; the refund shows in Stripe and the refund email arrives.
- [ ] An old PHP URL redirects:

```powershell
curl.exe -I https://strikearms.ie/Contact-us.php
```

  - *Check:* `301` with `Location: /contact`.
- [ ] Admin > Dashboard: the system health card is all ok.
- [ ] Disable or delete the sandbox webhook endpoint once live orders work.

## After launch: phase 2 content and legal (S6)

### Legal pages sign-off (phase 2 N-103)

The site went live before a solicitor read the legal pages. **Decision, 14 November 2026: Alan will not get a solicitor's sign-off.** The checklist below stays for reference only; the draft notices and open-point lists stay hidden from visitors, and the pages stand as written. Since phase 2, the "Draft, should be reviewed by a solicitor" notice and each page's list of open points show only in local development (`LegalDraftNotice.tsx`), so visitors no longer see them. The open points are still in each page's code (`OPEN_POINTS` in `Privacy.tsx`, `Terms.tsx`, `Returns.tsx` and `Delivery.tsx`), so nothing is lost. Run `pnpm --filter @workspace/strike-arms run dev` to read them in place.

- [ ] **Book the solicitor's review.** They read, in full:
  - `/privacy`, `/terms`, `/returns` (including the model cancellation form) and `/delivery`.
  - `/airsoft-law`, which is not on any earlier review list.
  - The account page data lines (`YourDataCard.tsx`) and the checkout age line.
  - The order confirmation email's "Changed your mind?" block (it repeats the Returns page wording).
- [ ] **Answer every open point.** Alan supplies the business facts: the legal name, and the company (CRO) number if it is a company; the VAT number (or the accountant does); delivery zones beyond the Republic of Ireland, including Northern Ireland; what happens when a customer cannot show ID at collection; which items ship sealed for hygiene reasons. The solicitor answers the legal points on each list.
- [ ] **Give the solicitor the Privacy inputs (N-108):** the processor list from the B9 audit (Supabase, Stripe, Resend, Cloudflare, and Google while Fonts and Maps load from Google), the Supabase project region (Supabase dashboard > Project Settings > General), and every form that runs the Turnstile bot check.
- [ ] **Hand the answers back for the code.** The new legal name, CRO and VAT numbers go in `BUSINESS` in `src/lib/site-config.ts` and in `SHOP` in `supabase/functions/notification-worker/templates/layout.ts` (the two must match). Each signed-off page then loses its `LegalDraftNotice` and `OPEN_POINTS`, and gets its "Last updated" date set to the sign-off date.
  - *Check:* `/privacy`, `/terms`, `/returns` and `/delivery` show no draft notice, and each shows the sign-off date.

### Email changes (phase 2 N-104, N-109)

The email footer now shows the shop email address, and the order confirmation email links the returns policy and the terms of sale.

- [ ] **Redeploy the email worker.** One command, from the repo root:

```powershell
npx supabase functions deploy notification-worker
```

  - *Check:* read the next real order confirmation that comes in: it has a "Changed your mind?" box with two working links, and the footer shows `info@strikearms.ie`. Do not place and refund a test order for this: Stripe is live, so it is a real charge, and Stripe keeps its processing fee on a refund.
- [ ] **Re-paste the four Auth email templates.** The footer change reaches the Auth emails only when they are pasted again. Open `supabase/templates/paste-into-supabase.html` in a browser and paste each one into the Supabase Auth email templates page, as was done on 2026-09-28.
  - *Check:* a password-reset email shows the shop email in its footer.

### Checkout function redeploy (phase 2 N-054, N-115)

`create-checkout-session` now sends a shopper who cancels on Stripe back to `/cart?cancelled=1`, so the cart can say the payment was cancelled. The site deploy alone does not ship this: until the function is redeployed, Stripe keeps sending people to plain `/cart` and the notice never shows. Nothing breaks in the meantime.

- [ ] **Wait for the Stripe terms consent change (N-115)** if it is still being made in the same function folder, so both land in one deploy.
- [ ] **Redeploy the function**, from the repo root:

```powershell
npx supabase functions deploy create-checkout-session
```

  - *Check:* on `/cart`, start a checkout and press the back link on the Stripe page. The cart shows the "payment cancelled" notice and the basket is unchanged. No card is needed for this check.

### Held: needs a hosted change first (phase 2 N-060, N-053)

- [ ] **Customer password minimum of 10 characters (PD8).** The site checks passwords against the Supabase Auth policy, which today is 12 characters with mixed case and a number, for admins and customers alike. A 10-character form rule would send passwords Supabase refuses, so the code change waits until the Auth policy is relaxed (Supabase dashboard > Authentication > Policies), with the admin rule kept strict in the admin forms. Tell the developer once it is set.
- [ ] **Hide sold pre-loved items 30 days after selling out (PD12).** The catalogue has no record of when an item sold out, only `in_stock`. It needs a small migration (a sold-out date stamped when stock goes to zero) and a `db push` before the listing can hide them. Today sold items sink to the end of `/pre-loved` instead.

### Cloudflare Web Analytics (phase 2 PD4, N-010)

- [ ] **Switch Web Analytics off** in the Cloudflare dashboard (Web Analytics, site `strikearms.ie`). It stays off until the Privacy page is signed off.
  - *Check:* no CSP violation for `cloudflareinsights.com` in the browser console on `/`.

## After launch: search, analytics and hand-over

Not done yet. Do these once the phase 2 S1 fixes (sitemap, redirects, noindex rules) are deployed, so Google reads the corrected files first.

- [ ] **Sitemap:** S1 regenerates `public/sitemap.xml` from the routes and live products and wires it into the build (phase 2 N-005). Check `https://strikearms.ie/sitemap.xml` lists the real pages and no 404s.
- [ ] **Google Search Console:** add `strikearms.ie` as a Domain property (DNS TXT record in Cloudflare). Submit `https://strikearms.ie/sitemap.xml`. If the old PHP site had a property, keep it: use it to watch the 301s and coverage.
- [ ] **Google Analytics 4:** the consent banner, footer "Cookie settings" link, CSP and Privacy wording are built. Nothing loads, and the banner and wording stay hidden, until the Measurement ID is set in `GA4_MEASUREMENT_ID` (`src/lib/analytics-config.ts`).
  1. analytics.google.com > Admin > Create > Property: name "Strike Arms", time zone Ireland, currency Euro.
  2. Data streams > Web: URL `https://strikearms.ie`, stream name "strikearms.ie". Copy the Measurement ID (`G-...`; it is public).
  3. On the stream, Enhanced measurement > the cog: untick "Page changes based on browser history events" (the site sends its own page views, so leaving it on double-counts).
  4. Admin > Data collection and modification > Data collection: leave Google Signals off.
  5. Admin > Data retention: pick 2 or 14 months, to match the Privacy page if you change it.
  6. Send the `G-...` ID; it goes in `analytics-config.ts`, then push and deploy.
  - *Check:* on strikearms.ie in a private window, the banner shows; Reject leaves no `_ga` cookie; Accept shows you in GA4 > Reports > Realtime within a minute.
- [ ] **Bing Webmaster Tools:** import from Search Console.
- [ ] **Google Business Profile:** check the website link points to `https://strikearms.ie`, and the name, address and hours match the site footer.
- [ ] **Watch the migration:** in Search Console, check Pages and the old URLs weekly for the first month. Add any old URL that shows as 404 to `public/_redirects`.
- [ ] **Clear test data before handing the site to Alan:** test orders (sandbox and live), test customers, test enquiries and failed-email rows. The stuck sandbox order on the health card goes with them.
