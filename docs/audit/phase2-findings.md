# Strike Arms phase 2 audit: merged findings

Merged from the nine phase 2 audits: B1 (technical SEO), B2 (content SEO), B3 (speed and Core Web Vitals), B4 (images and media), B5 (JavaScript), B6 (accessibility), B7 (storefront UX and conversion), B8 (admin UX) and B9 (privacy, consumer-law presentation and legal pages). All nine ran read-only against commit 7196f5d. The full reports are in the side-session notes folder under `phase2/audit-B*.md`. Source IDs such as `B3-02` point back to them, and the reports hold the line-by-line detail and the measurements. Phase 1 items (M-, W-, P-) are in `docs/audit/findings.md`.

- **Lane rule:** an item's lane follows the files its fix touches, not the audit that found it. Where a fix crosses lanes, the item sits under the lane that owns the main part and names the other parts.
  - **S1:** SEO, head and meta, and `public/` (sitemap, robots, `_redirects`, `_headers`, `index.html`), plus Pages Functions.
  - **S2:** media and assets (`public/images`, videos, image components, the Storage image path).
  - **S3:** performance and bundle (`vite.config.ts`, lazy loading, providers, React Query, the Supabase client).
  - **S4:** storefront UX and accessibility.
  - **S5:** admin UX, including the admin-side data and migrations.
  - **S6:** content and legal copy, including email templates.
- **Severity:** each item takes the highest severity of its sources unless the item says why not.
- **Tags:** `[decision]` needs Phil; `[solicitor]` needs a solicitor (or the accountant, where named); `[hosted]` is a dashboard or Cloudflare step; `[content]` needs Alan's copy or facts.
- **Paths** are relative to `artifacts/strike-arms/` unless they start with `supabase/`, `docs/` or `functions/`.
- **Standing rules:** no emojis anywhere (use lucide-react icons). `components/ui/` stays unmodified. Phil keeps Alan's superlative trust claims and the "Swords" naming (decided before this phase). Nothing here asserts Irish law; every legal question is routed to a solicitor.

## Summary

| Lane | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| S1 SEO, head and public files | 1 | 3 | 7 | 9 | 20 |
| S2 Media and assets | 0 | 3 | 4 | 3 | 10 |
| S3 Performance and bundle | 0 | 2 | 4 | 9 | 15 |
| S4 Storefront UX and accessibility | 1 | 9 | 13 | 8 | 31 |
| S5 Admin UX | 0 | 7 | 14 | 5 | 26 |
| S6 Content and legal copy | 0 | 4 | 6 | 6 | 16 |
| **Total** | **2** | **28** | **48** | **40** | **118** |

- **Merged:** 118 items (N-001 to N-118), plus 8 feature suggestions (B7 S-01 to S-08, not counted) and 3 dropped findings.
- **Sources:** 205 findings (B1 18, B2 28, B3 17, B4 18, B5 15, B6 32, B7 23, B8 35, B9 19). Every source ID appears at least once below.
- **Reopened from phase 1 with new evidence:** P-03 (marquee cost: 258 review cards, 7,060 DOM nodes, no reduced motion; see N-032 and N-051), P-10 (absorbed by this phase, by design), and the L5 close-out's "do not re-audit image sizes" (B3 and B4 measured about 1.28 MB of waste on the home page and wrong crops; see N-025). The L5 close-out's note on the over-500 kB chunk was wrong (N-031).

### Decisions needed from Phil

Each has a proposed default so lanes can prepare the work. A lane does not ship a `[decision]` part until Phil answers.

| ID | Question | Items | Proposed default |
|---|---|---|---|
| PD1 | Open the informational pages through the coming-soon gate now (option A), or launch soon (option B)? | N-001 | Answered: B. The gate was opened at launch (6b2dbfd, 2026-11-14) |
| PD2 | Add Cloudflare Pages Functions (`functions/`) as a new stack piece, for head injection, real 404s and an image proxy? | N-002, N-022 | Yes, HTMLRewriter only; no server rendering |
| PD3 | Card images: backfill the missing `-card` files, or use the Supabase Storage render endpoint? | N-021 | Render endpoint, if the Pro plan's transform quota covers the catalogue; otherwise backfill |
| PD4 | Cloudflare Web Analytics: allow its beacon in the CSP, or switch it off? | N-010 | Switch it off until N-108 is signed off |
| PD5 | Use a light public catalogue client (PostgrestClient) and load full supabase-js only for auth and admin? | N-031 | Yes |
| PD6 | Home title and hero h1 wording | N-011 | h1 is the visual headline and contains "Airsoft Shop" plus Swords, Co. Dublin |
| PD7 | Client error telemetry: Sentry free tier, or a small Edge Function? | N-042 | Edge Function, rate-limited |
| PD8 | A separate, length-only customer password policy? | N-060 | Yes, 10 characters minimum; admin unchanged; check with the security notes |
| PD9 | Add `sale_ends_at` to products? | N-080 | Not yet; ship bulk "Put on sale" and "End sale" first |
| PD10 | Record an "ID checked at collection" step with who and when? | N-084 | Yes, a confirm dialog plus two columns |
| PD11 | Retention periods for abandoned checkouts, enquiries and sent email jobs | N-096 | Ask the accountant and solicitor; prepare the cron job with the periods as settings |
| PD12 | How long do sold pre-loved items stay listed? | N-053 | Hide 30 days after selling out |
| PD13 | Replace the live Google Map with a click-to-load facade? | N-068 | Yes |
| PD14 | A customers view in the admin? | N-094 | Not now; add phone to the order search only |

### Shared-file owners

Only the owner edits a shared file. Other lanes send the owner the change they need, or edit in the order given under cross-lane dependencies.

| File | Owner | Notes |
|---|---|---|
| `index.html` | S1 | S3 adds the Supabase preconnect (N-034) and removes Google Fonts (N-035). The poster preload goes in `_headers`, not here (N-023) |
| `public/_headers` | S1 | S2 adds the poster `Link` for `/` only (N-023); S3 drops the Google Fonts hosts (N-035); S4 changes `frame-src` for the map (N-068) |
| `functions/` (new) | S1 | S1 owns `_middleware.ts`. S2 adds `functions/img/[[path]].ts` as its own file (N-022) and checks routing with S1 |
| `scripts/generate-sitemap.mjs`, `public/sitemap.xml`, `public/_redirects` | S1 | |
| `src/lib/structured-data.ts`, `src/lib/*-page-meta.ts` | S1 | S6 supplies the copy |
| `src/pages/ShopPage.tsx` | S1 | S4 changes the intro placement (N-057) after S1 adds the JSON-LD (N-007) |
| `src/components/HeroSection.tsx` | S2 | Sequence: S2 poster `<picture>` (N-023), S3 removes the opacity-0 start (N-023 part), S1 heading change (N-011), S4 static trust line (N-051) |
| `src/index.css` | S4 | S2 changes the logo sizing rules (N-026); S3 adds `@font-face` and removes the typography plugin (N-035, N-045) |
| `src/components/SiteHeader.tsx`, `site-header-*.tsx`, `SearchDropdown` | S4 | S3 removes framer-motion only after S4 rebuilds the drawer on Sheet (N-031, N-047) |
| `src/components/home/reviews-feature.tsx`, `trust-marquee.tsx`, `BrandMarquee` | S4 | S3 caps the review cards first (N-032); S2 changes the logo images (N-026) |
| `src/components/catalog/ProductInfo.tsx`, `src/pages/ProductDetail.tsx` | S4 | S6 changes the delivery wording (N-105) |
| `src/components/cart/CheckoutForm.tsx`, `checkout-age-confirmation.tsx`, `FulfillmentChoice.tsx` | S4 | S6 supplies copy for N-105, N-108 and N-115 |
| `supabase/functions/create-checkout-session/open-session.ts` | S4 | S6 adds the Stripe terms consent (N-115) after S4's `cancel_url` change (N-054) |
| `src/data/product-query.ts` | S4 | S3 changes the count mode (N-037) after S4's sort change (N-053) |
| `src/hooks/use-cross-sell-products.ts`, recommendation queries in `src/data/products-repository.ts` | S3 | S4 changes the rules in `lib/cross-sell.ts` and `lib/rank-related.ts` first (N-067) |
| `src/App.tsx`, `src/data/supabase-client.ts`, `vite.config.ts` | S3 | S4 adds route-change focus in `SiteLayout` or `App` (N-061) |
| `src/lib/site-config.ts` | S6 | Business identity and the two shipping lines (N-104, N-105) |
| `src/lib/taxonomy.ts`, `src/lib/taxonomy-data.ts` | S6 | S1 asks S6 for meta length changes (N-007) |
| `src/components/SiteFooter.tsx` | S6 | S4 fixes the heading levels (N-069) |
| `src/pages/Privacy.tsx`, `Terms.tsx`, `Returns.tsx`, `Delivery.tsx`, `AirsoftLaw.tsx` | S6 | |
| `supabase/functions/notification-worker/templates/*`, `supabase/templates/*` | S6 | S5 adds the marketing unsubscribe later (N-102) |
| `src/lib/compress-image.ts` | S2 | `ProductImagesField.tsx` is S5 (N-092, N-093) |
| New migrations in `supabase/migrations/` | S5 | Take the next free number at write time; one migration per item |
| `docs/audit/hosted-steps.md`, `docs/launch-runbook.md` | S6 | S1 sends its launch-flip SEO steps (N-001); S2 and S3 send their hosted steps |
| `docs/audit/close-outs/l5-storefront.md` | S3 | |
| `src/components/ui/*` | nobody | Do not modify. Fix through props, classNames or tokens in `index.css` |

