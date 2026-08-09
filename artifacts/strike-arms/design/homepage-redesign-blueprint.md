# Strike Arms — Homepage Redesign Blueprint

Synthesis of 5 parallel research passes (big-box/marketplace, premium DTC/Shopify,
airsoft/tactical peers, premium lifestyle/editorial, evidence-based homepage UX) into
one actionable plan for the `/demo` homepage. The live `/` homepage is not touched until
this is signed off and reviewed on `/demo`.

Date: 2026-08-08.

---

## 1. The strategic read (where all 5 agents agreed)

Strike Arms is a **small specialist with a physical shop and a named expert** — the
opposite profile to big-box. So the model is **brand-first, not catalogue-first**:

- Closest analogues: **Death Wish Coffee, Fellow, Ridge** (small catalogue made premium),
  **Arc'teryx** (dark/atmospheric editorial, strongest visual analogue), **RifleGear**
  (walk-in shop foregrounded), **Patrol Base** ("we all play" tone).
- The category's defining sin is **clutter** (Evike, OpticsPlanet, Fire Support cram promo
  banners + mega-menus). Our competitive edge is the opposite: **calm, curated, spare**.
- The single biggest lever a small specialist has, and one **no big competitor can copy**:
  a real person (Alan, 17 years) + a real place (oldest airsoft shop in Dublin, only
  north-Dublin walk-in) + in-house repairs. Give these real estate, not a footer line.

### What the research says to CUT (your "filler" instinct is evidence-backed)

Every agent independently flagged the same offenders:
- Auto-rotating hero carousels (~1% interact; hurts Core Web Vitals). *We don't have one — good.*
- **Generic "Why buy from us" bragging blocks** with vague adjectives → this is `WhyBuySection`.
- Walls of text (attention concentrates in the top 40% of the page).
- **Repeated value-prop / trust content stated 3–4 different ways** → we currently say
  "expert advice / beginner-friendly / Dublin / good reviews" in **five** different sections
  (`TrustStrip`, `WhyBuySection`, `ExpertGuidanceSection`, `AboutStatsSection`, `ReviewsSection`).
  Consolidate.
- Urgency/scarcity theatre, deal-of-the-day, membership/finance blocks — skip (big-box scale).
- Personalised "recently viewed" carousels — skip (need an engine + traffic we don't have;
  hand-curated "Alan's picks" gives 80% of the value).

---

## 2. Current homepage vs. the redundancy problem

Live order today:
`Hero → BrandMarquee → CategoryStrip → TrustStrip → ShopByLoadout → WhyBuySection →
AnnotatedRifleSection → ExpertGuidanceSection → ReviewsSection → AboutStatsSection →
FAQSection → FinalCTASection`

Redundancy map (same message, said repeatedly):
| Message | Appears in |
|---|---|
| "expert advice / we know the gear" | Hero, TrustStrip, WhyBuySection, ExpertGuidanceSection, AboutStats |
| "beginner-friendly" | TrustStrip, WhyBuySection, ExpertGuidanceSection, FAQ |
| "4.7 / 90 reviews / Dublin" | TrustStrip, ReviewsSection, AboutStatsSection |
| featured product w/ annotated hotspots | ShopByLoadout **and** AnnotatedRifleSection (duplicate mechanic) |

---

## 3. Proposed `/demo` section order (Hero unchanged per your instruction)

Lean, each section doing distinct work. **Deliberately fewer sections than any competitor.**

| # | Section | Action | Purpose (research-backed) |
|---|---------|--------|---------------------------|
| 1 | **Hero** | keep as-is | Identity + one CTA. |
| 2 | **Trust/USP bar** (redesign `TrustStrip`) | REBUILD | Currys-style reassurance band, placed high. Real claims: 17 yrs · oldest in Dublin · north-Dublin walk-in · in-house repairs · fast Irish delivery. Absorbs the concrete bits of `WhyBuySection`. |
| 3 | **Category grid** (`CategoryStrip`) | polish | Primary browse path. 6–8 photo tiles. |
| 4 | **Shop by Play Style** (`ShopByLoadout`) | polish | Differentiator — competitors bury playstyle in blogs; we make it a browse entry. |
| 5 | **Featured / New-in** (repurpose `AnnotatedRifleSection`) | REBUILD | A real curated featured product or "just in" row with price — not the fake "SSP-18" placeholder. |
| 6 | **Repairs & servicing** (NEW block) | NEW | Alan's differentiator big-box can't match. "Book a repair" CTA. |
| 7 | **Heritage / Meet Alan** (repurpose `AboutStatsSection`) | REBUILD | The Death Wish/Fellow "story = premium" moment. Named person, real place, "since". |
| 8 | **Brand wall** (`BrandMarquee`) | move down + polish | Logo credibility — one row, not primary nav. Moved below the story. |
| 9 | **Reviews** (`ReviewsSection`) | polish | Local Google reviews. Keep 4.7 + count (imperfect rating reads as real). |
| 10 | **Beginner "Start Here" + soft IE legal note** (repurpose `ExpertGuidanceSection`) | REBUILD | Category-standard onboarding. Ireland-specific, question-framed. **No hard age gate. Never state Irish law as fact — link/flag only.** |
| 11 | **FAQ** (`FAQSection`) | trim | Keep (collapsed accordion is not a text wall). |
| 12 | **Final CTA** (`FinalCTASection`) | keep | Repeat the one primary path. |

