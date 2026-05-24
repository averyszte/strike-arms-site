# Admin Dashboard Plan

Three tiers. Tier 1 is required for launch — without it, the shop can't operate. Tier 2 ships shortly after launch. Tier 3 is phase 2.

Confirm priorities with Alan during the call. Use this as the internal baseline.

---

## Tier 1 — Launch Must-Haves

### Orders
- List view with status filters: pending, paid, ready for pickup, collected, refunded, cancelled
- Search by order #, customer name, email, phone, product
- Order detail page: line items, customer info, payment status, full status history
- One-click "Mark ready for pickup" → auto-emails customer
- One-click "Mark as collected" when customer arrives in store
- Full and partial refund via Stripe
- Status filter chips at top for daily use (e.g. "today's pending pickups")
- Print packing slip / pickup slip for in-store organisation

### Inventory / Stock
- Stock count per product
- Quick adjust with reason: "restocked from supplier", "damaged", "manual correction"
- Low-stock threshold per product with alert when below
- Out-of-stock toggle (overrides count, useful for holding items)
- Click-and-collect: stock is physical — this must be dead simple for staff to update

### Product Catalog
- Full CRUD (create, read, update, archive/delete)
- Image upload: drag and drop, auto-converts to WebP, stored in Supabase Storage
- Required fields: name, slug, category, subcategory, brand, price (integer cents), description, image
- Optional fields: short description, tags, featured flag, new-arrival flag, sale price
- Bulk price update (e.g. "20% off all rifles for 7 days")
- Preview live product page from admin before publishing

### Customers
- List with search (name, email, phone)
- Order history per customer
- "Add note" field for staff (e.g. "prefers email", "regular", "had issue with last order")
- GDPR export and delete buttons for compliance requests

### Contact Form Inquiries
- List of submissions from the contact page
- Mark as read / replied / archived
- "Reply" button opens email client with mailto: pre-filled
- Filter by status (new, replied, archived)
- No ticketing system needed — simple log is enough at this scale

---

## Tier 2 — V1 Should-Haves (ship within weeks of launch)

### Discount Codes
- Create code: percentage off or fixed amount
- Settings: minimum order, usage limit, per-customer limit, expiry date
- Track usage: how many redeemed, total discount given
- Auto-disable when limit is hit
- Bulk-generate codes for email campaigns

### Sales Reports
- Ranges: today / this week / this month / custom date range
- Metrics: total revenue, order count, average order value
- Top-selling products
- Top-spending customers
- VAT breakdown (essential for Revenue filing)
- CSV export for the accountant

### Audit Log
- Every admin action: who, when, what, before/after state
- Filterable by user, action type, date
- Catches mistakes and prevents internal errors

### Manual Order Creation
- Admin creates an order on behalf of a customer (for phone/walk-in orders)
- Pick existing customer or create new
- Add line items, set payment method (cash, manual card)
- Generates a real order with same effects: inventory decrement, audit entry, optional email

### Email Template Editor
- Edit copy for: order confirmation, pickup ready, refund issued, account welcome
- Live preview in editor
- Branded header/footer — no plain-text emails

---

## Tier 3 — Phase 2 / Future

Mention these to Alan so he knows they're on the roadmap, but explicitly defer from launch scope.

- Bulk catalog operations: CSV import/export, bulk publish/unpublish, bulk image upload
- CMS for content pages: About, Services, Airsoft Law, FAQ — no code deploy needed for copy edits
- Brands management: dedicated brand pages and content
- Reviews moderation (if product reviews are added later)
- Multi-staff accounts with role-based permissions
- Settings page: store hours, pickup config, shipping rates, tax settings, business info
- Pickup time slots (if open-hours pickup becomes too chaotic)
- Full stock movement history: every delta broken down by sale / return / restock / manual
- POS integration (only if Alan has an in-store POS that needs inventory sync)
- Reorder suggestions: low-stock items grouped by supplier, ready to raise a purchase order

---

## Scope Cuts (explicitly NOT building in v1)

Each of these is a known cut. If Alan asks for any of them, it's a change request — not a freebie.

| Feature | Decision |
|---|---|
| Abandoned cart recovery emails | Skip v1 |
| Discount codes | Tier 2 (post-launch) |
| Product variants | Skip — each product is its own SKU |
| Subscriptions | Skip — not relevant |
| Gift cards | Skip v1 |
| Wishlists | Skip |
| Customer reviews on products | Skip v1 |
| Multi-channel / POS sync | Phase 2 only |
| Advanced reporting | Skip — basic sales export is enough |
| Affiliate tracking | Skip |

---

## Order Status State Machine

Legal transitions only. Reject anything outside this diagram.

```
pending → paid → ready_for_pickup → collected → completed
pending → cancelled
paid → refunded
paid → partially_refunded
```

Every transition is logged: who, when, from-state, to-state.