## Cross-lane dependencies

1. **Edge layer.** First, Phil answers PD2. Then S1 builds `functions/_middleware.ts` (N-002). Then S1 adds per-route social tags through it (N-003), and S2 adds the image proxy (N-022).
2. **Header and framer-motion.** First, S4 rebuilds the mobile drawer on the shadcn Sheet (N-047) and fixes the mega menu (N-046). Then S3 removes framer-motion from the header files (N-031).
3. **Hero.** First, S2 ships the poster `<picture>` and the `_headers` preload (N-023). Then S3 removes the hero's opacity-0 start. Then S1 changes the headings (N-011). Then S4 adds the static trust line (N-051).
4. **Marquees.** First, S3 caps the review cards (N-032). Then S4 adds reduced motion and a pause control (N-051). S2 can change the logo files at any time.
5. **Shipping copy.** First, S6 adds `SHIPPING_LINE_GUNS` and `SHIPPING_LINE_POSTABLE` and the `BUSINESS` identity fields (N-104, N-105). Then S4 uses them in the product page and collection lines (N-058).
6. **Product description.** First, S4 renders `product.description` (N-052) and S6 strips the supplier codes from it. Then S1 points the Product schema at it (N-006).
7. **Recommendations.** First, S4 fixes the cross-sell rules (N-067). Then S3 moves the queries to one RPC and reserves the space (N-033, N-034).
8. **Third parties and Privacy.** First, S3 self-hosts the font (N-035), S4 builds the map facade (N-068) and Phil answers PD4. Then S6 writes the processor list in Privacy (N-108).
9. **Launch checklist.** First, S6 adds the legal sign-off step to `hosted-steps.md` (N-103). Then S1 adds its launch-flip SEO steps after it. `/airsoft-law` opens through the gate (N-001) only after sign-off.
10. **Sitemap.** First, S1 settles the noindex rules (N-009). Then S1 regenerates the sitemap without those URLs and wires it into the build (N-005).
11. **Admin errors.** First, S5 adds the shared admin error lib (N-078). Then S5 uses it in the slug clash message (N-077) and the other toasts.
12. **Header height.** First, S4 fixes `--header-height` (N-055). Then S4 adds `scroll-padding-top` from it (N-061).

## Hosted steps for Phil

- [ ] **N-013:** one Cloudflare redirect rule so `http://www.strikearms.ie/*` goes to `https://strikearms.ie/*` in one hop. *Verify:* `curl -I http://www.strikearms.ie/store` shows one 301.
- [ ] **N-018:** check for a Cloudflare Browser Cache TTL override (robots.txt comes back with max-age 14400). Set it to "Respect existing headers". *Verify:* `curl -I https://strikearms.ie/robots.txt` matches `_headers`.
- [ ] **N-021:** check the Storage image transform quota on the Pro plan before PD3. *Verify:* the render URL for a product photo returns 200 with `max-age=31536000`.
- [ ] **N-022:** run the read-only SQL in B3-05 to list `cache_control` on product photos, and the re-upload or metadata fix the lane prepares. *Verify:* a product photo responds with a long public max-age.
- [ ] **N-010:** switch Cloudflare Web Analytics off, or allow it once PD4 is answered. *Verify:* no CSP violation in the console on `/`.
- [ ] **N-040:** turn on Early Hints in Cloudflare Speed settings. *Verify:* a 103 response on `/`.
- [ ] **N-108:** read the Supabase project region in the dashboard and give it to S6.
- [ ] **N-115:** if the solicitor wants Stripe terms consent, set the Terms URL in the Stripe dashboard public details.

## Top 15 by impact

1. **N-001** (Critical, S1) The coming-soon gate serves one indexable holding page on every URL, including the 301 targets of the old site.
2. **N-046** (Critical, S4) The desktop mega menu opens on hover only. Keyboard and touch-laptop users cannot reach a category.
3. **N-103** (High, S6) The "Draft, should be reviewed by a solicitor" notices and internal open points will go live, and the launch checklist has no legal sign-off step.
4. **N-105** (High, S6) Gun category copy and meta say "ships nationwide", but guns are collect-only; "Delivery across Ireland" while checkout takes Republic of Ireland Eircodes only.
5. **N-053** (High, S4) Out-of-stock products are mixed into every sort: 17 of the first 24 on `/store/rifles` are sold out.
6. **N-052** (High, S4) Product pages never show the full description or specs.
7. **N-004** (High, S1) The `_redirects` map misses old category URLs (`/Airsoft-Guns.php` and others) and has no lowercase twins.
8. **N-084** (High, S5) The packing slip prints "Age verified" for every web order on a self-declared tick, and collection has no ID prompt.
9. **N-031** (High, S3) The entry bundle is 810 kB raw, 245 kB gzip, including unused realtime and storage code and framer-motion.
10. **N-023** (High, S2) Home LCP is 5.1 s on mobile: the poster starts 3.5 s late and one 1920 px file serves every device.
11. **N-054** (High, S4) Coming back from Stripe empties the checkout form with no explanation.
12. **N-104** (High, S6) Legal name, VAT and company number are missing or inconsistent across footer, Terms and emails.
13. **N-049** (High, S4) Form errors on checkout, contact, quote and account forms are not announced or focused, and the disabled Pay button is not explained.
14. **N-002** (High, S1) No prerender or edge head: crawlers and link previews see the same head on every route, and unknown URLs return 200.
15. **N-083** (High, S5) The admin orders list and "Orders Today" include abandoned and unpaid Stripe checkouts.

---

## S1 SEO, head and public files

### N-001 The coming-soon gate serves one indexable page on every URL (Critical) [decision] [solicitor]
- **Sources:** B1-01
- **Evidence:** `src/lib/coming-soon-gate.ts` lets only money and account paths through; every other URL, including the targets in `public/_redirects`, renders `src/pages/ComingSoon.tsx` with status 200 and no `noindex`. Live since 2026-10-25.
- **Impact:** Google indexes one thin page in place of the old site's ranked pages, so the 301 migration passes equity to a holding page. Every week the gate stays up costs rankings.
- **Fix:** PD1. Option A: add the informational prefixes (`/where-to-play`, `/guides`, `/about`, `/contact`, `/glossary`, `/services`) to `OPEN_PATH_PREFIXES`, and add `noindex` to ComingSoon. `/airsoft-law` opens only after the N-103 sign-off. Option B: launch soon and follow B1's 8-step launch-flip checklist, which S1 adds to `hosted-steps.md`.
- **Files:** `src/lib/coming-soon-gate.ts`, `src/pages/ComingSoon.tsx`, `docs/audit/hosted-steps.md` (through S6). **Effort:** S.

### N-002 No prerender or edge head injection; soft-404s return 200 (High) [decision]
- **Sources:** B1-02, B1-04, B2 adjacent A-03
- **Evidence:** the SPA serves the same `index.html` head for every route; react-helmet-async sets titles only after JavaScript runs. Unknown URLs such as `/store/not-a-thing` return 200 with the app's 404 view.
- **Impact:** social and non-rendering crawlers see the generic head; Google sees soft-404s and wastes crawl budget on them.
- **Fix:** PD2. Add `functions/_middleware.ts` that uses HTMLRewriter to set title, description, canonical and og tags from a shared `src/lib/route-meta.ts`, and returns 404 for unknown routes and unknown product or category slugs.
- **Files:** new `functions/_middleware.ts`, new `src/lib/route-meta.ts`, the page meta files. **Effort:** L.

### N-003 Social tags are incomplete and the og image is a Replit placeholder (High)
- **Sources:** B1-07, B4-01
- **Evidence:** `public/opengraph.jpg` shows "Replit Agent is building". `index.html` has no og or twitter tags, and the pages set them unevenly.
- **Impact:** every share on WhatsApp, Facebook or X shows a placeholder or nothing.
- **Fix:** S2 makes a branded 1200x630 image. S1 adds static og and twitter tags to `index.html` and a `buildSocialMeta` helper used by every page; per-route tags through N-002 once it lands.
- **Files:** `public/opengraph.jpg` (S2), `index.html`, new `src/lib/social-meta.ts`, page components. **Effort:** M.

### N-004 Redirect map misses old URLs; migration doc is stale (High)
- **Sources:** B1-03, B1-09
- **Evidence:** `public/_redirects` has no rule for `/Accessories.php`, `/Airsoft-Guns.php`, `/Consumables.php`, `/Safety-Wear.php`, `/gear`, `/weapons`, `/industry-news` or `/index.php`, and no lowercase twins of the mixed-case rules. `seo/site-migration-redirects.md` sends Care-for-your-Rifle to `/guides/maintenance`; the real page is `/guides/airsoft-maintenance`.
- **Impact:** the old site's category pages, which hold backlinks, will 404 or fall to the SPA after the switch.
- **Fix:** add the missing rules and lowercase twins; correct the doc; add a check that every redirect target is a real route.
- **Files:** `public/_redirects`, `seo/site-migration-redirects.md`. **Effort:** S.

