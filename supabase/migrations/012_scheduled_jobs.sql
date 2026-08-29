-- Strike Arms: scheduled jobs
--
-- release_expired_reservations() has existed since migration 003 and has never
-- been called by anything. Every abandoned checkout therefore holds its stock
-- forever: the reservation row stays, reserved_count stays raised, and the
-- product reads as unavailable to everyone else until someone notices.
--
-- Switching that function on is a two-line change. Doing it safely is not,
-- because the function races the payment path, and the race oversells stock.
-- The fix comes first in this file; the schedule comes after it.

-- ═══════════════════════════════════════════════════════════════
-- FIX 1: confirm_order_paid must release holds from the reservation
--        rows, not from order_items.
--
-- reserve_order_stock raises reserved_count once per checkout_reservations
-- row, and every release path keys off those rows — release_order_reservations
-- says so in its own comment: "Safe to call twice: rows are deleted as they
-- are released, so a second call finds nothing."
--
-- confirm_order_paid was the exception. It looped over order_items and
-- decremented reserved_count from those, which is the same number only while
-- the reservation rows are guaranteed to still exist. With nothing on a
-- schedule that was always true, so the bug never fired.
--
-- The moment a cron can release an expired hold, it stops being true. Sequence:
-- cron releases the hold on an order whose payment is still in flight, the
-- webhook arrives late, and confirm_order_paid decrements reserved_count a
-- second time for stock that was already given back. greatest(0, ...) hides
-- the negative, so nothing errors — but reserved_count is now lower than the
-- holds actually outstanding, and the other shoppers' reservations have been
-- erased from the counter. The shop sells stock it does not have.
--
-- Driving the decrement off checkout_reservations makes the function idempotent
-- in the same way every other release path already is: no row, no decrement.
-- stock_count still comes from order_items, because that is what was sold.
-- ═══════════════════════════════════════════════════════════════

