-- Strike Arms: 036 inquiries lockdown
--
-- The contact and service quote forms now go through the submit-inquiry
-- Edge Function (Turnstile, rate limits, length caps), which writes with the
-- service role. The browser's own insert, open since 002, goes:
--
--   anon           nothing at all on inquiries
--   authenticated  select, and update of status only: what the admin
--                  enquiries screen does. The policies still require
--                  is_admin_aal2(); the narrower grant means a future policy
--                  mistake cannot hand a signed-in customer insert, delete
--                  or truncate (004 granted ALL, and RLS does not cover
--                  truncate).
--
-- Deploy submit-inquiry BEFORE pushing this, or the forms stop working in
-- between.

drop policy if exists "anon insert inquiries" on public.inquiries;

revoke all on public.inquiries from anon;
revoke all on public.inquiries from authenticated;

grant select on public.inquiries to authenticated;
grant update (status) on public.inquiries to authenticated;
