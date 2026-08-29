-- Strike Arms: product image storage
--
-- Admin product images were URL strings typed by hand into a text box, which
-- means the catalogue could only ever show images already hosted somewhere
-- else. This migration creates the bucket they actually live in.
--
-- It also creates the cleanup path up front. The All Blooms Florist build
-- deletes the product row and leaves every image in the bucket forever: no
-- sweep, no reconciler, no way to tell an orphan from a live file. Retrofitting
-- that means reconciling a bucket against a table after the fact, guessing at
-- which of two thousand files is still referenced. Doing it now costs one
-- trigger.
--
-- The trigger is the important half. A client-side "delete the images too"
-- call is best effort: it does not run when a row is deleted by SQL, by a
-- cascade, or by an admin whose browser closed mid-request. The trigger runs
-- whenever the row changes, whoever changed it.

-- ═══════════════════════════════════════════════════════════════
-- BUCKET
-- Public, because catalogue images are shown to anonymous shoppers and a
-- public bucket is served straight from the CDN with no signing round trip.
--
-- The size and MIME limits are set here rather than only in the browser: a
-- client-side check is a courtesy to the admin, not a control. Anyone holding
-- an admin token can POST whatever they like to the Storage API, so the
-- refusal has to live on the server.
-- ═══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  -- 5 MiB. Compressed uploads land far under this; the limit is for the case
  -- where compression is bypassed or fails.
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ═══════════════════════════════════════════════════════════════
-- STORAGE RLS
-- storage.objects already has RLS enabled by Supabase. These policies are
-- scoped to this one bucket so they cannot widen access to any other.
--
-- Writes require AAL2, matching store_settings and every other admin write in
-- this schema: an admin session that has not passed the second factor can read
-- the dashboard but cannot change what customers see.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists "public read product images"  on storage.objects;
drop policy if exists "admin insert product images" on storage.objects;
drop policy if exists "admin update product images" on storage.objects;
drop policy if exists "admin delete product images" on storage.objects;

-- The public /object/public/ route does not consult RLS, but the SDK's list()
-- and the authenticated download route do. Without this, the admin gallery
-- cannot enumerate what it has uploaded.
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin insert product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin_aal2()));

create policy "admin update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin_aal2()))
  with check (bucket_id = 'product-images' and (select public.is_admin_aal2()));

create policy "admin delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin_aal2()));

-- ═══════════════════════════════════════════════════════════════
-- ORPHAN QUEUE (A7.1)
-- A work list, not a log. A row here means "this file is no longer referenced
-- by any product and should be removed from the bucket". The sweeper deletes
-- the row once the object is gone.
--
-- Deleting a row from storage.objects in SQL is not the same as deleting the
-- underlying object, so the sweep has to go through the Storage API with the
-- service role. Hence a queue rather than a trigger that deletes directly.
-- ═══════════════════════════════════════════════════════════════

create table if not exists orphaned_images (
  -- The path inside the bucket, e.g. products/2026/ab12cd34.jpg
  path          text        primary key,
  orphaned_at   timestamptz not null default now(),
  attempt_count int         not null default 0,
  last_error    text
);

-- The sweeper claims oldest first and skips what it has already failed on
-- repeatedly, so it never spins on one poisoned path.
create index if not exists orphaned_images_pending_idx
  on orphaned_images (orphaned_at)
  where attempt_count < 5;

comment on table orphaned_images is
  'Bucket paths no longer referenced by any product. Drained by the sweep-orphan-images Edge Function, which holds the service role.';

-- ═══════════════════════════════════════════════════════════════
-- THE TRIGGER
-- ═══════════════════════════════════════════════════════════════

-- The marker that identifies one of our own public URLs. Anything that does
-- not contain it is an externally hosted image someone pasted in, and deleting
-- it is not ours to do.
create or replace function public.storage_path_from_public_url(p_url text)
returns text
language sql
immutable
set search_path = ''
as $fn$
  select nullif(
    -- Query strings are not part of the object path. A cache-busting ?v=2
    -- would otherwise produce a path that matches nothing in the bucket.
    split_part(
      split_part(p_url, '/storage/v1/object/public/product-images/', 2),
      '?', 1
    ),
    ''
  );
$fn$;

create or replace function public.enqueue_orphaned_images()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_removed text[];
  v_url     text;
  v_path    text;
begin
  -- On delete every image is removed; on update only those dropped from the
  -- array.
  if tg_op = 'DELETE' then
    v_removed := coalesce(old.images, '{}');
  else
    select coalesce(array_agg(img), '{}')
      into v_removed
      from unnest(coalesce(old.images, '{}')) as img
     where img <> all (coalesce(new.images, '{}'));
  end if;

  foreach v_url in array v_removed loop
    v_path := public.storage_path_from_public_url(v_url);

    -- Not ours, or still in use by another product. Two products sharing a URL
    -- is not something the admin can do on purpose, but a copied-and-pasted
    -- URL would make it possible, and deleting a live image is worse than
    -- leaving a dead one.
    if v_path is not null and not exists (
      select 1 from public.products p where p.images @> array[v_url]
    ) then
      insert into public.orphaned_images (path)
      values (v_path)
      on conflict (path) do nothing;
    end if;
  end loop;

  -- AFTER trigger; the return value is ignored.
  return null;
end;
$fn$;

drop trigger if exists products_enqueue_orphaned_images on public.products;

create trigger products_enqueue_orphaned_images
  after delete or update of images on public.products
  for each row execute function public.enqueue_orphaned_images();

-- If a product comes to reference a path that was queued for deletion — an
-- admin removing an image and then putting it back — the path stops being an
-- orphan. Cheap insurance against the sweeper deleting a file that came back.
create or replace function public.dequeue_reused_images()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_url  text;
  v_path text;
begin
  foreach v_url in array coalesce(new.images, '{}') loop
    v_path := public.storage_path_from_public_url(v_url);
    if v_path is not null then
      delete from public.orphaned_images where path = v_path;
    end if;
  end loop;
  return null;
end;
$fn$;

drop trigger if exists products_dequeue_reused_images on public.products;

create trigger products_dequeue_reused_images
  after insert or update of images on public.products
  for each row execute function public.dequeue_reused_images();

-- ═══════════════════════════════════════════════════════════════
-- SWEEPER SUPPORT
-- Incrementing a counter is a read-modify-write, which PostgREST cannot
-- express. Doing it in SQL also means two sweeps racing on the same batch
-- cannot lose an attempt between them.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.bump_orphan_attempts(
  p_paths text[],
  p_error text
)
returns void
language sql
security definer
set search_path = ''
as $fn$
  update public.orphaned_images
     set attempt_count = attempt_count + 1,
         last_error    = left(p_error, 500)
   where path = any (p_paths);
$fn$;

-- ═══════════════════════════════════════════════════════════════
-- GRANTS
-- The queue is service-role only. RLS is on with no policies, so even if a
-- grant were added by accident the browser still reads nothing.
-- ═══════════════════════════════════════════════════════════════

alter table orphaned_images enable row level security;

grant all on public.orphaned_images to service_role;
grant execute on function public.storage_path_from_public_url(text) to service_role;
grant execute on function public.bump_orphan_attempts(text[], text) to service_role;

-- Not granted to anon or authenticated. A security definer function with no
-- revoke is executable by public by default, which would let any signed-in
-- browser poison the queue.
revoke execute on function public.bump_orphan_attempts(text[], text) from public;
revoke execute on function public.storage_path_from_public_url(text) from public;

notify pgrst, 'reload schema';
