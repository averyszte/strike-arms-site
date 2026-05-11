# Architecture Standards

## Philosophy
Build scalable, maintainable systems for local businesses and admin dashboards.

## Frontend
- React + Vite
- Component-driven architecture
- Modular sections
- Reusable UI patterns
- Responsive layouts

## Backend
- Supabase for database, auth, and storage
- Use Row Level Security (RLS)
- Separate public and admin data access
- Use efficient queries

## CMS Structure
CMS editing should exist inside the admin dashboard.

Example:
/admin
/admin/dashboard
/admin/bookings
/admin/customers
/admin/content/homepage
/admin/content/services
/admin/content/gallery
/admin/content/testimonials

## Admin Dashboard Standards
- Clear sidebar navigation
- Separate operational tools from content editing
- Use role-based permissions
- Prioritize simplicity and usability

## Database Philosophy
- Clear table naming
- Avoid overly complex schemas initially
- Keep relationships understandable
- Scale progressively
```
