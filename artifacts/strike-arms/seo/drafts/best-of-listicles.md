# Best-of Listicles — DRAFTS (not published, not routed)

> **STATUS: HELD. Nothing in this file is on the live site.**
> These pages have no route, no registry entry and no sitemap URL. They exist as
> markdown so the structure is ready, and so Alan has one document to work through
> rather than five.
>
> **The blocker is the picks, not the prose.** Every recommendation below is a
> research answer from [alan-interview-answers.md](../alan-interview-answers.md) —
> general-market knowledge, *not* Alan's picks. Publishing them as this shop's
> recommendations would misrepresent the expertise the rest of the site is built on,
> and a wrong pick on a "best of" page is the kind of thing a customer holds you to
> across the counter.
>
> **To unblock:** Alan fills in the `[ALAN]` slots below. Then each draft converts to
> a page in one pass (ArticleLayout → `src/pages/guides/` → `src/lib/guides.ts` →
> `src/App.tsx` → `scripts/generate-sitemap.mjs`).

---

## CORRECTION (21 July 2026) — the brand assumption was wrong

These drafts were first written against pass-1 research that built its picks around
**G&G Combat Machine** and **Specna Arms EDGE**. The 21 July answer bank states that
**Strike Arms does not sell either brand**. Its gun range is **ASG, CYMA and EVOLUTION**.

So the old candidate picks are not merely unconfirmed — they are the wrong shop. Every
`[ALAN]` slot below now points at the real range. The house three-tier answer to work
from is:

| Tier | Platform | Note |
|---|---|---|
| Beginner | **CYMA** standard AEG | Workhorse; common parts, broad tech familiarity |
| Mid | **EVOLUTION** M4 / Ghost-type | More modern feature set, familiar M4 components |
| Premium compact | **ASG CZ Scorpion EVO** | Strong platform, but **dedicated parts** — flag that to buyers |

G&G and Specna may still appear as *neutral comparison* brands where a reader is weighing
an alternative. They must never be the centre of a Strike Arms recommendation.

**Also corrected:** any power framing in these drafts must assume Ireland's single limit
applies to every class — there is no higher DMR or bolt-action tier to write around. See
the answers doc for the citation and the publication gate.

---

## What Alan needs to answer

Everything else is written. These are the gaps:

| # | Question | Feeds |
|---|---|---|
| 1 | Which **CYMA** model you hand a beginner now, and its price bracket. | all five |
| 2 | Your three "buy this, it just works" picks across the CYMA / EVOLUTION / ASG range. | beginner, budget |
| 3 | Best sub-€200 AEG you actually stock and can replenish. | budget |
| 4 | Best first gas pistol — is the ASG CZ P-09 the house answer, and green gas or CO2 on it? | pistol |
| 5 | Which bolt-action platform Strike Arms will build and warranty, and what it needs spending on it. | sniper |
| 6 | Where the EVOLUTION and ASG tiers genuinely earn their price over a CYMA. | rifles |
| 7 | Anything you actively steer people *away* from, and why. | all five |
| 8 | Current prices/stock for anything named, and confirmation each is Irish-compliant. | all five |

Interview questions this maps to: §1.2, §2.1, §2.5, §2.15, §2.20, §6.1, §6.15.

---

## Shared rules for all five

Carried from the guides already published, so these read as the same shop:

- **No invented specifics.** No FPS figures, no age or purchase rules, no legal claims.
  Site power limits are "the site's limit, confirm with the venue".
- **No fabricated ratings.** Never mark up `aggregateRating` on a listicle. Only genuine
  reviews get schema.
- **Price brackets, not exact prices** in prose — prices go stale and the PDP is the
  source of truth. Link to the product page for the current figure.
- **Every pick links** to its PDP and to the relevant subcategory.
- **Lead with the reasoning, not the product.** Alan's §1.20, §6.16 and §2.17 answers
  all say the same thing: a dependable common platform plus good BBs, the right
  battery and a correct hop beats chasing specs. Each listicle should make that
  argument before it names anything.
