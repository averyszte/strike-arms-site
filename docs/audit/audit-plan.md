# Strike Arms: pre-launch audit plan

Drafted 2026-11-14. **Status: approved. Phil handed the whole process to this session (2026-11-14): it decides D2 to D6, merges the findings and runs the fix lanes without a further pause. Phil still does every push, deploy, `supabase db push` and dashboard (hosted config) change.**

Inputs:
- [feature-bank.md](feature-bank.md) and its five sections;
- [feature-bank/research-ecosystem.md](feature-bank/research-ecosystem.md);
- the All Blooms audit prompts and close-outs (July 2026);
- [completion-plan.md](completion-plan.md) (September 2026).

---

## 1. What went wrong at All Blooms, and the rule that prevents it

At All Blooms each audit fixed its own findings in its own session. Security, correctness and performance all edited the same files: the checkout function, the webhook, the email worker, the order screens and the React Query setup. None knew what the others had changed.

The rule here is this:

- **Audits only read.** All findings come back to this session.
- **Fixes are grouped by the files they touch, not by the audit that found them.** Each group of files has exactly one owner at a time.

## 2. The audits

### Phase 1: coding, security, efficiency (now)

| # | Audit | Scope (in) | Explicitly out |
|---|---|---|---|
| A1 | **Security, auth and payments** | RLS on every table and storage bucket; grants and revokes; security definer and `search_path`; AAL2 enforced in the database, not just the UI; admin invites; MFA; password reset; customer auth; edge function JWT flags and input validation; webhook signature verification; server-side pricing; secrets and `VITE_*`; Vault and cron key exposure; CSP and headers; Turnstile server check and hostname; rate limits and IP trust; enumeration; delete-account | Logic bugs that are not exploitable; style; performance |
| A2 | **Data and correctness** | Money maths in integer cents; VAT and shipping in all three copies; sale-price rules; order state machine (025); refund maths; order numbers; stock model; the outbox state machine and email triggers; React Query keys and invalidation; silent failures (writes with zero rows, swallowed errors); edge cases (empty cart, archived item in cart, concurrent edits, bad URL params, Eircodes); dates and time zones; dashboard and CSV figures | Exploitability (A1); recovery from outages (A5) |
| A3 | **Architecture and standards** | The CLAUDE.md hard rules: file and function sizes, layer rule, naming, `@/` imports, no `any` or `console.log`; one component per file; duplicated logic across runtimes; dead code (demo, draft and hidden pages); stale docs (CLAUDE.md says React 18, but the pin is 19.1.0); leftover Replit and drizzle scripts; lint config | Behaviour changes. A3 proposes refactors; it changes no logic. |
| A4 | **Performance and efficiency** | Supabase query shape: N+1, `select('*')`, pagination, indexes against real filters; `(select auth.uid())` in policies; React Query staleness; bundle splitting (admin dependencies kept out of the storefront); images; framer-motion and video cost; Cloudflare caching of `index.html` versus hashed assets; edge function cold paths | Core Web Vitals field data and SEO (phase 2) |
| A5 | **Resilience and integration (added)** | Each external dependency failing in turn: Stripe, Resend, Turnstile, the Supabase database, edge functions, cron. Stripe events retried or out of order; double submits; the whole 31-row failure-branch table (bank 2) re-verified. Hosted config the code assumes: webhook event list, cron jobs, Vault, secrets, Site URL and redirects, SMTP, DNS. What the customer sees and what Alan sees in each failure. Monitoring and alerting gaps. Backups and plan tier. The launch runbook, step by step. | Fixing hosted config (Phil does it; A5 writes the checklist) |
| A6 | **Admin safety: Alan-proofing (added)** | Every one of the 163 admin actions, asking: can this break the storefront, mis-state money, oversell, destroy data, or fail silently? Covers recovery paths (MFA, password, a mistaken refund, a mistaken status, undoing an import), confirmations, dry runs, slug locking, and validation in both the UI and the database. Also covers what Alan sees when he gets something wrong. | Admin performance (A4); admin security bypasses (A1) |

**Why A5 and A6 are separate audits.** You asked for an ecosystem where customers never hit a glitch and Alan can't break anything or lose money. A2 checks that each piece is right on its own. A5 checks what happens between the pieces when one of them fails. A6 checks the system from the point of view of a non-technical person changing it every day. Folded into the other audits, these become afterthoughts.

### Phase 2: later, after phase 1 fixes land

SEO (technical, schema, sitemap, 301 map), speed and Core Web Vitals, accessibility, privacy, GDPR and legal pages (owner and solicitor items flagged, not invented), UX and conversion, content.

## 3. How each audit runs

Every audit prompt uses the All Blooms structure. That means:
- a read-only instruction;
- a list of the docs and skills to read first;
- a numbered in-scope list;
- an explicit out-of-scope list;
- the "floor not ceiling" investigation clause;
- severity, file:line, a concrete failure scenario and a described fix for every finding;
- "adjacent" flags for anything just outside scope;
- a list of what the audit verified and what it could not.

