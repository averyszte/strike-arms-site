# Strike Arms Homepage Redesign — Deep Research Validation and Revised Blueprint

## Executive verdict

The core strategy is strong: **Strike Arms should not try to look like a smaller version of a large airsoft catalogue. It should make specialist judgement, a real shop and a recognisable human expert part of the product.** That direction is consistent with modern homepage research, which says homepages should establish clear priorities rather than make every element compete for attention, and with ecommerce research showing that static, well-prioritised sections are generally easier to get right than rotating promotional systems. citeturn28search3turn29search4

However, I would **not sign off the blueprint exactly as written**. There are four material corrections.

First, several of the proposed high-visibility trust claims are not currently safe enough to put on the homepage. Public evidence supports Strike Arms operating from Swords, having Alan as the named contact, and a business history going back to 2009. But I could not independently establish that Strike Arms is currently “Dublin’s oldest airsoft shop”, “north Dublin’s only walk-in”, has a defined in-house repair service, or offers “fast Irish delivery”. More importantly, GSE Airsoft currently publishes a physical store location in Dublin 11, so the exclusivity claim needs re-verification before it appears anywhere prominent. citeturn0search1turn18search3turn26search0turn26search3

Second, **repairs are valuable but not inherently unique**. Hobby Airsoft explicitly advertises both a bricks-and-mortar shop and an “In-House Repair & Upgrade Service”. Strike can still differentiate through *who does the work, how it is done, the relationship with Alan, supported platforms, transparency and service quality*, but “repairs” alone is not a defensible competitive moat. citeturn27search0

Third, the premise that the homepage should simply be “deliberately fewer sections than any competitor” is the wrong optimisation target. Baymard’s current research finds that first-time shoppers use homepage content to infer what a shop actually sells; 33% of respondents in its 2025 survey said they would begin casual visually driven shopping by scrolling the homepage, while 22% of benchmarked sites exposed an inadequate range of products. **Calm is good; catalogue ambiguity is not.** citeturn29search0

Fourth, I would tighten the proposed information architecture from 12 nominal sections to **10–11 genuinely distinct modules**, chiefly by merging “repairs” and “heritage/Meet Alan” into one high-value **Workshop & Swords Shop** story. That is a more meaningful interpretation of the “cut filler” principle than keeping the section count at 12 while merely changing the subjects.

My overall sign-off is therefore:

| Proposal | Research verdict |
|---|---|
| Brand-first rather than big-box imitation | **Approve** |
| Cut `WhyBuySection` | **Approve strongly** |
| Consolidate repetitive trust messaging | **Approve strongly** |
| High-position proof/USP strip | **Approve, but rewrite claims** |
| Category grid | **Approve; it is essential, not decorative** |
| Shop by Play Style | **Approve strongly** |
| Replace fake annotated product with real merchandise | **Approve strongly** |
| Generic “Featured/New In” | **Improve to “Alan’s Picks / New In”** |
| Standalone repairs section | **Conditional; merge with shop/expertise initially** |
| Meet Alan / heritage | **Approve strongly** |
| Brand marquee moved far down page | **Conditional; depends whether it is navigation or decoration** |
| Reviews | **Approve, but source rating/count dynamically or date-stamp it** |
| Beginner Start Here | **Approve** |
| Soft legal note | **Modify: concise homepage signpost to a maintained legal explainer** |
| FAQ | **Conditional; keep only for real unresolved purchase questions** |
| Dark industrial visual language | **Approve as brand direction, not as a UX rule** |
| WebP-only image system | **Modify to responsive AVIF/WebP delivery** |

There is also an important research limitation. **The live Strike Arms domain currently resolves to an “Account Suspended” page**, so I could not independently inspect the live `/` implementation or compare it visually and technically with `/demo`. The component sequence and redundancy audit in your brief therefore have to be treated as the authoritative description of the current React implementation rather than something I could verify against the deployed site. citeturn1view0

## Claims audit and competitive reality

The blueprint is strongest where it focuses on **specific, difficult-to-fake evidence** rather than generic adjectives. Where it weakens is in converting plausible company lore into absolute marketing claims.

### The claims that are strong enough to build around

Public Strike Arms material identifies **Alan** as the contact and the shop at Unit C3, Airside Enterprise Centre in Swords. Strike Arms public material also describes the business as providing airsoft guns since 2009. On that evidence, “Alan”, “Swords”, “walk-in shop” and **“Est. 2009” / “serving Irish airsoft since 2009”** are materially safer propositions than a rolling “17 years” figure. citeturn0search1turn18search3

“Est. 2009” is also better copy. It does not go stale every year and avoids the edge case of claiming 17 years before the exact 2009 anniversary date has been established.