### N-005 The sitemap is stale and not generated in the build (Medium)
- **Sources:** B1-05, B2 adjacent A-01, B2-10 (sitemap part)
- **Evidence:** 241 URLs. Missing `/delivery`, `/evolution`, `/returns`, `/terms` and 7 Evolution products; includes `/brands/unbranded`, an empty `/sale` and the "Coming soon" `/gift-cards`. `scripts/generate-sitemap.mjs` has no `isListedBrand` filter and is not in the build script.
- **Fix:** add the filter and the missing static routes, exclude every noindexed URL (N-009), run it in `build`.
- **Files:** `scripts/generate-sitemap.mjs`, `package.json`, `public/sitemap.xml`. **Effort:** S-M.

### N-006 Product schema and meta descriptions are weak (Medium) [decision] [solicitor]
- **Sources:** B1-06, B1-11, B2-02 (schema part)
- **Evidence:** in `src/lib/structured-data.ts`, 13 products have an empty `image` array, 114 have brand "Unbranded", `sku` is the UUID, and there is no `shippingDetails` or `hasMerchantReturnPolicy`. Schema uses `shortDescription`. 168 of 180 product meta descriptions are under 70 characters.
- **Fix:** omit `image` and `brand` when empty or unbranded; use a real SKU if one exists or drop it; add shipping details from the store rates; add the return policy only after the solicitor signs off the Returns terms. Add `buildProductMetaDescription` (name, brand, key spec, price, fulfilment). Use the full description once N-052 lands.
- **Files:** `src/lib/structured-data.ts`, new `src/lib/product-meta-description.ts`, `src/pages/ProductDetail.tsx` meta. **Effort:** M.

### N-007 Category pages are thin and have no breadcrumb or list schema (Medium) [content]
- **Sources:** B1-08, B2-07, B2-08, B2 adjacent A-02
- **Evidence:** category descriptions in `src/lib/shop-page-meta.ts` are about 50 characters; the `/store` h1 is just "Shop"; `ShopPage.tsx:141-147` emits no BreadcrumbList or ItemList; non-promoted subcategories such as `/store/rifles/smgs` take the parent's title.
- **Fix:** S6 and Alan write 150-character descriptions and h1s per category and subcategory; S1 adds a subcategory title fallback ("SMGs | Airsoft Rifles") and BreadcrumbList plus ItemList JSON-LD.
- **Files:** `src/lib/shop-page-meta.ts`, `src/pages/ShopPage.tsx`, `src/lib/structured-data.ts`, `src/lib/taxonomy-data.ts` (S6). **Effort:** M.

### N-008 Organisation and LocalBusiness schema gaps (Medium) [content]
- **Sources:** B1-15, B2-16, B4-16
- **Evidence:** pages reference `#organization` and `#store` @ids that no page defines; Article has no image; the logo is `favicon.svg`. LocalBusiness lacks geo, image, priceRange, sameAs and hasMap (the Place ID is at `review-bank.ts:18`). No web manifest or theme-color; favicon sizes are incomplete.
- **Fix:** define both nodes once in the home or layout schema; add a 512 px raster logo (S2), geo, hasMap from the Place ID, sameAs from Alan's social links; add `site.webmanifest` and theme-color.
- **Files:** `src/lib/structured-data.ts`, `index.html`, new `public/site.webmanifest`, `public/images/logo-512.png` (S2). **Effort:** M.

### N-009 Thin brand, sale and gift-card pages are indexable (Medium) [content]
- **Sources:** B2-09, B2-10
- **Evidence:** brand pages share boilerplate ("Guns & Gear" on Bolle); an empty `/sale` shows the "no products match your filters" state; `/gift-cards` is "Coming soon". All are in the sitemap.
- **Fix:** add a `blurb` and `kind` per brand; `noindex` brands with fewer than 3 products, an empty `/sale` and `/gift-cards`; give `/sale` its own empty state.
- **Files:** `src/lib/brand-page-meta.ts`, brand data, `src/pages/Sale.tsx`, gift-cards page. **Effort:** S-M.

### N-010 The CSP blocks the Cloudflare Web Analytics beacon (Medium) [decision] [hosted]
- **Sources:** B3-07, B5-03
- **Evidence:** the beacon is injected by Cloudflare but `script-src` in `public/_headers` blocks it, so every page logs a violation. `docs/build-backlog.md:153` assumes analytics works.
- **Fix:** PD4. Either switch it off in the dashboard, or allow `static.cloudflareinsights.com` and `cloudflareinsights.com` and name it in Privacy (N-108). Update the backlog line.
- **Files:** `public/_headers`, `docs/build-backlog.md`. **Effort:** S.

### N-011 Home title and hero headings (Medium) [decision]
- **Sources:** B2-13, B6-26 (hero part), B7-20
- **Evidence:** the home title has no "Ireland" or "Swords". In `src/components/HeroSection.tsx:85,92` the h1 is the small eyebrow "Airsoft Shop Dublin" and the visual headline is an h2.
- **Fix:** PD6. Make the visual headline the h1 with the location in it or directly before it; make the eyebrow a `p`; update the title.
- **Files:** `src/components/HeroSection.tsx` (owner S2, see dependency 3), `src/pages/Home.tsx`. **Effort:** S.

### S1 low

- **N-012** (Low) Two `<title>` elements in `index.html`. Remove the static duplicate. Sources B1-10. Effort S.
- **N-013** (Low) [hosted] `http://www` takes two redirect hops. One Cloudflare rule (see hosted steps). Sources B1-12. Effort S.
- **N-014** (Low) Titles too long (`/brands` 73, `/pre-loved` 73, `/jumble` 79, 22 products) and the suffix varies. One `buildTitle` with a 60-character budget. Sources B1-13, B2-27. Effort S.
- **N-015** (Low) Breadcrumbs link to non-canonical subcategory URLs. Use the canonical path builder. Sources B1-14. Effort S.
- **N-016** (Low) `<html lang="en">` should be `en-IE`. Sources B1-16. File `index.html`. Effort S.
- **N-017** (Low) The "More" button on listings is not a crawlable link. Render an `<a href="?page=2">` that the button enhances. Sources B1-17. Effort S.
- **N-018** (Low) [hosted] `/checkout` is missing from `_headers` (no `noindex` or cache rule), and robots.txt shows a Browser Cache TTL override. Sources B1-18. Effort S.
- **N-019** (Low) [content] Guides have no Person author. Add Alan as author in Article schema and a byline. Sources B2-20. Effort S.
- **N-020** (Low) The 404 page has no helpful links. Add search and the top categories. Sources B2-28. Effort S.

## S2 Media and assets

### N-021 Product card images request `-card` variants that return 400 (High) [decision] [hosted]
- **Sources:** B3-04, B4-02, B4-13
- **Evidence:** `src/lib/card-image-srcset.ts` builds `-card` URLs that do not exist in Storage; `card-image.tsx` falls back after the 400, so every card makes a failed request first. The srcset `w` descriptors assume square photos, which most are not.
- **Impact:** a wasted round trip per card on every listing, and the browser picks the wrong size.
- **Fix:** PD3. Preferred: the Storage render endpoint (`/storage/v1/render/image/public/...?width=400`), which returns 200 with `max-age=31536000`; check the transform quota first. Fallback: backfill the variants with a script. Fix the descriptors to the real widths.
- **Files:** `src/lib/card-image-srcset.ts`, `src/components/catalog/card-image.tsx`. **Effort:** S-M.

### N-022 Product photos are `private, no-cache` and carry `X-Robots-Tag: none` (High) [decision] [hosted]
- **Sources:** B3-05, B4-03, B4-04
- **Evidence:** uploads set no cache control (`src/data/storage-repository.ts:36` and the upload scripts), so photos come back `private, no-cache`. Supabase Storage sends `X-Robots-Tag: none`, so Google Images will not index any product photo.
- **Impact:** repeat visits re-download every photo; product images never appear in image search.
- **Fix:** set `cacheControl: '31536000'` on upload and fix existing objects (Phil runs the read-only SQL first). PD2: serve photos through a same-origin proxy `functions/img/[[path]].ts` that strips `X-Robots-Tag` and sets long caching.
- **Files:** `src/data/storage-repository.ts`, the upload scripts, new `functions/img/[[path]].ts`, `src/lib/card-image-srcset.ts`. **Effort:** M.

### N-023 Home LCP: late, oversized poster and a hidden hero text (High)
- **Sources:** B3-01, B4-06
- **Evidence:** Lighthouse mobile home LCP 5.1 s, score 0.70. The poster's load delay is 3.5 s, there is no preload, one 1920 px file serves every device, and the hero text starts at framer-motion opacity 0.
- **Fix:** S2: a 828x1472 mobile portrait crop and a desktop crop in a `<picture>`; preload it with a `Link` header in `_headers` for `/` only (not in `index.html`, which every route shares; this settles the conflict between B3-01 and B4-06). S3: render the hero text visible from the first paint, with CSS animation at most.
- **Files:** `src/components/HeroSection.tsx`, `public/images/hero-*`, `public/_headers` (through S1). **Effort:** S.

### N-024 The 7.6 MB hero video reaches tablets (Medium)
- **Sources:** B3-06, B4-05
- **Evidence:** VP8 WebM, 1920x1080, 9.84 s at 6.2 Mbit/s, mostly hidden under overlays. The gate lets it load at 768 px; `autoplay` overrides the preload hint.
- **Fix:** re-encode to VP9 or AV1 at 1280 px plus an H.264 MP4 fallback (B4 has the ffmpeg commands); gate at 1024 px and on `navigator.connection.effectiveType` and Save-Data; add `preload="none"` and start playback in script.
- **Files:** `public/videos/*`, the hero video component. **Effort:** M.

