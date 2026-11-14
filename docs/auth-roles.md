# Auth Roles

## Roles (v1)
- Admin
- Customer

**Staff/Technician is dropped from v1.** In the 23 July 2026 meeting Alan confirmed the
repair technician does **not** need a login to the admin dashboard, so there is no
Staff/Technician role in the schema or the app. The admin auth model is a single flat
**admin** (the `admins` table + the `is_admin()` / `is_admin_aal2()` RLS helpers). If the
service job tracker is ever built and the bench needs its own restricted view, reintroduce
the role then — the design is preserved below under "Deferred".

## Admin Permissions
- Manage dashboard
- Manage users
- Manage bookings/orders
- Manage CMS content
- View private business data

## How someone becomes an admin

- **Invites only.** Phil invites the person from Supabase > Authentication >
  Users > Invite user. A trigger on `auth.users` (migrations 024 and 027) gives
  the invited user an `admins` row. There is no invite screen in the app
  (P-07); invites stay a runbook step.
- **M-020 (pending the L3 migration).** Today the trigger matches a pending
  invite by email, so with sign-ups open someone who knows an invited address
  could register it first and be promoted. The fix grants admin only to a user
  the invite itself created (`invited_at` or the invite token), never by
  email match, and signs the user out everywhere when admin is granted. Until
  that migration is applied, do not invite an address while public sign-ups
  are open.
- **Sign-ups (hosted decision with M-020).** Whether `enable_signup` stays on
  for customer accounts is Phil's call in the Auth settings; it is recorded in
  `docs/launch-runbook.md` section 0.
- **Two-factor is required.** Every admin read needs aal2. Each admin enrols
  two TOTP factors (D4, M-026); there are no recovery codes. If every factor is
  lost, Phil follows the reset in `docs/launch-runbook.md` section 7.
- **Removing an admin:** delete the user in Authentication > Users, or delete
  their row in `public.admins` (see `docs/admin-auth-emails.md`).

## Customer Permissions
- View own bookings/orders
- Submit requests
- Update own profile

## Deferred — Staff/Technician (not in v1)
Kept only as a design record. Reintroduce alongside a service job tracker if the repair
bench ever needs its own login.
- View assigned jobs
- Update job status
- Upload job photos/notes

## Rules
- Never expose admin routes publicly
- Use Supabase RLS
- Check permissions before sensitive actions
- Keep role logic simple and clear
