# What the florist build teaches us

Distilled from a full audit of the All Blooms Florist repository (2026-08-29), which is
live and has been in production for months. Organised by the `feature-inventory.md` item
it applies to, so it can be read at the point of building rather than up front.

`ecommerce-playbook.md` holds the general stack patterns. This file holds the specific,
expensive lessons — the ones learned from an outage rather than from documentation.

---

## First, the correction that matters most

**The florist has no customer accounts at all.** No signup, no login, no profile, no order
history, no saved addresses. `enable_signup = false`. Checkout is fully anonymous, and
`orders.customer_email` is the only link between a person and their orders.

Accounts were assumed to be the one difference between the two projects. They are not the
only one — they are the one with **no reference implementation to copy**. Section B of the
inventory has to be designed from the Supabase docs, not lifted.

Four other things we need that the florist cannot help with either:

| We need | Florist has |
|---|---|
| Product search | Nothing. Category then filters only. No ilike, no full-text index. |
| Real stock control | A single `in_stock` boolean, set by hand. No decrement, no reservation, no check at checkout. |
| VAT | Nothing. No tax field on any table. Prices stored and charged gross. |
| Age verification | Nothing — not applicable to flowers. |

We are ahead of the florist on stock reservation, VAT extraction and deferred order
numbers. We are level on Stripe. We are far behind on email, images and admin depth.

---

## E3 / C5 — Transactional email

The florist's outbox is the single most directly copyable thing in that repo, and it is
exactly the shape our unused `notification_jobs` table already assumes.

**Nothing sends email inline.** Postgres triggers insert into `notification_jobs`; a
`notification-worker` Edge Function drains it on a schedule.

- `BATCH_SIZE = 10`, processed with `Promise.allSettled` so one failure does not abort
  the batch.
- `MAX_ATTEMPTS = 3` with exponential backoff written into `next_attempt_at`
  (`2^attempt * 60_000`). After three, the row is left `failed` with `last_error` set.
- Resend is called with an `Idempotency-Key` of `notification:${job.id}`, so a retry that
  already reached Resend does not double-send.
- The `recipient` column stores the literal string `owner`, resolved to the `OWNER_EMAIL`
  secret at send time. Changing the owner's address never touches queued rows or triggers.
- `EMAIL_FROM` is a secret with a fallback, so the sender address never needs a code
  deploy. They hardcoded the agency domain first and regretted it.

Four emails: customer order confirmation, owner new-order alert, customer status change,
owner new-inquiry alert.

**Two bugs to inherit the fixes for, not the bugs:**

1. `escapeHtml` must be null-safe. A pickup order has no address, and `null.replace is not
   a function` crashed the owner email in production. Coerce to an empty string.
2. The order reference must be formatted identically on every surface. Theirs quoted
   `substring(id from 25)` in the status email and the last 8 characters everywhere else,
   so the customer and the owner were reading different references off the same order.

**Known weakness to not copy:** nothing alerts when a job exhausts its retries, and they
cannot confirm the worker is actually scheduled. An outbox nobody watches is a queue of
silent failures. Add the alert when we build it.

**Custom SMTP is confirmed necessary**, for the reason already found in the Supabase docs:
the default mailer's 2/hour limit makes admin invites and password resets unusable.

## A7 / E4 — Images

Complete pipeline, all client-side, in their `storage-repository.ts`:

- Compress in the browser with `browser-image-compression`.
- **Keep PNG only when the source is already PNG** (transparency may matter). Output JPEG
  for everything else — WebP encoding is still unreliable in Safari.
- Client limit 10 MB; project limit 50 MiB.
- Path shape `<slug>/<Date.now()>-<random6>.<ext>`, `upsert: false`. Every upload is a
  unique, never-rewritten object — which is what makes `cacheControl: 31536000` safe.
- Replace is upload-then-delete; a failed delete is swallowed. The new image matters more
  than cleaning up the old one.
- The web worker needs `worker-src 'self' blob:` in the CSP.

**The gap to fix rather than copy:** deleting a product deletes only the row. Every image
of every deleted product is still in the bucket, forever. No sweep, no reconciler, no
count. Design ours with a cleanup path from the start — a `storage.objects` trigger on
delete, or a scheduled reconciler.

Two more to avoid: they store absolute public Storage URLs and parse the path back out of
`/object/public/<bucket>/` when deleting, so the URL format is load-bearing. And their
gallery has one hardcoded alt string for every image.

## C6 — Shipping constants (act on this now)

**We have their exact bug, uncaught.** `shipping.ts` exists twice — `src/lib/` and
`supabase/functions/_shared/` — with a warning banner telling us to change both copies
together.

They had the same duplication for delivery zones and it drifted in production: two Dublin
routing keys were overcharged and eight were missing from the server copy entirely. The
customer saw one price and Stripe charged another. Their own verdict on what they would
not build again: put the fees in a table.

A warning comment is not a mechanism. Before shipping rates go live, move them to a table
read by both sides.

## D — Admin dashboard

Their original plan was products, inquiries and admins. Everything below was added because
daily use demanded it, and is worth planning for rather than discovering:

- **Manual order entry.** The biggest one. A shop takes orders by phone and over the
  counter; an admin that only shows web orders shows the owner a fraction of their
  business, and every revenue figure is then wrong. Alan will have exactly this. It needs
  a product picker with search — scrolling a `select` of the whole catalogue while a
  customer is on the phone does not work.
