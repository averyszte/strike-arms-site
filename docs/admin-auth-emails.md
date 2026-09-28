# Admin auth emails, password policy and invites

How admin invites and password resets work, and the hosted Supabase settings
they depend on. `supabase/config.toml` only configures the local stack. The
hosted project (cxnhkgndvzgyqhiwsvrr) is set by hand in the dashboard, as
below. Do not run `supabase config push`, because it would also push the
localhost `site_url` to production.

## How the links work

Both emails carry a `token_hash` link rather than Supabase's default link.
The page reads the hash and redeems it with `verifyOtp`, which signs the
person in. This works on any device and does not depend on redirect URLs.

| Email          | Lands on                                             | Page                  |
| -------------- | ---------------------------------------------------- | --------------------- |
| Invite user    | `/auth/confirm?token_hash=...&type=invite`           | `AcceptInvitePage`    |
| Reset password | `/admin/reset-password?token_hash=...&type=recovery` | `ResetPasswordPage`   |

Recovery signs the person in at aal1. If the account has an authenticator,
Supabase refuses a password change until the session is aal2, so the reset
page asks for a code first.

## 1. Email templates

Dashboard > Authentication > Emails.

- **Invite user**: subject `Your Strike Arms admin invite`. Body: paste
  `supabase/templates/invite.html`.
- **Reset password**: subject `Reset your Strike Arms admin password`. Body:
  paste `supabase/templates/recovery.html`.

Until these are pasted, the hosted project sends Supabase's default emails,
and their links do not reach the pages above.

## 2. Site URL

Dashboard > Authentication > URL Configuration.

The templates build links from `{{ .SiteURL }}`, so this decides where the
emails point.

- For testing now, use `http://localhost:5173`.
- At go-live, use the live domain, e.g. `https://strikearms.ie`. Invites and
  resets sent before the change point at localhost. This is on the checklist
  in `docs/launch-runbook.md`.

## 3. Password policy

Dashboard > Authentication > Sign In / Providers > Email.

- Minimum password length: **12**
- Password requirements: **Lowercase, uppercase letters and digits**

These must match `src/lib/password-policy.ts`, which the forms check against
before sending. If only the dashboard changes, the forms accept a password
that Supabase then rejects. The rejection still shows as an error, but the
hint will be wrong.

Customer accounts are not in Supabase Auth yet; they are local placeholders.
When real customer accounts arrive, this policy and the recovery template
apply to them too. The recovery template points at `/admin/reset-password`,
so it will need a customer version at that point.

## 4. Sending limits

Supabase's built-in email sender allows only a handful of emails an hour, and
is meant for testing. Invites and resets are unreliable until custom SMTP
(Resend, Phase 3) is configured under Authentication > Emails > SMTP Settings.

## Invites make admins

Migration `024_admin_invites.sql` adds a trigger on `auth.users`: any user
created by an invite gets an `admins` row. So:

- **Inviting someone** (Dashboard > Authentication > Users > Invite user)
  gives them full admin access once they set a password and enrol two-factor.
  Only invite people who should run the shop.
- **Creating a user any other way** (e.g. Add user) does not make them an
  admin.
- **Removing an admin**: delete their user in Authentication > Users, or
  delete their row from `public.admins`. Deleting the row leaves the login in
  place, but the account can no longer see anything in the admin.

If `supabase db push` refuses 024 because it touches `auth.users`, run the
file in the SQL editor instead.