A proposed trust bar could therefore safely evolve towards:

> **Est. 2009** · **Visit us in Swords** · **Talk to Alan**

A fourth item can be added only after operational verification — for example repairs, collection or a specific delivery promise.

This is materially stronger than:

> 17 years · Dublin’s oldest · north-Dublin’s only · in-house repairs · fast Irish delivery

because every word in a high-trust reassurance bar acts like a factual promise. The most important thing is not to maximise the number of trust claims; it is to make them **boringly defensible**.

### “Only north-Dublin walk-in” should be removed pending verification

Strike Arms has itself used “Northside Dublin’s only walk in Airsoft store” publicly in the past. citeturn0search0turn0search5

The problem is that the market has moved. GSE Airsoft currently gives a “Store Location & Contacts” address at Europa House, Blackwater Road, Dublin Industrial Estate, Glasnevin, Dublin 11, and separately labels the same address as its store location on its contact page. citeturn26search0turn26search3

That does not automatically prove GSE meets whatever precise definition Strike Arms intended by “walk-in”, but it is more than enough to make an unqualified **“only”** claim risky. An intelligent competitor or customer can challenge it in seconds.

I would replace exclusivity with specificity:

> **Walk-in airsoft shop in Swords**

or, if the intended audience understands the geography:

> **North Dublin shop — visit us in Swords**

That still differentiates Strike Arms from online-only sellers without making a potentially obsolete monopoly claim.

### “Oldest airsoft shop in Dublin” remains unverified

The available material supports operation since 2009, but I did not find sufficiently reliable evidence establishing the founding dates and continuity of **every other relevant Dublin airsoft retailer**. Because “oldest” is a comparative superlative rather than a statement about Strike Arms alone, proving Strike’s own founding year is insufficient.

This is exactly the sort of claim that should sit in an internal **claims register**:

| Claim | Required proof before publishing |
|---|---|
| Est. 2009 | First-party/company record |
| Dublin’s oldest airsoft shop | Competitor chronology plus evidence of continuous trading |
| North Dublin’s only walk-in | Current competitor/store audit |
| In-house repairs | Alan confirms actual service and operating process |
| Fast Irish delivery | Shipping SLA and fulfilment evidence |
| 4.7 rating | Current source, review count and retrieval date |

### Repairs are valuable, but the proposed rationale needs rewriting

Hobby Airsoft currently presents itself as a bricks-and-mortar retailer with an **in-house repair and upgrade service**, alongside its online shop. Its homepage also exposes a dedicated Repair & Upgrade taxonomy. citeturn27search0

So the statement that repairs are a differentiator “big-box can’t match” does not survive scrutiny.

The better strategic question is:

**What could make a Strike Arms repair proposition meaningfully different?**

It could be the human connection:

> **Talk to the person who will actually look at your replica.**

It could be transparency:

> **Diagnosis first. No mystery upgrade list.**

It could be local convenience:

> **Drop it into the Swords shop.**

Or technical specialisation, if true:

> **AEG servicing / GBB work / gearbox diagnostics / upgrades.**

Those are merely positioning examples until Alan confirms them. The key distinction is that **“we repair airsoft guns” is a service category; “Alan diagnoses and services your kit here in Swords, with a clearly explained process” is a brand asset.**

### Review evidence needs cleaner handling

Public directories currently show approximately a **4.7 rating**, but indexed review counts vary — one source showed 97 while older material showed lower totals. citeturn16search7turn16search1

That makes hard-coded copy such as “4.7 from 90 reviews” an unnecessary maintenance trap. The number will become inaccurate precisely when the business is successfully acquiring new reviews.

The better pattern is:

> **4.7 on Google**  
> Based on [live/current count] reviews

with the count pulled from an appropriate current source where practical, or manually reviewed on a scheduled basis with a “checked [month/year]” process.

The psychological argument about an imperfect rating looking “more real” should also be softened. Northwestern’s Spiegel Research Center found in product-review datasets that purchase likelihood did not simply keep increasing as ratings approached a perfect five stars, and that some negative feedback can contribute credibility. That supports not being embarrassed by a 4.7, but it does **not** establish that a 4.7 local-shop Google rating is intrinsically more persuasive than every higher rating. citeturn20search0

## What the competitor research actually says

The most useful correction to the initial five-pass synthesis is to stop asking **“Which brand should Strike Arms resemble?”** and instead ask **“Which pattern should Strike borrow for each job?”**

The named premium analogues are much less homogeneous than the blueprint implies.

### Arc’teryx is the best visual and navigation analogue, not a structural template

