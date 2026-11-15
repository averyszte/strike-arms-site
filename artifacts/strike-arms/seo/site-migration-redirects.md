# Strike Arms — Site Migration & Redirect Map

Context: **strikearms.ie is currently Alan's OLD live site** — a small custom-PHP informational site
(not e-commerce). The new React build replaces it. To preserve existing rankings, backlinks, and
bookmarks, every old URL must 301-redirect to its closest new equivalent at cutover.

Crawled the live old site directly (no sitemap.xml or robots.txt exists on it — both return 404).

## Old-site URL inventory

The first crawl found 7 pages. The phase 2 audit (B1-03, 2026-11) found more in the
Wayback Machine, from the 2022 PHP site and a 2016 WordPress/WooCommerce shop. The live
rules are in `public/_redirects`, which is the source of truth; this table follows it.

| Old URL | Old page title | Notes |
|---|---|---|
| `/` (`index`, `/index.php`) | Home | "Northside Dublin's only walk-in Airsoft store", 17 years trading |
| `/Contact-us.php` | Contact us | store hours + phone |
| `/guns-n-gear.php` | Guns N' Gear | product/gear reference (not a real shop — informational) |
| `/About-Airsoft.php` | What is Airsoft | educational |
| `/Airsoft-and-the-Law.php` | Airsoft and the Law | **key ranking asset** (ranks for Irish airsoft-law queries) |
| `/Care-for-your-Rifle.php` | Care for your Rifle | maintenance educational |
| `/Where-to-Play.php` | Where to Play | local play info |
| `/Accessories.php` | Accessories | 2022 category page (Wayback) |
| `/Airsoft-Guns.php` | Airsoft Guns | 2022 category page (Wayback) |
| `/Consumables.php` | Consumables | 2022 category page (Wayback) |
| `/Safety-Wear.php` | Safety Wear | 2022 category page (Wayback) |
| `/gear`, `/weapons`, `/industry-news` | WordPress paths | 2016 shop (Wayback) |
| `/?product=…`, `/?page_id=…`, `/?p=…` | WordPress query URLs | land on `/` already; `_redirects` cannot match a query string |

Confirmed primary-source facts (from the old site, Alan's own copy — still worth Alan re-confirming):
- Northside Dublin's only walk-in airsoft store.
- Seventeen years trading.
- Physical store with published hours and phone.

## 301 redirect map (old → new)

Shipped in Cloudflare Pages `public/_redirects`. Pages matches paths case-sensitively, so
every mixed-case `.php` rule has a lowercase twin. `src/lib/redirect-targets.test.ts`
fails if any target is not a real route.

| Old URL | New URL | Rationale |
|---|---|---|
| `/Airsoft-and-the-Law.php` | `/airsoft-law` | **Highest-priority redirect** — preserves the one page with real rankings/links. |
| `/Where-to-Play.php` | `/where-to-play` | Direct topical match. |
| `/Care-for-your-Rifle.php` | `/guides/airsoft-maintenance` | Maintenance guide is the successor. |
| `/About-Airsoft.php` | `/guides/beginners-guide` | "What is airsoft" → beginner pillar. |
| `/guns-n-gear.php` | `/store` | Gear reference → the actual shop. |
| `/Contact-us.php` | `/contact` | Direct match. |
| `/Accessories.php` | `/store/accessories` | Category match. |
| `/Airsoft-Guns.php` | `/store/rifles` | Main gun category. |
| `/Consumables.php` | `/store/consumables` | Category match. |
| `/Safety-Wear.php` | `/safety-equipment` | Safety shelf. |
| `/index.php` | `/` | Home. |
| `/gear` | `/store` | Old WordPress shop path. |
| `/weapons` | `/store/rifles` | Old WordPress shop path. |
| `/industry-news` | `/guides` | Old blog → guides hub. |
| `/` | `/` | Home stays; new home replaces old. |

## Migration checklist (P0 — do at/around cutover)

1. **Redirects first.** Ship the `_redirects` above before or with the DNS/hosting cutover — no gap where old URLs 404.
2. **Preserve the strongest asset.** The new `/airsoft-law` hub must be as good or better than the old `Airsoft-and-the-Law.php` on day one (it currently carries the rankings). Do not launch it thin.
3. **New sitemap.xml + robots.txt.** The old site has neither. `scripts/generate-sitemap.mjs` writes `public/sitemap.xml` from the published catalogue on every build; `robots.txt` references it.
4. **Search Console.** Keep/verify the property, submit the new sitemap, and use the Change of Address / re-index flow. Watch Coverage for redirect errors post-launch.
5. **Backlink audit.** Pull the old domain's backlinks (Ahrefs/Search Console links report) and confirm each linked old URL 301s somewhere sensible — especially any links to `Airsoft-and-the-Law.php`.
6. **Canonicals** point at the live apex (`https://strikearms.ie/...`), never a `.pages.dev` staging URL.
7. **Post-launch:** monitor rankings for "is airsoft legal in Ireland" and "airsoft shop Dublin" for 4-8 weeks; a temporary dip during reindexing is normal, a sustained drop means a redirect/quality problem.

## Impact on the SEO plan

- **No product-URL migration** — old site has no product pages, so all new PDPs are net-new (no redirect debt).
- The old site already targeted **airsoft law, where-to-play, care/maintenance, and "what is airsoft"** — the same content clusters our plan prioritises. The new site should clearly *supersede and expand* each, so redirects pass equity into stronger pages rather than sideways.
- Reinforces P1 priority on `/airsoft-law` and `/where-to-play`: these aren't just opportunities, they're where the old domain already has equity to protect.