### N-025 Home, category and banner images are oversized or badly cropped (Medium) [decision]
- **Sources:** B3-11, B4-07, B4-10
- **Evidence:** about 1.28 MB of measured waste on the home page. Category tiles are 588 kB of portrait images cropped to strips; one AI image has a "SAFE SAFE" artefact. Banner, loadout and guide images have no srcset; `maintenance-guide` is low resolution.
- **Fix:** re-crop tiles to 1600x400 and 800x300 with srcset; add srcset to banners and guides; replace the artefact image and the low-resolution guide image (Phil picks replacements).
- **Files:** `public/images/categories/*`, `public/images/*`, the tile, banner and guide components. **Effort:** M.

### N-026 Brand logos: blurry, heavy, eager and partly unstocked (Medium) [content]
- **Sources:** B3-16, B4-08, B4-09, B2-22, B2 adjacent A-06
- **Evidence:** logos are 31 px tall, shown at 48 px (`index.css:252-254`); ICC profiles are 71% of their bytes; they load eagerly with no dimensions and compete with the LCP image; a CSS filter recolours them. The marquee shows brands the shop does not stock and the logos are not links. `cyma.webp` is dirty and the arctus file name is misspelt.
- **Fix:** re-export at 96 px tall, strip ICC, add width and height and `loading="lazy"`; show only stocked brands (from the brand list) and link each to its brand page; clean and rename the two files.
- **Files:** `public/images/brands/*`, `BrandMarquee`, `src/index.css` (through S4). **Effort:** S-M.

### N-027 Admin image compression turns WebP into JPEG and can leak EXIF (Medium)
- **Sources:** B4-11
- **Evidence:** `src/lib/compress-image.ts:143` re-encodes WebP as JPEG and PNG as PNG; `keepOriginal` at line 153 uploads the original file, with its EXIF (camera, possibly GPS).
- **Fix:** always output WebP; always re-encode, so EXIF is dropped.
- **Files:** `src/lib/compress-image.ts`. **Effort:** S.

### S2 low

- **N-028** (Low) Product gallery: no srcset, no swipe or zoom, thumbnails lack `aria-pressed`. Use the shadcn Carousel and a zoom Dialog; srcset from N-021. Sources B3-12, B4-12, B6-25, B7-22. File `src/components/catalog/ProductGallery.tsx`. Effort M.
- **N-029** (Low) A missing image returns 200 `text/html`, cached for a week. Add `scripts/check-public-assets.mjs` to the build and a 404 rule for `/images/*`. Sources B4-15. Effort S.
- **N-030** (Low) An image that fails twice shows a broken icon. Add a placeholder fallback on the second error. Sources B4-18. Effort S.

## S3 Performance and bundle

### N-031 The storefront entry bundle is 245 kB gzip (High) [decision]
- **Sources:** B3-02, B5-01, B5-02, B5-10, B5-15
- **Evidence:** entry 810 kB raw, 245 kB gzip. supabase-js is about 207 kB raw of it, including realtime, phoenix, storage and iceberg (about 84 kB) that the storefront never uses. framer-motion (about 120 kB) comes in through `SiteHeader`, the drawer and `SearchDropdown` (7 files). Home sections and 10 kB of review text are eager for every deep link. `docs/audit/close-outs/l5-storefront.md` wrongly says the size warning comes from a lazy chunk. The holding page ships the full app.
- **Fix:** PD5: a `src/data/public-catalogue-client.ts` built on PostgrestClient for anonymous catalogue reads, with the full client loaded by dynamic import for auth, checkout and admin (keep RLS behaviour; the admin JWT path must use the full client). Replace framer-motion in the header with CSS, or `LazyMotion` elsewhere. Lazy-load the below-the-fold Home sections with fixed-height placeholders. Correct the close-out note.
- **Files:** `src/App.tsx`, `src/data/supabase-client.ts`, new `src/data/public-catalogue-client.ts`, header files (after S4), `src/pages/Home.tsx`, `vite.config.ts`, the close-out doc. **Effort:** M-L.

### N-032 The review marquee renders about 258 cards (High)
- **Sources:** B3-03 (reopens P-03)
- **Evidence:** `src/components/home/reviews-feature.tsx` renders every review, duplicated for the loop: the home page has 7,060 DOM nodes and 817 ms of style and layout on mobile.
- **Fix:** render about 12 reviews, duplicated once for the loop; pause the animation off-screen with IntersectionObserver.
- **Files:** `src/components/home/reviews-feature.tsx`, `src/lib/google-reviews.ts`. **Effort:** S.

### N-033 Product page layout shift from recommendations (Medium)
- **Sources:** B3-08
- **Evidence:** desktop CLS 0.13 on product pages; `ProductRecommendations` returns null while loading and then pushes content down (`src/hooks/use-cross-sell-products.ts`).
- **Fix:** reserve the row height with a skeleton; collapse only when the result is known to be empty.
- **Files:** `src/hooks/use-cross-sell-products.ts`, `ProductRecommendations`. **Effort:** S.

### N-034 No Supabase preconnect; four recommendation queries (Medium)
- **Sources:** B3-09
- **Evidence:** `index.html` has no preconnect to the Supabase host; each query pays a CORS preflight; the product page makes four recommendation queries.
- **Fix:** add `preconnect` (through S1); replace the four queries with one RPC after N-067.
- **Files:** `index.html`, `src/data/products-repository.ts`, new migration (through S5), `src/hooks/use-cross-sell-products.ts`. **Effort:** M.

### N-035 Google Fonts is render-blocking and sends every visitor to Google (Medium) [solicitor]
- **Sources:** B3-10, B5-12, B9-05 (fonts part)
- **Evidence:** the stylesheet in `index.html:10-12` blocks render for 952 ms on mobile; latin-ext loads only for two review names (`google-reviews.ts:72,78`); every visitor's IP goes to Google with no mention in Privacy.
- **Fix:** self-host Inter Variable (`@fontsource-variable/inter`, latin subset), preload it, drop the Google hosts from `index.html` and the CSP. Whether the current setup needed consent is for the solicitor; self-hosting removes the question.
- **Files:** `index.html`, `src/index.css`, `public/_headers`, `package.json`. **Effort:** S.

### N-036 recharts is about 330 kB of the admin chunk for one chart (Medium)
- **Sources:** B5-04
- **Evidence:** only `revenue-tracker-card.tsx` uses recharts; `AdminArea` uses `Suspense fallback={null}`.
- **Fix:** lazy-load the card with a skeleton fallback; consider a small SVG chart.
- **Files:** `src/components/admin/dashboard/revenue-tracker-card.tsx` (S5 file, S3 change), `AdminArea`. **Effort:** S.

### S3 low

- **N-037** (Low) Listings always use `count: 'exact'` (`src/data/product-query.ts:20`). Use `planned` after the first page. Sources B3-13. Effort S.
- **N-038** (Low) No `manualChunks`; about 25 micro-chunks under 0.5 kB (single icons). Group lucide icons and vendor code; `experimentalMinChunkSize`. Sources B3-14, B5-11. File `vite.config.ts`. Effort S.
- **N-039** (Low) Route chunks load in a waterfall. Prefetch the route chunk on link hover or focus. Sources B3-15. Effort S.
- **N-040** (Low) [hosted] TTFB is 669 ms. Turn on Early Hints. Sources B3-17. Effort S.
- **N-041** (Low) `TooltipProvider` in `App.tsx` is dead (about 32 kB raw). Remove it; leave `components/ui/tooltip.tsx`. Sources B5-06. Effort S.
- **N-042** (Low) [decision] No client error telemetry; `AppErrorBoundary` only logs to the console. PD7. Sources B5-07. Effort S-M.
- **N-043** (Low) Reload-guard edge cases beyond M-053: a crash fallback can flash, and a cached rejected lazy import never recovers. Retry the import once and show a "Reload" button for chunk errors. Sources B5-08. Effort S.
- **N-044** (Low) The cart does not sync across tabs, so two tabs overwrite each other. Listen for `storage` events in the cart repository. Sources B5-09. Effort S.
- **N-045** (Low) Duplicate Radix slot and primitive versions, and the unused `@tailwindcss/typography` plugin. `resolve.dedupe`, remove the plugin. Sources B5-13, B5-14. Effort S.

## S4 Storefront UX and accessibility

### N-046 The desktop mega menu opens on hover only, with no "Shop all" link (Critical)
- **Sources:** B6-01, B7-05
- **Evidence:** `SiteHeader.tsx` (lines 55-105) uses `onMouseEnter` only through `use-hover-menu.ts`; no click, keyboard, `aria-expanded` or Escape. `site-header-mega-columns.tsx` and the drawer have no "Shop all X" link.
- **Impact:** keyboard, screen-reader and touch-laptop users cannot open any category menu; shoppers cannot reach a whole category.
- **Fix:** use the shadcn NavigationMenu primitive (click and keyboard toggle, `aria-expanded`, Escape), keeping hover as an extra; add "Shop all X" as the first link in each column and drawer group.
- **Files:** `src/components/SiteHeader.tsx`, `src/hooks/use-hover-menu.ts`, `site-header-mega-columns.tsx`, `site-header-mobile-drawer.tsx`, `src/lib/site-navigation-shop.ts`. **Effort:** M.

### N-047 The mobile drawer is not a dialog (High)
- **Sources:** B6-02, B7-16
- **Evidence:** `site-header-mobile-drawer.tsx` has no focus trap, no Escape, no dialog role, and the close button (line 47) has no name. There is no search in it.
- **Fix:** rebuild it on the shadcn Sheet (side left) with a title and a search field at the top. This also removes its framer-motion use (dependency 2).
- **Files:** `site-header-mobile-drawer.tsx`. **Effort:** M.