Arc’teryx clearly supports activity-oriented discovery: its current taxonomy exposes paths such as **Run, Hike and Climb**, alongside product categories and educational material. citeturn26search10turn26search17

That is excellent evidence for **Shop by Play Style**. The analogy is:

> Run / Hike / Climb  
> becomes  
> CQB / Woodland / Beginner / Sniper or similar.

The deeper principle is that some shoppers begin with **what they are trying to do**, not the technical class of object they need.

Arc’teryx also demonstrates that editorial atmosphere and substantial product-navigation depth can coexist. Its navigation is not actually sparse; it contains many product, activity, collection and education routes. citeturn26search17

That is important because it punctures a possible confirmation bias in the blueprint: **premium does not equal fewer paths. Premium often means better hierarchy between paths.**

### Fellow validates expert curation better than minimalist catalogue architecture

Fellow’s current product estate is broad; its all-products collection exposes hundreds of products rather than a tiny handcrafted catalogue. citeturn31search5

The useful Fellow lesson is elsewhere. Fellow Drops publicly introduces named tasting-panel members, gives their credentials and explains that the panel selects coffees from a much larger field. citeturn31search9

That is directly transferable:

> **Alan’s Picks**

is potentially much stronger than:

> **Featured Products**

because it turns merchandising into **expert judgement**.

The distinction matters. “Featured” tells me where the retailer wants my attention. “Alan’s Picks” tells me *why I should trust the selection*.

The card still needs normal ecommerce information — product name, real price, availability/status and a direct product destination — so curation does not become decorative storytelling.

### Ridge is not evidence for avoiding promotional retail mechanics

Ridge’s current US homepage is highly merchandising- and campaign-led, including a major prize promotion, product categories, prices and reviews. Its EU presence likewise puts products and pricing prominently into the experience. citeturn31search6turn31search10

Ridge therefore supports bold positioning and product confidence, but not the proposition that a premium brand should necessarily suppress commercial merchandising.

For Strike Arms, that reinforces a distinction:

**Avoid cheap-looking promotional clutter, not commerce itself.**

Prices, stock, new arrivals and products are not “big-box”. An undifferentiated wall of them is.

### Patrol Base provides stronger support for human expertise

Patrol Base explicitly says its staff play airsoft and describes collective experience in playing and upgrading equipment, then offers contact with specialists. citeturn26search1

That supports the instinct behind “Meet Alan”, but Strike has an opportunity to be more specific than Patrol Base because it can attach the expertise to **one identifiable person and one identifiable shop**.

A generic:

> Experts who understand airsoft

is easy to imitate.

A genuine:

> Ask Alan

with a real photograph, story and practical contact route is harder.

### The Irish competitors make catalogue restraint useful — but also dangerous if overdone

Hobby Airsoft’s current homepage/navigation exposes a very broad range of rifles, pistols, accessories, ammunition, tactical equipment, repairs, offers and other categories. citeturn27search0

GSE also exposes numerous gun categories and product listings from its navigation and shop pages. citeturn26search0turn26search5

This gives Strike a legitimate opportunity to **reduce initial cognitive noise**. NN/g’s homepage guidance explicitly recommends identifying top tasks and using visual hierarchy rather than allowing all elements to compete equally. citeturn28search3turn28search6

But restraint has a boundary. Baymard found that users can underestimate a shop’s catalogue when the homepage shows too narrow a slice of what is sold; in its 2025 research, 22% of sites exposed an inadequate product range and some users interpreted missing homepage categories as missing inventory. citeturn29search0

So Strike should aim for:

> **curated breadth**

not:

> **minimal content**

Those are not the same thing.

## Revised homepage architecture

I recommend changing the proposed `/demo` architecture to the following **11-module version**, with one of those modules removable after testing.

| Order | Module | Recommended treatment | Job |
|---|---|---|---|
| Hero | Existing Hero | Keep | Establish identity and primary shopping path |
| Proof bar | Rebuilt `TrustStrip` | Rebuild | Deliver 3–4 verifiable concrete facts |
| Categories | `CategoryStrip` | Polish | Make catalogue scope immediately legible |
| Brands | `BrandMarquee` | Rebuild as compact clickable rail | Give brand-led shoppers a fast route and reinforce range |
| Play Style | `ShopByLoadout` | Polish | Offer intent-based/thematic product discovery |
| Alan’s Picks / New In | Repurposed `AnnotatedRifleSection` | Rebuild | Put real merchandise, price and curation on the page |
| Workshop & Swords Shop | Merge repairs + `AboutStatsSection` story | New/rebuild | Combine person, physical place, history and service proof |
| Reviews | `ReviewsSection` | Polish | Independent local social proof |
| Start Here | `ExpertGuidanceSection` | Rebuild | Answer beginner uncertainty and route to legal/help content |
| FAQ | `FAQSection` | Conditional | Resolve remaining purchase objections only |
| Final conversion band | `FinalCTASection` | Polish | Give the next action with clear hierarchy |

