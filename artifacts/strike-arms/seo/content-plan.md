# Strike Arms — Per-Page Content Plan (reconciled)

Reconciles the three SEO sources into a build-ordered, per-page plan.

- **Source 1 — Alan's interview answers** (authoritative; pending — questions in [alan-interview-questions.md](alan-interview-questions.md)).
- **Source 2 — ChatGPT Deep Research** ([chatgpt-deep-research-report.md](chatgpt-deep-research-report.md)).
- **Source 3 — SEO agent workflow** ([keyword-research.md](keyword-research.md), [competitor-analysis.md](competitor-analysis.md)).

Page architecture is locked in [sitemap-architecture.md](sitemap-architecture.md).

---

## 1. Source reconciliation

### Where all three (or the two available) agree — high confidence
- **The monopoly openings are content, not products.** Sources 2 and 3 independently land on the same gaps: Ireland-specific **legal** content, **where-to-play**, **beginner** guides, **best-of** comparisons, dedicated **services** pages, **brand** comparison content, and a **glossary**. No Irish competitor owns these; UK/US sites win them by default. This is the core strategy.
- **IE volumes are small but high-intent.** Both sources agree absolute Irish search volume is modest (low tens-to-hundreds/month). The win is near-total share of a small market plus capturing UK/EU spillover — priority is driven by intent quality and margin, not raw volume.
- **Local + legal are the fastest P1 wins.** "airsoft shop Dublin", "airsoft near me", and "is airsoft legal in Ireland" are low-competition, high-intent, and currently held by directories/forums or assertive competitor blogs.
- **Structural edge over UK shops:** in-country stock, ROI+NI shipping, the physical Dublin shop, and in-house repairs/upgrades. Every commercial page should lead with these.

### Conflicts / corrections — source 3 (verified) overrides source 2
- **Competitor list:** source 2 (ChatGPT) listed some unverified entries and invented DA figures (and a couple of shaky names). Source 3 verified real domains and **corrected** two errors: Patrol Base *does* ship to ROI (constrained, not "unavailable"), and Waterford Airsoft is a shop+venue hybrid, not a club. **Use source 3's verified competitor set as the spine**; treat all authority/DA numbers from either source as estimates to confirm with Ahrefs/Semrush.
- **Competitors each source found that the other missed:** source 3 adds GSE Airsoft (Dublin), TSAirsoft (Belfast, strong "no import fees" ROI message), Outdoor Zone, and Special Ops (venue). Source 2 adds candidates worth a quick check (Bullseye Country Sport NI, Skirmshop). Verify all live.
- **Resolved:** source 3's SERP note that Strike Arms "already ranks a `/Airsoft-and-the-Law.php`" was correct — that is Alan's **current old live site** (a 7-page custom-PHP informational site, now inventoried). The new build replaces it, so this is a **site migration**, not a greenfield launch. Redirect map and migration checklist: [site-migration-redirects.md](site-migration-redirects.md). The old site already had rankings on `/Airsoft-and-the-Law.php`, `/Where-to-Play.php`, and `/Care-for-your-Rifle.php` — equity to protect, not just opportunities to chase.

### The authoritative layer that's still missing
- **Source 1 (Alan).** Everything local (field names, which sites enforce what FPS), legal-in-practice (age/ID policy, two-tone handling), and product-recommendation (his actual "buy this" picks, common bench failures) must come from Alan and **overrides** sources 2 and 3. Pages in those areas are drafted to a skeleton now and completed once his answers land.
- **Legal pages stay question-framed** until verified against a primary source (Irish Statute Book / An Garda Síochána / Revenue). No published legal assertions.

---

## 2. Build waves

Priorities carried from the keyword master table (source 3), adjusted for build dependencies.

| Wave | Theme | Depends on |
|---|---|---|
| **P0 — enablers** | **Site-migration 301 map** ([site-migration-redirects.md](site-migration-redirects.md)); build `/products/{slug}` PDP route + Product schema; `LocalBusiness` schema + complete Contact/store NAP; sitemap.xml + robots.txt; breadcrumb schema | Engineering (routing) + cutover |
| **P1 — fast wins** | `/airsoft-shop-dublin`; `/airsoft-law/is-airsoft-legal-in-ireland`; beginner guide; best-first-gun; core category pages (Rifles/Pistols/Consumables) intro copy; BBs/consumables | P0 schema; Alan (legal + local + picks) |
| **P2 — depth** | Remaining legal spokes; where-to-play (Dublin/Leinster); services spokes; guides (AEG-vs-GBB, FPS/joules, BB weight, batteries, gas, maintenance, loadouts); brand pages (top 4); remaining subcategories | Alan (services, fields); P1 hubs live |
| **P3 — long tail** | All PDPs at scale; remaining brand pages; best-of listicles; glossary; gift guide; pre-loved; support pages (shipping/returns/FAQ) | Catalogue + Alan |