### N-048 Input and border colours are nearly invisible (High)
- **Sources:** B6-03
- **Evidence:** `--input` and `--border` are #242424 on the dark background, a 1.25:1 contrast, so form fields, the Switch track and checkboxes have no visible edge.
- **Fix:** a new `--input` token around #5c5c5c to #666 (3:1 or better) and keep `--border` for dividers; style the Switch track through a className in `FilterSidebar`, not in `components/ui`.
- **Files:** `src/index.css`, `src/components/catalog/FilterSidebar.tsx`. **Effort:** S.

### N-049 Form errors are not announced or focused (High)
- **Sources:** B6-04, B7-10, B6-31
- **Evidence:** CheckoutForm, CheckoutField, checkout-age-confirmation, contact-form, inquiry-send-error, contact-form-sent, SignInForm, SignUpForm and ServiceQuoteForm show errors with no `aria-invalid`, `aria-describedby`, live region or focus move. The Pay button is disabled while Turnstile runs, with no text. `MIN_HUMAN_FILL_MS` (3000 ms, `inquiry-validation.ts:78`) drops a fast submission silently.
- **Fix:** one pattern: focus and `scrollIntoView({block:'center'})` the first invalid field, `aria-invalid` and `aria-describedby` on each, an error summary in a `role="alert"` region. Show "Checking your browser..." next to the disabled button. Tell a too-fast sender to try again instead of dropping silently.
- **Files:** the nine form files above, `src/lib/inquiry-validation.ts`, `DeliveryAddressFields.tsx`. **Effort:** M.

### N-050 Search dropdown is mouse-only (High)
- **Sources:** B6-06
- **Evidence:** the clear button and results act on `onMouseDown` only; no combobox roles or ids; no live region for result counts; no search landmark.
- **Fix:** the ARIA combobox pattern (input `role="combobox"`, `aria-controls`, `aria-activedescendant`, arrow keys, Enter), click handlers, a polite live region, `<search>` or `role="search"`.
- **Files:** `SearchDropdown` and its hook. **Effort:** M.

### N-051 Marquees ignore reduced motion and cannot be paused (High)
- **Sources:** B5-05, B6-05, B6-29, B7-13 (reopens P-03)
- **Evidence:** no `prefers-reduced-motion` rule anywhere (`index.css:259-266`, 36 s infinite); no pause control; the trust claims are read out three times by screen readers (`trust-marquee.tsx:22`, BrandMarquee, reviews-feature). The strongest claims ("17 years in the game", "Oldest airsoft shop in Dublin") appear only in moving text. No `MotionConfig reducedMotion`; the hotspot pulse never stops.
- **Fix:** a reduced-motion rule that stops the animation; a pause button; `aria-hidden` on the duplicated copies; `MotionConfig reducedMotion="user"`; repeat one or two claims as static text in the hero or VisitShop.
- **Files:** `src/index.css`, `trust-marquee.tsx`, `BrandMarquee`, `reviews-feature.tsx`, `App.tsx` (through S3), `HeroSection.tsx` or `visit-shop.tsx`. **Effort:** S.

### N-052 Product pages never show the full description (High)
- **Sources:** B7-01, B2-02
- **Evidence:** `data/product-query.ts:15` fetches `description`, but `ProductInfo.tsx` (about line 75) renders only `shortDescription` and `ProductDetail.tsx` has no details section. Imported Evolution descriptions contain supplier codes.
- **Impact:** buyers cannot see FPS, gearbox, battery, materials or box contents; thin product pages for search.
- **Fix:** a "Details" section (shadcn Accordion on mobile) rendering the description as plain text with line breaks; S6 strips supplier codes in `scripts/catalogue-evolution.mjs` and the stored rows; then N-006.
- **Files:** `src/pages/ProductDetail.tsx`, new `src/components/catalog/product-description.tsx`, `scripts/catalogue-evolution.mjs` (S6). **Effort:** S-M.

### N-053 Out-of-stock products fill the first screen of every category (High) [decision]
- **Sources:** B7-02, B7 adjacent (pre-loved retention)
- **Evidence:** no sort in `data/product-query.ts:33-48` orders by `in_stock`. Measured live: 17 of the first 24 on `/store/rifles`, 15 of 24 on `/store`, 13 of 15 on `/pre-loved`.
- **Fix:** `in_stock desc` first in every sort; an "In stock only" toggle in the filter sidebar and sheet; PD12 for sold pre-loved items.
- **Files:** `src/data/product-query.ts`, `FilterSidebar.tsx`, `mobile-filter-sheet.tsx`, the filter hook and query key. **Effort:** S (sort), M (toggle).

### N-054 Checkout details are lost after a Stripe cancel (High)
- **Sources:** B7-03
- **Evidence:** `CheckoutForm.tsx:201` holds the details in `useState`; `cancel_url` is `/cart` (`open-session.ts:116`); nothing reacts to the return.
- **Fix:** keep the details (not the age tick or Turnstile token) in sessionStorage through `src/data/`, wrapped in try/catch and cleared on success; add `?cancelled=1` to `cancel_url`; show "Payment not completed. Your basket and details are saved."
- **Files:** `CheckoutForm.tsx`, new `src/hooks/use-checkout-draft.ts`, a draft repository in `src/data/`, `src/pages/Cart.tsx`, `supabase/functions/create-checkout-session/open-session.ts`. **Effort:** M.

### N-055 Mobile header: 20 px tap targets, an empty utility bar and a wrong header height (High)
- **Sources:** B7-04, B7-12, B7-17
- **Evidence:** search, account, cart and menu icons measure 20x20 px live; `UtilityBar` is `h-8` with every link `hidden md:flex`, so 92 px of 812 px is chrome; `--header-height` is 90 px (`index.css:72`) against a real 92 px; the mobile search panel is `fixed top-[60px]` (`SiteHeader.tsx:136`), so it sits under the sticky stack.
- **Fix:** 44x44 hit areas around 20 px glyphs; hide UtilityBar on mobile or give it one line ("Collect in Swords, Tue to Sun 11:00 to 18:00"); set `--header-height` from the real stack per breakpoint; position the panel from it.
- **Files:** `SiteHeader.tsx`, `UtilityBar.tsx`, `SiteLayout.tsx`, `src/index.css`, `ShopPage.tsx:172`. **Effort:** S.

### N-056 Special listing pages stop at 48 products, with no sort or count (Medium)
- **Sources:** B7-06
- **Evidence:** `ProductListingPage.tsx` and `useProducts.ts` fetch one page of 48 for New, Sale, Pre-loved, Jumble, Evolution and Safety.
- **Fix:** reuse the shop's infinite query, `ResultsHeader` and `Pagination` with a fixed preset filter.
- **Files:** `src/components/catalog/ProductListingPage.tsx`, `src/hooks/useProducts.ts`. **Effort:** M.

### N-057 Category intro pushes the first product below the fold on mobile (Medium)
- **Sources:** B7-07
- **Evidence:** at 375x812 the first card starts at 703 px on `/store/rifles` and 490 px on `/pre-loved`.
- **Fix:** keep the h1 and one line above the grid; clamp the rest to two lines with "Read more", or move it under the grid (S1 signs off, since the copy is SEO text).
- **Files:** `src/pages/ShopPage.tsx` (owner S1), the intro component. **Effort:** S.

### N-058 Product page: no VAT note, delivery line, "View basket" or out-of-stock path (Medium)
- **Sources:** B7-08, B7-21
- **Evidence:** `ProductInfo.tsx` shows the price with no "incl. VAT" and no delivery line; the add toast (lines 179-184) has no action; no quantity selector; an out-of-stock product shows only a disabled button. `FulfillmentChoice.tsx` says only "Pick everything up at Swords".
- **Fix:** "incl. VAT" under the price; a fulfilment line from `isShippable` using S6's shipping constants; a "View basket" toast action; "Ask us about this item" linking to `/contact?product=slug`; address and hours from `BUSINESS` in the collection option.
- **Files:** `ProductInfo.tsx`, `FulfillmentChoice.tsx`, `src/lib/` fulfilment wording. **Effort:** S.

### N-059 The 18+ and photo-ID rule appears only after payment (Medium) [decision] [solicitor]
- **Sources:** B7-09, B9-11
- **Evidence:** `CheckoutSuccess.tsx:129` asks for photo ID; before payment there is only the tick box (`checkout-age-confirmation.tsx:25`); a grep of the catalogue and cart code finds no "18" or "photo ID".
- **Fix:** once Phil confirms the wording, one line on collect-only product pages ("18+ only. Bring photo ID to collect."), beside the collection option and in the basket summary when the basket holds collect-only items.
- **Files:** `ProductInfo.tsx`, `FulfillmentChoice.tsx`, `CartSummary.tsx`, `checkout-age-confirmation.tsx`. **Effort:** S.

### N-060 Customer password rules are admin-strength (Medium) [decision]
- **Sources:** B7-11
- **Evidence:** `src/lib/password-policy.ts` (12 characters, mixed case, a number) is shared with admin; `SignUpForm.tsx` asks twice with no show toggle.
- **Fix:** PD8; replace the confirm field with a show-password toggle.
- **Files:** `src/lib/password-policy.ts`, `SignUpForm.tsx`, the reset form. **Effort:** S.

