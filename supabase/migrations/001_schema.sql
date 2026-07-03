-- Strike Arms: Database schema
-- Run with:  supabase db push  (or supabase migration up)
-- Requires PostgreSQL 12+ for generated columns.

-- ═══════════════════════════════════════════════════════════════
-- SEQUENCES
-- ═══════════════════════════════════════════════════════════════

create sequence if not exists order_number_seq start 1 increment 1;

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════

create table if not exists products (
  id                  uuid        primary key default gen_random_uuid(),
  slug                text        not null unique,
  name                text        not null,
  category            text        not null,
  subcategory         text        not null,
  brand               text        not null,
  price_cents         int         not null check (price_cents > 0),
  sale_price_cents    int         check (sale_price_cents > 0 and sale_price_cents < price_cents),
  images              text[]      not null default '{}',
  short_description   text        not null default '',
  description         text        not null default '',
  is_new              bool        not null default false,
  is_featured         bool        not null default false,
  is_published        bool        not null default false,
  stock_count         int         not null default 0 check (stock_count >= 0),
  reserved_count      int         not null default 0 check (reserved_count >= 0),
  low_stock_threshold int         not null default 5,
  tags                text[]      not null default '{}',
  in_stock            bool        generated always as (stock_count > reserved_count) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- ADMINS
-- ═══════════════════════════════════════════════════════════════

create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade
);

-- ═══════════════════════════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════════════════════════

create table if not exists orders (
  id                    uuid        primary key default gen_random_uuid(),
  order_number          text        not null unique
    default ('SA-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0')),
  stripe_session_id     text        unique,
  stripe_payment_intent text,
  customer_name         text        not null,
  customer_email        text        not null,
  customer_phone        text,
  payment_status        text        not null default 'pending'
    check (payment_status in ('pending','paid','refunded','partially_refunded','failed','expired')),
  fulfillment_status    text        not null default 'pending'
    check (fulfillment_status in ('pending','ready_for_pickup','collected','cancelled')),
  total_cents           int         not null check (total_cents >= 0),
  vat_cents             int         not null default 0,
  refund_cents          int         not null default 0,
  age_verified          bool        not null default false,
  notes                 text,
  is_archived           bool        not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id) on delete cascade,
  product_id       uuid references products(id) on delete set null,
  product_slug     text not null,
  product_name     text not null,
  product_image    text,
  brand            text not null,
  unit_price_cents int  not null check (unit_price_cents > 0),
  quantity         int  not null check (quantity > 0),
  subtotal_cents   int  generated always as (unit_price_cents * quantity) stored
);

create table if not exists order_status_log (
  id          uuid        primary key default gen_random_uuid(),
  order_id    uuid        not null references orders(id) on delete cascade,
  field       text        not null check (field in ('payment_status','fulfillment_status')),
  from_status text,
  to_status   text        not null,
  changed_by  uuid        references auth.users(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- INVENTORY
-- ═══════════════════════════════════════════════════════════════

create table if not exists inventory_adjustments (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references products(id) on delete cascade,
  adjustment  int         not null,
  reason      text        not null,
  adjusted_by uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Stock held during active Stripe checkout sessions (≤30 min TTL).
create table if not exists checkout_reservations (
  id          uuid        primary key default gen_random_uuid(),
  product_id  uuid        not null references products(id) on delete cascade,
  quantity    int         not null check (quantity > 0),
  session_key text        not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- INQUIRIES (contact form)
-- ═══════════════════════════════════════════════════════════════

create table if not exists inquiries (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  phone       text,
  subject     text,
  message     text        not null,
  status      text        not null default 'new'
    check (status in ('new','replied','archived')),
  consent     bool        not null default false,
  source_page text,
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- STRIPE & NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

-- Dedup table: Stripe webhook handler writes event ID before processing.
create table if not exists stripe_event_log (
  id           text        primary key,
  processed_at timestamptz not null default now()
);

-- Durable outbox: Edge Function writes a job; a polling worker sends the email.
create table if not exists notification_jobs (
  id              uuid        primary key default gen_random_uuid(),
  type            text        not null, -- 'order_confirmation', 'pickup_ready', etc.
  payload         jsonb       not null,
  status          text        not null default 'pending'
    check (status in ('pending','sent','failed')),
  attempt_count   int         not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error      text,
  created_at      timestamptz not null default now()
);
