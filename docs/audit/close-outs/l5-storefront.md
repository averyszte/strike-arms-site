# Close-out: L5 storefront

**Commits:** `4bd4d8e` and `53187cf` (M-051 shelf counts).

**Verification:** at `9e58dc2`, every item passed except three that were partly done: M-050, M-051 and M-065. The verification fixes completed those three and the M-049 key prefix.

## What changed
- **M-043, routes.** Every route is lazy-loaded behind Suspense; route tables are in `pages/routes/`.
- **M-049, M-053, React Query and deploys.**
  - React Query has explicit defaults.
  - A reload guard handles chunks that fail to load after a deploy.
  - Verification fix: two admin keys now carry the `admin` prefix.
- **M-045, drafts.** The drafts routes are gone from production.
- **M-003, client side.** The success page has "Check again", and handles the 409 `already_paid` response.
- **M-048, M-052, the cart.**
  - Line and quantity limits, with a toast.
  - An out-of-stock notice.
  - Store rates go stale after 60 seconds.
- **M-007, client side.** Checkout validation accepts Dublin 6W.
- **M-046, the coming-soon gate (D5).** It lets account, confirm, reset and success links through.
- **M-044, M-054, images and LCP.**
  - WebP category and placeholder images.
  - Card-size srcsets.
  - A hero poster. The hero video plays only on wide screens with no data saver and no reduced motion.
  - Inter weight 900 is loaded, because `font-black` is used.
- **M-047, price filters.** They use the effective (sale) price.
- **M-050, product queries.**
  - Explicit product columns.
  - Verification fix: "load more" now fetches only the next page with `useInfiniteQuery`, instead of re-fetching every earlier row.
- **M-051, counts.**
  - Header shelf counts read the `catalogue_counts` view.
  - Verification fix: brand counts read it too.
- **M-056, client side.** The customer auth forms send a captcha token.
- **M-065, dead files.**
  - The dead demo, draft and section files are deleted.
  - Verification fix: 7 unreferenced images in `public/images` are deleted too (about 9.4 MB).
  - Kept: 9 PNGs (about 13.8 MB) that `supabase/seed.sql` still uses. Remove them when the seed data is replaced.
  - `.agents/agent_assets_metadata.toml` still lists the deleted files. It is a Replit leftover and is not shipped.

## Deferred, and why
- **Re-encode the hero video to under 2 MB.** It needs a media tool and a visual check. It does not reach mobile, so it is not a launch blocker.
- **A vite chunk over 500 kB.** It is a lazy admin or vendor chunk, not the storefront entry. Splitting it further is tuning.

## Noticed, not touched
- **The shop filter sidebar** still reads product rows, because its counts follow each ticked filter. This is by design.
- **The price range filter** uses Radix directly, because it needs two thumbs. The single-thumb shadcn `ui/slider.tsx` was deleted as dead (W-12).

## Do not re-audit
- Route splitting.
- The gate's allow list.
- Cart limits.
- The D6W client regex.
- Image sizes and srcsets.
- The chunk reload guard.

## Rejected on merit
- **P-03, marquee animation cost:** cosmetic; phase 2.
- **P-10, SEO and accessibility notes:** phase 2. The research is in `artifacts/strike-arms/seo/`.
- **P-01, a server-side shop gate:** rejected under D5.

## Hosted
- Deploy the site in the same wave as the functions.
- Turn on Auth CAPTCHA only after the site is deployed.
