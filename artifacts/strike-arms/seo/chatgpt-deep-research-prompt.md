# ChatGPT Deep Research Prompt — Strike Arms SEO

Paste everything below the line into ChatGPT (Deep Research mode). It is self-contained.

---

You are an SEO strategist and airsoft-industry researcher. I run **Strike Arms**
(**strikearms.ie**), a Dublin-based airsoft shop in Ireland. I want to become the dominant
organic-search result for airsoft in Ireland — the site people find whether they search for a
product, a brand, a buying question, or "airsoft shop Dublin".

Do a full **Deep Research** run and return **three deliverables**: (1) keyword research,
(2) competitor research, and (3) a large, categorised expert-question bank for my shop owner Alan.
Do your own research and deliver findings — do not just hand me questions.

## About the business

- Dublin airsoft specialist: beginner-friendly, expert in-house advice, trusted brands,
  in-house repairs and upgrades. Ships across Ireland (Republic + NI), one physical location in Dublin.
- Brands stocked: G&G, Specna Arms, Tokyo Marui, ASG, Vorsk, Nuprol, Valken, Krytac, ICS, WE
  (also VFC, ZCI, SHS, Perun, Acetech in parts/accessories).
- Categories: Rifles (AEG, SMG, GBBR, sniper), Pistols (GBB, revolver, electric), Consumables
  (BBs, bio BBs, green gas, CO2, batteries), Tactical Gear, Accessories (optics, mags, slings,
  holsters, suppressors), Parts & Internals (barrels, gearboxes, MOSFETs), Services
  (repairs, upgrades, custom builds, chrono).
- Market: Ireland (primary), with UK retailers as the main competitive pressure since many ship to Ireland.

## Site architecture I am building (map keywords to these page types)

- Commercial: Home, `/store` + category + subcategory pages, **product detail pages** `/product/{slug}`.
- Brand hub `/brands` + per-brand pages.
- Local: `/airsoft-shop-dublin`, enhanced Contact/store page, `/where-to-play` (airsoft sites in Ireland).
- Guides `/guides/...` (beginner guide, first gun, AEG vs GBB, FPS/joules, BB weight, batteries,
  gas types, maintenance, loadouts, gift guide).
- Legal `/airsoft-law/...` (Irish airsoft law topics).
- Services `/services/...` (repairs, upgrades, gearbox rebuilds, custom/DMR builds, chrono, hop-up tuning).
- Reference: `/glossary`. Listicles: `/guides/best-...`.

## Deliverable 1 — Keyword research

- Build **keyword clusters** organised by search intent (transactional, commercial-investigation,
  informational, local, brand). For each cluster give: the cluster theme, the head term, 10-40
  supporting long-tail keywords, rough monthly search volume (Ireland; note if you can only find
  UK/global and are estimating IE), competition/difficulty (low/med/high), dominant intent, and the
  **Strike Arms page type it maps to** from the architecture above.
- Prioritise **Ireland-specific** demand ("airsoft Ireland", "airsoft shop Dublin", "airsoft guns
  Ireland", "is airsoft legal in Ireland") and separate it from UK/global demand.
- Include: brand + "Ireland" terms, category + "Ireland" terms, "best [x]" comparison terms,
  question/People-Also-Ask terms, and near-me / local terms.
- Flag quick wins (low difficulty, real IE volume, clear commercial or local intent).
- State your data sources and confidence. If you cannot get exact IE volumes, say so and give ranges.

## Deliverable 2 — Competitor research

- Identify the **real** organic competitors for Irish airsoft search: both Ireland-based shops and
  UK shops that ship to and rank in Ireland. Verify each site actually exists before listing it;
  do not invent retailers. For each competitor give: domain, location, whether they ship to Ireland,
  approximate size/authority, and their apparent SEO strengths and weaknesses.
- Do a **content/SERP teardown**: for the top ~15 Irish airsoft queries, who ranks, what page type
  wins (product, category, guide, forum, YouTube), and why.
- Identify **content gaps** — topics/keywords where no strong Irish-focused page exists (these are
  our monopoly openings), especially Ireland-specific legal, local, and beginner content.
- Note structured-data, local-SEO (Google Business Profile), and review-signal patterns competitors use.

## Deliverable 3 — Expert-question bank for Alan (shop owner)

Produce a **large** (aim 120+), **categorised** question bank to interview Alan. These extract facts
only an experienced Dublin shop owner and airsoft tech knows — the raw material for pages that
out-rank generic content. Organise by category, matching the site architecture. Cover at least:

- Beginners & first purchase (what he actually recommends and why, common mistakes, budgets)
- Product/brand expertise (real-world reliability, which brands he trusts for what, upgrade paths)
- Repairs & tech (most common faults, gearbox issues, what customers get wrong, DIY vs shop)
- Airsoft in Ireland — local (fields/sites near Dublin, communities, events, seasons)
- Airsoft law in Ireland (what he tells customers — flag these for legal verification, do not assert law)
- Buying-decision questions (AEG vs GBB, FPS, BB weight, gas, batteries — in his words)
- Gear & loadouts (eye protection, what beginners over/under-buy)
- Services & business (what makes Strike Arms different, guarantees, aftercare)

For each question, add a one-line note on **which page(s) the answer will feed**.

## Output format

- Three clearly separated sections (Keyword Research / Competitor Research / Question Bank).
- Tables where useful. Cite sources with links. State assumptions and confidence levels.
- Irish/British English. No emojis.
- Do NOT state Irish firearms/airsoft law as fact unless you cite a primary source (Irish Statute
  Book / An Garda Siochana / Revenue). Where unsure, mark it as "verify with primary source / Alan".
