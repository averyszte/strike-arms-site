# Alan meeting — 23 July 2026 — question sheet

Prioritised by how much each answer unblocks. Sources: about-page-questions.md,
best-of-listicles.md (8 questions), the Needs-Alan items in alan-interview-answers.md,
seo/changelist.md gates, and the two schema decisions surfaced by the admin/Supabase port.

## The big five (if time is short)

1. **Catalogue.** Confirm range = ASG / CYMA / EVOLUTION (Italian, not E&L) only.
   Which actual models per brand can stay consistently in stock? Needed to seed the real
   product DB — the mock catalogue is wrong brands. Confirm the three-tier ladder:
   CYMA (beginner) → EVOLUTION M4/Ghost (mid) → ASG CZ Scorpion EVO (premium).
   Confirm first-AEG bracket (~€180–260 before accessories?).
2. **Shipping or click-and-collect only?** Order system is currently C&C only
   (pending → ready_for_pickup → collected). Ship within ROI? NI? (NI = UK RIF rules;
   couriers restrict gas/CO2/realistic replicas — publish only carrier-approved routes.)
3. **Age policy.** Law: no RIF sale under 16. What does Strike Arms operate — 16+ or a
   stricter 18+? Photo ID procedure? Same in-store and online? Blocks checkout age-gating.
4. **Services pricing reality.** Typical turnaround, publishable price ranges, warranty /
   aftercare on repairs and used guns, chrono + proof on every outgoing gun? (Appendix A1,
   §8.13, services §3/§17.)
5. **Contact details.** Is info@strikearms.ie real? Phone +353 87 273 6351 current?
   Exact address for the map pin (lat/long)?

## About page — the five story questions (record him)

1. How did you get into airsoft, and how did that become a shop? Actual sequence;
   specific and awkward beats polished.
2. Years teching AND years Strike Arms has existed — two separate numbers, no rounding.
3. Why a physical shop in Swords rather than online-only? (Doubles as the "why not buy
   from the UK" answer.)
4. Who does the technical work, and what training/experience stands behind it?
   Only credentials that can be documented.
5. Pricing vs UK shops — honestly. Where he matches, where he doesn't, what the customer
   gets for the difference.

## Bench data (unlocks listicles + repair content)

- Most common genuine "broke day one" fault vs user error — from records.
- Brands/models most often in for repair — only vs units sold.
- Cheap first guns he refuses to sell — actual shop policy.
- Sniper/DMR platforms he will build and warranty.
- Surcharge/labour policy for correcting DIY damage.
- Batteries/chargers he recommends and which he refuses.
- Repairs/trade-ins: what identity/proof-of-ownership is recorded and retained?
- Spares kept in stock vs ordered in (ASG Scorpion parts, EVOLUTION electronics?).
- MOSFET policy: when worth fitting, installed price range.
- GBB pistols he'd sell for an Irish winter (ASG CZ P-09 confirmed?).

## Venues + legal gates

- Vouch for Khaos / Fingal / Special Ops / Redhills — open, rules current
  (ages 10/11/12; Redhills semi-only, 0.9 J HPA, 0.28 g cap)? Add/drop any?
- Solicitor available to review the legal spokes? Gates: the 1 J threshold (CJA 2006
  s.26), under-16 sale prohibition, two-tone-is-UK-only. Biggest unpublished
  differentiator on the site.
- NI sales stance: sell/ship north at all?
- Turned-away sales / Garda interactions — red flags he acts on (for the law hub, may
  stay unpublished).

## Housekeeping (30 seconds each)

- Gift cards: physical, digital, both? Fixed denominations?
- Customer accounts: order history wanted, or guest checkout fine for launch?
- Staff/admin access: anyone besides Alan needing dashboard logins? (Invite system
  is built.)
- Confirm NAP in site-config still current for the new shop.

## After the meeting

Fold answers into alan-interview-answers.md with **Alan** status (his words supersede
Sourced/Draft), update the gated items in seo/changelist.md, and re-seed supabase/seed.sql
with the confirmed model list.
