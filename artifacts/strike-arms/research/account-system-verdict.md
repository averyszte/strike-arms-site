# Customer Accounts — Final Verdict (reconciled)

Reconciles two sources:
- **Source 2 — ChatGPT deep research** (`chatgpt-account-research-report.md`): comprehensive.
- **Source 1 — SEO-workflow deep research** (partial; hit session limit): returned 6 primary-source-
  verified claims that corroborate the legal core. Claims it marked "unverified" mostly failed
  because verifier agents erred out on the session limit — that means *not independently triple-checked*,
  **not refuted**. Source 2 + DPC guidance back them.

Confidence: legal core is **high** (both sources agree; source 1 cites the DPC and GDPR articles
directly). The airsoft-specific age/sale rules are **not** settled here — verify with an Irish
solicitor / primary source before asserting anything on-site.

---

## A. Legal — the non-negotiables (Ireland/EU)

1. **Privacy notice at signup (GDPR Art. 13)** — REQUIRED. Link to a privacy policy at the point of
   sign-up (what's collected, lawful basis, retention, rights).
2. **Right to erasure = delete-OR-anonymise (Art. 17, with the Art. 17(3) exemption)** — REQUIRED on
   valid request. *Source 1 verified 3-0 against the DPC and gdpr-info.eu.* You must erase personal
   data, BUT may retain records necessary for a legal obligation (tax/accounting — Irish Companies
   Act 2014 ≈ 6 years) and for the establishment/defence of legal claims. **Correct pattern:**
   anonymise order rows (strip name/email/address, keep the transaction skeleton), close the account.
   A one-click self-service delete button is **best practice, not strictly mandated** — but you must
   comply within one month either way. You were right that this matters; the nuance is delete-or-anonymise.
3. **Right of access (Art. 15) + portability (Art. 20)** — must provide a copy of the person's data
   on request. Self-service "download my data" export is **best practice**, not strictly required;
   structured format (JSON/CSV) preferred.
4. **Marketing email = affirmative opt-in (ePrivacy Reg. 13, S.I. 336/2011)** — REQUIRED. *Source 1
   verified 2-0 against the DPC.* No pre-ticked/bundled boxes. Record consent + timestamp; every
   marketing email needs a working unsubscribe; withdrawal must be as easy as giving consent. A
   limited **"soft opt-in"** lets you email *existing customers* about *similar* products if they got
   an opt-out at purchase and in every message (source 2; standard DPC position).
5. **Cookie consent (ePrivacy)** — REQUIRED for non-essential cookies (analytics, ads, tracking);
   strictly-necessary cookies (session/cart) are exempt. Consent before setting them; no implied
   consent / pre-ticked.
6. **Age — digital consent age is 16 in Ireland (Data Protection Act 2018)** — block under-16 sign-ups
   or obtain parental consent. **Separate and flagged:** any airsoft *sale* age restriction (likely
   18+ under firearms law) is a different question — do NOT assert it; verify against Irish firearms
   legislation / a solicitor. Practically: an age-confirmation step at checkout.
7. **Breach notification (Art. 33/34)** — notify the DPC within 72 hours of a reportable breach;
   notify affected individuals if high risk. Not a "feature" — needs a short incident-response plan.
8. **Data minimisation & retention (Art. 5)** — collect only what's needed; **never store card data**
   (Stripe handles it); keep data only as long as needed, then anonymise/delete.

## B. Functionality verdict

**Must-have for launch:** sign-up / login / logout; email verification; password reset; editable
profile; saved shipping addresses; order history (once orders exist); marketing-preference toggle;
cookie-consent banner; delete/anonymise account; data export on request; age gate.

**Nice-to-have / later:** social (OAuth) login; wishlist / saved items; saved payment methods; MFA;
active-session overview / last-login. (Supabase sign-out already revokes sessions, so "log out of all
devices" is effectively free.)

**Guest checkout:** allow it — forcing account creation abandons roughly a fifth of carts. Offer
optional account creation *after* purchase. Same GDPR duties apply to guest data regardless.

## C. Security verdict

- **Passwords:** minimum length (≥8, encourage passphrases), **no** forced complexity rules, check
  against breached-password lists (Have I Been Pwned). No forced periodic expiry.
- **MFA:** offer optional TOTP (Supabase supports it); not required for customers.
- **Sessions/tokens:** Supabase JWT ~1h expiry is fine; SPA XSS is the real risk — strict CSP,
  sanitise inputs, prefer HttpOnly cookie mode if feasible. **RLS on every user table**
  (`user_id = auth.uid()`).
- **Abuse:** Supabase built-in rate limits + Cloudflare rate limiting on auth; throttle/lockout or
  CAPTCHA after repeated failures; log auth events.
- **Stripe:** verify webhook signatures; store minimal identifiers (payment_intent/customer id) only.

## D. Prioritised build checklist

**Launch (legal requirements in bold):**
- Auth: sign-up / login / logout, email verification, password reset
- **Privacy notice + link at sign-up**
- Profile with editable details
- Saved shipping address(es)
- Order history (when orders exist)
- **Marketing opt-in toggle — affirmative, off by default**
- **Cookie-consent banner (non-essential cookies)**
- **Delete/anonymise account** (self-service button ideal; otherwise a request flow completed ≤ 1 month)
- **Data export on request** (self-service = best practice)
- **Age gate: block under-16** at sign-up; **age-confirmation at checkout** for airsoft (verify the law)
- RLS on all tables; breached-password check; sensible session expiry

**Later:** social login, wishlist, MFA, saved payment methods, session overview, written breach-response plan.

## E. What we're NOT sure about (get confirmation before publishing/relying)
- The exact airsoft **sale** age and any verification duty (firearms law — separate from data-protection age).
- Precise retention periods beyond the ~6-year accounting norm.
- These should be confirmed with an Irish solicitor / the DPC, not guessed.