This is a more defensible architecture than the original 12-section proposal for several reasons.

### The proof bar belongs high, but it should be evidence rather than advertising

NN/g’s eye-tracking work found that attention is disproportionately concentrated towards the top of long pages; its later study found roughly 57% of viewing time above the fold and 74% within the first two screenfuls. The researchers consequently recommend putting high-priority user and business goals towards the top. citeturn28search0

That justifies the high proof bar.

It does **not** justify cramming five claims into it.

My initial version would be:

**EST. 2009**  
Serving airsoft players since 2009

**SWORDS SHOP**  
Visit us in person

**ASK ALAN**  
Straightforward help choosing your setup

**WORKSHOP / SERVICE**  
Only after exact service is verified

The final copy should be shorter than those descriptions; the point is the hierarchy.

### Category Grid should be treated as functional navigation

This is where I would push hardest against an overly editorial interpretation of the homepage.

Baymard’s current research shows that the homepage helps new users infer catalogue breadth, and category-oriented navigation matters heavily to product finding. citeturn29search0turn29search2

Your proposed 6–8 category tiles are therefore sensible **provided they represent enough of the real catalogue**.

For example, the exact inventory may suggest:

Rifles · Pistols · Snipers · Tactical Gear · Optics · Magazines · BBs/Gas · Parts/Upgrades

The exact taxonomy should come from actual inventory/search demand rather than aesthetic symmetry.

Each tile should answer instantly:

> “What will I get if I click this?”

A moody CQB photograph that could equally mean “rifles”, “gear”, “CQB” or “new arrivals” is weaker category navigation than an image that visibly represents the product family. This is consistent with ecommerce research on visual hit areas and navigational clarity: users should be able to predict where a visual link will take them. citeturn29search9

### I would move Brands upwards only if brands are genuinely navigational

The proposed blueprint moves `BrandMarquee` below the heritage story. I would apply a simple rule instead:

**Clickable brand discovery → high. Decorative logo credibility → low or delete.**

If airsoft customers arrive looking specifically for Tokyo Marui, Specna Arms, G&G, Vorsk, WE or whatever brands Strike actually stocks, a clickable brand rail is a product-finding device.

In that case it belongs after Categories, not ninth.

If it is simply:

> logo · logo · logo · logo

with nowhere meaningful to go, it is weak proof and not worth prime homepage space.

This also solves the current asset problem: rather than treating manufacturer marks as ambience, every logo gets a defined semantic job.

### Shop by Play Style is one of the blueprint’s best ideas

This is the element I would preserve even if the homepage had to be cut further.

Baymard’s research supports thematic and guided browsing for shoppers who have not yet translated a need into a precise product category, while Arc’teryx visibly makes activity a first-class navigation dimension. citeturn29search6turn26search10

The key condition is that it must lead somewhere useful.

Do not build:

> Beautiful CQB scene → decorative hotspots → dead end.

Build:

> **CQB**  
> Compact platforms, fast handling, essentials for indoor play  
> **Shop CQB gear**

leading to a real curated collection or product list.

Likewise:

> **First game? Start here**

can lead to a curated first-loadout route.

The existing HTML hotspots can remain as an enhancement, but the panel itself must have an unambiguous destination. Visual ecommerce links that obscure where they lead create navigational uncertainty. citeturn29search9

### Replace “Featured” with “Alan’s Picks” where possible

A generic New In rail is useful for repeat customers. An Alan-curated selection does additional brand work.

I would design the module so it can carry both:

> **ALAN’S PICKS**  
> Gear worth a closer look

with perhaps four actual SKUs.

Each card should expose, at minimum:

**Product image → exact product name → price → status → click to PDP.**

No fake SSP-18. No example price that accidentally survives production.

When there genuinely is a major new arrival, the section label can switch through data rather than component redesign:

```text
type: "alans-picks"
title: "Alan's Picks"
```

or

```text
type: "new-in"
title: "Just In"
```

That keeps merchandising flexible without inventing another homepage section.

### Merge repairs and Meet Alan into “Workshop & Swords Shop”

This is the most meaningful structural change I would make.

Your current proposed sections six and seven both ultimately answer:

> “Why does buying from this small local shop offer something different?”

Separating them risks recreating the redundancy problem in a new form.

One substantial split/full-bleed module could do all the work:

**THE SHOP, NOT A WAREHOUSE**

Real photograph of Alan / counter / workshop.

