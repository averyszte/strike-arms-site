-- ═══════════════════════════════════════════════════════════════
-- 051: every product in stock
--
-- A one-off data change at the owner's request: every product marked out
-- of stock is set back to in stock. Since 038 in_stock is an ordinary flag
-- the admin sets by hand, so nothing else moves with it. Products already
-- in stock are left alone, so their updated_at does not change.
--
-- Alan can still mark any product out of stock again in the admin.
-- ═══════════════════════════════════════════════════════════════

update public.products
set in_stock = true
where not in_stock;