create or replace function confirm_order_paid(
  p_order_id          uuid,
  p_payment_intent_id text,
  p_session_id        text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  v_number text;
  v_moved  uuid;
  item     record;
  res      record;
begin
  update orders
     set payment_status        = 'paid',
         paid_at               = coalesce(paid_at, now()),
         stripe_payment_intent = coalesce(stripe_payment_intent, p_payment_intent_id),
         stripe_session_id     = coalesce(stripe_session_id, p_session_id),
         order_number          = coalesce(
           order_number,
           'SA-' || to_char(now(), 'YYYY') || '-' ||
             lpad(nextval('order_number_seq')::text, 4, '0')
         )
   where id = p_order_id
     and payment_status = 'pending'
   returning id, order_number into v_moved, v_number;

  if v_moved is null then
    -- Already paid (a redelivery), or refunded/expired and so not eligible.
    -- Stripe does not guarantee event ordering, and a late "completed" must
    -- never resurrect a closed order.
    select order_number into v_number
      from orders where id = p_order_id and payment_status = 'paid';
    return v_number;
  end if;

  -- Give back exactly the holds this order still has. If the sweeper already
  -- released them there are no rows here and reserved_count is left alone.
  -- The update on orders above holds that row's lock for the rest of this
  -- transaction, which is what stops the sweeper reading 'pending' and
  -- releasing the same holds concurrently.
  for res in
    select product_id, quantity
      from checkout_reservations
      where order_id = p_order_id
      for update
  loop
    update products
       set reserved_count = greatest(0, reserved_count - res.quantity)
     where id = res.product_id;
  end loop;

  -- Stock actually leaving the shelf is a property of the sale, so it comes
  -- from the order, not from whatever holds happen to survive.
  for item in
    select product_id, quantity
      from order_items
      where order_id = p_order_id and product_id is not null
  loop
    update products
       set stock_count = greatest(0, stock_count - item.quantity)
     where id = item.product_id;

    insert into inventory_adjustments (product_id, adjustment, reason)
      values (item.product_id, -item.quantity, 'sale: ' || v_number);
  end loop;

  delete from checkout_reservations where order_id = p_order_id;

  return v_number;
end;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- FIX 2: the sweeper must not release a hold on an order that has paid.
--
-- The original selected purely on expires_at. An order can be paid and still
-- have an unexpired-by-the-clock reservation for a few seconds while the
-- webhook is in flight; releasing it there would be the losing half of the
-- race described above, from the other side.
--
-- Reading the order row under a lock is what actually closes the window, but
-- the lock is taken with skip locked rather than by waiting. confirm_order_paid
-- locks the order first and the reservations second; this function takes them
-- in the opposite order, and two transactions acquiring the same pair of locks
-- in opposite orders is the textbook deadlock. Postgres would detect it and
-- abort one side — which, on the payment path, means a webhook failure and a
-- Stripe retry for something that was never an error.
--
-- Skipping instead of waiting removes the cycle entirely: this function never
-- blocks on a lock, so it can never be the waiting half of one. A reservation
-- whose order is busy is simply left for the next run five minutes later.
-- ═══════════════════════════════════════════════════════════════

create or replace function release_expired_reservations()
returns int
language plpgsql
security definer
set search_path = pg_catalog, public
as $fn$
declare
  r         checkout_reservations%rowtype;
  v_status  text;
  v_release int := 0;
begin
  for r in
    select * from checkout_reservations
    where expires_at < now()
    order by expires_at
    for update skip locked
  loop
    if r.order_id is not null then
      -- Cleared every iteration on purpose. SELECT INTO leaves the variable
      -- untouched when the query returns no row, so without this a skipped
      -- order would inherit the previous order's status — and if that was
      -- 'pending', this loop would release a hold it just decided not to read.
      v_status := null;

      select payment_status into v_status
        from orders where id = r.order_id for update skip locked;

      -- Three cases collapse into one deliberate skip:
      --   paid / refunded / failed -> that path owns the release and does it
      --                               in the transaction that moved the status
      --   locked by another txn    -> null, because we skipped rather than wait
      --   order already gone       -> null; the cascade took the row with it
      -- Only a settled, readable, still-pending order is ours to release.
      if v_status is distinct from 'pending' then
        continue;
      end if;
    end if;

    update products
       set reserved_count = greatest(0, reserved_count - r.quantity)
     where id = r.product_id;

    delete from checkout_reservations where id = r.id;
    v_release := v_release + 1;
  end loop;

  return v_release;
end;
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- THE SCHEDULE
--
-- pg_cron runs inside the database, so the reservation sweep needs no secret
-- and no network call — it is a function call on a timer.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pg_cron;

-- Idempotent by hand: cron.unschedule() raises if the job is absent, which
-- would make re-running this migration fail.
delete from cron.job where jobname = 'release-expired-reservations';

-- Every five minutes. Reservations are held for the length of a Stripe
-- session, so five minutes of extra hold on an abandoned cart is not worth a
-- tighter interval and the wakeups it costs.
select cron.schedule(
  'release-expired-reservations',
  '*/5 * * * *',
  $job$ select public.release_expired_reservations(); $job$
);

-- ═══════════════════════════════════════════════════════════════
-- THE IMAGE SWEEP (A7.1)
--
-- This one calls an Edge Function, which means an HTTP request from the
-- database, which means the service-role key has to be reachable from SQL.
-- That key is deliberately not in this repository and not in this migration.
--
-- So the job is not scheduled here. Store the key in Vault once, then call
-- schedule_image_sweep() — it reads the secret by name and builds the job.
-- Doing it this way means `db push` never needs a secret to succeed, and the
-- key exists in exactly one place that git never sees.
--
-- If the sweep is never scheduled, nothing breaks: orphaned_images simply
-- accumulates rows, and the function can be invoked by hand after a bulk
-- delete. It costs storage, not correctness.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pg_net;

create or replace function public.schedule_image_sweep(
  p_project_url text,
  p_schedule    text default '17 3 * * *'
)
returns text
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_key text;
begin
  select decrypted_secret into v_key
    from vault.decrypted_secrets
   where name = 'service_role_key';

  if v_key is null then
    raise exception
      'No Vault secret named service_role_key. Add it first: '
      'select vault.create_secret(''<the key>'', ''service_role_key'');';
  end if;

  delete from cron.job where jobname = 'sweep-orphan-images';

  perform cron.schedule(
    'sweep-orphan-images',
    p_schedule,
    format(
      $job$
        select net.http_post(
          url     := %L,
          headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'Authorization', 'Bearer ' || %L
          ),
          body    := '{}'::jsonb
        );
      $job$,
      rtrim(p_project_url, '/') || '/functions/v1/sweep-orphan-images',
      v_key
    )
  );

  return format('sweep-orphan-images scheduled (%s)', p_schedule);
end;
$fn$;

-- Nobody in a browser schedules jobs.
revoke execute on function public.schedule_image_sweep(text, text) from public;

comment on function public.schedule_image_sweep(text, text) is
  'Schedules the orphan-image sweep. Requires a Vault secret named service_role_key. Run once, from the SQL editor, after storing that secret.';