> **Meet Alan**  
> Strike Arms has been serving the airsoft community from Swords since 2009. Come in, talk through a setup, or ask about servicing and repairs.

CTAs:

**Visit the shop**  
**Ask about a repair**

The repair CTA should not become “Book a Repair” until an actual booking workflow exists.

Hobby Airsoft’s public repair proposition means the competitive strength here is not simply that maintenance is offered; it is the **person + place + service combination**. citeturn27search0

### FAQ should have to earn its place

An accordion is visually compact, but collapsed text is still content architecture.

I would keep FAQ only where it resolves questions not already answered elsewhere, for example:

> Can I collect from the Swords shop?  
> I’m completely new — what do I need for my first game?  
> How do I ask about a repair?  
> Where can I read the current rules for airsoft in Ireland?

Do not use it to repeat:

> Why shop with Strike Arms?  
> Are you beginner-friendly?  
> Do you offer expert advice?

Those would simply rebuild `WhyBuySection` inside an accordion.

If there are fewer than roughly four genuinely important unanswered questions, the homepage FAQ should disappear and the questions can live in the relevant help pages.

### “One CTA per screen” should be treated as a heuristic, not doctrine

NN/g’s homepage guidance is to identify and visually prioritise **top tasks**, not to enforce exactly one interactive option per viewport. citeturn28search3

Strike Arms has at least two fundamentally different commercial behaviours:

**shop online** and **engage with the physical specialist/shop**.

The hierarchy should make one primary, but the other does not need to be artificially hidden.

For example:

> **Ready to get sorted?**  
> **Shop airsoft**  
> Visit us in Swords

is clearer than making a local customer hunt for the physical shop because a visual rule decreed one button.

## Visual direction and asset system

The dark industrial direction is coherent with the intended positioning, but it should remain a **brand decision constrained by usability**, rather than being treated as if research proves dark interfaces convert better.

The evidence supports hierarchy, restrained competition between elements and careful prioritisation. NN/g specifically warns that when everything receives emphasis, nothing stands out. citeturn28search3turn28search6

That makes the proposed orange accent system sensible:

> orange = action / active state / critical label

rather than:

> orange = borders, gradients, icons, headings, glows, chips and decorative lines everywhere.

### “One idea per screen” is useful until it starts hiding merchandise

This is another place I would soften the blueprint.

Large editorial imagery can be attractive, but NN/g has cautioned that oversized image-led treatments can hurt the broader experience when imagery is prioritised without regard for actual user tasks. citeturn28search20

Meanwhile Baymard finds that ecommerce homepages need to expose sufficient product breadth. citeturn29search0

So the better rule is:

> **One dominant job per section.**

A category section may legitimately display eight tiles because all eight contribute to the same job: **choose a category**.

An Alan’s Picks section may show four products because all four contribute to **expert-curated product discovery**.

“One idea” should never become “one huge photo and twelve words because that feels premium”.

### Photography should be authentic and functional

The proposal to invest in consistent real photography is directionally excellent, particularly for the shop/person/service sections where the very purpose is proving a real local presence.

I would establish three distinct photographic modes:

| Mode | Used for | Goal |
|---|---|---|
| **Product navigation** | Categories, product cards | Make the object/category immediately recognisable |
| **Play context** | CQB, woodland, beginner/play-style panels | Show the intended environment/use |
| **Proof/editorial** | Alan, Swords shop, workshop, local scenes | Establish authenticity and place |

Do not force every image through a heavy near-black treatment just for consistency. If users cannot quickly distinguish an M4-shaped rifle category image from a dark-clad CQB lifestyle image, the system has prioritised mood over usability.

Consistency should come from **lighting, crop, treatment and art direction**, not from crushing every image into the same black rectangle.

### The proposed file system is good; the delivery specification needs upgrading

The folder organisation is clean and maintainable:

```text
public/images/
├── brands/
├── categories/
├── playstyles/
├── shop/
└── sections/
```

I would retain it, assuming the project framework does not already provide a content/image pipeline that makes `public/` less appropriate.

I would also keep the naming discipline:

```text
category-rifles
category-pistols
playstyle-cqb
playstyle-first-game
shop-alan-counter
shop-workbench
section-home-hero
```

But **“WebP for all photos” should not be an absolute rule in 2026**. Current web guidance recommends modern WebP and AVIF formats, with responsive delivery and appropriate fallback/source selection. AVIF can provide particularly efficient compression, while WebP remains extremely broadly supported. citeturn24search0turn24search1turn24search4

A better rule is:

> **Store suitable masters; serve optimised responsive AVIF/WebP variants through the site’s image pipeline.**

For example:

