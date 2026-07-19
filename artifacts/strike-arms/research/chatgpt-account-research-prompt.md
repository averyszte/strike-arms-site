# ChatGPT Deep Research Prompt — Customer Account System (Strike Arms)

Paste everything below the line into ChatGPT (Deep Research mode). It is self-contained.

---

You are a product, privacy-law, and security researcher. I run **Strike Arms** (**strikearms.ie**),
a Dublin-based airsoft retailer in Ireland. We are building **customer user accounts** into our
website and I need a rigorous, **cited** research report to make sure we build the right features
and stay genuinely legally compliant — not just plausible.

Context about the build:
- Direct-to-consumer (B2C) e-commerce site. Customers in the Republic of Ireland and Northern Ireland.
- Stack: React (SPA) + Supabase Auth (Postgres, row-level security) + Stripe Checkout (hosted),
  deployed on Cloudflare Pages.
- Small specialist retailer, not a large enterprise. We want practical, proportionate advice.
- This is an **airsoft** retailer, so there may be age-related considerations.
- Scope: the **customer** account side only (not the internal admin/staff dashboard).

Produce a deep, well-organised, **source-cited** report covering three areas, and finish with a
prioritised build checklist. Throughout, clearly separate **"legally required"** from **"best
practice"**, and cite primary or authoritative sources wherever possible.

## Part 1 — Functionality

What a modern e-commerce **customer account** should include. For each item, say whether it is
must-have or nice-to-have for a small specialist retailer, and note anything Supabase Auth gives us
out of the box:
- Registration / sign-up, login, log-out.
- Email verification / confirmation.
- Password reset / forgot-password.
- Social / OAuth login (Google, Apple, etc.) — is it worth it for a shop this size?
- Profile management (name, contact details).
- Saved shipping and billing addresses.
- Order history and order detail (note: orders come from Stripe Checkout).
- Saved items / wishlist.
- Marketing-email preferences and opt-in/opt-out.
- Account settings, session management, "log out of all devices".
- **Guest checkout vs required accounts** — what do the best specialist retailers do, and what
  converts best while staying compliant?

## Part 2 — Legal / compliance for Ireland & the EU (the important part)

Give me a careful, cited breakdown of GDPR and related obligations for a customer account, under
**Irish and EU law**. Prioritise primary/authoritative sources: the GDPR articles themselves, Irish
Data Protection Commission (DPC) guidance, the Irish Data Protection Act 2018, and the ePrivacy
Regulations (S.I. 336/2011). Cover:
- **Right to erasure ("delete my account", GDPR Art. 17):** Is a self-service in-product "delete my
  account" button legally *required*, or is it enough to handle deletion on request? What must be
  deleted versus what may (or must) be retained — e.g. order/transaction records for tax and
  accounting? How long must such records be kept under Irish law (Revenue / Companies Act), and how
  do we reconcile "keep for tax" with "erase on request"? What's the correct pattern (e.g. anonymise
  vs hard-delete)?
- **Right of access (Art. 15) and data portability (Art. 20):** Should we offer self-service data
  export/download? Required or best practice? What format?
- **Lawful basis & consent (Arts. 6, 7):** Marketing email consent specifically — the rules for opt-in,
  the "soft opt-in" for existing customers under ePrivacy, and how consent must be recorded and
  withdrawable.
- **Cookies / tracking (ePrivacy):** consent banner requirements in Ireland, what needs consent vs
  what is exempt, and DPC's current position.
- **Data minimisation & retention:** what customer data we should and shouldn't store, and sensible
  retention periods.
- **Personal-data breach:** the 72-hour notification duty (Art. 33), when customers must be told
  (Art. 34), and what a small retailer should have in place.
- **Age considerations:** the age of digital consent in Ireland (for processing a child's data), and
  — given we sell airsoft — whether any age verification or gating is needed at account creation or
  checkout, distinguishing data-protection age rules from any product-sale/airsoft-specific rules.
  Flag airsoft-sale legal questions as "verify against Irish firearms law / primary source" rather
  than asserting them.

## Part 3 — Security best practices

- Password policy (length, complexity, breached-password checks) aligned to current NIST/OWASP guidance.
- MFA / 2FA — is it worth offering to customers, and how does it work with Supabase Auth?
- Secure session and token handling with Supabase Auth (JWT storage, refresh, expiry), and SPA-specific
  risks (XSS, token theft).
- Rate limiting, brute-force / credential-stuffing protection, and account-takeover mitigations.
- Anything specific to a Supabase + Cloudflare Pages + Stripe stack.

## Output format

- Three clearly separated sections, then a **prioritised build checklist** at the end: "must-have for
  launch" vs "later", with every **legal requirement we cannot skip** explicitly flagged.
- Cite sources with links; prefer primary/authoritative ones for anything legal.
- State assumptions and confidence levels. Where the law is genuinely uncertain or fact-specific,
  say so and recommend confirming with an Irish solicitor / the DPC rather than guessing.
- Irish/British English. No emojis.
