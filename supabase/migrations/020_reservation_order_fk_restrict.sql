-- ═══════════════════════════════════════════════════════════════
-- 020 -- deleting an order can no longer leak held stock
--
-- 007 added checkout_reservations.order_id as ON DELETE CASCADE. Deleting an
-- order therefore removed its reservation rows without giving back
-- products.reserved_count, so that stock stayed "held" for good: in_stock is
-- stock_count > reserved_count, and nothing would ever release it. The cron
-- sweeper (012) cannot help, because it works from reservation rows and
-- those are gone.
--
-- Both paths that delete orders release first: clear_stale_checkout_attempt
-- (008) and the failure branch of the create-checkout-session Edge Function.
-- The Edge Function ignores the release's error, though, so a failed release
-- followed by a successful delete leaked the stock. Under RESTRICT that
-- delete fails instead, the order stays pending, and the cron sweeper (012)
-- releases its holds when they expire. The other exposure is a manual delete
-- in the Supabase table editor.
--
-- RESTRICT turns that silent leak into an error. The existing path is
-- unaffected: release deletes the rows, so the restrict check finds none.
-- To delete an order by hand, run release_order_reservations(id) first.
-- (012's sweeper comment "order already gone -- the cascade took the row"
-- describes a case that can no longer arise; the null-status skip it guards
-- is still correct for a row locked by another transaction.)
--
-- The constraint was declared inline in 007, so its name is Postgres's
-- choice; it is looked up rather than assumed.
-- ═══════════════════════════════════════════════════════════════

do $$
declare
  v_name text;
begin
  select con.conname into v_name
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
   where con.conrelid = 'public.checkout_reservations'::regclass
     and con.contype = 'f'
     and att.attname = 'order_id';

  if v_name is not null then
    execute format('alter table public.checkout_reservations drop constraint %I', v_name);
  end if;
end;
$$;

alter table public.checkout_reservations
  add constraint checkout_reservations_order_id_fkey
  foreign key (order_id) references public.orders(id) on delete restrict;