- **Say who each pick is wrong for.** A best-of page with no downsides reads as an advert.
- Schema: `Article` + `BreadcrumbList`, `FAQPage` where the Q&A fits. `ItemList` is
  reasonable once real products are named.
- Irish/British English. No emojis — lucide-react icons only.

---

## 1. `/guides/best-beginner-airsoft-gun`

**KW:** best beginner airsoft gun Ireland · **Pri:** P3 · **Alan:** §1, §2, §6

**Angle:** the highest-intent listicle on the site, and the one most likely to be
someone's first contact with the shop. It should feel like the conversation Alan has
across the counter, not a spec table.

**Structure:**

1. **Before the list — the three questions.** Where you will play (CQB/woodland/both),
   total budget *including* safety gear and power, and what matters most to you
   (reliability, realism, weight, upgrade potential). Straight from §1.1. Link to
   [/guides/first-airsoft-gun](../../src/pages/guides/FirstAirsoftGun.tsx).
2. **What "best" actually means here.** §2.17 — advertised FPS is not it. Reliability,
   hop performance, air seal, BB quality and build quality are. A common platform means
   spares, magazines and any tech can work on it.
3. **The picks.** `[ALAN: 2-4 guns, with the bracket each sits in]`
   For each: who it suits, who it does *not*, what platform/gearbox, battery fit,
   what it comes with, and what you would spend next on it.
4. **The budget reality.** §1.3 — €300-450 all in, and *why* the gun is not the whole
   budget. This is already published in the beginner's guide; restate briefly, link across.
5. **What we would not sell you as a first gun, and why.** `[ALAN: §1.4 — his actual
   shop policy. This is the section a UK listicle cannot write.]`
6. **Rent first?** §1.15.
7. **FAQ.** Reuse the beginner's-guide answers where they fit.

**Do not include:** a sniper rifle (§1.17), a GBBR (§6.2), or anything picked on FPS.

---

## 2. `/guides/best-budget-airsoft-gun`

**KW:** best budget airsoft gun Ireland / cheap airsoft gun Ireland · **Pri:** P3

**Angle:** the trap page. Search intent is "cheapest", and the honest answer is that
the cheapest gun is usually the most expensive route into the sport. §1.3 and §1.20
both say it: cheap BBs and batteries are false economies, and the money saved on the
gun gets spent twice.

**Structure:**

1. **The honest framing.** There is a floor below which a gun costs you more than it
   saves — feeding problems, proprietary parts, no spares, and a repair bill.
   `[ALAN: where is that floor, roughly, and what goes wrong below it?]`
2. **What to protect in the budget.** Rated eye protection and the charger, never
   compromised (§1.3). Quality BBs (§1.8). A battery that suits the gun (§1.7).
3. **The picks.** `[ALAN: best sub-€200 and best sub-€300 that you stock and stand behind]`
4. **Buying used as the better budget option.** §8.12 — the full checklist is already
   written in the first-gun guide: chronos consistently, feeds reliably, sound gearbox
   and wiring, working safety/selector, no cracks or corrosion, sourceable parts. A
   clean standard second-hand gun beats a new bottom-tier one. Link across.
5. **False economies, listed plainly.** Cheap BBs, the wrong charger, an 11.1V battery
   in a gun not built for it, a stronger spring instead of a hop fix.

---

## 3. `/guides/best-airsoft-pistol`

**KW:** best airsoft pistol Ireland · **Pri:** P3 · **Alan:** §2, §6

**Angle:** pistols are usually a second purchase, so the reader is less green. Lead on
gas choice and cold-weather behaviour, which is where the Irish angle is real.

**Structure:**

1. **Sidearm or primary?** A gas pistol makes far more sense as a sidearm than as a
   first primary (§6.2, §4.14).