```html
<picture>
  <source
    type="image/avif"
    srcset="
      /images/categories/category-rifles-480.avif 480w,
      /images/categories/category-rifles-800.avif 800w,
      /images/categories/category-rifles-1200.avif 1200w
    "
  />
  <source
    type="image/webp"
    srcset="
      /images/categories/category-rifles-480.webp 480w,
      /images/categories/category-rifles-800.webp 800w,
      /images/categories/category-rifles-1200.webp 1200w
    "
  />
  <img
    src="/images/categories/category-rifles-800.webp"
    alt=""
    width="800"
    height="1067"
    loading="lazy"
  />
</picture>
```

In practice, a framework image component may generate the markup automatically.

Responsive `srcset`/`sizes` allows the browser to choose an appropriate resource rather than forcing a phone to download the same large raster used on a desktop panel. Web.dev explicitly recommends responsive image sources for this purpose. citeturn24search16turn24search10

### “Fixed dimensions” should mean fixed geometry, not one bitmap size

This distinction matters.

Keep:

> category tile = 3:4  
> heritage image = 3:2  
> play-style panel = defined responsive aspect system

but do not interpret:

> one image per slot, fixed dimensions

as:

> one 800 × 1067 WebP file is sent to every device.

The desired architecture is:

**one logical asset / crop per slot → multiple generated delivery widths.**

Explicit image `width` and `height`, or an equivalent known aspect ratio, allow browsers to reserve layout space and reduce layout shifts; responsive sources then keep the payload appropriate to the display. citeturn6search6turn19search11turn24search16

That gives you the content-management simplicity you want **without sacrificing responsive performance**.

### Hero handling needs special treatment

The hero/LCP image should **not** be lazy-loaded. Current web performance guidance recommends prioritising the Largest Contentful Paint image where appropriate, including use of `fetchpriority="high"`, while below-the-fold imagery can be lazily loaded. citeturn24search5turn6search14

So:

```html
<img
  src="..."
  width="..."
  height="..."
  fetchpriority="high"
  alt="..."
/>
```

for the likely LCP image, but:

```html
<img
  ...
  loading="lazy"
/>
```

for the lower sections.

`fetchpriority` is a browser priority hint, not something to spray across every first-screen image. MDN notes that it can complement other prioritisation mechanisms for important images. citeturn24search8

Where possible, I would also favour an actual `<img>`/image component for the critical hero visual over a CSS-only background, because normal image elements are easier for the browser’s resource discovery and responsive image machinery to reason about. If a critical LCP image must be a CSS background, early preload/resource discovery deserves explicit attention. citeturn24search18

### `decoding="async"` is not the optimisation to design the architecture around

There is nothing inherently wrong with using it, but the important hierarchy is:

**correct dimensions → appropriate responsive source → compression/modern format → LCP priority → lazy loading for genuinely offscreen assets.**

I would therefore change:

> Below-fold images `loading="lazy" decoding="async"`

to:

> Below-fold images lazy-load where appropriate; allow the image framework/browser to handle decoding unless testing shows a reason to override it.

That leaves less fragile implementation folklore in the design specification.

### The HTML-label rule is absolutely worth keeping

The instruction:

> labels, prices, tags and callouts = HTML/CSS, never baked into imagery

is sound.

It preserves:

**editability, responsive behaviour, accessibility, localisation, dynamic prices and clean art reuse.**

It also prevents the particularly expensive workflow where changing:

> “Beginner”

to:

> “First Game”

requires reopening Photoshop or Illustrator and exporting mobile and desktop assets.

The one qualification is that genuine manufacturer artwork, diagrams or authored graphic illustrations can obviously contain text where text is part of the artwork itself. Product names, prices, CTA copy and UI callouts should not.

### Brand logos should be normalised at the asset level

SVG is the appropriate preferred format for vector logos because it scales cleanly at different rendered sizes; MDN continues to recommend SVG for imagery that needs accurate vector rendering at different sizes. citeturn24search11

A robust implementation would use:

```text
brands/
  g-and-g.svg
  specna-arms.svg
  tokyo-marui.svg
  vorsk.svg
```

with one consistent logo container, for example a 120 × 40 visual slot.

Do not fix inconsistent vendor assets with per-logo React dimensions plus arbitrary brightness filters where a cleaned, authorised brand asset is available. Normalise optical size in the source/design system once, then let the component remain uniform.

## Legal, beginner and trust architecture

The instinct to avoid casual legal claims is correct, but I would refine the solution.

The answer is **not to make all Irish-law content vague**. The answer is to separate legally sourced information from marketing copy and maintain it properly.

Ireland’s Criminal Justice (Miscellaneous Provisions) Act 2009 contains the statutory framework concerning “realistic imitation firearms”, while Garda Commissioner guidance discusses airsoft devices and the one-joule distinction. citeturn32search0turn30search1

