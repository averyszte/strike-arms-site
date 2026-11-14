# Close-out: wave 3 refactors

**Commits:**
- `c9f105e`: 3B, platform;
- `1b02847`: 3A, storefront;
- `9e58dc2`: 3C, admin;
- the verification fix commit: W-05 and W-07.

None of these was meant to change behaviour. Each passed the gates: tsc, eslint with zero warnings, the node tests and the vite build.

## What changed
- **W-01:** one `effectivePriceCents` in `lib/effective-price.ts`, and `FulfillmentMethod` declared once in `types/order.ts`. The Deno copy in `_shared/shipping.ts` stays, as planned.
- **W-02:** a query-key factory in `lib/query-keys.ts`. Admin product edits, imports and counter sales also refresh the storefront catalogue.
- **W-03:** one money format and parse module (`format-price`, `parse-euro-cents`).
- **W-05:** the React and side-effect code is out of `lib/`.
  - `cart-context` is now `components/cart/cart-provider.tsx`, plus the hooks `use-cart-state` and `use-cart`, plus `data/cart-storage-repository.ts`.
  - `admin-auth-context` is now `components/admin/admin-auth-provider.tsx`, plus the hooks `use-admin-auth-state` and `use-admin-auth`.
  - The eslint exceptions for these files are dropped.
  - Verification fix: the Supabase client moved from `lib/supabase.ts` to `data/supabase-client.ts`, and all 28 repository imports were updated. `lib/compress-image.ts` stays in `lib/` with a layer note: it uses canvas but no network or storage.
- **W-07:** one hook per file, across the storefront and the admin.
  - The verification fixes split the three admin files the first pass missed: failed emails, MFA factors and orphaned images.
  - Their shared query keys are in `hooks/failed-emails-query-keys.ts`, `hooks/admin-mfa-query-keys.ts` and `hooks/orphaned-images-query-keys.ts`.
- **W-10:** dead code removed: 29 unused shadcn ui files and 17 dependencies. `unenrollTotp` is kept for M-026.
- **W-11:** `types/review.ts` breaks the `review-bank` / `google-reviews` type cycle.
- **W-13:** the route tables moved to `pages/routes/`.
- **File splits:**
  - the glossary, taxonomy and site-navigation data;
  - `products-repository`, with its query builders moved to `data/product-query.ts`.

## Deferred, and why
- **W-04, shared auth plumbing.** It touches both sign-in flows just before launch, so the risk is not worth it now.
- **W-06, long functions.** This is partly done. 64 functions are still over 80 lines. Most are admin and storefront components, and none is in `lib`, `data` or `hooks`.
- **W-08, generated database types.** This waits until migrations 040 to 049 are applied (see L6).
- **W-09, the naming clean-up.** This needs Phil's decision, for example on `useProducts.ts` against kebab-case.
- **W-12, the slider.**
  - The price filter uses Radix directly on purpose, because it needs two thumbs.
  - The unused single-thumb `ui/slider.tsx` was deleted.
  - Phil to accept this, or ask for a two-thumb shadcn slider.

## Do not re-audit
- W-01, W-02, W-03, W-10, W-11 and W-13. All were verified with file and line evidence.

## Rejected on merit
- None.