2. **Green gas vs CO2.** §6.4 verbatim in substance: green gas is easier and simpler for
   a beginner pistol; CO2 holds pressure better in cold but runs higher pressure, and
   **only** in a gun and magazine designed for it — otherwise it accelerates wear or
   damages valves, seals, nozzles and slides. Link to
   [/guides/airsoft-gas-types](../../src/pages/guides/GasTypesGuide.tsx).
3. **The picks.** `[ALAN: §2.5 — GBB pistols that run reliably through an Irish winter.
   This is the question the page lives or dies on.]`
4. **Maintenance reality.** §3.9 leak points (fill valve, output valve, base/main mag
   seal), what is cheap to fix and what makes a magazine uneconomical. Already written
   in the gas guide — restate briefly, link across.
5. **Electric and spring pistols** as the lower-maintenance alternative.

---

## 4. `/guides/best-airsoft-sniper-rifle`

**KW:** best airsoft sniper rifle Ireland · **Pri:** P3

**Angle:** this page has to talk a chunk of its own traffic out of buying. §1.17 is
unambiguous — a bolt-action is a poor first primary. Say so early, then serve the
reader who genuinely wants one.

**Structure:**

1. **Not your first gun.** §1.17 — low rate of fire, less forgiving, often needs
   expensive tuning, may face minimum-engagement-distance rules. More range and far
   more playing time from a reliable AEG while you learn movement and hop.
2. **What you are actually buying.** An off-the-shelf bolt-action is usually a
   platform, not a finished gun. `[ALAN: §2.15 — which base platforms are worth
   starting from, and what an honest "and then you spend X on it" figure looks like.]`
3. **Site rules first.** Minimum engagement distances and the site's power limit decide
   whether a build is usable at all — confirm with the venue before spending. Do **not**
   write this page around a higher sniper power allowance: the answer bank is explicit
   that Ireland applies one limit to every class, so a bolt-action here is built for
   consistency and hop performance, not extra power. No figures asserted until the legal
   gate clears.
4. **The picks.** `[ALAN]`
5. **Heavier BBs.** Link to the BB weight guide rather than restating.

---

## 5. `/guides/best-airsoft-rifles`

**KW:** best airsoft rifle Ireland · **Pri:** P3

**Angle:** the broad head term. Segment by player rather than ranking 1-10, so it does
not compete with the beginner listicle.

**Structure:**

1. **Segments:** first rifle · best all-rounder · best for CQB · best for woodland ·
   best above ~€350.
2. **One or two picks per segment.** `[ALAN: §2.12 covers the ~€350+ tier as research
   only — his call needed. §2.20 "buy this, it just works" fits here.]`
3. **What separates the tiers.** Honest version: mostly QC, consistency and finish
   rather than raw performance — §6.16 says an expensive part cannot compensate for a
   poor base platform, and §2.9 says most upgrade money is better spent on BBs, hop and
   air seal than internals.
4. **Cross-link** to the loadout guides for CQB vs woodland, and to the first-gun guide
   for the decision itself.

---

## Conversion checklist (per page, once Alan has signed off)

- [ ] Every `[ALAN]` slot filled with his words, no research placeholders left
- [ ] Every named product is in the **real** ASG / CYMA / EVOLUTION range, not the mock catalogue
- [ ] Every named product exists in the catalogue and links to its PDP
- [ ] Price brackets only in prose; no exact prices outside the PDP
- [ ] No `aggregateRating`; no invented FPS/legal/age specifics
- [ ] `Article` + `BreadcrumbList` (+ `FAQPage` / `ItemList` where they fit)
- [ ] Page under 300 lines; FAQ extracted if it pushes over
- [ ] Registered in `src/lib/guides.ts`, `src/App.tsx`, `scripts/generate-sitemap.mjs`
- [ ] Sitemap regenerated; breadcrumbs checked for nested `<li>`
- [ ] `npx tsc --noEmit` and a production build both clean
