# Customer accounts and order tracking: plan

Written 2026-09-29 from three research passes: the Strike Arms codebase, the All Blooms
order flow, and Supabase / OWASP / GDPR guidance (sources at the end). This reverses
decision D1 (guest lookup only in v1). Guest checkout and guest lookup stay; accounts sit on
top of them.

Part 1 (the tracker) is built: migration 033, not yet pushed. Part 2 is next. Phil's answers
(2026-09-29): every step emails, the project is on Supabase Pro, build both back to back.

## What we found

- **All Blooms has no customer tracking page and no timeline.** Customers get a static thank
  you page and an email on each status change, with no link back to the site. So the tracker is
  new work. What we take from All Blooms is the per-method wording and the outbox email
  pipeline, which Strike Arms already has (migrations 030 and 031).
- **Strike Arms is already ahead on the status model.** 025 has per-method lanes and a guard
  trigger: pickup `pending > ready_for_pickup > collected`, posted
  `pending > packed > shipped > delivered`, mixed interleaves both, `cancelled` is final, and
  nothing moves before payment. All Blooms had none of that.
- **Emails today:** order confirmed, ready for collection, posted, refunded. Nothing for
  packed, collected, delivered or cancelled. None of them link to the site. None send yet:
  Resend domain and secrets are still outstanding.
- **Every admin policy relies on "authenticated = staff" in the grants.** 004 gives
  `authenticated` `grant all` on orders, order_items and order_status_log. Row policies all
  check `is_admin_aal2()`, so a customer sees nothing today, but policies are permissive: the
  first "customer reads own orders" policy, stacked on `grant all`, would let a customer write
  any column the policy lets them reach. Grants must be narrowed in the same migration.
- **The 024/027 trigger turns anyone with `invited_at` into an admin.** Customers must never
  be created through the invite path (no "invite this guest to claim their order").
- **Sign-up is switched off on the hosted project**, and the auth emails go through Supabase's
  default mailer: 2 an hour, team addresses only. Customers cannot receive a confirmation
  email until custom SMTP (Resend) is set up.
- **`AdminAuthProvider` wraps the whole storefront** and runs admin checks for any session.
- **Checkout ignores who is signed in.** The function has `verify_jwt = false` and never reads
  the user. There is no `user_id` on orders.

## Part 1: the order tracker (no accounts needed, build first)

The tracker is a stepper: a line with a dot per step, the done steps filled, the current one
highlighted, dates under each step from `order_status_log`.

| Method | Steps |
|---|---|
| Posted | Order received > Packing > Posted > Delivered |
| Pickup | Order received > Ready to collect > Collected |
| Mixed | Order received > Packing > Ready to collect > Posted > Collected / Delivered (one line, labels say which items) |

Special states replace the line with a notice: not paid, cancelled, refunded (partial refund
shows the line plus a note).

Work:
1. `lib/order-timeline.ts`: pure function, method + status + log dates to steps. Reuses the
   025 lanes; one table, mirrored from `lib/order-transitions.ts`.
2. `components/order-lookup/OrderTimeline.tsx`: the stepper, lucide icons (Package, Truck,
   Store, CheckCircle), mobile vertical, desktop horizontal.
3. `order-lookup` function returns the status history (dates only, no staff names).
4. Status emails get a "Track your order" link to `/account?order=SA-...`. The lookup form
   pre-fills the number; the email still has to be typed, so the link leaks nothing.
5. **Decided: every step emails the customer** (packed, posted, delivered, ready to collect,
   collected, cancelled). 033 `is_status_email_due()`: forward moves only, paid orders only
   (cancelled: was paid), never a counter sale, and each status at most once per order.
6. **Decided: "Delivered" stays a step Alan ticks.** Posted orders get an optional An Post
   tracking number (`orders.tracking_number`, set on the order sheet) that shows as a link in
   the tracker and in the posted and delivered emails.
7. Admin: the status select says "(emails customer)" on the steps that do.

## Part 2: customer accounts

### Security groundwork (one migration, before sign-up is switched on)
- `customer_profiles (user_id pk -> auth.users on delete cascade, full_name, phone,
  marketing_opt_in bool default false, marketing_opt_in_at, created_at)`.