However, the Garda document itself is an older guidance document rather than a substitute for current legislation, and the version examined discusses commencement status of different provisions at the time it was written. The Garda guidance also cautions that such guidance should be read alongside up-to-date legislation rather than treated as a statement of law. citeturn10view0turn9view0

That means the right website structure is:

**Homepage:**  
brief beginner reassurance + legal signpost.

**Dedicated page:**  
“Airsoft and Irish law” with current official sources, a “last reviewed” date and solicitor-reviewed wording.

**Terms/checkout:**  
whatever legally required purchasing restrictions or confirmations the solicitor advises.

I would therefore turn section ten into something like:

> **NEW TO AIRSOFT? START HERE**  
> Not sure what you need for your first game? We’ll explain replicas, power, batteries/gas, eye protection and the basics without assuming you already know the terminology.  
>
> **Start with the beginner guide**  
> Airsoft & Irish law →

That is better than dropping a vague disclaimer into the homepage and hoping users understand it.

I would also **not copy RifleGear’s age-gate treatment merely because RifleGear was used as a design reference**. RifleGear is a US firearms retailer, so its regulatory context is fundamentally different from an Irish airsoft shop. The relevant Irish implementation should follow current Irish law and legal advice rather than borrowing compliance UI from a foreign firearms website. Irish official sources specifically address realistic imitation firearms through their own statutory framework. citeturn32search0turn30search1

The broader lesson is important: **competitive inspiration should stop at the boundary between design pattern and factual/legal requirement.**

## Final sign-off specification

On the evidence available as of **8 August 2026**, I would approve the redesign direction with the following amendments.

### The `/demo` content model

The recommended build target is:

> **Hero**  
> ↓  
> **Verified Proof Bar**  
> ↓  
> **Shop Categories**  
> ↓  
> **Shop Brands** — only if genuinely clickable/useful  
> ↓  
> **Shop by Play Style**  
> ↓  
> **Alan’s Picks / New In**  
> ↓  
> **Workshop & Swords Shop / Meet Alan**  
> ↓  
> **Customer Reviews**  
> ↓  
> **New to Airsoft? Start Here**  
> ↓  
> **FAQ** — only if it contains distinct objections/questions  
> ↓  
> **Final CTA**

That architecture preserves shopping breadth near the top, introduces the distinctive human/local material in the middle, and moves education later without hiding it. It follows the research principle of prioritising high-value tasks early while ensuring the homepage still communicates what products the retailer sells. citeturn28search0turn28search3turn29search0

`WhyBuySection` should be **deleted**. Based on the component/message map you supplied, it does no unique job that cannot be expressed more credibly through real facts in the proof bar and real evidence in the shop/Alan module.

`AnnotatedRifleSection` should cease being a standalone visual gimmick. Its component real estate should become **real, current merchandise**. If the hotspot mechanic remains useful, it belongs inside Play Style or a legitimate “build this loadout” experience where every hotspot resolves to a real product or collection.

### The trust claims permitted at first launch

I would launch with only claims that have been operationally verified.

**Green now:**

> Est. 2009  
> Swords physical shop  
> Alan as named contact/expert

The historical/public sources support those elements. citeturn0search1turn18search3

**Amber — Alan/internal verification required:**

> Repairs/servicing  
> exact repair types  
> turnaround  
> diagnostic charge  
> upgrade service  
> warranty on workshop work  
> delivery speed/SLA  
> exact review source/count

**Red until independently proven:**

> Dublin’s oldest airsoft shop  
> North Dublin’s only walk-in airsoft shop

The present existence of GSE’s published D11 store address is enough to prevent treating the second claim as safe without a much more specific definition and current market check. citeturn26search0turn26search3

### The repairs decision

**Build the component now; do not invent the service proposition now.**

The `/demo` implementation can safely establish:

```text
WorkshopSection
- image
- eyebrow
- heading
- description
- primary CTA
- optional service items
```

But the content data should initially be constrained to what has been confirmed.

Until Alan provides the operational detail, avoid:

> Same-day repairs  
> 48-hour turnaround  
> Warranty included  
> All brands serviced  
> Book your repair

unless each happens to be true.

A lower-commitment interim CTA such as:

> **Ask Alan about a repair**

is preferable if Strike genuinely accepts repair enquiries.

Once the service scope exists, the component can graduate into specific proof:

> AEG diagnostics  
> gearbox service  
> hop/rubber work  
> upgrade fitting  
> etc.

Again, those are examples of the data structure, **not claims I found verified for Strike Arms**.

### The beginner/legal decision