---

## 3. Per-page content plan

Legend: **KW** = primary keyword · **Pri** = priority · **Schema** = structured data · **Alan** = which interview sections feed it · **Status** = route/build state.

### Commercial core

| Page | KW | Pri | Key content | Schema | Alan | Status |
|---|---|---|---|---|---|---|
| `/` Home | airsoft Ireland / airsoft shop | P1 | Value prop (Dublin shop, ROI+NI shipping, in-house repairs), featured categories/brands, trust block, local hook | Organisation, LocalBusiness, WebSite (SearchAction) | §8 | exists — SEO layer |
| `/store` | airsoft guns Ireland | P1 | Intro copy above grid, links to all categories + brands | BreadcrumbList, ItemList | §2 | exists |
| `/store/rifles` (+ pistols, consumables) | airsoft rifles/pistols/BBs Ireland | P1 | 150-300w category intro, subcategory links, brand links, buying-help link | Breadcrumb, ItemList | §2, §6 | exists |
| `/store/{gear,accessories,parts,more}` | category + Ireland | P2 | Category intro + subcategory links | Breadcrumb, ItemList | §2, §7 | exists |
| `/store/{cat}/{sub}` (~30) | subcategory + Ireland | P2 | Short sub intro, weight/spec helper where relevant (BBs, gas, batteries) | Breadcrumb, ItemList | §2, §6 | exists |
| `/products/{slug}` (PDP, ~65+) | model + Ireland | P0/P3 | Unique spec copy, FPS/compat, "who it's for", cross-sell, real reviews only | **Product + Offer** (EUR, availability), Breadcrumb | §2 | **NEW ROUTE — build** |

### Brand

| Page | KW | Pri | Key content | Schema | Alan | Status |
|---|---|---|---|---|---|---|
| `/brands` | airsoft brands Ireland | P2 | Brand grid, "brands we stock & recommend" | Breadcrumb, ItemList | §2 | exists |
| `/brands/{specna-arms, gg, tokyo-marui, asg}` | {brand} Ireland | P2 | In-Ireland stock/shipping lead, Alan's take on the brand, model lines, reliability, linked PDPs | Breadcrumb, Brand | §2 | NEW |
| `/brands/{krytac,nuprol,vorsk,ics,we,valken,…}` | {brand} Ireland (stockist) | P3 | Same pattern, lighter | Breadcrumb, Brand | §2 | NEW |

### Local (Dublin)

| Page | KW | Pri | Key content | Schema | Alan | Status |
|---|---|---|---|---|---|---|
| `/airsoft-shop-dublin` | airsoft shop Dublin / near me | P1 | Local landing: shop story, address/hours/map, in-store advantages vs UK, categories, reviews, directions | LocalBusiness (NAP, hours, geo) | §4, §8 | NEW |
| Contact/store (enhance) | airsoft store Dublin | P1 | Complete NAP, map embed, hours, phone; GBP alignment | LocalBusiness | §8 | exists — enhance |
| `/where-to-play` | airsoft sites/where to play Ireland | P2 | Directory of Dublin/Leinster sites (indoor/outdoor, beginner-friendly, FPS rules), how to book first game, kit CTA | ItemList, FAQPage | §4 (fields), Appendix A5 | NEW |

### Legal (question-framed, primary-source verified before publish)

| Page | KW | Pri | Alan | Status |
|---|---|---|---|---|
| `/airsoft-law` hub | airsoft law Ireland | P1 | §5 | exists — expand |
| `/airsoft-law/is-airsoft-legal-in-ireland` | is airsoft legal in Ireland | P1 | §5 Q1 | NEW |
| `/airsoft-law/rif-two-tone-fps-ireland` | two-tone / RIF / FPS Ireland | P2 | §5 Q2,6 | NEW |
| `/airsoft-law/minimum-age-to-buy` | airsoft age limit Ireland | P2 | §5 Q4,5 | NEW |
| `/airsoft-law/importing-and-transport` | importing airsoft into Ireland | P2 | §5 Q8,10 | NEW |
| `/airsoft-law/licence-question` | do you need a licence Ireland | P2 | §5 Q1,18 | NEW |
| `/airsoft-law/uk-vs-ireland` | UK vs Ireland airsoft law | P3 | §5 Q7 | NEW |

All legal pages: `FAQPage` schema, visible "last reviewed" date, explicit "verify with a primary source" framing, links to named legislation as *what to check* (never asserted).

### Services (all service pages — sign-off scope)