Additions for Strike Arms:
- Each audit receives the feature bank. It must give a verdict on every relevant "watch" note: confirmed, rejected or adjacent, citing the bank ID.
- It must also report findings the bank missed.
- Output is a file in the shared notes folder (`audit-A1-security.md` and so on), not chat.
- Each finding gets a stable ID (A1-01 and so on) and a list of the **files a fix would touch**. That list is what drives the fix lanes.

**Agent budget for phase 1:** six audit agents, one per audit, run in parallel, all read-only. Nothing else runs during the audit phase.

## 4. From findings to fixes

1. **Merge.** I combine the six reports into one `docs/audit/findings.md`. Duplicates are merged: when two audits flag the same thing, it becomes one item with both IDs. Each item is tagged with severity, its fix lane, and whether it needs a migration, a decision or hosted config.
2. **No pause (changed 2026-11-14).** Phil delegated the review. The merged list is written to `findings.md` for the record, and the fixes start straight away.
3. **Fix lanes.** Each lane owns a fixed set of files. Only one agent works a lane at a time, and lanes never share a file.

| Lane | Owns | Notes |
|---|---|---|
| L1 Money path | `supabase/functions/create-checkout-session`, `stripe-webhook`, `refund-order`, `checkout-status`, `order-lookup`, `_shared/shipping.ts` | Highest risk. Runs one finding at a time. |
| L2 Messaging | `supabase/functions/notification-worker`, `submit-inquiry`, `_shared/turnstile.ts`, `_shared/rate-limit.ts`, `_shared/guard.ts`, `supabase/templates` | |
| L3 Database | **All new migrations** | The only lane that writes SQL, so migration numbers never collide. Other lanes request SQL changes through me. Phil applies with `supabase db push`. |
| L4 Admin UI | `src/pages/admin`, `src/components/admin`, the admin hooks and admin data repositories | |
| L5 Storefront | Storefront pages and components, cart, `src/lib` storefront logic, customer account pages | |
| L6 Platform | `public/_headers`, `_redirects`, `robots.txt`, sitemap generation, `scripts/`, ESLint and tsconfig, docs, CI and tests | A3 refactors land here last, after the behaviour fixes. |

**Shared files** have one named owner, and the other lanes ask through me. These are `src/types/*`, `src/lib/shipping.ts`, the React Query client setup and `src/data/function-error-message.ts`.

4. **Order of waves.**
   - Wave 1: L3 database first, because L1 and L2 depend on the new SQL. L5 and L6 run alongside it, since they share no files.
   - Wave 2: L1 and L2, then L4.
   - Wave 3: A3 structural refactors.

   After every lane: typecheck and lint must pass with zero warnings. I review the diff against the finding before the next lane starts.
5. **Verify.** A fresh read-only pass re-checks every fixed finding. It also runs the failure-scenario list from A5 in Stripe test mode where possible. Each lane ends with a close-out in the All Blooms format: what changed, what was noticed but not touched, what not to re-audit, and what was rejected on merit.

**Agent budget for fixes:** at most 3 agents running at once, about 12 to 15 in total across the waves. No workflow runs that fan out unchecked.

## 5. Decisions needed from Phil (or Alan) before or during the audits

| # | Decision | Why it matters | My recommendation |
|---|---|---|---|
| D1 | **Stock model.** Migration 038 removed stock counting, so only a manual "In stock" tick prevents overselling. | One-off pre-loved guns can be sold twice, on the web and at the counter. | **Decided (Phil, 2026-11-14): keep the manual tick. Alan unticks an item when it sells.** The audits treat the 038 model as intended and do not report "no stock counting" as a bug. They still check the edges: that the owner order email reliably reaches Alan (so he knows to untick), and that an unticked item is refused at checkout and in the cart. Possible later improvement, not in scope: an "untick" link in the owner email. |
| D2 | Payment methods: card and wallets only (instant)? | Async methods (SEPA and others) are not handled end to end. | **Decided: instant only for launch.** The code restricts the session to instant methods, and the async webhook events are handled defensively (alert, no state change). |
| D3 | Supabase plan | The free tier pauses and has no PITR. The built-in auth email allows 2 an hour. Leaked-password protection needs Pro. | **Decided: Pro before launch, and Resend SMTP for auth email.** These go on Phil's hosted-config checklist. |
| D4 | MFA recovery for Alan | A lost phone currently needs a developer in the dashboard. | **Decided: allow a second TOTP factor (a backup device) and document the developer reset procedure in the runbook.** |
| D5 | The coming-soon gate is client-side only | Anyone can reach the API and pages directly. Order and email links hit the gate. | **Decided: acceptable as a holding page.** The fix pass makes sure order and auth links pass the gate, and the runbook flips it at launch. |
| D6 | Whether fixes are committed by me | The memory says commit and deploy are yours. | **Decided: I commit each lane locally in this worktree, one commit per lane, and never push.** Phil pushes, deploys and runs `supabase db push`. If committing is blocked, I hand over the commands instead. |

## 6. Housekeeping

- `docs/current-task.md` says "Stay lean. No multi-agent workflows". Phil's 2026-11-14 instruction overrides this for the audit. I update the doc when the fixes start.
- `docs/feature-inventory.md` is superseded by `feature-bank.md`. Retire it in the L6 docs pass.
- The migration names listed in `current-task.md` do not match the folder (038 is "simple_stock", not "indexes").