**Keep it, but make the homepage educational rather than legalistic.**

The legal information should live on a maintained page grounded in current Irish official sources and reviewed by the solicitor. The homepage can link to it instead of reproducing a brittle mini-summary.

This approach is more useful than either extreme:

> pretending law does not exist until a solicitor writes every word

or

> copying an unsourced paragraph about Irish airsoft law into the homepage.

Official Irish statutory and Garda material exists; the solicitor’s role is to confirm how the current law should be translated into retailer-facing copy and processes. citeturn32search0turn30search1

### The carousel claim should be corrected in the research document

Delete:

> “~1% interact”

unless the original research pass can produce a credible source for that exact figure.

The **conclusion** remains sound, but the statistic is unnecessary and appears unsupported by the stronger evidence gathered here.

Baymard’s 2025 benchmark says 33% of ecommerce sites it assessed use homepage carousels and that 46% of homepage carousels have UX issues. Its testing finds that static homepage sections are a simpler alternative that can perform just as well. citeturn29search4turn28search1

There is also a clear accessibility burden: automatically moving content that meets WCAG’s conditions needs a mechanism to pause, stop or hide it, and WAI’s carousel guidance calls for automatic rotation to stop on focus and for an accessible rotation control. citeturn28search2turn28search5

So the defensible design statement is simply:

> **Use static editorial sections rather than an auto-rotating homepage carousel.**

No dubious 1% statistic is needed.

### The asset specification I would put into the design hand-off

```text
public/images/
├── brands/
│   └── *.svg
├── categories/
│   └── category-*.{avif,webp}
├── playstyles/
│   └── playstyle-*.{avif,webp}
├── shop/
│   └── shop-*.{avif,webp}
└── sections/
    └── section-*.{avif,webp}
```

With these implementation rules:

| Rule | Final specification |
|---|---|
| UI text | HTML/CSS, never baked into photos |
| Product price/status | Always live HTML/data |
| Logos | Clean SVG preferred |
| Photography delivery | Responsive AVIF/WebP variants |
| Geometry | Fixed logical aspect ratio per slot |
| Responsive payload | `srcset` / framework image optimisation |
| Layout stability | Explicit intrinsic width/height or equivalent aspect ratio |
| Hero/LCP | Do not lazy-load; prioritise only the true LCP candidate |
| Below fold | Lazy-load genuinely offscreen images |
| `decoding` | Treat as implementation hint, not system requirement |
| Alt text | Based on semantic purpose, not filename |
| File names | descriptive kebab-case |
| Hotspots/labels | HTML positioned over image |
| Data | central configuration rather than hard-coded per component |

These recommendations follow current browser/web-performance guidance on responsive sources, modern formats, known image dimensions and LCP prioritisation. citeturn24search4turn24search16turn6search6turn24search5

### The acceptance criteria for `/demo`

The redesign should not be signed off merely because it “looks premium”. It should demonstrate that a new visitor can rapidly answer five questions:

**What does Strike Arms sell?**  
The category grid and product content must make this obvious. Baymard’s catalogue-breadth research makes this a first-order homepage requirement. citeturn29search0

**Why would I buy here rather than from a larger retailer?**  
The answer should emerge from Alan, Swords, history, actual help and verified service — not from a generic “Why us?” paragraph.

**How do I start shopping in the way I naturally think?**  
Users should have clear category, brand where relevant, play-style and curated-product pathways. Activity-oriented navigation is a successful pattern visible in Arc’teryx’s current information architecture, while guided/intermediary navigation is also supported by ecommerce usability research. citeturn26search10turn29search6

**Can I trust the claims?**  
Every numerical, comparative or operational homepage claim should have an owner, source and review date.

**What do I do next?**  
The visual hierarchy should make the main commercial action unmistakable without artificially hiding the physical-shop/help route. NN/g’s guidance is to prioritise key tasks through visual weight and avoid competing emphasis. citeturn28search3

The most important strategic refinement is therefore this:

> **Do not make Strike Arms premium by removing information. Make it premium by removing repetition, weak claims and visual competition — while making the remaining information unusually concrete.**

The strongest version of the brand is not “minimalist airsoft retailer”. It is:

> **A curated Irish airsoft shop where the person recommending the gear, the place you can walk into, and the expertise behind the sale are visible parts of the experience.**

That proposition is compatible with a calm Arc’teryx-influenced visual system, but it also gives the homepage something much harder to copy than dark photography, condensed typography or orange buttons. The competitive research supports the individual ingredients — activity-led browsing, named expertise, physical-shop proof and disciplined hierarchy — while the local-market audit shows why the claims must be made more precise than in the original blueprint. citeturn26search10turn31search9turn26search1turn28search3