- **Archive/restore, never hard delete.** Then the second-order lesson: the dashboard had
  to *include* archived orders in revenue, because archiving is workflow tidy-up, not a
  financial event. Excluding them made all-time revenue shrink whenever the owner tidied
  up.
- **Kanban board alongside the table.** A table is for querying, a board is for working a
  shift. They kept both behind a persisted toggle, and force the table below 768px.
- Separate boards for delivery vs collection — one mixed board was unworkable.
- **Operational alerts** (failed orders, orders pending over 24h). The only thing in their
  system that surfaces a problem without someone going looking.
- Tap-actionable email and phone in detail sheets — trivial, disproportionately useful on
  a phone behind a counter.

Still missing from theirs and worth having: bulk operations, CSV export, a refund button,
customer lookup, and any way to resend a failed email.

## E1 / E3 — Database and RLS

- **Postgres checks GRANTs before RLS.** Three separate silent outages traced to a missing
  GRANT with a correct policy — the admin product form could never save, and the public
  contact form 401'd on every submission while showing a success message. Worth an audit
  of ours.
- Write admin predicates as `(SELECT public.is_admin_aal2())`. The subquery form is
  evaluated once per statement instead of once per row.
- **Policies created in the Supabase dashboard drift.** Permissive policies combine with
  OR, so one loose policy added in the UI defeats every tight one on the table. They needed
  a migration purely to reconcile it. Never author policies in the dashboard.
- Their AAL2 was originally client-side only and bypassable by any direct REST call with a
  valid JWT. Ours is already enforced in the database — that is one we got right.

## G — Deploy and operations

- **Their worst production incident: migrations committed but never applied.** A refund
  silently failed while returning HTTP 200 because `refund_columns` was never pushed to
  prod. Their runbook now has a 35-row table for manually reconciling the migrations folder
  against the live database. There was no enforced link between committed and applied.
- Cloudflare Pages `_redirects` wins over static assets, so prerendered routes must have no
  rule shadowing them. The SPA shell destination must be extensionless (`/spa-shell`, not
  `.html`) because Pages 308-redirects `.html` to the clean URL — which broke every
  client-only route.
- Their `_headers` carries a full production CSP, HSTS preload, `X-Frame-Options: DENY`,
  noindex on `/checkout` and `/order/*`, and immutable caching on `/assets/*`. We have none
  of this. Copy the file and adapt.
- CI runs typecheck and lint only. **They have zero automated tests, and say so as a
  regret:** every regression in their production-incident list was found by a human.
- ESLint enforces the architecture — `max-lines: 300`, `no-explicit-any`, `no-console`, and
  a `no-restricted-imports` rule banning `@/data` imports from `src/components/**`. That is
  our CLAUDE.md layer rule as a machine check. It landed very late for them and forced a
  round of file splitting. Ours is item G6 and should land early.

## F10 — Prerendering (evidence for the decision)

They prerender, and would not do it again. Eight commits to stop it breaking the site, a
temporary dev-mode production build shipped purely to debug it, and a React #418 warning
still unresolved. The payoff is undercut by its own design: data-driven pages set a
no-hydrate flag and re-render from scratch on the client anyway, so it is a crawler
snapshot rather than a performance win, and any product published since the last build is
not prerendered at all.

Their recommendation: **edge meta injection alone** — the Cloudflare `_middleware.js` half,
which is cheap and works. It rewrites title, description, canonical, OG and Twitter tags
per route, and catches a 404 on a product URL to re-serve the SPA shell with a 200 so a
newly published product still renders.

Hydration is the tax prerendering charges. Four separate React #418 causes: randomised
review order, a portalled mobile menu, Turnstile's implicit widget, and reading
localStorage during render. **The Turnstile one is dangerous** — a mismatch tears down and
recreates sibling widgets, so checkout silently stops producing a captcha token. Their fix
is to render the widget explicitly into an empty ref'd div after mount.

## C11 — Turnstile

Fails closed: a missing or invalid token is rejected, with an `ALLOW_INSECURE_NO_CAPTCHA`
local-dev escape hatch. On exactly two surfaces — checkout submit and the contact form.
The frontend site key and the backend secret must be set together in production or both
surfaces break at once.

**No rate limiting behind it.** Anyone who solves Turnstile can create unlimited pending
orders. Not a pattern to copy.

## Convergences — things we already did the same way

Worth knowing we are not off-course. Independently, both projects arrived at: a deferred
order number assigned on payment success rather than at insert (their owner asked why the
sequence had gaps); a `checkout_attempt_id` reused across retries so a double-click
replaces the pending order instead of stacking duplicates; server-side repricing from the
database as the only defence against a tampered basket; webhook dedupe via a
`stripe_event_log` written *after* successful handling; and an effective-price column so
price sorting uses what the customer actually pays.

The one pattern of theirs worth adopting wholesale is the **split additive/subtractive
migration**: an additive migration that is dormant and changes nothing, deployed first;
then the code that uses it; then the subtractive migration that drops the old default. They
deliberately held the subtractive half *outside* the migrations folder so `db push` could
not apply it early, because applying it while the old webhook still ran would have stranded
paid orders.

## Two things they call their own worst debt

1. **The base schema was created in the Supabase dashboard and never captured as a
   migration.** Five tables and their original RLS exist only in the live project;
   `db reset` does not produce a working database. Ours is fully in migrations 001–009.
   Keep it that way.
2. **No tests, at all.** Their words: every regression on their production-incident list
   was found by a human.
