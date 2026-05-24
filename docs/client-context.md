# Client Context

## Business Name
Strike Arms Airsoft

## Owner
Alan

## Location
Dublin, Ireland

## Industry
Airsoft retail — guns, BBs, gas, tactical gear, upgrades, repairs

## Business Model
- Primary: click-and-collect (customer orders online, picks up in store)
- Secondary: walk-in / phone orders
- In-store repair and upgrade services

## Goals
- Replace current informal order process (phone/DMs/walk-in) with a proper online store
- Click-and-collect system that staff can actually operate day-to-day
- Admin dashboard for order management, inventory, and product catalog
- Generate leads for repair/upgrade services
- Improve local Dublin SEO
- Increase trust and professionalism
- Make the site easy for Alan to update without needing a developer every time

## Brand Style
- Premium but approachable
- Dark, tactical aesthetic (not military cosplay — serious but accessible)
- Clean layouts, strong visual hierarchy
- Mobile-first
- Strong CTA hierarchy
- Real imagery, not stock photos

## Key Features (confirmed)
- Click-and-collect ecommerce (Stripe Checkout, hosted)
- Product catalog with filtering, search, sort
- Admin dashboard (orders, inventory, products, customers, inquiries)
- Contact form / service inquiry
- Repair & upgrade service pages
- Airsoft Law / compliance information page
- FAQ
- Reviews / testimonials

## Legal & Compliance (Ireland)
- 18+ age verification required at checkout and at pickup
- Irish VAT 23% standard rate — Stripe Tax handles calculation, display is VAT-inclusive
- GDPR — privacy policy, cookie consent, right to access/deletion
- Order records must be kept 6 years for Revenue
- Distance selling: 14-day cooling-off period (may differ for click-and-collect in-person pickup — get legal advice)

## Things To Avoid
- Generic SaaS / AI-looking layouts
- Cluttered mobile navigation
- Overly complicated animations
- Excessive text walls
- Overengineering
- Variants system (not needed for v1 — each product is its own SKU)
- Abandoned cart emails, wishlists, subscriptions, bundles (all deferred to phase 2)

## Stack
- Frontend: React 18 + Vite + TypeScript, Tailwind + shadcn/ui, wouter, TanStack Query, framer-motion
- Backend (to be built): Supabase (Postgres + Auth + RLS + Edge Functions + Storage)
- Payments: Stripe Checkout (hosted) + Stripe Tax
- Email: Resend
- Deploy: Cloudflare Pages

## Related Docs
- `docs/ecommerce-rules.md` — non-negotiables for money handling, orders, inventory, security
- `docs/admin-dashboard-plan.md` — feature tiers for the admin dashboard
- `docs/alan-call-questions.md` — call prep questions to ask Alan
- `docs/database-plan.md` — database schema (to be filled in)
- `docs/auth-roles.md` — admin / staff / customer role permissions
