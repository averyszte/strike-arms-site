# Auth emails, password policy and invites (admins and customers)

How admin invites, customer sign-up, password resets and email changes work,
and the hosted Supabase settings they depend on. `supabase/config.toml` only
configures the local stack. The hosted project (cxnhkgndvzgyqhiwsvrr) is set
by hand in the dashboard, as below. Do not run `supabase config push`, because
it would also push the localhost `site_url` to production.

## How the links work

The invite, confirmation and recovery emails carry a `token_hash` link rather
than Supabase's default link. The page reads the hash and redeems it with
`verifyOtp`, which signs the person in. This works on any device. The
confirmation and recovery emails also carry a 6-digit code, which the customer
can type on the page instead (mail scanners sometimes use up a link before the
customer clicks it).

| Email                | Lands on                                             | Page                  |
| -------------------- | ---------------------------------------------------- | --------------------- |
| Invite user (admin)  | `/auth/confirm?token_hash=...&type=invite`           | `AcceptInvitePage`    |
| Reset password       | `/admin/reset-password?token_hash=...&type=recovery` | `ResetPasswordPage`   |
|                      | `/account/reset?token_hash=...&type=recovery`        | `AccountReset`        |
| Confirm sign-up      | `/account/confirm?token_hash=...&type=email`         | `AccountConfirm`      |
| Change email address | Supabase default link, back to `/account/details`    | `AccountDetails`      |

There is one recovery template for admins and customers. It links to
`{{ .RedirectTo }}`, which the page that asked for the reset sets: the admin
login asks for `/admin/reset-password`, the customer reset page for
`/account/reset`. The confirmation template does the same with
`/account/confirm`.

**`RedirectTo` must be on the redirect allow-list (section 2).** If it is not,
Supabase silently swaps in the Site URL and the link lands on the home page,
which does nothing with it.

Recovery signs the person in at aal1. If an admin account has an
authenticator, Supabase refuses a password change until the session is aal2,
so the admin reset page asks for a code first. Customers have no MFA in v1.

## 1. Email templates

Dashboard > Authentication > Emails.

- **Invite user**: subject `Your Strike Arms admin invite`. Body: paste
  `supabase/templates/invite.html`.
- **Reset password**: subject `Reset your Strike Arms password`. Body: paste
  `supabase/templates/recovery.html`. It is worded for both admins and
  customers.
- **Confirm sign up**: subject `Confirm your Strike Arms account`. Body: paste
  `supabase/templates/confirmation.html`.
- **Change email address**: leave Supabase's default. It is sent to both the
  old and the new address, and the change goes through once both are
  confirmed ("Secure email change", on by default).

Until these are pasted, the hosted project sends Supabase's default emails,
and their links do not reach the pages above.

## 2. Site URL and redirect allow-list

Dashboard > Authentication > URL Configuration.

**Site URL.** The invite template builds its link from `{{ .SiteURL }}`, and
Supabase falls back to it for any redirect that is not allowed.

- For testing now, use `http://localhost:5173`.
- At go-live, use the live domain, e.g. `https://strikearms.ie`. Invites sent
  before the change point at localhost. This is on the checklist in
  `docs/launch-runbook.md`.

**Redirect URLs.** Add each of these for every place the site is served
(`http://localhost:5173`, the live domain, and
`https://*.strike-arms-site.pages.dev` for previews):

- `<origin>/account/**` (confirm, reset and the email change return)
- `<origin>/admin/reset-password`

For example `https://strikearms.ie/account/**`.

## 3. Sign-up

Dashboard > Authentication > Sign In / Providers.

- **Allow new users to sign up**: on. Do this only once custom SMTP (section
  6) works, or confirmation emails will hit the built-in sender's limit.
- **Email provider > Confirm email**: on. An account cannot sign in until its
  email is confirmed, and only then are earlier guest orders with that email
  linked to it.

A self-signed-up customer never gets an `admins` row (see "Invites make
admins" below), so sign-up gives no access to the admin. The admin login
refuses a customer account.

## 4. Password policy

Dashboard > Authentication > Sign In / Providers > Email.

- Minimum password length: **12**
- Password requirements: **Lowercase, uppercase letters and digits**
- **Prevent use of leaked passwords**: on (a Pro plan feature). A password
  found in a breach is refused with its own message on every form.

The policy is project-wide, so customers get the same rule as admins. These
must match `src/lib/password-policy.ts`, which the forms check against before
sending. If only the dashboard changes, the forms accept a password that
Supabase then rejects. The rejection still shows as an error, but the hint
will be wrong.

## 5. Delete account

Customers delete their own account from `/account/details`. The
`delete-account` Edge Function checks the password again, refuses admin
accounts, and deletes the auth user. The profile goes with it; orders stay (a
sales record) with `user_id` set to null. Deploy it with:

```bash
npx supabase functions deploy delete-account
```

## 6. Sending limits

Supabase's built-in email sender allows only a handful of emails an hour, and
is meant for testing. Invites, confirmations and resets are unreliable until
custom SMTP (Resend, `smtp.resend.com`, port 465, user `resend`) is configured
under Authentication > Emails > SMTP Settings.

## Invites make admins

Migration `024_admin_invites.sql` adds a trigger on `auth.users`: any user
created by an invite gets an `admins` row. So:

- **Inviting someone** (Dashboard > Authentication > Users > Invite user)
  gives them full admin access once they set a password and enrol two-factor.
  Only invite people who should run the shop.
- **Creating a user any other way** (Add user, or signing up on the site) does
  not make them an admin.
- **Removing an admin**: delete their user in Authentication > Users, or
  delete their row from `public.admins`. Deleting the row leaves the login in
  place, but the account can no longer see anything in the admin.

If `supabase db push` refuses 024 because it touches `auth.users`, run the
file in the SQL editor instead.
