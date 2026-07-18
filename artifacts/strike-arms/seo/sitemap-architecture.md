# Strike Arms — SEO Page Architecture (LOCKED v1)

Domain: **strikearms.ie** — Dublin airsoft specialist.
Goal: dominant organic-search presence for airsoft in Ireland across four intents —
**product**, **brand**, **question**, and **local (Dublin)**.

Signed off: scope = all clusters + all service pages, **one location (Dublin only)**,
PDPs confirmed, dedicated Dublin local page, existing category slugs kept.

Conventions (from CLAUDE.md / coding-rules): one H1 per page, semantic H2/H3, `@/` aliases,
Irish/British English, **no emojis anywhere — lucide-react icons only**. Legal claims are
Alan-owned or primary-source-cited; never invented.

---

## Intent → cluster map

| Intent | Primary clusters | "Win condition" |
|---|---|---|
| Product ("buy Specna SA-E03") | A. Commercial core (PDPs, subcategories) | PDP ranks + Product schema + Shopping |
| Brand ("Tokyo Marui Ireland") | B. Brand | Brand hub + per-brand pages rank |
| Question ("is airsoft legal in Ireland", "what FPS") | D. Guides, E. Legal, H. Reference | Guide/legal pages own the SERP + AI answers |
| Local ("airsoft shop Dublin") | C. Local | Dublin page + Home + GBP + where-to-play |

---

## A. Commercial core (money pages)

| Page type | URL pattern | Status | Primary keyword target | H1 |
|---|---|---|---|---|
| Home | `/` | exists | airsoft Ireland / airsoft shop Ireland | Strike Arms — Airsoft [tagline] |
| Shop all | `/store` | exists | airsoft guns Ireland | Shop Airsoft Guns & Gear |
| Category (7) | `/store/{category}` | exists | "airsoft rifles Ireland" etc. | per category |
| Subcategory (~30) | `/store/{category}/{subcategory}` | exists | "AEG rifles Ireland", "bio BBs" | per subcategory |
| **Product detail (PDP)** | `/products/{slug}` | **ROUTE BUILT** (plural, matches existing links) | exact model + Ireland | product name |

Categories (existing slugs kept; display names mapped):

| Slug | Display name | Subcategories (from catalogue) |
|---|---|---|
| `rifles` | Rifles | aeg-rifles, smgs, gbbr, sniper |
| `pistols` | Pistols | gbb-pistols, revolvers, electric-pistols |
| `consumables` | Consumables | bbs, bio-bbs, green-gas, co2, batteries |
| `gear` | Tactical Gear | chest-rigs, battle-belts, headwear, helmets, eye-protection, plate-carriers, gloves |
| `accessories` | Accessories | optics, scopes, flashlights, suppressors, rifle-magazines, slings, holsters |
| `parts` | Parts & Internals | barrels, gearboxes, mosfets |
| `more` | More | chronographs, tools, camping |

Notes:
- PDP route is missing today — highest-priority build. Needs `Product` JSON-LD (name, brand,
  price EUR, availability). `AggregateRating` only if real review data exists.
- Category/subcategory pages need intro copy (150-300 words) above the grid for topical relevance —
  hero eyebrow = H1 convention per playbook §13.

## B. Brand cluster

| Page | URL | Status | Target |
|---|---|---|---|
| Brands hub | `/brands` | exists | airsoft brands Ireland |
| Per-brand (10 primary) | `/brands/{brand}` | NEW | "{Brand} Ireland" |

Primary brands: G&G, Specna Arms, Tokyo Marui, ASG, Vorsk, Nuprol, Valken, Krytac, ICS, WE.
Also in catalogue (parts/other): VFC, ZCI, SHS, Perun, Acetech — brand pages optional/phase 2.
Brand x category programmatic (`/brands/{brand}/{category}`) — **phase 2**, not launch.

## C. Local SEO — Dublin (one location)

| Page | URL | Status | Target |
|---|---|---|---|
| Dublin local landing | `/airsoft-shop-dublin` | NEW | "airsoft shop Dublin", "airsoft Dublin", "airsoft shop near me" |
| Visit us / store info | on `/contact` (LocalBusiness schema, hours, map, directions) | enhance | "airsoft shop near me" |
| Where-to-Play hub | `/where-to-play` | NEW | "airsoft sites Ireland", "where to play airsoft Ireland" |
| Per-site guides | `/where-to-play/{site}` | NEW (Dublin/Leinster sites first) | per-venue + "airsoft near Dublin" |