### N-061 No skip link, no focus move on route change, no scroll padding (Medium)
- **Sources:** B6-07, B6-08
- **Fix:** a skip link to `<main>`; focus the h1 or main after navigation; `scroll-padding-top: var(--header-height)` after N-055.
- **Files:** `SiteLayout.tsx`, `App.tsx` (through S3), `src/index.css`. **Effort:** S.

### N-062 Catalogue controls: names, groups and feedback (Medium)
- **Sources:** B6-10, B6-14, B6-15, B6-16, B6-20, B6-24, B7-18, B7-19
- **Evidence:** the price slider has no `aria-valuetext`; loadout tabs have no `aria-pressed`; filter groups have no fieldset or legend; the result count is not live; "Load more" ignores `isFetchingNextPage`; the mobile Filters button shows no active count; the sort select has no label; CategoryTree has no `aria-current`.
- **Fix:** each as named, with "Filters (2)" and a disabled "Loading..." state.
- **Files:** `FilterSidebar.tsx`, `ResultsHeader.tsx`, `Pagination.tsx`, `CategoryTree`, the loadout showcase, `ShopPage.tsx`. **Effort:** S-M.

### N-063 Cart lines: focus is lost on remove, no undo, small controls (Medium)
- **Sources:** B6-12, B6-13, B7-23
- **Fix:** move focus to the next line or the heading; an "Undo" toast; 44 px quantity and remove buttons; a 12 px or larger cart badge.
- **Files:** `src/components/cart/CartLineRow.tsx`, `SiteHeader.tsx`. **Effort:** S.

### N-064 Sale price presentation (Medium) [solicitor]
- **Sources:** B6-09, B6-18
- **Evidence:** the Sale badge is 3.61:1; was and now prices are told apart only by strikethrough.
- **Fix:** a darker badge; visually hidden "Was" and "Now" text. Whether a "was" price needs a reference period is for the solicitor.
- **Files:** `ProductCard.tsx`, `ProductInfo.tsx`. **Effort:** S.

### N-065 Alt text on cards, tiles and thumbnails (Medium)
- **Sources:** B6-17, B2-23, B4-14
- **Evidence:** card images repeat the product name already in the link (read twice) and carry a redundant `tabIndex`; category tiles and thumbnails have generic or missing alt.
- **Fix:** empty alt on card images inside named links; descriptive alt on tiles; "Image 2 of 5" on thumbnails; drop the extra `tabIndex`.
- **Files:** `ProductCard.tsx`, `card-image.tsx`, the category tile component, `ProductGallery.tsx`. **Effort:** S.

### N-066 The toast close button has no accessible name (Medium)
- **Sources:** B6-11
- **Evidence:** `toaster.tsx` renders `ToastClose` with an icon only.
- **Fix:** pass `aria-label="Close"` where `toaster.tsx` uses `ToastClose`. If `toaster.tsx` is inside `components/ui/`, flag it to Phil before editing, since that folder is do-not-modify.
- **Files:** `toaster.tsx`. **Effort:** S.

### N-067 "Goes well with" recommends sold-out, pre-loved and wrong items (Medium)
- **Sources:** B2-15
- **Evidence:** `src/lib/cross-sell.ts` and `src/lib/rank-related.ts` do not exclude out-of-stock or pre-loved items and suggest magazines that do not fit the gun's platform.
- **Fix:** exclude out-of-stock and pre-loved; match magazines by platform; then S3's RPC (N-034).
- **Files:** `src/lib/cross-sell.ts`, `src/lib/rank-related.ts`. **Effort:** S-M.

### N-068 The Google Map loads before any interaction (Medium) [decision] [solicitor]
- **Sources:** B9-05 (map part)
- **Evidence:** `src/components/home/visit-shop.tsx:92-98` embeds a live Maps iframe on the home page with no click-to-load; Google is not named in Privacy.
- **Fix:** PD13. A static image or styled address panel with "Show map" that loads the iframe on click and says Google's terms apply; keep "Get directions". If the live embed stays, S6 names Google in Privacy.
- **Files:** `visit-shop.tsx`, `src/lib/shop-location.ts`, `public/_headers` (through S1). **Effort:** S-M.

### S4 low

- **N-069** (Low) Heading levels: footer headings are h4 (`SiteFooter.tsx:36,52,64`), product cards have no heading, the loadout card uses h4, and "Shop bycategory" is missing a space before `<br/>`. Sources B2-18, B2-24, B2-25, B6-26. Effort S.
- **N-070** (Low) Focus rings are 1 px and the CTA constants in `storefront-styles.ts` have none; `ui/button` references an undefined `--button-outline`. Use a 2 px ring and define the token in `index.css`. Sources B6-19, B6 adjacent. Effort S.
- **N-071** (Low) The fulfilment radio group has no name. Add a legend. Sources B6-21. Effort S.
- **N-072** (Low) Star ratings need `role="img"` and a label; truncated review text is only in a `title` attribute. Sources B6-22, B6-23. Effort S.
- **N-073** (Low) Nav landmarks are unnamed; UtilityBar separators are read out; `/contact` is linked twice in a row. Sources B6-27, B6-28. Effort S.
- **N-074** (Low) Sheets have no `SheetDescription`, so Radix warns. Sources B6-30. Effort S.
- **N-075** (Low) "Best Sellers" links to `/new` (`src/lib/site-navigation-shop.ts:36`). Rename it "New arrivals" or point it at `?sort=featured`. Sources B7-15. Effort S.
- **N-076** (Low) [solicitor] "Download my data" covers the profile and linked orders only. Add a note that enquiries and earlier guest orders are available on request, or extend the export by verified email. Sources B9-14. Files `YourDataCard.tsx`, `use-customer-account-actions.ts`. Effort S.

## S5 Admin UX

### N-077 Product slugs are typed by hand (High)
- **Sources:** B8-01
- **Evidence:** `ProductSlugField.tsx` is the second field, "Slug *", with no generation from the name; a duplicate shows the raw Postgres unique-constraint message (`ProductFormSheet.tsx:85-90`, no 23505 mapping in `admin-products-repository.ts`).
- **Fix:** fill the slug from the name with `toSlug` until it is edited; keep M-039's lock after publishing; move it under "Advanced: web address" with a URL preview; map 23505 through N-078 to "Another product already uses this web address."
- **Files:** `ProductSlugField.tsx`, `ProductFormFields.tsx`, `ProductFormSheet.tsx`, `src/data/admin-products-repository.ts`. **Effort:** S-M.

### N-078 Admin toasts show raw technical errors (Medium)
- **Sources:** B8-21, B8-01 (error part)
- **Evidence:** `error instanceof Error ? error.message : ...` and `loadErrorMessage` pass "JWT expired", "violates check constraint" and "FunctionsHttpError" to Alan (`CounterOrderSheet.tsx`, dashboard cards, `AdminLoadError.tsx`).
- **Fix:** one `src/lib/admin-error-message.ts` mapping expired sessions, network failures and codes 23505, 23503 and 23514 to plain English, with the raw text behind "Details".
- **Files:** new lib file, `CounterOrderSheet.tsx`, `ProductFormSheet.tsx`, `AdminLoadError.tsx`, dashboard cards. **Effort:** M.

### N-079 An outside click or Escape wipes the counter sale (High)
- **Sources:** B8-02
- **Evidence:** `CounterOrderSheet.tsx:89-94` resets the draft on close with no dirty check; M-036's guard covered only the product sheet.
- **Fix:** reuse the M-036 discard guard ("Discard this sale?") when there are lines or a customer name.
- **Files:** `CounterOrderSheet.tsx`, the M-036 hook. **Effort:** S.

### N-080 No bulk sale or discount action (High) [decision]
- **Sources:** B8-03
- **Evidence:** `ProductsBulkBar.tsx` has no sale actions; the sale price is one absolute field with no "% off" helper.
- **Fix:** bulk "Put on sale (x% off)" and "End sale" with a price preview before confirming (M-017 pattern); a "% off" helper; PD9 for end dates.
- **Files:** `ProductsBulkBar.tsx`, `ProductsDialogs.tsx`, the bulk hook, `admin-products-repository.ts`, `ProductFormFields.tsx`. **Effort:** M.

### N-081 The product list cannot be filtered by category, draft or sale (High)
- **Sources:** B8-04
- **Evidence:** `ProductsToolbar.tsx` has stock and search only; `admin-products-repository.ts:91-95` always sorts by category and name; rows have no photo and show the slug; group counts are per page (`ProductsTableGroup.tsx:327-329`).
- **Fix:** URL-kept filters for category, status and on sale; sorts for newest, name and price; a 40 px thumbnail; brand or price instead of slug; "6 on this page" or real totals.
- **Files:** `ProductsToolbar.tsx`, `ProductsTableRow.tsx`, `ProductsTableGroup.tsx`, `use-admin-products-list.ts`, `admin-products-repository.ts`. **Effort:** M.

### N-082 Fulfilment changes give no success feedback and cannot be undone (High)
- **Sources:** B8-05
- **Evidence:** `use-update-fulfillment-status.ts` and `use-orders-actions.ts` toast failures only; the board's one-click advance emails the customer with no confirmation.
- **Fix:** "Marked Posted. Email to customer queued."; an undo window of about 5 seconds on the board, after checking how the email queue handles a reverted status.
- **Files:** the two hooks, `OrderBoardCard.tsx`, `OrdersBoard.tsx`. **Effort:** S (toasts), M (undo).

