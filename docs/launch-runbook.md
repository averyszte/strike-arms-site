# Launch runbook

The things to do by hand, in the dashboards, when the site goes live. Tick
each one off as it is done. Names only, never secret values.

This file is started early so nothing agreed along the way is forgotten.
Phase 5 item 34 in `docs/audit/completion-plan.md` finishes it, using All
Blooms' runbook as the template; section 5 of that plan has the full list of
environment variables and secrets.

## Supabase Auth (dashboard > Authentication)

- [ ] **Change the Site URL to the live domain.** URL Configuration > Site URL:
      `http://localhost:5173` becomes `https://strikearms.ie` (or whatever the
      final domain is). The invite and reset emails build their links from
      this, so until it changes they point at localhost and nobody outside
      the dev machine can use them. Invites and resets sent before the change
      keep pointing at localhost; send them again afterwards.
- [ ] **Add the live domain to Redirect URLs** in the same screen.
- [ ] **Custom SMTP (Resend)**, under Emails > SMTP Settings. The built-in
      sender allows only a few emails an hour.
- [ ] **Recheck the password policy** is still 12 characters with lowercase,
      uppercase and digits, matching `src/lib/password-policy.ts`.

## Done already

Kept here so nobody redoes or second-guesses them. Details in
`docs/admin-auth-emails.md`.

| Date | What |
| ---- | ---- |
| 2026-09-28 | Migrations 024, 025 and 026 pushed; `verify-rls.sql` clean (only the expected `anon-insert-inquiries` review row) |
| 2026-09-28 | Invite and reset email templates pasted, with the Strike Arms subjects |
| 2026-09-28 | Site URL set to `http://localhost:5173` for testing |
| 2026-09-28 | Password policy set: minimum 12, lowercase, uppercase and digits |