| Page | KW | Pri | Alan | Status |
|---|---|---|---|---|
| `/services` hub | airsoft repairs/upgrades Ireland | P2 | §3, §8 | exists |
| `/services/repairs` | airsoft repairs Ireland | P2 | §3 | exists |
| `/services/upgrades` | airsoft upgrades Ireland | P2 | §3, §8 | exists |
| `/services/gearbox-rebuilds` | gearbox rebuild Ireland | P2 | §3 Q2,3,4 | NEW |
| `/services/custom-builds` | custom/DMR build Ireland | P2 | §3 Q13, §8 Q19, App A3 | NEW |
| `/services/chrono-service` | airsoft chrono Ireland | P2 | §3 Q7, App A1 | NEW |
| `/services/hop-up-tuning` | hop-up tuning | P3 | §3 Q6 | NEW |
| `/services/wiring-mosfet` | MOSFET install Ireland | P3 | §3 Q12 | NEW |
| `/services/diagnostics` | airsoft repair diagnosis | P3 | §3 Q1 | NEW |
| `/pre-loved` | used airsoft Ireland | P3 | §8 Q12,13 | NEW |

Service pages: `Service` schema, price ranges + turnaround from Alan, "in-house Dublin workshop" as the differentiator (no IE competitor ranks these).

### Guides

| Page | KW | Pri | Alan |
|---|---|---|---|
| `/guides/beginners-guide` (pillar) | airsoft for beginners Ireland | P1 | §1 |
| `/guides/first-airsoft-gun` | best first airsoft gun Ireland | P1 | §1, §2 |
| `/guides/aeg-vs-gbb-vs-spring` | AEG vs GBB | P2 | §6 Q1,2 |
| `/guides/fps-and-joules` | FPS and joules explained | P2 | §6 Q5,6 |
| `/guides/bb-weight` | airsoft BB weight guide | P2 | §6 Q7-10 |
| `/guides/batteries` | airsoft battery/LiPo guide | P2 | §6 Q11-13 |
| `/guides/gas-types` | green gas vs CO2 | P2 | §6 Q3,4 |
| `/guides/maintenance` | airsoft gun maintenance | P2 | §3 Q16,20 |
| `/guides/loadout-cqb` / `-woodland` / `-sniper` | airsoft loadout Ireland | P2/P3 | §7 |
| `/guides/buying-airsoft-uk-vs-ireland` | buying airsoft from UK to Ireland | P2 | §4 Q17, §8 Q14 |
| `/guides/best-{beginner,budget,pistol,sniper,rifles}` | best {x} Ireland | P3 | §2 |
| `/guides/airsoft-gift-ideas` | airsoft gifts Ireland | P3 (seasonal) | §1 |

Guides: `Article` + `FAQPage` where Q&A fits; every guide links to matching category/subcategory + 2-3 PDPs (internal-linking rule).

### Reference & support

| Page | KW | Pri |
|---|---|---|
| `/glossary` | airsoft terms (AEG, GBB, FPS, hop-up…) | P3 |
| `/shipping` | airsoft delivery Ireland | P3 |
| `/returns` | returns & warranty | P3 |
| `/faq` | airsoft FAQ | P3 (FAQPage) |

---

## 4. Cross-cutting technical actions (from all sources)

- Build `/products/{slug}` route + `Product`/`Offer` JSON-LD (biggest transactional upside).
- `LocalBusiness` JSON-LD with real NAP, hours, geo; align Google Business Profile.
- `BreadcrumbList` on all category/subcategory/PDP paths; `ItemList` on grids; `FAQPage` on legal/beginner/where-to-play.
- **Never** fabricate `aggregateRating` — only mark up genuine reviews.
- `sitemap.xml` (edge function + static fallback) and `robots.txt`; canonicals to live apex; 301s for any slug change.
- Prominent "ships across Ireland (ROI + NI)" trust block (mirrors TSAirsoft's winning message; keep to what Strike Arms can guarantee).
- Visible "last reviewed" dates on legal/beginner pages.

## 5. Next steps

1. **Send Alan** [alan-interview-questions.md](alan-interview-questions.md). His answers = source 1.
2. **Engineering P0:** build the PDP route + core schema (unblocks commercial + local waves).
3. On Alan's answers: finalise P1 pages (Dublin local, is-airsoft-legal, beginner guide, first-gun, core categories), verifying every legal point against a primary source.
4. Then P2/P3 per the waves above.
5. **At cutover:** ship the 301 redirect map ([site-migration-redirects.md](site-migration-redirects.md)) so the old PHP site's equity (esp. the airsoft-law page) transfers to the new pages; keep Search Console, submit the new sitemap.
6. Pull real search volumes from a paid tool (DataForSEO/Ahrefs) before locking spend — the only remaining material data gap in this plan.