**CUT:** `WhyBuySection` (generic bragging block — its only concrete claims move into #2 and #7).

Net: **12 → 12 sections but zero redundancy**, one new differentiator (repairs), and the
worst filler removed. Could go leaner (drop FAQ or merge #10 into #6) — flag if you want that.

---

## 4. Visual direction (Arc'teryx-led, tactical/industrial)

- **Dark, high-contrast, industrial.** Commit to it. Accent colour (the orange) used
  *sparingly* — CTAs, key labels, hover only. Restraint is what separates "premium tactical"
  from "gamer RGB".
- **One idea per screen.** Full-bleed image panels, single message, single CTA per section.
- **Alternating rhythm** — full-bleed hero → grid → split panel → full-bleed. Tension/release.
- **Generous padding.** Space around a product is the cheapest premium signal.
- **Photography is the #1 lever.** Consistent, well-lit shots on one treatment make a small
  catalogue look curated. Inconsistent supplier photos are what make small shops look cheap.
  Real shop/team/local-game photos beat stock — competitors literally cannot replicate them.
- **Typography:** one confident industrial/condensed display face + a neutral body face.
  Big headlines, quiet small labels. No decorative/gamer type.
- **No emojis anywhere** — lucide-react icons only (project rule).

---

## 5. Image system spec (the asset problem you raised)

The core decision: **keep editable labels/tags as code; only put photography & true artwork
in image files.** This means we almost never re-open Illustrator to change a label — it's a
data edit.

### Folder layout (under `public/images/`)
```
public/images/
├── brands/        # manufacturer logos — one per brand
├── categories/    # category tile photos (rifles, pistols, …)
├── playstyles/    # play-style scene photos (beginner, cqb, mil-sim, sniper)
├── shop/          # real shop / team / Alan / local-game photography
└── sections/      # section background/feature imagery (hero poster, repairs, etc.)
```

### Per-slot conventions (uniform = premium)
| Slot | Format | Aspect / size | Treatment |
|---|---|---|---|
| Brand logos | **SVG preferred** (PNG fallback), single-colour | fixed bounding box (e.g. 120×32) | rendered monochrome/white in CSS, not baked. *Today they're mixed png/svg/webp with per-logo hand-set width/height + a brightness filter — inconsistent. Normalise.* |
| Category tiles | WebP | 3:4 portrait, ~800×1067 | dark-toned, consistent crop, subtle gradient scrim added in CSS |
| Play-style scenes | WebP | 16:7, ~1400×613 | dark, product laid out; **hotspot labels stay as HTML pills** (already are — keep) |
| Shop/heritage | WebP | 4:3 or 3:2 | real photography, slight grayscale in CSS for cohesion |
| Section features | WebP | context-dependent | one visual language across all |

### Rules
1. **Labels, prices, tags, callouts = HTML/CSS, never baked into the image.** Editable,
   translatable, crisp on every screen. (Your "design the labels in Illustrator" instinct —
   recommend *against* for labels; do it only for genuine illustration/logo work.)
2. **kebab-case, descriptive filenames** (`category-rifles.webp`, `playstyle-cqb.webp`).
3. **One image per slot, fixed dimensions** — define slots in a small data file so swapping
   art is a one-line change and the layout never shifts (CLS win).
4. **WebP for all photos** (some current assets are PNG — heavier; convert).
5. Below-fold images `loading="lazy" decoding="async"`; hero poster `fetchpriority="high"`.

---

## 6. Open decisions for sign-off
1. Approve the section order + the `WhyBuySection` cut in §3? (Or go leaner / reorder.)
2. Repairs block (#6) — build it now with placeholder copy, or wait for Alan's repairs list
   (turnaround, warranty scope are still BLOCKED on Alan per current-task)?
3. Beginner/legal block (#10) — keep it question-framed and Ireland-generic for now, since
   Irish airsoft law must not be stated as fact until a solicitor confirms.