### N-083 Orders "All" and "Orders Today" include abandoned checkouts (High)
- **Sources:** B8-06
- **Evidence:** `buildOrdersQuery` has no default payment filter; `admin-dashboard-metrics.ts:55-56` counts every created order; tabs say "Pending" and "Expired".
- **Fix:** default to "Paid"; rename the tabs "Unpaid (checkout open)" and "Abandoned"; count paid orders today with "n abandoned checkouts" underneath.
- **Files:** `use-orders-filters.ts`, `OrdersToolbar.tsx`, `src/lib/admin-dashboard-metrics.ts`, `DashboardPage.tsx`. **Effort:** S.

### N-084 The packing slip says "Age verified" on a self-declared tick (High) [decision] [solicitor]
- **Sources:** B9-03
- **Evidence:** the checkout tick is stored as `age_verified` (`build-order.ts:44`); `print/packing-slip.tsx:54-58` prints "Age verified" in bold; moving to `collected` (`order-transitions.ts:14,16`) has no ID prompt, though Terms, Delivery and the collection email promise a photo-ID check.
- **Fix:** relabel "18+ declared online"; PD10: an "ID checked at collection" confirm when a pickup or mixed order moves to `collected`, recording who and when. Close to P-06, which stays parked for counter sales.
- **Files:** `packing-slip.tsx`, the status-change dialog, `src/lib/order-transitions.ts`, a new migration and the transition RPC. **Effort:** S (label), M (check).

### N-085 Brand is a free-text "Brand slug" (Medium)
- **Sources:** B8-07
- **Evidence:** `ProductFormFields.tsx:186-187`; a typo creates a new brand.
- **Fix:** a combobox of existing brands with an explicit "Add new brand".
- **Files:** `ProductFormFields.tsx`, new `src/hooks/use-admin-brands.ts`, `admin-products-repository.ts`. **Effort:** M.

### N-086 Sidebar: closed groups, no badges, counter sale only on Orders (Medium)
- **Sources:** B8-08, B8-20
- **Fix:** flatten the nav or open groups by default; count badges for new orders and enquiries; "New counter sale" in the sidebar and on the dashboard, with `?counter=1`; "View shop"; correct active states.
- **Files:** `AdminSidebar.tsx`, `AdminLayout.tsx`, `DashboardPage.tsx`, `OrdersView.tsx`. **Effort:** S.

### N-087 The dashboard puts the to-do list last and mislabels its stats (Medium)
- **Sources:** B8-09, B8-10, B8-35
- **Evidence:** `OperationalAlertsCard` renders at `DashboardPage.tsx:108`, after charts; "Open Deliveries, awaiting collection" (lines 79-81) mixes both lanes; the Delivery Status card counts every order ever.
- **Fix:** alerts at the top; stat cards link to filtered views; split into "To pack or post" and "Ready for collection"; show open stages only.
- **Files:** `DashboardPage.tsx`, `admin-dashboard-metrics.ts`, `delivery-status-card.tsx`. **Effort:** S.

### N-088 Enquiries: stale status in the sheet, wrong default, no search (Medium)
- **Sources:** B8-11, B8-12, B8-30
- **Evidence:** `InquiriesTable.tsx:37` keeps an object snapshot, so the sheet's Select (`InquiryDetailSheet.tsx:246-248`) shows the old status; the default tab is All; opening never marks read; the source page is plain text.
- **Fix:** store the id and derive from query data; default to New and link the alert to `?status=new`; mark read on open; offer "Mark as replied?" after the reply link; a search box; link the source page.
- **Files:** `InquiriesTable.tsx`, `InquiryDetailSheet.tsx`, `src/lib/admin-alerts.ts`, the enquiries hook and repository. **Effort:** M.

### N-089 Enter in the counter-sale search submits the form (Medium)
- **Sources:** B8-13, B8-31
- **Fix:** Enter adds the first match and does not submit (barcode scanners send Enter); prefill the customer name "Counter sale" and select it on focus.
- **Files:** `CounterOrderProductPicker.tsx`, `src/lib/counter-order-draft.ts`. **Effort:** S.

### N-090 Tracking comes after the status, and "Posted" and "Shipped" both appear (Medium)
- **Sources:** B8-14, B8-33
- **Fix:** tracking above the status, or prompt "Add tracking first?" on Shipped; one word ("Posted") everywhere; show only the order's own lane statuses plus Cancel.
- **Files:** `OrderDetailSheet.tsx`, `OrderTrackingNumberField.tsx`, `OrderFulfilmentSelect.tsx`, the status label map. **Effort:** S.

### N-091 Orders table: no keyboard open, missing columns, one empty state (Medium)
- **Sources:** B8-15, B8-16, B8-32
- **Fix:** a button on the order number; collection or delivery icon, a short item summary and the time for recent orders; "No orders match these filters" with "Clear filters".
- **Files:** `OrdersTable.tsx`, `OrdersTableRow.tsx`, the list select in `orders-repository.ts`. **Effort:** S-M.

### N-092 Admin touch targets are too small for the counter tablet (Medium)
- **Sources:** B8-17, B8-23
- **Evidence:** Edit and Archive are 28 px side by side (`ProductsTableRow.tsx:483-506`); photo buttons are 24 px; the bulk bar wraps to three or four lines on a phone.
- **Fix:** 40 px minimum on `pointer: coarse`; the product name opens Edit; Archive moves into "More"; two primary bulk actions plus "More actions".
- **Files:** `ProductsTableRow.tsx`, `ProductImagesField.tsx`, `OrderFulfilmentSelect.tsx`, `ProductsBulkBar.tsx`. **Effort:** S.

### N-093 Photos have no drag-and-drop upload or reordering (Medium)
- **Sources:** B8-18
- **Fix:** a drop zone, drag reordering and "Uploading 2 of 5".
- **Files:** `ProductImagesField.tsx`, the upload hook. **Effort:** M.

### N-094 Order search misses phone numbers; no customers view (Medium) [decision]
- **Sources:** B8-19
- **Fix:** add phone to `buildOrdersQuery` and the placeholder now; PD14 for a customers view.
- **Files:** `src/data/orders-repository.ts`, `OrdersToolbar.tsx`. **Effort:** S.

### N-095 Product form messages are terse and there is no "Duplicate" (Medium)
- **Sources:** B8-22
- **Fix:** friendlier messages and a character counter; "Duplicate" (slug cleared, draft) and "View on shop"; buttons "Save changes" and "Add product".
- **Files:** the product form schema, `ProductFormSheet.tsx`, `ProductsTableRow.tsx`. **Effort:** S-M.

### N-096 No retention limit on abandoned orders, enquiries or email jobs (Medium) [decision] [solicitor]
- **Sources:** B9-06
- **Evidence:** abandoned orders keep name, email, phone and address for ever (`040_payments_integrity.sql:229-235`); `inquiries` has no purge; `notification_jobs.recipient` goes only by cascade; Privacy says "for the required period".
- **Fix:** PD11; a scheduled job that anonymises abandoned orders after N days, deletes enquiries N months after the last change and deletes sent jobs after N days; S6 states each period in Privacy.
- **Files:** a new migration with `cron.schedule`, `docs/launch-runbook.md` (through S6). **Effort:** M.

### N-097 No tool to answer a guest's erasure or access request (Medium) [decision] [solicitor]
- **Sources:** B9-07 (tools part)
- **Evidence:** `delete-account` removes the auth user only; there is no admin delete for enquiries or anonymise for orders; a guest request needs hand-written SQL.
- **Fix:** "Delete enquiry", "Anonymise customer details" (orders past the dispute window, through a `security definer` RPC) and "Export this customer's data", or an SQL runbook procedure as a stopgap.
- **Files:** a new migration, the orders and enquiries repositories, the admin order and enquiry components. **Effort:** M.

### S5 low

- **N-098** (Low) Admin wording: "Fulfillment" and "fulfilment", "Inquiries" and "enquiry", raw status strings with underscores replaced, "Outside Stripe". One label map; "Fulfilment", "Enquiries", "Ready to collect", "Paid or refunded another way". Sources B8-24, B8-25, B8-26, B8-34. Effort S.
- **N-099** (Low) Light amber publish warning on the dark admin, and admin micro-text below contrast. Theme tokens. Sources B8-27, B6-32. Effort S.
- **N-100** (Low) No keyboard shortcuts. Optional "/" for search and "n" for new. Sources B8-28. Effort S-M.
- **N-101** (Low) Spinners instead of skeletons on the dashboard and lists. Sources B8-29. Effort S.
- **N-102** (Low) [solicitor] A marketing opt-in exists, but there is no consent log or unsubscribe, and opting out clears the timestamp. Before any marketing send: an append-only consent table, an unsubscribe token and endpoint, a runbook note. Sources B9-13. Effort M (when needed).

## S6 Content and legal copy

### N-103 Draft legal notices will go live, and launch has no legal sign-off step (High) [decision] [solicitor]
- **Sources:** B9-01, B9-15, B9-19
- **Evidence:** `LegalDraftNotice.tsx:17` renders "Draft. This page should be reviewed by a solicitor before the site goes live." on Privacy, Terms, Returns and Delivery, and each page lists its internal open points publicly. `docs/audit/hosted-steps.md:182-240` has no sign-off step. `AirsoftLaw.tsx` and the account page legal lines (`YourDataCard.tsx:49,99`) are not on any review list.
- **Fix:** a "Legal pages signed off" step before the gate opens: the solicitor reads Privacy, Terms, Returns, Delivery, AirsoftLaw and the account page lines; each open point is answered; the notices come off page by page; dates are set. Render `LegalDraftNotice` only while `IS_COMING_SOON` is true or in dev.
- **Files:** `docs/audit/hosted-steps.md`, `docs/launch-runbook.md`, `LegalDraftNotice.tsx`, the four pages. **Effort:** S in code.

