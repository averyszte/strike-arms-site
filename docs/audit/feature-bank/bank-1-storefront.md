# Feature bank 1: public storefront and client-side cart

Scope: every route except /admin, the /account pages and the checkout server side. Paths are relative to `artifacts/strike-arms/src` unless they start with `public/`, `supabase/` or `index.html`. Line numbers are the line in the file at commit bc14169.

Status key: **working** (complete and wired up), **partial** (wired up, with a known gap), **stub** (placeholder content only), **hidden** (exists, but no route or link reaches it), **unknown** (depends on config or data I could not see).

---

## 1. App shell, routing and gate

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-001 | Provider stack: Helmet > QueryClient > Tooltip > Cart > Router > ErrorBoundary | App.tsx | none | working | Toaster sits outside AppErrorBoundary, so a toast survives a crash but nothing else does |
| S-002 | Router base taken from BASE_URL | App.tsx | none | working | Sub-path deploys depend on the Vite base being right |
| S-003 | Route table (about 50 public routes) | App.tsx | none | working | Order matters: /store/:category/:subcategory comes before /store/:category |
| S-004 | /login and /signup redirect to the account pages | App.tsx | none | working | Hand-off to accounts |
| S-005 | Lazy AdminArea on /admin/* | App.tsx | none | working | Out of scope; lazy chunk only |
| S-006 | NotFound fallback route | App.tsx, pages/not-found.tsx | none | working | The SPA returns HTTP 200 for unknown paths; only the meta tag says noindex (not-found.tsx:18) |
| S-007 | Scroll to top on route change | hooks/use-scroll-to-top.ts | none | working | Also fires on query-string-only changes? Check the filter UX (ShopPage uses replace navigation) |
| S-008 | Coming-soon gate on/off flag | lib/coming-soon-gate.ts | none | working | IS_COMING_SOON=true (line 7): launch means flipping it and redeploying |
| S-009 | Gate applies only on strikearms.ie and www | lib/coming-soon-gate.ts | none | working | Pages preview hosts are never gated, so they are fully public if anyone knows the URL |
| S-010 | Paths that skip the gate: /admin, /auth/confirm | lib/coming-soon-gate.ts | none | working | Stripe success (/checkout/success) is gated: a live checkout before launch would land on the holding page |
| S-011 | ?preview bypass, saved in localStorage | hooks/use-coming-soon.ts | none | partial | Stays on for good, with no way to turn it off (lines 8-17) |
| S-012 | ComingSoon holding page | pages/ComingSoon.tsx | none | working | Phone and email are hardcoded (lines 32-45) rather than taken from BUSINESS; no SiteLayout |
| S-013 | App error boundary with fallback, resets on location change | components/AppErrorBoundary.tsx | none | working | console.error at line 27 (CLAUDE.md bans console.log; decide whether this counts); fallback has no header or nav |
| S-014 | Supabase config check at boot | lib/supabase.ts, lib/verify-supabase-config.ts | Supabase client | working | Make sure a missing env var fails loudly in prod builds |
| S-015 | Default document title and Inter font from Google Fonts | index.html | fonts.googleapis.com | working | A third-party font request; check the privacy page covers it |
| S-016 | Security headers and CSP | public/_headers | none | working | img-src allows only self, data, blob and Supabase: any external image (a CDN logo, a Google avatar) is blocked |
| S-017 | noindex headers on /cart, /checkout/*, /account*, /admin* | public/_headers | none | working | Also set in page Helmet; the two must stay in step |
| S-018 | HSTS with preload | public/_headers | none | working | Preload is hard to undo; confirm every subdomain is HTTPS |
| S-019 | Legacy PHP 301s and /search to /store | public/_redirects | none | working | No SPA fallback rule on purpose (Pages does it); check the old URLs that carry a query string |
| S-020 | robots.txt | public/robots.txt | none | partial | Does not disallow /checkout or /drafts (draft pages carry meta noindex only) |
| S-021 | sitemap.xml (241 URLs) | public/sitemap.xml | none | partial | Static: products added later are missing until it is regenerated; check it lists no gated or empty shelves |
| S-022 | Draft route /drafts/sections | App.tsx, pages/SectionDrafts.tsx | none | hidden | Public URL with meta noindex only; holds unshipped copy |
| S-023 | Draft route /drafts/evolution | App.tsx, pages/EvolutionDrafts.tsx, components/demo/drafts/* | products (via hooks) | hidden | Same as S-022 |
| S-024 | Demo pages DemoCurated, DemoEditorial, DemoWorkshop, HomeDemo | pages/Demo*.tsx, pages/HomeDemo.tsx, components/demo/{drop,local,manual}/* | none | hidden | Not routed; dead code in the bundle graph, a candidate for deletion |
| S-025 | Unused home sections: AnnouncementBar, ReviewsSection, TrustStrip, PromoBannerSection, AnnotatedRifleSection, ExpertGuidanceSection, WhyBuySection, CategoryStrip, FinalCTASection, AboutStatsSection | components/*.tsx | none | hidden | Nothing renders them. AnnouncementBar hardcodes the phone (AnnouncementBar.tsx:8) |

## 2. Layout, header, navigation, footer

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-026 | SiteLayout: sticky utility bar and header, main, footer | components/SiteLayout.tsx | none | working | `className` prop is used to scope `.theme-drop` on Home only |
| S-027 | Utility bar links: Find Us, Help, Airsoft Law, Track an Order | components/UtilityBar.tsx | none | working | Hidden below md; Find Us and Help both go to /contact; Track an Order goes to /account (line 7) |
| S-028 | Header logo (text wordmark) | components/SiteHeader.tsx | none | working | |
| S-029 | Desktop primary nav with mega menu | components/SiteHeader.tsx, lib/site-navigation.ts | none | partial | Opens on mouseenter only (SiteHeader.tsx:80): no click, focus or keyboard handler, so touch tablets at lg width and keyboard users cannot open it |
| S-030 | Mega menu close delay (120 ms timer) | components/SiteHeader.tsx | none | working | |
| S-031 | Mega menu links: wouter Link for app routes, plain anchor otherwise | components/SiteHeader.tsx, lib/is-app-route.ts | none | working | |
| S-032 | Prune nav links whose shelf has no published products | lib/prune-navigation.ts, hooks/use-shelf-counts.ts | products (listFacetRows) | working | Every page load fetches every published product's facet row for the header (use-shelf-counts.ts:12-16), paged in 1000-row reads; cost grows with the catalogue |
| S-033 | Nothing is pruned while counts load (no flicker) | lib/prune-navigation.ts | none | working | A failed facet read shows the full menu, dead ends included |
| S-034 | Desktop live search box (expands on focus) | components/SearchDropdown.tsx | see S-120 | working | |
| S-035 | Mobile search toggle and full-width bar | components/SiteHeader.tsx | none | working | Autofocus after 50 ms (SearchDropdown.tsx:29) |
| S-036 | Account icon links to /account | components/SiteHeader.tsx | none | working | Hand-off to accounts |
| S-037 | Cart icon with item count badge (99+ cap) and aria label | components/SiteHeader.tsx | none | working | Count comes from localStorage cart |
| S-038 | Mobile drawer with accordion groups | components/site-header-mobile-drawer.tsx, lib/mobile-navigation.ts | products (facet rows) | working | Pruned the same way as desktop |
| S-039 | Mobile drawer footer links: Airsoft Law, Contact, Account, Cart | components/site-header-mobile-drawer.tsx | none | working | |
| S-040 | Footer nav, shop, contact and legal columns | components/SiteFooter.tsx | none | partial | Phone and email hardcoded (lines 68, 76); shop links are static and not pruned, so an empty shelf (e.g. /store/gear) can still be linked |
| S-041 | PageHero (crumbs, eyebrow, title, intro, compact) | components/PageHero.tsx | none | working | |
| S-042 | JsonLd injector | components/JsonLd.tsx | none | working | |
| S-043 | Storefront style tokens (CTA, EYEBROW, PANEL, phoneHref) | lib/storefront-styles.ts | none | working | phoneHref is in a style file; consider moving it to lib/contact-links |

## 3. Home page

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-044 | Home Helmet: title, description, canonical, OG | pages/Home.tsx | none | working | |
| S-045 | Organisation, WebSite and LocalBusiness JSON-LD | pages/Home.tsx, lib/structured-data.ts | none | working | SportingGoodsStore has no geo, image or priceRange; logo is favicon.svg (Google prefers a raster logo) |
| S-046 | Hero video with poster and failure fallback | components/HeroSection.tsx | none | partial | Only a webm is shipped (public/videos); the mp4 source is a comment (line 39), so Safari on older iOS gets the poster only |
| S-047 | Hero CTAs: Shop (/store) and Visit the store (#visit) | components/HeroSection.tsx | none | working | |
| S-048 | Hero Google rating badge with part-filled stars | components/hero-review-badge.tsx, lib/review-bank.ts | none | partial | Rating is hardcoded "4.7, November 2026" (review-bank.ts:20) and goes stale silently |
| S-049 | Trust marquee | components/demo/combined/trust-marquee.tsx | none | working | Superlative claims kept on purpose (see memory); legal review item |
| S-050 | Brand logo marquee (reversed direction, pause) | components/BrandMarquee.tsx, lib/brand-logos.ts | none | working | Local webp logos; trademark use of brand logos |
| S-051 | Category grid | components/demo/combined/category-grid.tsx | none | working | Static links, not pruned against shelf counts |
| S-052 | Evolution band, hidden when there are no Evolution products | components/demo/combined/evolution-band.tsx, hooks/use-evolution-products.ts, lib/evolution-band.ts | products (tag evolution-range, price-asc, 12) | working | A failed read hides the band silently (line 30) |
| S-053 | Evolution rail cards with payable price | components/demo/combined/evolution-rail-card.tsx | none | working | payablePriceCents is a third copy of the "sale only if lower" rule (also ProductCard, ProductInfo) |
| S-054 | Loadout showcase with tabs and hotspot product cards | components/demo/combined/loadout-showcase.tsx, hooks/use-loadout-products.ts, lib/loadouts.ts | products (listProductsBySlugs) | partial | Hardcoded slugs: a renamed or unpublished product quietly drops off the card |
| S-055 | Guides lineup | components/demo/combined/lineup.tsx, lib/guides.ts | none | working | |
| S-056 | Reviews feature with ranked review cards | components/demo/combined/reviews-feature.tsx, review-parts.tsx, lib/review-bank.ts, lib/google-reviews.ts | none | partial | Reviews are a static copy of Google's; check Google's terms on republishing review text |
| S-057 | Read and write review links (Google place ID) | components/demo/combined/review-parts.tsx | google.com | working | External links open in a new tab with noopener |
| S-058 | Visit the shop: address, hours, phone, directions, map iframe | components/demo/combined/visit-shop.tsx, lib/shop-location.ts | google.com maps embed | working | Keyless embed sets Google cookies before any consent (privacy page says no tracking cookies) |
| S-059 | FAQ accordion | components/FAQSection.tsx | none | working | No FAQPage JSON-LD on Home |
| S-060 | Final CTA with phone link | components/demo/combined/final-cta.tsx | none | working | tel number hardcoded (line 37) |
| S-061 | `.theme-drop` scoped theme on Home only | pages/Home.tsx, CSS | none | working | Home looks different from every other page by design |

## 4. Catalogue: shop, category and subcategory pages

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-062 | /store, /store/:category, /store/:category/:subcategory | pages/ShopPage.tsx | products | working | |
| S-063 | Category and subcategory slugs checked against the taxonomy, else NotFound | pages/ShopPage.tsx, lib/taxonomy.ts | none | working | Taxonomy is in code; a new subcategory in the DB is unreachable until the code changes |
| S-064 | URL is the filter state (replace navigation) | pages/ShopPage.tsx, lib/category-filters.ts, hooks/use-url-params.ts | none | working | |
| S-065 | Parse filters from the query string | lib/category-filters.ts | none | partial | parseInt with no NaN guard: ?page=abc gives NaN and range(0, NaN) errors; ?minPrice=abc gives NaN (lines 38-49) |
| S-066 | Page size 24, Load more | lib/category-filters.ts, components/catalog/Pagination.tsx | products | partial | Load more re-fetches range(0, page*24-1), so each click downloads every earlier row again; ?page=1000 asks for 24,000 rows |
| S-067 | Page clamp when filters shrink the result | hooks/use-page-clamp.ts | none | working | |
| S-068 | "Showing x of y" count | components/catalog/Pagination.tsx | products count | working | |
| S-069 | Results header with sort dropdown (5 sorts) | components/catalog/ResultsHeader.tsx, SortDropdown.tsx | none | working | |
| S-070 | Featured sort: is_featured, type_rank, created_at, id | data/products-repository.ts | products, type_rank (037) | working | |
| S-071 | Newest, price asc/desc (effective price), name A-Z | data/products-repository.ts | products.effective_price_cents | working | |
| S-072 | Category filter | data/products-repository.ts | products.category | working | |
| S-073 | Subcategory filter | data/products-repository.ts | products.subcategory, subcategories | working | |
| S-074 | Brand filter (multi-select, `in`) | data/products-repository.ts, components/catalog/brand-filter.tsx | products.brand | working | |
| S-075 | Brand list collapses past BRAND_COLLAPSE_AT | components/catalog/brand-filter.tsx, lib/facet-options.ts | none | working | |
| S-076 | Price range filter | data/products-repository.ts | products.price_cents | partial | Filters on the list price while the sort and the card use the sale price, so a sale item can sit inside or outside the range inconsistently (lines 82-85) |
| S-077 | Price slider: two thumbs on a non-linear scale | components/catalog/price-range-filter.tsx, lib/price-scale.ts | none | working | |
| S-078 | Price text boxes commit on blur or Enter | hooks/use-price-range-draft.ts | none | working | |
| S-079 | Price ceiling rounds up to the next 100 EUR | lib/catalog-facets.ts | none | working | |
| S-080 | In-stock switch | data/products-repository.ts, FilterSidebar.tsx | products.in_stock (038) | working | in_stock is a hand-set boolean |
| S-081 | On-sale switch (sale_price_cents not null) | data/products-repository.ts | products.sale_price_cents | partial | A sale price at or above the list price counts as "on sale" here but shows no Sale badge on the card |
| S-082 | Condition filter (one at a time) | components/catalog/condition-filter.tsx, lib/product-condition.ts | products.condition (018) | working | |
| S-083 | Category tree, empty shelves hidden | components/catalog/CategoryTree.tsx, lib/shelf-visibility.ts | facet rows | working | |
| S-084 | Facet counts per option | lib/catalog-facets.ts, data/catalog-facets-repository.ts, hooks/use-catalog-facets.ts | products (paged 1000-row reads) | partial | matches() ignores tag, excludeTags, isNewOnly and q (lines 11-25); counts disagree with the grid wherever those filters apply |
| S-085 | Facets narrowed to search matches | data/catalog-facets-repository.ts (listSearchMatchIds) | products.search_text | partial | No paging: capped at 1000 IDs |
| S-086 | Active filter chips, Clear all keeps shelf and q | components/catalog/ActiveFilterChips.tsx, lib/active-filter-chips.ts | none | working | |
| S-087 | Desktop sticky filter sidebar | components/catalog/FilterSidebar.tsx | none | working | |
| S-088 | Mobile filter sheet with "Show N products" | components/catalog/MobileFilterSheet.tsx | none | working | |
| S-089 | Free-text ?q search on the grid (ilike on search_text) | data/products-repository.ts, lib/escape-search-term.ts | products.search_text (015) | working | The grid uses ilike, the dropdown uses the ranked RPC: results and order differ between the two |
| S-090 | Search-term escaping (strips , ( ) % _ \ " ') | lib/escape-search-term.ts | none | working | |
| S-091 | Shop heading and breadcrumbs | lib/shop-heading.ts | none | working | |
| S-092 | Shop meta: canonical to subcategory only when it has SEO copy; search noindexed | lib/shop-page-meta.ts | none | working | Filtered URLs (brand, price) canonicalise to the shelf; check that this is intended |
| S-093 | Product grid with skeletons, error, empty and Clear filters states | components/catalog/ProductGrid.tsx | none | working | |
| S-094 | Load error shown only when there is nothing older to show | components/catalog/ProductGrid.tsx, CatalogLoadError.tsx | none | working | |
| S-095 | Previous results kept while refetching (placeholderData) | hooks/useProducts.ts | none | working | |
| S-096 | Load-error message reader (PostgrestError, TypeError) | lib/load-error-message.ts | none | working | |
| S-097 | Doc comment in types/product.ts | types/product.ts | none | partial | Malformed comment at lines 74-77 (bulk-action comment fused with the stock-filter one) |

## 5. Product card and product detail

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-098 | Product card: image, brand, name, price | components/catalog/ProductCard.tsx | none | working | Brand shown as the slug with hyphens turned to spaces (line 68), not getBrandName, so "5-11" reads "5 11" |
| S-099 | Card image fallback | components/catalog/ProductCard.tsx | none | partial | Falls back to the rifles category image for any product (line 13) |
| S-100 | Card badges: Pre-loved > New > Featured, plus Sale, Out of stock | components/catalog/ProductCard.tsx | none | working | |
| S-101 | Card sale price shown only when below list | components/catalog/ProductCard.tsx | none | working | |
| S-102 | /products/:slug, published only | pages/ProductDetail.tsx, hooks/useProduct.ts, data/products-repository.ts | products | working | |
| S-103 | Failed read shows a retry page, not a 404 | pages/ProductDetail.tsx, components/catalog/CatalogLoadErrorPage.tsx | none | working | |
| S-104 | Product skeleton while loading | pages/ProductDetail.tsx | none | working | |
| S-105 | Product breadcrumbs from the taxonomy | pages/ProductDetail.tsx | none | working | |
| S-106 | Product Helmet: title, description, canonical, OG image, price meta | pages/ProductDetail.tsx | none | partial | Price meta uses salePrice ?? price (line 64), while the page shows the sale price only when it is lower, so the two can disagree |
| S-107 | Product JSON-LD (Offer, availability, condition) | lib/structured-data.ts | none | partial | Same salePrice ?? price rule (line 169); no seller, shippingDetails or hasMerchantReturnPolicy (Merchant listing warnings); empty image array when there are no photos; sku is the UUID |
| S-108 | Gallery with thumbnails | components/catalog/ProductGallery.tsx | Supabase Storage images | working | No zoom or swipe; fallback is the rifles image (line 7) |
| S-109 | Product info: brand, name, price, stock and pre-loved badges, short description | components/catalog/ProductInfo.tsx | none | working | Long description is never rendered |
| S-110 | Add to cart, disabled when out of stock | components/catalog/ProductInfo.tsx | none | working | No quantity picker; adds 1 each click (line 76) |
| S-111 | Add-to-cart toast, collect-only wording | components/catalog/ProductInfo.tsx | none | working | |
| S-112 | Delivery or collect-only line | components/catalog/ProductInfo.tsx | none | working | |
| S-113 | Pre-loved "sold as seen" notice (guns vs kit wording) | components/catalog/PreLovedNotice.tsx, lib/product-condition.ts | none | working | Gun list is a hardcoded set of subcategories |
| S-114 | "Goes well with" cross-sell row | components/catalog/ProductRecommendations.tsx, hooks/use-related-products.ts, lib/cross-sell.ts, lib/rank-related.ts | products (listByTarget, one query per shelf) | working | |
| S-115 | "You might also like" similar row | hooks/use-related-products.ts | products (2 queries of 12) | working | |
| S-116 | Row hidden when empty | components/catalog/ProductRecommendations.tsx | none | working | Failed reads hide the row silently |
| S-117 | Row mapper (snake to camel) | lib/product-mappers.ts | none | working | |
| S-118 | Price formatting | lib/format-price.ts | none | working | toFixed(2) with a euro sign, not Intl; no thousands separator (EUR 1234.00) |

## 6. Header search

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-119 | Debounced (250 ms) live search, at least 2 characters | hooks/use-search-products.ts | none | working | |
| S-120 | search_products RPC (limit 6) | data/products-repository.ts | RPC search_products (015, security invoker, published only, limit clamped 1-50) | working | |
| S-121 | Case-folded cache key | hooks/use-search-products.ts | none | working | |
| S-122 | No retry on PGRST errors, one retry otherwise | hooks/use-search-products.ts | none | working | |
| S-123 | Error, searching, results and no-results states | components/SearchDropdown.tsx | none | working | |
| S-124 | Arrow keys, Enter and Escape | components/SearchDropdown.tsx | none | working | Enter fires the search even while the panel is closed |
| S-125 | "View all results" goes to /store?q= | components/SearchDropdown.tsx | none | working | See S-089: the full results come from a different query |
| S-126 | Click outside closes; blur closes after 150 ms | components/SearchDropdown.tsx | none | working | The 150 ms blur timer (lines 118-124) is not cleared on unmount |
| S-127 | Clear button | components/SearchDropdown.tsx | none | working | |
| S-128 | Result row | components/SearchResultRow.tsx | none | working | |
| S-129 | Combobox ARIA (role, expanded, listbox) | components/SearchDropdown.tsx | none | partial | No aria-activedescendant, and options have no ids, so screen readers do not hear the highlighted result |

## 7. Shelf pages and brands

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-130 | Shared listing page (Helmet, breadcrumb JSON-LD, hero, grid) | components/catalog/ProductListingPage.tsx | products | partial | No pagination: 48 items maximum and nothing beyond, with no "x of y" |
| S-131 | /new: is_new, newest, 48 | pages/NewArrivals.tsx | products.is_new | working | |
| S-132 | /sale: on sale, featured, 48 | pages/Sale.tsx | products.sale_price_cents | partial | Same rule as S-081 |
| S-133 | /pre-loved: excludes jumble and wallhanger tags | pages/PreLoved.tsx | products.condition, tags | working | |
| S-134 | /jumble: tag jumble | pages/Jumble.tsx | products.tags | working | |
| S-135 | /safety-equipment: tag safety | pages/SafetyEquipment.tsx | products.tags | working | Deliberately makes no protection claim |
| S-136 | /evolution: tag evolution-range | pages/Evolution.tsx | products.tags | working | |
| S-137 | Empty listing's "Clear filters" goes to /store | components/catalog/ProductListingPage.tsx | none | partial | Wording is odd on a shelf page with no visible filters |
| S-138 | /gift-cards | pages/GiftCards.tsx | none | stub | Intro is just "Coming soon." (line 25) but it is indexable and has a canonical |
| S-139 | /brands index | pages/Brands.tsx, hooks/useProducts.ts (useBrands) | products (tallied in the browser) | partial | No error state: a failed read shows an empty grid (line 51); tally capped at 1000 rows |
| S-140 | /brands/:slug with its own pagination | pages/BrandPage.tsx, components/catalog/BrandPageHeader.tsx, lib/brand-page-meta.ts | products, useBrandCategories | partial | The brand comes from the 1000-row tally, so a brand found only past the cap 404s (line 68); page number is local state, not in the URL |
| S-141 | Brand display names | lib/brands.ts | none | working | |

## 8. Cart (client)

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-142 | Cart context: add (merging duplicate lines), set quantity, remove, clear, update | lib/cart-context.tsx, hooks/use-cart.ts | none | working | |
| S-143 | Cart persisted to localStorage, checked line by line | lib/cart-storage.ts | none | working | Key strike-arms:cart:v1; corrupt data is dropped silently |
| S-144 | Up to 20 per line | lib/cart-context.tsx | none | partial | MAX_QUANTITY_PER_LINE (line 22); the + button is never disabled at 20, it just stops (CartLineRow.tsx:59-67) |
| S-145 | No stock cap | lib/cart-context.tsx | products.in_stock | partial | in_stock is a boolean, so nothing stops quantity 20 of a one-off pre-loved gun |
| S-146 | Freshness check on cart open: price, name, shippable; unpublished items dropped | hooks/use-cart-freshness.ts, lib/cart-refresh.ts, data/cart-freshness-repository.ts | products | partial | Never reads in_stock, so an out-of-stock item stays in the cart until checkout rejects it; no is_archived filter (relies on archiving unpublishing); runs refreshCartLines twice (lines 20-21) |
| S-147 | Cart changes notice | components/cart/CartChangesNotice.tsx | none | working | |
| S-148 | Cart line row: image, name, price, quantity, remove | components/cart/CartLineRow.tsx | none | partial | Image fallback /images/placeholder-product.png (line 28) does not exist in public/images, so it shows a broken image |
| S-149 | Delivery or collection choice | components/cart/FulfillmentChoice.tsx | none | partial | wantsDelivery is not persisted (cart-context.tsx:45), so a reload resets it to collect |
| S-150 | Delivery disabled when nothing is shippable; mixed-basket note | components/cart/FulfillmentChoice.tsx, lib/cart-totals.ts | none | working | |
| S-151 | Subtotal; the delivery subtotal counts only shippable lines | lib/cart-totals.ts | none | working | |
| S-152 | Flat delivery rate, free over the threshold | lib/shipping.ts | none | working | Duplicated in supabase/functions/_shared/shipping.ts; the two must stay identical |
| S-153 | VAT taken out of the gross total | lib/cart-totals.ts | none | working | |
| S-154 | Store rates read from store_settings (10 min cache) | hooks/use-store-rates.ts, data/settings-repository.ts | store_settings id=1 (010) | working | No fallback on purpose; pricing is null while loading |
| S-155 | Cart summary with free-delivery shortfall nudge | components/cart/CartSummary.tsx, hooks/use-cart-pricing.ts | none | partial | Total falls back to the items subtotal while rates load, so the figure jumps |
| S-156 | Empty cart | components/cart/EmptyCart.tsx | none | working | |
| S-157 | Cart page Helmet with noindex and canonical | pages/Cart.tsx | none | working | |

## 9. Checkout (client side)

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-158 | Checkout form: name, email, phone (optional) | components/cart/CheckoutForm.tsx, components/cart/CheckoutField.tsx | none | working | Prefill from the customer profile is set during render |
| S-159 | Delivery address fields (line 1, city, Eircode required) | components/cart/DeliveryAddressFields.tsx | none | working | |
| S-160 | Validation: name, email, age, Eircode | lib/checkout-validation.ts | none | partial | Eircode regex /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i (line 14) rejects D6W, Dublin 6W's real routing key |
| S-161 | Age 18+ checkbox, required | components/cart/CheckoutForm.tsx, lib/checkout-validation.ts | sent as ageConfirmed | working | The only age gate on the site; product pages have none |
| S-162 | Terms and returns links in the form | components/cart/CheckoutForm.tsx | none | working | Both pages are drafts (see S-180) |
| S-163 | Turnstile 'checkout' bot check | components/cart/CheckoutForm.tsx, hooks/use-turnstile.ts, components/BotCheck.tsx | challenges.cloudflare.com | partial | Submit stays disabled until a token arrives; if Turnstile fails there is only a reload message |
| S-164 | Token reset after each submit | components/cart/CheckoutForm.tsx | none | working | |
| S-165 | Create checkout session call (no prices sent) | hooks/use-checkout.ts, data/checkout-repository.ts | Edge Function create-checkout-session | working | Redirects with window.location.href = session.url |
| S-166 | Checkout attempt ID in sessionStorage | data/checkout-attempt-repository.ts | none | working | |
| S-167 | Function error message parsing | data/function-error-message.ts | none | working | |

## 10. Checkout success and order lookup UI

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-168 | /checkout/success reads ?order and ?session | pages/CheckoutSuccess.tsx | none | working | Gated by coming soon (S-010) |
| S-169 | Polls checkout-status every 2 s, up to 30 times | hooks/use-checkout-confirmation.ts, data/checkout-status-repository.ts | Edge Function checkout-status | partial | Missing ids go straight to 'unconfirmed'; a query error stops polling ('delayed') after 2 retries |
| S-170 | States: confirming, paid, delayed, unconfirmed | pages/CheckoutSuccess.tsx | none | working | |
| S-171 | On paid: clear the cart and the attempt ID | hooks/use-checkout-confirmation.ts | none | working | |
| S-172 | Create-account nudge | components/account/CreateAccountNudge.tsx | none | working | Hand-off to accounts |
| S-173 | Guest order lookup form (Turnstile 'order-lookup', maxLength 20) | components/order-lookup/*, hooks/use-order-lookup.ts | Edge Function order-lookup | working | Mounted on /account; hand-off |
| S-174 | Lookup reply shape check; shared mapper with my_orders | data/order-lookup-repository.ts | RPC my_orders | working | |
| S-175 | Looked-up order card with An Post tracking link | components/order-lookup/LookedUpOrderCard.tsx, lib/tracking-number.ts | none | working | |
| S-176 | Order timeline from fulfilment lanes | components/order-lookup/OrderTimeline.tsx, lib/order-timeline.ts, lib/order-transitions.ts | none | working | |
| S-177 | Order number from the query string (SA-YYYY-NNNN) | lib/order-lookup-display.ts | none | working | Pattern /^SA-\d{4}-\d{4,8}$/ |

## 11. Forms: contact and service quotes

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-178 | Contact form (name, email, phone, subject, message, consent) | components/contact/contact-form.tsx, lib/inquiry-validation.ts | Edge Function submit-inquiry, inquiries (036) | working | No maxLength on inputs; the server caps them (name 200, message 5000) |
| S-179 | Message 10 to 2000 characters | lib/inquiry-validation.ts | none | working | The client says 2000, the server allows 5000 |
| S-180 | Honeypot field and 3 s "too fast" check, faked success | components/contact/honeypot-field.tsx, lib/inquiry-validation.ts | none | working | A real fast typist or autofill under 3 s is told "sent" and the message is dropped (inquiry-validation.ts:78) |
| S-181 | Turnstile 'inquiry' | components/contact/contact-form.tsx | challenges.cloudflare.com | partial | Same failure mode as S-163 |
| S-182 | Server error message, or a generic one with the phone number | hooks/use-inquiries.ts | none | working | |
| S-183 | Thank-you panel | components/contact/contact-form.tsx | none | working | It promises a reply in a day or two, but nothing emails the shop (ServiceQuoteForm comment) |
| S-184 | Service quote form (gun, details) | components/service/ServiceQuoteForm.tsx, lib/service-quote.ts | submit-inquiry | working | Subject "Quote request — {service}" |
| S-185 | Quote message built from its fields | lib/service-quote.ts | inquiries.message | working | |
| S-186 | Source page saved with each inquiry | contact-form.tsx, ServiceQuoteForm.tsx | inquiries.source_page | working | |
| S-187 | Bot-check widget loader (script only on form pages) | hooks/use-turnstile.ts | challenges.cloudflare.com | unknown | No site key means no widget; hosted functions refuse a missing token, so VITE_TURNSTILE_SITE_KEY must be set on Pages |

## 12. Content pages

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-188 | /contact: address, hours, maps link, contact form, JSON-LD | pages/Contact.tsx, lib/shop-location.ts | submit-inquiry | working | |
| S-189 | /about with CtaBand | pages/About.tsx | none | working | |
| S-190 | /airsoft-law | pages/AirsoftLaw.tsx | none | working | Legal accuracy needs review |
| S-191 | /where-to-play | pages/WhereToPlay.tsx | none | working | Third-party site details go stale |
| S-192 | /glossary with DefinedTermSet JSON-LD and anchors | pages/Glossary.tsx, lib/glossary.ts | none | working | |
| S-193 | /guides hub | pages/GuidesHub.tsx, lib/guides.ts | none | working | |
| S-194 | 11 guide pages with Article, FAQ and breadcrumb JSON-LD | pages/guides/*, components/article/ArticleLayout.tsx | none | working | datePublished equals dateModified (updatedISO); fixed dates |
| S-195 | /services hub | pages/services/ServicesHub.tsx, lib/services.ts | none | working | |
| S-196 | 6 service pages with Service, FAQ, breadcrumb JSON-LD, TOC, steps, tiles, quote block | pages/services/*, components/service/* | submit-inquiry | working | |
| S-197 | Active-section TOC highlight | hooks/use-active-section.ts, components/service/ServiceTocNav.tsx | none | working | |
| S-198 | Rotating index helper | hooks/use-rotating-index.ts | none | working | |

## 13. Legal pages

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-199 | Legal draft notice | components/LegalDraftNotice.tsx | none | partial | Shows "Draft ... reviewed by a solicitor" to the public (line 17) |
| S-200 | /terms | pages/Terms.tsx | none | partial | Open points: legal name, company number, VAT number, ID at collection |
| S-201 | /privacy | pages/Privacy.tsx | none | partial | Open points: record retention, Turnstile cookies. Says no tracking cookies, but the Maps embed and Google Fonts call third parties |
| S-202 | /returns with cancellation form text | pages/Returns.tsx | none | partial | Open points: 14 days for click and collect, collect-only returns, hygiene items |
| S-203 | /delivery with live rates from store_settings | pages/Delivery.tsx, hooks/use-store-rates.ts | store_settings | partial | Rates are still placeholders (open point); collection hours use only the first opening-hours entry (line 21) |
| S-204 | Business details (address, phone, email, hours) in one place | lib/site-config.ts | none | partial | Footer, ComingSoon and final-cta still hardcode copies |
| S-205 | SITE_URL defaults to production when VITE_SITE_URL is unset | lib/site-config.ts | none | working | Preview builds would canonicalise to production (intended) |

## 14. Analytics, cookies and age gating

| ID | Feature | Files | Backend touched | Status | Watch |
|---|---|---|---|---|---|
| S-206 | Analytics | none | none | stub | None installed (no gtag, Plausible or similar) |
| S-207 | Cookie banner | none | none | stub | None. The privacy page says none is needed, but the keyless Google Maps iframe on Home sets cookies |
| S-208 | Age gate | lib/checkout-validation.ts | none | partial | Only the checkout checkbox (S-161); no site-wide age notice for replica-firearm pages |

---

## Cross-area hand-offs

- **Accounts:** /account*, /login and /signup redirects, CreateAccountNudge on the success page, guest order lookup mounted on /account, the my_orders RPC shared mapper, and checkout prefill from the customer profile (use-checkout-prefill, use-customer-session).
- **Checkout server:** create-checkout-session (price, stock, published and age checks, attempt ID idempotency), checkout-status, stripe-webhook, and _shared/shipping.ts, which must match lib/shipping.ts. Confirm the server refuses out-of-stock lines, because the client cart never checks stock (S-145, S-146), and that it applies the same "sale only when lower" rule as the UI.
- **Admin:** store_settings rates (still placeholders), the in_stock switch (038), is_archived vs is_published (cart freshness relies on archiving unpublishing), product tags that drive the Jumble, Safety, Evolution and Pre-Loved shelves, the inquiries inbox (reading what submit-inquiry wrote), and the subcategories table vs the hardcoded taxonomy.
- **Backend/security:** submit-inquiry rate limits (035) and the inquiries lockdown (036); order-lookup rate limiting; the search_products RPC (015) is security invoker; and the CSP img-src for any future external images.
- **SEO:** static sitemap (241 URLs), robots.txt gaps (/checkout, /drafts), Product schema gaps (no shippingDetails or return policy), the indexable gift-cards stub, filtered-URL canonical policy, the 200 status on 404s, and the 301 map in _redirects.
- **Legal/content:** LegalDraftNotice open points on four pages, the Google reviews republishing, brand logo use, superlative trust claims, Maps cookies vs the privacy page, and the age gate scope.
- **Ops/launch:** IS_COMING_SOON flip, the permanent ?preview flag, VITE_TURNSTILE_SITE_KEY and VITE_SITE_URL on Pages, the missing placeholder-product.png, the hero mp4, and the hardcoded GOOGLE_RATING date.
