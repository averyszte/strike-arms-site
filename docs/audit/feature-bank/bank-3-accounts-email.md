# Feature bank 3: customer accounts, inquiries and forms, email

Source: a read-only pass over the worktree `confident-sammet-18385d` (branch `claude/confident-sammet-18385d`, head bc14169), 2026-11-14. Where the code and the docs disagree, the code wins.

Paths are shortened as follows:
- `src/` = `artifacts/strike-arms/src/`
- `mig/` = `supabase/migrations/`
- `fn/` = `supabase/functions/`
- `tpl/` = `supabase/templates/`
- `nw/` = `fn/notification-worker/`

Status key:
- **working**: the code is complete and wired up end to end.
- **partial**: works, but with a gap.
- **stub**: a placeholder only.
- **not deployed**: needs a manual step on the hosted project that this repo cannot prove has been done.
- **unknown**: the hosted state cannot be seen from the repo.

Line numbers are approximate, to within a few lines.

---

## A. Customer accounts and auth

### A1. Sign-up

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-001 | Sign-up page at /account/sign-up (form, then a code step) | src/pages/AccountSignUp.tsx, src/hooks/use-customer-sign-up.ts | Supabase Auth signUp | working | `enable_signup = true` in config.toml is local only. The hosted toggle is set in the dashboard (docs/admin-auth-emails.md), so its live state is unknown. |
| A-002 | Full name is sent as user metadata at sign-up | src/data/customer-auth-repository.ts | auth.users raw_user_meta_data | working | The handle_new_customer trigger copies it into customer_profiles (mig/034). |
| A-003 | emailRedirectTo is /account/confirm | src/data/customer-auth-repository.ts | Auth redirect allow-list | not deployed | The hosted redirect allow-list must include `https://<live>/account/**`. config.toml covers localhost only. |
| A-004 | An existing account is flagged as user_already_exists (identities.length === 0) | src/data/customer-auth-repository.ts | Auth | working | Deliberately allows email enumeration (Phil's choice). Record it as an accepted risk in the audit. |
| A-005 | Password policy: 12 or more characters, with upper, lower and digit | src/lib/password-policy.ts, supabase/config.toml | Auth password rules | partial | The client mirrors config.toml, but the hosted rules are set in the dashboard. Leaked-password protection needs the Pro plan. |
| A-006 | Pwned or weak password error is mapped to friendly copy | src/lib/password-policy.ts, src/lib/customer-auth-errors.ts | Auth error codes | working | Only effective if leaked-password protection is on in the hosted project. |
| A-007 | Zod sign-up validation | src/lib/customer-account-validation.ts | none | working | |
| A-008 | Email-code step after sign-up (6-digit {{ .Token }}) | src/pages/AccountSignUp.tsx (EmailCodeStep) | verifyOtp type 'email' | working | Depends on the hosted confirmation template including the code. |
| A-009 | Resend sign-up confirmation | src/data/customer-auth-repository.ts (resend type 'signup') | Auth | working | Subject to Supabase's email rate limit. Very low without custom SMTP. |
| A-010 | Confirmation link page /account/confirm redeems token_hash, then goes to /account | src/pages/AccountConfirm.tsx, src/hooks/use-customer-email-link.ts | verifyOtp | working | The query redeems once, so a refetch cannot reuse the token. It only works if the hosted template uses the token_hash link, not the default ConfirmationURL. |
| A-011 | Profile row is created automatically on sign-up | mig/034 (handle_new_customer trigger on auth.users) | customer_profiles | working | Also fires for invited admins, so admins get a customer profile too. Harmless, but note it. |
| A-012 | No age (18+) confirmation at sign-up | none | none | partial | Age is only checked at checkout (see hand-offs). Confirm the business accepts this for an airsoft shop. |
| A-013 | No CAPTCHA on Auth sign-up or sign-in | supabase/config.toml (no [auth.captcha]) | Auth | partial | Bot sign-ups are limited only by Supabase's rate limits. Turnstile is not wired into Auth. |

### A2. Sign-in, sign-out and session

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-014 | Sign-in page at /account/sign-in with email and password | src/pages/AccountSignIn.tsx, src/components/account/SignInForm.tsx, src/hooks/use-customer-sign-in.ts | signInWithPassword | working | |
| A-015 | An unconfirmed email on sign-in leads to the code step | src/pages/AccountSignIn.tsx | Auth email_not_confirmed | working | |
| A-016 | Sign-in schema needs a password of at least 1 character | src/lib/customer-account-validation.ts | none | working | Correct, but SignInForm.tsx:132 still shows PASSWORD_HINT on sign-in, which is confusing for older accounts. |
| A-017 | Auth error code map | src/lib/customer-auth-errors.ts | none | partial | `insufficient_aal` is not mapped, so it falls back to the generic text. This matters if an admin uses the customer pages. |
| A-018 | Session hook: getSession plus onAuthStateChange | src/hooks/use-customer-session.ts | Auth | working | |
| A-019 | SIGNED_OUT clears the customer react-query caches | src/hooks/use-customer-session.ts | none | working | Check that no order or profile data stays on screen after signing out on a shared device. |
| A-020 | Sign out from /account/details | src/pages/AccountDetails.tsx | signOut (global scope by default) | working | Global scope signs out every device. That may surprise customers, but it is the safer choice. |
| A-021 | Header account icon links to /account | src/components/SiteHeader.tsx:116 | none | partial | The icon is static and never shows signed-in state. |
| A-022 | Mobile drawer has "Your Account" and "Track an Order" links; UtilityBar has "Track an Order" | src/components/SiteHeader.tsx, UtilityBar | none | working | |

### A3. Password reset and change

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-023 | Request a reset email | src/pages/AccountReset.tsx, src/hooks/use-customer-password-reset.ts | resetPasswordForEmail, redirectTo /account/reset | working | Depends on the hosted recovery template and the redirect allow-list. |
| A-024 | Reset by link (token_hash, type recovery) | src/pages/AccountReset.tsx, tpl/recovery.html | verifyOtp | working | The recovery template is shared with admin reset (see hand-offs). |
| A-025 | Reset by 6-digit code | src/pages/AccountReset.tsx | verifyOtp type 'recovery' | working | |
| A-026 | New password form after redeeming | src/pages/AccountReset.tsx, which imports @/components/admin/NewPasswordForm | updateUser | partial | Cross-area import: customer page depends on an admin component. After redeeming, the customer is signed in even if they abandon the form, so the old password still works and the session stays open. |
| A-027 | Password change re-checks the current password first | src/hooks/use-customer-account-actions.ts, PasswordChangeCard | signInWithPassword, then updateUser | working | |

### A4. Profile and preferences

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-028 | Account details page /account/details | src/pages/AccountDetails.tsx | none | working | Five cards plus sign-out. |
| A-029 | Edit full name (up to 120) and phone (up to 30) | ProfileCard, src/hooks/use-customer-profile.ts, src/data/customer-account-repository.ts | customer_profiles | working | Column grants allow customers to update full_name and phone only (mig/034). |
| A-030 | RLS on customer_profiles: own row, plus admin aal2 select | mig/034 | RLS | working | |
| A-031 | Marketing opt-in toggle with timestamp | MarketingCard, mig/034 set_marketing_opt_in | customer_profiles.marketing_opt_in(_at) | stub | Stored but read nowhere else: no list, export or sender. Either build the consumer or hide the toggle before launch. |
| A-032 | Email change request | EmailChangeCard, src/data/customer-auth-repository.ts requestEmailChange (emailRedirectTo /account/details) | updateUser email | partial | config.toml has no [auth.email.template.email_change] entry. tpl/email-change.html uses the default {{ .ConfirmationURL }}, unlike the other token_hash templates, and /account/details does not redeem a token_hash. Test end to end on the hosted project. |
| A-033 | Checkout prefill from session and profile (name, email, phone) | src/hooks/use-checkout-prefill.ts | customer_profiles | working | |

### A5. Orders in the account

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-034 | /account landing: MyOrders plus GuestOrderLookup when signed in; SignInPrompt plus lookup when signed out | src/pages/Account.tsx | none | working | |
| A-035 | ?order= pre-fills the guest lookup | src/pages/Account.tsx | none | working | This is the link format the emails use (nw/templates/order-blocks.ts trackOrderUrl). |
| A-036 | my_orders() RPC: own orders with items and fulfilment history, no staff fields | mig/034 | SECURITY DEFINER RPC | working | Filters user_id = auth.uid() and order_number not null, so abandoned drafts are hidden. |
| A-037 | Guest orders are claimed automatically by confirmed email | mig/034:185-212 claim_my_guest_orders, src/hooks/use-my-orders.ts | orders.user_id | working | Requires email_confirmed_at. Matches lower(trim(customer_email)) and only rows where user_id is null. Runs before every fetch, which is a cheap extra RPC on each load. |
| A-038 | Signed-in checkout links the order to the user | fn/create-checkout-session/signed-in-customer.ts | orders.user_id from the verified JWT | working | Falls back to guest checkout on any failure, silently. A-037 picks the order up later anyway. |
| A-039 | orders.user_id references auth.users with on delete set null | mig/034 | FK | working | Orders survive account deletion (needed for accounting). |
| A-040 | Authenticated grants on orders, order_items and order_status_log are narrowed | mig/034:242-252 | grants | working | Customers read only through my_orders(), not direct selects. |
| A-041 | Create-account nudge on CheckoutSuccess for paid guest orders | src/components/.../CreateAccountNudge | none | working | |

### A6. Your data: export and deletion

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| A-042 | Data export as JSON download | YourDataCard, src/hooks/use-customer-account-actions.ts | profile plus my_orders | partial | Export leaves out inquiries submitted under the same email, the auth email history and marketing timestamps. Decide whether it is a complete GDPR subject-access export. |
| A-043 | Delete account dialog asks for the password | YourDataCard (AlertDialog), src/data/customer-account-repository.ts deleteCustomerAccount | fn/delete-account | working | Signs out locally after the call. |
| A-044 | delete-account function: JWT user, password re-check on a throwaway anon client, refuses admins, auth.admin.deleteUser | fn/delete-account/index.ts | Auth admin API | working | No rate limit. The password check runs before the admin check (around lines 53-61), so the function is a password oracle for admin accounts too. A wrong password returns 200 {deleted:false}. All checks come from the function's IP, so Supabase auth IP limits may hit. |
| A-045 | After deletion, profile is removed (cascade) and orders are kept with user_id null | mig/034 | FK | working | Order rows still hold name, email and address. Make sure the privacy notice says so. |

---

## I. Inquiries and forms

### I1. Contact form

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| I-001 | Contact form (name, email, phone, subject, message, consent) | src/components/contact/contact-form.tsx | fn/submit-inquiry | working | The comment at line 26 still says "Nothing emails yet". It is stale since mig/039. |
| I-002 | Client validation (zod) | src/lib/inquiry-validation.ts | none | partial | Client message cap is 2000, server cap is 5000. Harmless but inconsistent. |
| I-003 | Consent checkbox, required | contact-form.tsx, fn/submit-inquiry/index.ts | server rejects consent !== true | working | Check that the consent wording links to the privacy page. |
| I-004 | Honeypot field (moved off-screen, autoComplete off) | src/components/contact/honeypot-field.tsx | none | working | A filled honeypot fakes success on the client, and nothing is sent. |
| I-005 | Minimum fill time of 3 seconds | contact-form.tsx | none | working | Fakes success when too fast. Client-only, so a direct POST bypasses it (Turnstile still applies). |
| I-006 | Turnstile widget (action 'inquiry') | src/hooks/use-turnstile.ts, src/components/BotCheck.tsx, src/types/turnstile.ts | Cloudflare Turnstile | partial | With no VITE site key, no widget renders and the token is null, so the server returns 503 unless ALLOW_INSECURE_NO_CAPTCHA=true. The widget is reset after each mutate. |
| I-007 | Error fallback text shows the shop phone number | contact-form.tsx | none | working | |
| I-008 | Success state after send | contact-form.tsx | none | working | |

### I2. Service quote forms

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| I-009 | Service quote form on 6 service pages (through ServiceLayout and ServiceQuoteBlock) | src/components/service/ServiceQuoteForm.tsx | fn/submit-inquiry | working | |
| I-010 | Subject is built as `Quote request — <service>` | src/lib/service-quote.ts quoteSubject | none | working | The prefix is duplicated in nw/templates/owner-new-inquiry.ts QUOTE_PREFIX. If one changes, owner emails lose the "Quote request" kind. |
| I-011 | Message composed from the gun model (up to 120 characters) and notes | src/lib/service-quote.ts composeQuoteMessage | none | working | |
| I-012 | Same honeypot, timing, Turnstile and consent as the contact form | ServiceQuoteForm.tsx | as I-003 to I-006 | working | |

### I3. submit-inquiry Edge Function

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| I-013 | Public function, verify_jwt false | fn/submit-inquiry/index.ts, supabase/config.toml | Edge Function | unknown | Deploy state unknown. mig/036 says to deploy it BEFORE 036, otherwise forms break. |
| I-014 | Server field limits: name 200, email 254, phone 30, subject 200, message 5000, sourcePage 200 | fn/submit-inquiry/index.ts | none | working | |
| I-015 | Turnstile verification on the server: action, hostname, 8-second timeout, fail closed | fn/_shared/turnstile.ts | Cloudflare siteverify | partial | If SITE_HOSTNAME is unset, any hostname passes (around line 193). Set it in function secrets. |
| I-016 | Rate limit of 5 per hour per email | fn/submit-inquiry/index.ts:99-117, fn/_shared/rate-limit.ts | hit_rate_limit RPC | partial | Counted BEFORE Turnstile, so unverified requests can use up a real customer's email quota and lock them out for an hour. |
| I-017 | Rate limit of 5 per 10 minutes per IP | same, fn/_shared/client-ip.ts | hit_rate_limit | partial | Also counted before Turnstile. IP is the first x-forwarded-for entry, or cf-connecting-ip. Check which header is trustworthy behind Supabase's edge, since the first XFF entry can be spoofed by the client. |
| I-018 | Rate limiter fails closed on errors | fn/_shared/rate-limit.ts | none | working | A DB hiccup blocks all inquiries. That is the intended choice. |
| I-019 | Insert with the service role | fn/submit-inquiry/index.ts | inquiries table | working | |

### I4. Database: rate limits, lockdown and notifications

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| I-020 | rate_limit_hits table plus atomic hit_rate_limit upsert (service_role only) | mig/035 | Postgres | unknown | Keys are HMAC'd with the service-role key, so no raw emails or IPs are stored. |
| I-021 | Nightly purge of rate-limit rows older than a day (cron '17 3 * * *') | mig/035 | pg_cron | unknown | Needs pg_cron enabled on the hosted project. |
| I-022 | Inquiries lockdown: anon insert policy dropped; authenticated keeps select and update(status) only | mig/036 (policies from mig/002 and mig/023) | RLS | unknown | Read is admin aal2 (023). Check the hosted policy list matches. |
| I-023 | New inquiry queues an owner email (AFTER INSERT trigger) | mig/039 inquiries_queue_notification | notification_jobs | working | No auto-reply to the customer (see E table). |

### I5. Admin inquiries

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| I-024 | Inquiries page with status tabs (all, new, replied, archived) | src/pages/admin/InquiriesPage.tsx, src/components/admin/InquiriesTable.tsx, src/hooks/use-inquiries.ts | inquiries select | working | |
| I-025 | Inline status select in the table | InquiriesTable.tsx, src/data/inquiries-repository.ts updateInquiryStatus | update(status) | working | |
| I-026 | Load more (count plus a growing limit) | src/data/inquiries-repository.ts | none | working | The growing limit refetches every row each time. Fine at small volumes. |
| I-027 | Detail sheet: message, source page, status, mailto "Re: subject", tel link | src/components/admin/InquiryDetailSheet.tsx | none | working | Replies happen in the owner's own mail client, so nothing logs that a reply was sent. Status "replied" is set by hand. |
| I-028 | Dashboard count of new inquiries | DashboardPage (useInquiries('new',1)) | none | working | |
| I-029 | Sidebar link to Inquiries | admin sidebar | none | working | |

---

## E. Email: Resend and the notification outbox

### E1. Outbox schema and producers

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-001 | notification_jobs table: event_type check, subject ids, recipient, payload, status, attempts, next_attempt_at, last_error, sent_at | mig/030, mig/031, mig/039 | Postgres | working | num_nonnulls(order_id, product_id, inquiry_id) = 1 (039). |
| E-002 | RLS: admin aal2 select only; service_role all | mig/030 | RLS | working | |
| E-003 | Orders trigger on payment_status, fulfillment_status and refund_cents | mig/030, revised in mig/033 | trigger | working | Emails are queued in the same transaction as the order change (transactional outbox). |
| E-004 | Order-confirmed producer: pending or abandoned to paid, with a customer_email | mig/033 | trigger | working | |
| E-005 | Owner order-paid producer: web channel orders only | mig/033 | trigger | working | Counter sales do not notify the owner. Intended. |
| E-006 | Status-changed producer: is_status_email_due (moved forward or cancelled; paid or part refunded, or refunded for cancelled; not counter; never pending) | mig/033 | trigger | working | |
| E-007 | Status email is deduplicated by NOT EXISTS on the same order and status | mig/033:79-85 | trigger | working | Moving back and then forward again never re-emails that status. Admins must use resend. |
| E-008 | Refunded producer: refund_cents rises, payload holds refunded_now_cents | mig/033 | trigger | working | Two quick partial refunds give two emails, which is correct. |
| E-009 | Owner low-stock producer | mig/031 (added), mig/038 (trigger dropped, unsent jobs deleted around line 40) | none | stub | Retired. The event type is kept for history. The worker throws "nothing to send about" on such jobs (nw/build-email.ts:158). |
| E-010 | Owner new-inquiry producer | mig/039 | trigger | working | |
| E-011 | "owner" recipient resolved at send time from OWNER_EMAIL | mig/030, nw/index.ts | function secret | not deployed | If OWNER_EMAIL is missing, every owner job fails. |

### E2. Claim, retry and scheduling

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-012 | claim_notification_jobs(p_limit): for update skip locked, 5-minute lease, attempt_count + 1 at claim, limit capped at 50 | mig/030 | RPC | working | An expired lease can claim the same job twice. The Idempotency-Key covers this within 24 hours. |
| E-013 | complete_notification_job: sent, or backoff of attempt² minutes, failed at 5 attempts or more | mig/030 | RPC | partial | A job is marked failed ONLY here. If the worker crashes or the completion call fails (only logged, nw/index.ts:76-84), the job is re-claimed every 5 minutes for ever, with attempt_count climbing and no dead-letter. After the 24-hour key window a duplicate email can go out. |
| E-014 | invoke_notification_worker posts only when a job is due | mig/030 | pg_net, Vault | not deployed | Needs the Vault secret named `service_role_key`. |
| E-015 | Cron every minute through schedule_notification_worker(project_url) | mig/030 | pg_cron | not deployed | Must be run once by hand in the SQL editor with the live project URL. Without it, nothing ever sends. |
| E-016 | Worker caller check (verify_jwt true plus isServiceRoleCaller) | nw/index.ts, fn/_shared/service-role-caller.ts | Auth admin API | working | Constant-time compare with SUPABASE_SERVICE_ROLE_KEY, or a JWT role claim confirmed through /auth/v1/admin/users. |
| E-017 | Batch of 10, sent one after another | nw/index.ts BATCH_SIZE | none | working | About 10 emails a minute at most. Fine for this shop. |
| E-018 | Worker logs with console.error | nw/index.ts | function logs | working | Allowed in functions. Nothing alerts anyone on failures; the admin only sees them in OrderEmailsSection. |

### E3. Building and sending

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-019 | Routes event types to templates | nw/build-email.ts | none | working | An unknown type throws, so the job retries and then fails (no silent skip). |
| E-020 | Fresh order load at send time; throws without order_number | nw/load-order.ts | orders | working | Email content reflects the current order, not the state at queue time. |
| E-021 | Fresh inquiry load | nw/load-inquiry.ts | inquiries | working | |
| E-022 | Resend client: Idempotency-Key = job id, throws on non-2xx, requires RESEND_API_KEY, no EMAIL_FROM fallback | fn/_shared/resend.ts | Resend API | not deployed | Needs RESEND_API_KEY, EMAIL_FROM (on a domain verified in Resend, with SPF and DKIM) and REPLY_TO secrets. |
| E-023 | replyTo: template value, otherwise REPLY_TO | nw/index.ts | none | working | |
| E-024 | Owner order-paid replyTo is the customer email | nw/build-email.ts:131 | none | working | |
| E-025 | Owner inquiry replyTo is the visitor's typed email | nw/build-email.ts:156 | none | working | Not verified. Spoofable, but expected for a contact form. |

### E4. Templates (transactional)

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-026 | Shared layout, HTML plus plain text | nw/templates/layout.ts | none | working | SHOP constants (name, address, phone) are duplicated by hand from site-config. If they drift, emails show stale details. |
| E-027 | Shared order blocks: collection lines (photo ID 18+), progress steps, track link `/account?order=` | nw/templates/order-blocks.ts | none | working | The track link depends on the SITE_URL value. Check it is the live domain. |
| E-028 | Order confirmed: "Order X confirmed", next steps, needs-attention line | nw/templates/order-confirmed.ts | none | working | |
| E-029 | Owner order paid: "[Needs attention]" prefix when it applies, link to /admin/orders | nw/templates/owner-order-paid.ts | none | working | |
| E-030 | Refunded: "Refund for order X" | nw/templates/refunded.ts | none | working | |
| E-031 | Status changed: copy for packed, shipped, delivered, ready_for_pickup, collected and cancelled; An Post tracking link when there is a tracking number and the order is shipped or delivered | nw/templates/status-changed.ts | orders.tracking_number (mig/033) | working | A status with no copy throws (around line 200). Any new fulfilment status needs copy here first. |
| E-032 | Owner new inquiry: "kind: topic (name)" | nw/templates/owner-new-inquiry.ts | none | working | QUOTE_PREFIX coupling, see I-010. |

### E5. Admin view and resend

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-033 | Order emails list in the order sheet: label, status badge, recipient, time, last error | src/components/admin/OrderEmailsSection.tsx, src/hooks/use-order-emails.ts, src/data/order-emails-repository.ts, src/lib/order-email-display.ts | notification_jobs select (admin aal2) | working | No polling. Pending to sent changes are not seen until a refetch. |
| E-034 | Resend button for an eligible email | same, plus mig/031 resend_notification | RPC | working | Requires is_admin_aal2. Refuses pending jobs and product jobs. Sends a NEW job to the order's current customer_email (with a new idempotency key). Toast says "It goes out within a minute", which is only true if E-015 is scheduled. |
| E-035 | Inquiry emails have no admin view or resend | none | none | partial | A failed owner.new_inquiry is visible only in the DB or logs. The inquiry itself is still on the Inquiries page, so this is low risk. |

### E6. Supabase Auth emails

| ID | Feature | Files | Backend | Status | Watch |
|---|---|---|---|---|---|
| E-036 | Branded auth templates generated from the shared layout | tpl/render.ts, tpl/auth-emails.ts, tpl/paste-page.ts, tpl/paste-into-supabase.html, tpl/sample-orders.ts | none | working | Generated HTML must be pasted into the hosted dashboard by hand (docs/admin-auth-emails.md; do not run config push). |
| E-037 | Confirm sign-up template: token_hash link with RedirectTo, type=email, plus 6-digit code | tpl/confirmation.html | Auth | not deployed | |
| E-038 | Recovery template: token_hash link with RedirectTo, type=recovery, plus code | tpl/recovery.html | Auth | not deployed | Shared by customers and admins. RedirectTo decides which page gets the link. |
| E-039 | Invite template: {{ .SiteURL }}/auth/confirm type=invite | tpl/invite.html | Auth | not deployed | Uses SiteURL, so if the hosted Site URL is still localhost, invites break. |
| E-040 | Email change template: default {{ .ConfirmationURL }} | tpl/email-change.html | Auth | partial | Missing from config.toml and inconsistent with the token_hash pattern. See A-032. |
| E-041 | Custom SMTP through Resend (smtp.resend.com:465, user resend) | docs/admin-auth-emails.md | Auth SMTP | not deployed | Without it, Supabase's built-in sender has tight hourly limits and is meant for testing only. Sign-up should be turned on only after SMTP works. |
| E-042 | Hosted Site URL and redirect allow-list | docs/admin-auth-emails.md, supabase/config.toml (local only) | Auth | not deployed | Must be the live domain at go-live. |

---

## Email type table

| Email type | Trigger | Template file | Recipient | Idempotency |
|---|---|---|---|---|
| customer.order_confirmed | payment_status moves from pending or abandoned to paid, with a customer_email (mig/033) | nw/templates/order-confirmed.ts | order customer_email | Job created once per transition; Resend Idempotency-Key = job id (24 h) |
| owner.order_paid | Same transition, web channel only | nw/templates/owner-order-paid.ts | OWNER_EMAIL (replyTo the customer) | Job id |
| customer.status_changed | Fulfilment moves forward or to cancelled, per is_status_email_due (mig/033) | nw/templates/status-changed.ts | order customer_email | Job id, plus NOT EXISTS for the same order and status (mig/033:79-85) |
| customer.refunded | refund_cents rises | nw/templates/refunded.ts | order customer_email | Job id (one job per increase) |
| owner.new_inquiry | INSERT on inquiries (mig/039) | nw/templates/owner-new-inquiry.ts | OWNER_EMAIL (replyTo the visitor) | Job id |
| owner.low_stock | Retired: trigger dropped in mig/038 | none (worker throws) | OWNER_EMAIL | n/a |
| Admin resend (any order type above) | resend_notification(job_id), admin aal2 (mig/031) | Same template as the original type | Order's CURRENT customer_email, or owner | New job id, so a new key; not deduplicated against the original |
| Supabase: confirm sign-up | signUp, or resend type 'signup' | tpl/confirmation.html (pasted in the dashboard) | New user | Supabase's own rate limits |
| Supabase: recovery | resetPasswordForEmail (customer or admin) | tpl/recovery.html | User | Supabase |
| Supabase: invite | Admin invite | tpl/invite.html | Invitee | Supabase |
| Supabase: email change | updateUser({ email }) | tpl/email-change.html (not in config.toml) | Old and/or new address, per secure email change setting | Supabase |
| Customer inquiry auto-reply | none | none | none | Not implemented |
| Marketing / newsletter | none (marketing_opt_in is stored only) | none | none | Not implemented |

---

## Cross-area hand-offs

- **Checkout.**
  - The age confirmation (18+) lives only at checkout: CheckoutForm ageConfirmed, enforced on the server in fn/create-checkout-session/parse-request.ts:137 and stored as age_verified in build-order.ts:44.
  - Signed-in orders take user_id from the verified JWT (signed-in-customer.ts) and fall back to guest checkout without telling anyone.
  - Turnstile action 'checkout' shares fn/_shared/turnstile.ts, so the SITE_HOSTNAME gap applies there too.
  - Prefill comes from use-checkout-prefill.
- **Stripe webhook.** confirm_order_paid setting payment_status = paid is what queues customer.order_confirmed and owner.order_paid. If the webhook fails, no confirmation email goes out.
- **Order lookup and guest tracking.** Every customer email links to `/account?order=`. That page uses the order-lookup function (verify_jwt false, Turnstile action 'order-lookup'). That flow belongs to the orders bank.
- **Admin orders.**
  - Fulfilment status changes trigger customer.status_changed. Adding a new status needs copy in status-changed.ts, or its jobs fail.
  - tracking_number (with a format check in mig/033) feeds the An Post link.
  - refund-order raising refund_cents triggers customer.refunded.
  - OrderEmailsSection resend sits in the order sheet.
  - Correcting a mistyped customer_email and resending is the documented fix.
- **Admin auth.**
  - Invites use /auth/confirm, and Site URL decides where they point.
  - The recovery template is shared between customers and admins.
  - Admin reads of notification_jobs, inquiries and customer_profiles all need aal2 (MFA).
  - delete-account refuses admins, but only after checking the password.
  - handle_new_customer creates profiles for admins too.
- **Deploy and launch runbook.**
  - Function secrets: RESEND_API_KEY, EMAIL_FROM, REPLY_TO, OWNER_EMAIL, SITE_URL, SITE_HOSTNAME and TURNSTILE_SECRET_KEY. ALLOW_INSECURE_NO_CAPTCHA must NOT be set.
  - Front-end env: the Turnstile site key.
  - Vault secret `service_role_key`.
  - Run schedule_notification_worker('<live project url>') once.
  - pg_cron and pg_net must be enabled.
  - Deploy submit-inquiry before applying mig/036.
  - Supabase dashboard: Resend SMTP, the pasted templates, Site URL, redirect allow-list (/account/** and /auth/confirm), sign-up toggle, password rules, leaked-password protection (Pro plan).
  - Resend domain verification with SPF and DKIM.
- **Privacy and legal.**
  - Contact-form consent wording.
  - The data export is incomplete (no inquiries).
  - After deletion, orders keep personal data.
  - marketing_opt_in is collected with no consumer.
  - Inquiry rows have no retention or purge job. Rate-limit rows are purged daily.
- **Security bank.**
  - Turnstile hostname check skipped when SITE_HOSTNAME is unset.
  - Rate limit counted before Turnstile.
  - delete-account has no rate limit.
  - The first X-Forwarded-For entry is trusted as the client IP.
  - There is no CAPTCHA on Auth.
  - Email enumeration on sign-up is accepted.

---

Feature count: 45 accounts (A-001 to A-045), 29 inquiries (I-001 to I-029), 42 email (E-001 to E-042) = **116 features**.