Local requires: consistent NAP, `LocalBusiness` JSON-LD, Google Business Profile alignment.
No county/city pages at launch (Dublin only, per sign-off).

## D. Buying guides — informational `/guides/{slug}` (all NEW)

1. Beginner's guide to airsoft (Ireland)
2. How to choose your first airsoft gun
3. AEG vs GBB vs spring vs HPA — which to buy
4. FPS and joules explained (Irish site limits)
5. BB weight guide (0.20 / 0.25 / 0.28 / 0.32+)
6. LiPo & battery guide for AEGs
7. Green gas vs CO2 vs HPA
8. How to clean & maintain your airsoft gun
9. Loadout guide: CQB
10. Loadout guide: woodland / outdoor
11. Loadout guide: sniper / DMR
12. Airsoft gift guide (ties to `/gift-cards`)

## E. Legal & safety authority `/airsoft-law` (hub exists) + spokes (all NEW)

Spokes (Alan-owned answers / primary-source cited — NEVER invented):
- Is airsoft legal in Ireland?
- Airsoft age limits in Ireland
- Two-tone rules, imitation firearms & realistic imitation firearms (RIF/IF)
- Importing airsoft into Ireland (customs & An Post/couriers)
- Do you need a licence for airsoft in Ireland?
- Transporting airsoft guns legally
- FPS / joule limits at Irish sites

## F. Services / tech `/services` (hub + Repairs + Upgrades exist) — ALL service pages

Existing: `/services`, `/services/repairs`, `/services/upgrades`.
New service spokes:
- `/services/gearbox-rebuilds`
- `/services/custom-builds` (incl. DMR builds)
- `/services/chrono-service`
- `/services/hop-up-tuning`
- `/services/wiring-mosfet`
- `/services/diagnostics`
- `/pre-loved` — trade-in / used guns hub (+ listings)

## G. Support / trust / conversion (NEW)

- `/shipping` — delivery to Ireland + NI, times, costs
- `/returns` — returns & warranty
- `/faq` — frequently asked questions (schema: FAQPage)
- `/track-order` (if supported)

## H. Reference (NEW)

- `/glossary` — airsoft glossary A-Z (AEG, GBB, FPS, hop-up, MOSFET, joule creep, DMR…)
  Strong internal-link hub and AI-citation surface.

## I. "Best / vs" listicles — comparison MOFU `/guides/best-{slug}` (NEW)

- Best airsoft rifles in Ireland
- Best airsoft guns for beginners
- Best budget airsoft rifles
- Best airsoft pistols
- Best sniper rifles
- Brand-vs-brand comparisons (e.g. Specna Arms vs G&G) — as demand is validated

---

## Scale (launch)

| Cluster | Approx pages |
|---|---|
| A. Commercial core (home/shop/cat/subcat) | ~40 (+ ~65 PDPs, scaling) |
| B. Brand | 11 |
| C. Local (Dublin) | ~4 + where-to-play sites |
| D. Guides | 12 |
| E. Legal | 8 |
| F. Services | ~10 |
| G. Support | 4 |
| H. Reference | 1 |
| I. Listicles | ~6 |

Roughly **110–130 editorial/commercial URLs** + PDPs at launch (Dublin-only, no programmatic).

## Internal linking rules

- Every guide links to the relevant category/subcategory and 2-3 relevant PDPs.
- Every category page links up to Home, across to its subcategories, and to the matching brand pages.
- Legal spokes link to the `/airsoft-law` hub and to the beginner's guide.
- Glossary terms deep-link to the guide/category that explains them.
- Where-to-play pages link to gear/consumables needed to play (CTA into commercial core).

## Open build gaps flagged

1. `/products/{slug}` PDP route — BUILT (`src/pages/ProductDetail.tsx`, wired in `App.tsx`, with Product + BreadcrumbList JSON-LD). Note: plural `/products/` to match existing `ProductCard` links.
2. `/where-to-play` and `/pre-loved` do not exist yet (not stubs) — new builds.
3. Category display-name mapping (gear/parts/more → Tactical Gear / Parts & Internals / More)
   needs a display map; slugs unchanged.
