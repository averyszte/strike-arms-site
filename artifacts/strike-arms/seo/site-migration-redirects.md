# Strike Arms — Site Migration & Redirect Map

Context: **strikearms.ie is currently Alan's OLD live site** — a small custom-PHP informational site
(not e-commerce). The new React build replaces it. To preserve existing rankings, backlinks, and
bookmarks, every old URL must 301-redirect to its closest new equivalent at cutover.

Crawled the live old site directly (no sitemap.xml or robots.txt exists on it — both return 404).

## Old-site URL inventory (complete — 7 pages)

| Old URL | Old page title | Notes |
|---|---|---|
| `/` (`index`) | Home | "Northside Dublin's only walk-in Airsoft store", 17 years trading |
| `/Contact-us.php` | Contact us | store hours + phone |
| `/guns-n-gear.php` | Guns N' Gear | product/gear reference (not a real shop — informational) |
| `/About-Airsoft.php` | What is Airsoft | educational |
| `/Airsoft-and-the-Law.php` | Airsoft and the Law | **key ranking asset** (ranks for Irish airsoft-law queries) |
| `/Care-for-your-Rifle.php` | Care for your Rifle | maintenance educational |
| `/Where-to-Play.php` | Where to Play | local play info |

Confirmed primary-source facts (from the old site, Alan's own copy — still worth Alan re-confirming):
- Northside Dublin's only walk-in airsoft store.
- Seventeen years trading.
- Physical store with published hours and phone.

## 301 redirect map (old → new)

Ship in Cloudflare Pages `_redirects` (note the `.php` extensions and mixed-case paths — match exactly; add lowercase variants too since old inbound links may vary).

| Old URL | New URL | Rationale |
|---|---|---|
| `/Airsoft-and-the-Law.php` | `/airsoft-law` | **Highest-priority redirect** — preserves the one page with real rankings/links. New hub must be at least as strong. |
| `/Where-to-Play.php` | `/where-to-play` | Direct topical match. |
| `/Care-for-your-Rifle.php` | `/guides/maintenance` | Maintenance guide is the successor. |
| `/About-Airsoft.php` | `/guides/beginners-guide` | "What is airsoft" → beginner pillar. |
| `/guns-n-gear.php` | `/store` | Gear reference → the actual shop. |
| `/Contact-us.php` | `/contact` | Direct match. |
| `/` | `/` | Home stays; new home replaces old. |

Suggested `_redirects` entries (add case-insensitive/lowercase duplicates as needed):

```
/Airsoft-and-the-Law.php   /airsoft-law            301
/Where-to-Play.php         /where-to-play          301
/Care-for-your-Rifle.php   /guides/maintenance     301
/About-Airsoft.php         /guides/beginners-guide 301
/guns-n-gear.php           /store                  301
/Contact-us.php            /contact                301
```

## Migration checklist (P0 — do at/around cutover)

1. **Redirects first.** Ship the `_redirects` above before or with the DNS/hosting cutover — no gap where old URLs 404.
2. **Preserve the strongest asset.** The new `/airsoft-law` hub must be as good or better than the old `Airsoft-and-the-Law.php` on day one (it currently carries the rankings). Do not launch it thin.
3. **New sitemap.xml + robots.txt.** The old site has neither. Generate `sitemap.xml` (edge function + static fallback) listing the new URLs; `robots.txt` references it.
4. **Search Console.** Keep/verify the property, submit the new sitemap, and use the Change of Address / re-index flow. Watch Coverage for redirect errors post-launch.
5. **Backlink audit.** Pull the old domain's backlinks (Ahrefs/Search Console links report) and confirm each linked old URL 301s somewhere sensible — especially any links to `Airsoft-and-the-Law.php`.
6. **Canonicals** point at the live apex (`https://strikearms.ie/...`), never a `.pages.dev` staging URL.
7. **Post-launch:** monitor rankings for "is airsoft legal in Ireland" and "airsoft shop Dublin" for 4-8 weeks; a temporary dip during reindexing is normal, a sustained drop means a redirect/quality problem.

## Impact on the SEO plan

- **No product-URL migration** — old site has no product pages, so all new PDPs are net-new (no redirect debt).
- The old site already targeted **airsoft law, where-to-play, care/maintenance, and "what is airsoft"** — the same content clusters our plan prioritises. The new site should clearly *supersede and expand* each, so redirects pass equity into stronger pages rather than sideways.
- Reinforces P1 priority on `/airsoft-law` and `/where-to-play`: these aren't just opportunities, they're where the old domain already has equity to protect.
