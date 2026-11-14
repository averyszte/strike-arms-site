# Strike Arms: feature bank

Surveyed 2026-11-14 at commit bc14169. The survey was read-only, from the code; where the docs disagree, trust the code.

This replaces `docs/feature-inventory.md` (2026-08-29) as the record of what the site does. The detail lives in the section files. This page is the index and a map of how the features connect.

| Section | File | Features | IDs |
|---|---|---|---|
| 1. Storefront and cart | [feature-bank/bank-1-storefront.md](feature-bank/bank-1-storefront.md) | 208 | S-001 to S-208 |
| 2. Money path (Stripe) | [feature-bank/bank-2-payments.md](feature-bank/bank-2-payments.md) | 88, plus 31 failure branches | P-001 to P-088, F-01 to F-31 |
| 3. Accounts, inquiries, email | [feature-bank/bank-3-accounts-email.md](feature-bank/bank-3-accounts-email.md) | 116 | A-, I-, E- |
| 4. Admin dashboard | [feature-bank/bank-4-admin.md](feature-bank/bank-4-admin.md) | 163 | D-001 to D-163 |
| 5. Database and platform | [feature-bank/bank-5-database-infra.md](feature-bank/bank-5-database-infra.md) | 14 tables, 42 functions, 27 policies, 4 cron jobs, 36 infra items | DB-T, DB-F, DB-P, DB-C, INF- |
| Reference: external best practice | [feature-bank/research-ecosystem.md](feature-bank/research-ecosystem.md) | 218 checklist items, each with its source | by service |

Every row has a "watch" note. These notes are observations, not verified audit findings. The audits in [audit-plan.md](audit-plan.md) confirm or reject each one.

---

## 1. How the pieces connect today

```
Browser (Cloudflare Pages SPA, CSP in _headers, coming-soon gate client-side only)
  |-- reads catalogue ------------> Supabase PostgREST (anon, RLS) + search_products RPC
  |-- cart (localStorage) -------> cart-freshness read (price/published only, NOT stock)
  |-- checkout ------------------> create-checkout-session (Turnstile, rate limit, reprice,
  |                                  reserve (in_stock flag only), order row, Stripe session)
  |                                       |
  |                                  Stripe Checkout (hosted) ---> customer pays
  |                                       |
  |                                  stripe-webhook (signature, stripe_event_log claim)
  |                                    -> confirm_order_paid / expire_order / record_refund
  |                                    -> trigger queue_order_notifications (same transaction)
  |                                          -> notification_jobs (outbox)
  |                                                 -> pg_cron (only if scheduled by hand)
  |                                                    -> notification-worker -> Resend
  |-- success page polls --------> checkout-status
  |-- order lookup / account ----> order-lookup fn (Turnstile) / my_orders RPC (JWT)
  |-- contact / service forms ---> submit-inquiry (rate limit, Turnstile) -> inquiries -> outbox
Admin (same SPA, /admin, password + TOTP/AAL2)
  |-- products, categories, CSV import, images (Storage, orphan sweeper cron)
  |-- orders: status (025 guard), tracking, counter sale RPC, refund-order fn, resend email
  |-- settings (store_settings: delivery rates, VAT), payment alerts, migration check
```

## 2. Where the connections are weak

Each item comes from at least one bank's watch notes. IDs point to the detail.

**Money and stock can disagree**
- Nothing counts stock since 038. A one-off item can be sold twice, on the web and at the counter. Only Alan unticking "In stock" prevents it. (D-160, F-15, 038:77-150)
- A retried checkout can leave two payable Stripe sessions. Both orders can be paid, with no alert. (F-13)
- Order numbers collide at 10,000. From then on every paid order sticks at pending. (F-20)
- Refund state only changes when `charge.refunded` arrives. Failed refunds and disputes are not handled. `refund-order` may not be deployed. A partial refund can be sent twice. (F-08, F-09, F-31, D-068)
- `release_stripe_event` failure is unchecked, so an event can be lost silently. (F-02)

**Email can block payment, or silently never happen**
- The outbox insert runs inside the payment-confirm transaction. If the email queue fails, the paid order fails too. (F-19)
- The worker cron and the Vault key exist only if someone ran a setup command by hand. Nothing reports their absence. (E-015, DB-C)
- If the worker crashes, the job is never dead-lettered. It retries for ever, and after 24 hours it can send duplicates. (E-013)

**Each fact has more than one source**
- Shipping and VAT logic lives in three places: client, edge function and counter SQL. (P- cross-area)
- The price filter uses the list price; sorting and checkout use the sale price. (S- runner-up)
- The cart caches delivery rates for 10 minutes. (D-152)

**Hosted config that the code assumes but nothing checks**
- Stripe webhook event list, Turnstile hostname (`SITE_HOSTNAME`), Supabase Site URL and redirects (still localhost), auth SMTP, auth templates, cron jobs, Vault secret, Resend DNS. (INF-, E-037 to E-042)
- The `service_role` key is stored in plain text in `cron.job` if the image sweep was ever scheduled. (012:283-299)

**Admin actions that can hurt the live shop**
- Editing a live product's slug breaks its URL. (D-112)
- A CSV import with a blank Images cell permanently deletes photos. The import also accepts EUR 0 prices. (D-127, D-129)
- There is no MFA reset, so a lost phone locks Alan out. (D-008)
- Several writes report success when zero rows changed. (D-161)
- Counter sales accept unpublished products and skip the stock check. (038:239-244)

**Failure looks like success or emptiness**
- The rate limit is counted before Turnstile, so bots can lock out a real email address. (I-015, I-016)
- A global checkout limit of 200 an hour can be used by a bot to shut checkout for everyone. (F-24)
- If the success-page poll times out, the cart is not cleared, and the customer may pay again. (F-27)

## 3. How they should connect (target principles)

The audits and fixes aim at these:

1. **Stripe is the source of truth for money; the database is the source of truth for stock and price.** Every money state change arrives by a verified, idempotent webhook. Every unexpected case raises a `payment_alerts` row, never a silent no-op.
2. **Stock is a manual in-stock tick that Alan manages (decided 2026-11-14, D1 in [audit-plan.md](audit-plan.md)).** The system's job is to make sure he finds out about every sale, and that an unticked item can't be bought.
3. **Email never blocks payment.** Enqueue it so a failure there cannot roll back a paid order. Jobs have a retry limit and a dead-letter state that Alan can see.
4. **One definition per business rule.** Shipping, VAT and sale-price rules are defined once, as data or a single module, and checked for parity where a runtime split forces a copy.
5. **Hosted config is checked, not assumed.** A health check covers cron jobs, Vault, secrets and the webhook event list. The runbook covers every manual step.
6. **Admin actions are guarded and reversible.**
   - Destructive actions need a confirmation.
   - Imports dry-run first.
   - Slugs lock once published.
   - Writes verify a row changed.
   - Alan always has a recovery path for MFA and his password.
7. **Every failure is visible to the right person.** The customer sees a clear message. Alan sees an alert. Nothing shows EUR 0 or an empty list when the backend is down.