### N-104 Business identity is incomplete and in three copies (High) [content] [solicitor]
- **Sources:** B9-02, B2-19 (phone and email part)
- **Evidence:** `SITE_LEGAL_NAME` is "Strike Arms Airsoft" (`site-config.ts:16`) while Terms lists the legal name as open; emails say "Strike Arms"; no VAT or company number anywhere; the footer gives only "Swords, Co. Dublin" and hard-codes phone and email (`SiteFooter.tsx:68,76`); the email `SHOP` constant is a third copy. `docs/current-task.md:233-234` lists these as required and blocked on Alan.
- **Fix:** Alan supplies legal name, trading name, CRO and VAT numbers; add them to `BUSINESS` and render from it in the footer, Terms, Privacy, the cancellation form and the email footer, with the full address in the footer.
- **Files:** `src/lib/site-config.ts`, `SiteFooter.tsx`, `Terms.tsx`, `Privacy.tsx`, `Returns.tsx`, `notification-worker/templates/layout.ts`, `supabase/templates/*.html`. **Effort:** S once the data exists.

### N-105 Copy says guns ship, and "Ireland" where only the Republic is served (High) [content]
- **Sources:** B2-01, B9-08, B9-09, B2-03
- **Evidence:** "Ships nationwide" or "Ships across Ireland" in gun copy and meta: `taxonomy-data.ts:19,21,33,35,44,46,66,68`, `taxonomy.ts:28,30,47`, `brand-page-meta.ts:32`, `Sale.tsx:8`, `Brands.tsx:15`, `ArticleLayout.tsx:74`. Guns are collect-only (Delivery, Terms, `ProductInfo.tsx:100`). "Delivery across Ireland" in `ProductInfo.tsx:96`, `FulfillmentChoice.tsx:65` and `Cart.tsx:20`, but checkout takes Republic Eircodes only; `Contact.tsx:50` says the shop ships to Northern Ireland.
- **Fix:** `SHIPPING_LINE_GUNS` ("Collect in store in Swords, Co. Dublin") and `SHIPPING_LINE_POSTABLE` ("Delivery in the Republic of Ireland") in `site-config.ts`, used everywhere; Alan confirms Northern Ireland.
- **Files:** the files above. **Effort:** S.

### N-106 Category and brand copy names brands the shop does not stock (High) [content]
- **Sources:** B2-04, B2-05
- **Evidence:** the Brands hub title and description (`Brands.tsx:13,15`) and the rifle and AEG copy (`taxonomy.ts:28`, `taxonomy-data.ts:19,21`) name Specna, G&G, Krytac and ICS, which are not stocked.
- **Fix:** name only stocked brands, or generate the list from the brand data.
- **Files:** `Brands.tsx`, `taxonomy.ts`, `taxonomy-data.ts`. **Effort:** S.

### N-107 Unsupported claims: bio BBs, "mandatory", mesh eyewear (Medium) [content]
- **Sources:** B2-06, B2-17
- **Evidence:** the bio-BB claim (`taxonomy.ts:32`, `taxonomy-data.ts:101,103`); "Mandatory at every site" in safety copy; mesh eyewear is sold while the shop's own draft says not to recommend it (`SafetyEquipment.tsx`).
- **Fix:** Alan confirms or softens each claim; decide whether mesh eyewear stays listed.
- **Files:** `taxonomy.ts`, `taxonomy-data.ts`, `SafetyEquipment.tsx`. **Effort:** S.

### N-108 The Privacy page does not match what the site does (Medium) [solicitor]
- **Sources:** B9-04, B9-05 (naming part), B9-07 (wording part), B9-12, B9-17
- **Evidence:** enquiries and quote requests are not covered and use a mandatory consent tick as their basis (`consent-field.tsx:24`); Turnstile is said to run on checkout and lookup only (`Privacy.tsx:127`); Google Fonts and Maps are not named; erasure is said to anonymise kept records, but orders keep full details (`Privacy.tsx:101`); the checkout form has no privacy link (`checkout-age-confirmation.tsx:33-43`); no email in "Who we are", no transfers outside the EEA, the date is "September 2026".
- **Fix:** give the solicitor B9's processor list (Supabase, Stripe, Resend, Cloudflare, Google if kept) and the Supabase region; add enquiries with basis and retention; list every Turnstile form; match the erasure wording to the code; add the privacy link at checkout; set the date on sign-off.
- **Files:** `Privacy.tsx`, `consent-field.tsx`, `inquiry-validation.ts`, `checkout-age-confirmation.tsx` (through S4). **Effort:** S.

### N-109 The order confirmation email has no returns or terms information (Medium) [solicitor]
- **Sources:** B9-10
- **Evidence:** `order-confirmed.ts` has no 14-day cancellation, returns or terms link; the footer (`layout.ts:90-96`) has no email address or legal identity.
- **Fix:** a short "Changed your mind?" block linking `/returns` and `/terms`; the shop email and N-104 identity in the footer.
- **Files:** `order-confirmed.ts`, `layout.ts`, `order-blocks.ts`, `supabase/templates/render.ts`. **Effort:** S.

### N-110 Home FAQ facts disagree with the rest of the site (Medium) [content]
- **Sources:** B2-12
- **Evidence:** `FAQSection.tsx` says "Dublin" instead of Swords, hard-codes the phone, says 0.20 g where the guide says 0.25 g, and has no FAQPage schema.
- **Fix:** correct the facts with Alan, read the phone from `BUSINESS`, add FAQPage schema through S1.
- **Files:** `FAQSection.tsx`, `src/pages/Home.tsx`. **Effort:** S.

### N-111 Guides do not link to products (Medium) [content]
- **Sources:** B2-11, B2-26
- **Fix:** an optional guide shop row (two to four products or a category link) in the 11 guide pages; the Upgrades service page links back to its guide.
- **Files:** `src/pages/guides/*`, new `src/components/guide-shop-row.tsx`, the Upgrades service page. **Effort:** M.

### N-112 `/airsoft-shop-dublin` is not built (Medium) [content] [solicitor]
- **Sources:** B2-14
- **Evidence:** the planned local landing page from `seo/` does not exist; the legal spoke pages are blocked on the solicitor.
- **Fix:** build the local page with Alan's copy; legal spokes wait for sign-off.
- **Files:** new page, routes, sitemap (through S1). **Effort:** M.

### S6 low

- **N-113** (Low) "Basket" and "cart" are both used in customer copy. Use "basket" in visible text; routes stay. Sources B7-14. Effort S.
- **N-114** (Low) "An Garda Siochana" without fadas (`AirsoftLaw.tsx:29,62,82`). Use "An Garda Síochána". Sources B9-18. Effort S.
- **N-115** (Low) [solicitor] The order button says "Continue to payment" and terms acceptance is a passive line with no record. If the solicitor asks, set Stripe `consent_collection.terms_of_service` and `custom_text` in `open-session.ts` (after N-054). Sources B9-16. Effort S.
- **N-116** (Low) The footer is missing Brands, Pre-loved and Equipment links, and the footer email is unconfirmed. Sources B2-19 (links part). File `SiteFooter.tsx`. Effort S.
- **N-117** (Low) [decision] [solicitor] The accessibility statement exemption (microenterprise) still needs Alan's headcount and turnover. Sources B6 adjacent, B9 adjacent. Effort S.
- **N-118** (Low) [decision] Green gas, CO2 and LiPo are postable by default, and "Grenades" may include pyrotechnics. Phil confirms courier rules; anything legal goes to the solicitor. Sources B9 adjacent. Effort S.

## Feature suggestions (not counted)

From B7, not defects. Phil picks any he wants for a later phase.

- **S-01:** "In stock only" filter (part of N-053) and back-in-stock requests through the contact form.
- **S-02:** genuine Google reviews near Pay; never a made-up `aggregateRating`.
- **S-03:** "Ships to all of Ireland" messaging for non-gun items, once N-105 settles what may ship. [solicitor]
- **S-04:** a "Your first airsoft gun in Ireland" guide linking a starter-kit listing.
- **S-05:** price-band shortcuts in the Rifles menu.
- **S-06:** a percentage-saved badge on Sale cards and quick add on accessory cards.
- **S-07:** an "Upgrade this at our workshop" link on gun product pages.
- **S-08:** "ready by" messaging for click and collect, if Phil can commit to a service level.

## Dropped

| Source | Finding | Reason |
|---|---|---|
| B4-17 | 13.8 MB of seed PNGs in the repo | Kept on purpose under M-065. B4's idea of pointing `seed.sql` at the WebP copies is optional housekeeping, not new evidence of harm. |
| B2-21 | Superlative trust claims ("oldest", "17 years") | Phil decided to keep Alan's claims before this phase. B2 flagged them only. |
| B8 exclusions | M-028 import undo, M-031 dashboard load, P-02, P-05, P-06, P-07, P-08 | Re-listed by B8 as already fixed or deferred; no new evidence. P-06 is referenced, not reopened, by N-084. |

Reopened rather than dropped, because the audits bring new evidence: P-03 (N-032, N-051), the L5 image-size exclusion (N-025), M-044 card srcset (N-021), M-053 reload guard (N-043) and M-050 realtime intent (N-031).