- `orders.user_id uuid null references auth.users on delete set null`, indexed.
- Narrow grants: revoke `all` on orders, order_items, order_status_log from `authenticated`;
  grant back only the columns the admin UI updates (fulfilment status, notes, archive), and
  `select`. Same audit for every other `grant all ... to authenticated`.
- Customer policies, `to authenticated`, SELECT only: orders where `user_id = auth.uid()`,
  items and status log through the order. Customers never write orders.
- Profile policies: read and update own row, `marketing_*` only through a function that stamps
  the time.
- `handle_new_customer` trigger on auth.users: security definer, `search_path = ''`, inserts a
  profile only, never reads metadata for a role, skips invited users.
- `verify-rls.sql` extended so a customer JWT is checked against every table.

### Auth
- Email and password, email confirmation on. Minimum 12 characters (the admin policy), no
  composition rules for customers, leaked password protection on (the project is on Pro; Phil switches it on in Auth settings).
- Password reset by a 6-digit code in the email, not a link (mail scanners burn links, and
  PKCE links fail in a different browser).
- Turnstile on sign-up, sign-in and reset (Supabase supports it natively). Same keys as item 17.
- Enumeration-safe copy: "Invalid email or password", "If an account exists, we've sent a
  code".
- Admin separation: `AdminAuthProvider` moves inside `/admin` only; a customer signing in at
  `/admin/login` is still signed out. Customer MFA: not in v1.
- Separate auth email templates for customers (sign-up confirmation, reset code); the existing
  ones are admin-worded.

### Pages
- `/account/sign-in`, `/account/sign-up`, `/account/reset`.
- `/account`: signed out shows sign-in plus the guest lookup; signed in shows order history
  (number, date, status, total) and each order with the tracker.
- `/account/details`: name, phone, email change (Supabase secure email change, confirms both
  addresses), password change, marketing opt-in (separate, unticked), delete account.
- Header: "Sign in" / "Account" link back next to the cart.

### Linking orders
- Checkout: `create-checkout-session` verifies the caller's JWT itself (the gateway doesn't),
  sets `user_id` from it, never from the body, and pre-fills the email.
- Claiming past guest orders: a service-role function, only for a confirmed email, only orders
  where the lowercased email matches and `user_id` is null. Run after confirmation and on
  request ("We found 2 earlier orders").
- After checkout as a guest, the success page offers "Create an account with this email".
  Uses the normal sign-up, never the invite path.

### GDPR
- Delete account: an Edge Function that re-checks the password, deletes the auth user and
  profile; orders keep their rows (6-year Revenue retention, TCA 1997 s.886) with `user_id`
  set null. The confirmation says what is kept and why.
- Data export: "Download my data" JSON of profile and orders.
- Privacy page: accounts, Supabase and Resend as processors, retention, the sign-in session as
  strictly necessary storage. Goes to Alan and the solicitor with item 26.

## Blockers outside the code (all on Phil)

1. Push migration 032 (service_role grants). Checkout and every function are broken until it
   is in.
2. Resend: verify the domain, set `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL`, schedule the
   worker. Without it no status email and no account email goes out.
3. Supabase Auth custom SMTP through Resend (`smtp.resend.com`, port 465, user `resend`).
4. Turnstile site and secret keys.
5. At launch: turn sign-up on, set the Site URL and redirect allow-list
   (`https://strikearms.ie/**`, `https://*.strike-arms-site.pages.dev/**`).

## Order of work

1. DONE in code: Part 1, the tracker and email links. Push 033, then redeploy order-lookup and
   notification-worker.
2. Accounts migration (groundwork above), with verify-rls updated. Phil pushes.
3. Auth pages, account pages, admin provider scoped to `/admin`.
4. Checkout link and guest-order claim.
5. Delete and export, privacy copy.
6. Switch sign-up on after 2-5 and the SMTP blocker are done.

## Sources

Supabase: auth rate limits, custom SMTP, custom access token hook and RBAC, password
security, managing user data, PKCE flow, sessions, MFA, row level security, email templates,
redirect URLs, captcha, the Oct 2026 change to Data API exposure of new tables. OWASP
Authentication Cheat Sheet. NIST SP 800-63B-4. Stripe Checkout Sessions API. Resend SMTP
with Supabase. Data Protection Commission, right to erasure. TCA 1997 s.886.
