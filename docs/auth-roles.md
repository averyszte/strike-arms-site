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
