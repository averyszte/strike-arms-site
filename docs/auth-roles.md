# Auth Roles

## Roles
- Admin
- Staff/Technician
- Customer

## Admin Permissions
- Manage dashboard
- Manage users
- Manage bookings/orders
- Manage CMS content
- View private business data

## Staff/Technician Permissions
- View assigned jobs
- Update job status
- Upload job photos/notes

## Customer Permissions
- View own bookings/orders
- Submit requests
- Update own profile

## Rules
- Never expose admin routes publicly
- Use Supabase RLS
- Check permissions before sensitive actions
- Keep role logic simple and clear
