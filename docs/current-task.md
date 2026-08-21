# Current Task

## SESSION HANDOFF — 2026-08-21 (homepage promotion + demo cleanup)

**Branch:** `claude/homepage-direction-d-polish-87d57c` (local dev; carries a dev-only login bypass).
**Production `main`** is at `75358c2` and is the source Cloudflare Pages builds from.

### What shipped to production this session
- **Direction D ("Combined") is now the live homepage.** `src/pages/Home.tsx` renders the Combined
  layout with real indexable SEO (title/description/canonical/OG + JsonLd). It pulls sections from
  `src/components/demo/combined/*` and wraps them in the scoped `.theme-drop` CSS (in `index.css`,
  unlayered) so only `/` adopts the brighter accent / squared corners; every other route is untouched.
- **All demo preview routes removed** from `src/App.tsx` and **`src/pages/DemoCombined.tsx` deleted.**
  `/demo`, `/demo-editorial`, `/demo-workshop`, `/demo-curated`, `/demo-combined` now 404.
- **The four other demo page files are KEPT but unrouted (hidden), by the user's choice** —
  `HomeDemo.tsx`, `DemoEditorial.tsx`, `DemoWorkshop.tsx`, `DemoCurated.tsx` and their
  `components/demo/{manual,drop,local,...}` folders stay on disk, unreachable. Do not delete them.
  `components/demo/combined/` is NOT demo dead-code — it backs the live homepage (rename to a
  non-`demo/` path someday is cosmetic-only, left undone).

### Deploy pattern used (keeps the dev bypass off main)
Commit on the polish branch → `git checkout -B <tmp> origin/main` → `git cherry-pick <sha>` →
`git push origin <tmp>:main` → `git checkout` back to the polish branch → delete `<tmp>`. The
cherry-pick excludes the bypass commit so it never reaches production. `git push` is now allowed
(user added `Bash(git push:*)` to `~/.claude/settings.json`).

### DEFERRED — admin login 500 (real fix still pending)
Admin login (`/admin/login`) returns HTTP 500 "Database error querying schema" — a **DB-side GoTrue
fault, user-specific**: the existing admin user 500s, a non-existent email returns a clean 400.
Attempted fix (re-inserting the `auth.identities` email row for user id
`a45de809-2cff-4890-9f6b-5cb6a8742d4b`) did **not** resolve it. No service-role key available, so no
Admin API access — needs Supabase Auth-log inspection / more SQL. **Stopgap in place:**
`src/lib/admin-auth-context.tsx` has a `DEV_BYPASS_ADMIN = import.meta.env.DEV && true` bypass
(FAKE_ADMIN_USER) so the dashboard renders locally. It is guarded by `import.meta.env.DEV` and, more
importantly, **lives only on the polish branch — it must NEVER reach `main`.** Remove it once the
real 500 is fixed.

---

Last updated: 2026-08-08 (end of the Supabase-restore / Alan-meeting session).

## Where the project is right now

The admin dashboard + Supabase backend are **live and working**. The public SEO site is
largely built. The commerce path (cart persistence, checkout, orders) is **not built yet**.
Nothing is deployed to production. The `strikearms.ie` domain is **not secured** (launch blocker).

## What just happened (this session)

- **Supabase confirmed live.** Project "Strike Arms Airsoft" (ref `cxnhkgndvzgyqhiwsvrr`,
  eu-west-1) already existed from an earlier session. It had auto-paused (free tier, ~7 idle
  days → DNS removed → "Failed to fetch" in the browser). Restored via the dashboard; data intact.
- **Migrations now in sync 001–006.** Pushed `005_subcategories` and a new `006_subcategories_grants`
  (the subcategories table shipped with RLS but no table-level GRANT → "permission denied";
  fixed). Verified all admin tables reachable, RPCs exist, repository column-mappings match schema.
- **Admin login works.** Single flat admin (the `admins` table + `is_admin()`/`is_admin_aal2()`
  RLS helpers, AAL2/TOTP required for writes).
- **Alan meeting (23 July) folded into `seo/alan-interview-answers.md`** as authoritative
  **Alan** status (a dated block at the top that overrides the older "Pass 2" research bank).
- **`/about` story added** — 17 years, oldest airsoft shop in Dublin, only walk-in in north Dublin.
- **Staff/Technician role dropped from v1** (Alan: repair tech needs no login) — was docs-only,
  never in code. `auth-roles.md` now v1 = Admin + Customer, technician design kept under "Deferred".

## BLOCKED on Alan (do not guess these)

1. **Real brand/model list.** THE catalogue blocker. In the meeting Alan gave only a rough,
   incomplete verbal brand note (Tokyo Marui, D-Boys, G&G, Specna Arms came up; some brands he
   carries **new**, some **pre-loved only** — the split was not pinned down). This is **NOT a
   settled answer** and it discredited the older research claim of "ASG/CYMA/EVOLUTION only".
   **Brand range is currently UNKNOWN.** Do not reseed the catalogue until Alan supplies a
   proper list: which brands, new vs pre-loved per brand, and the always-stockable models.
2. **Shop address + real email** — finishes `/about` and the Contact NAP/schema.
3. **Domain status** — does Alan own `strikearms.ie`, has it lapsed, who's the registrar?
   Gates the entire 301 migration / cutover. Launch blocker.

Also outstanding from Alan (lower urgency): repairs job list + turnaround, exact warranty scope
on new electricals, per-tier best-seller models, beginner site names, gift-card amounts/format.

## Buildable NOW (not blocked)

- **Stripe Checkout (hosted) + webhook Edge Function** — the biggest missing piece; site can't
  earn without it. Per docs: session created server-side, `checkout.session.completed` creates
  the order + decrements stock. No checkout page exists yet.
- **Mixed-fulfilment schema change** — Alan delivers **gear/parts/BBs only, guns collect-in-store
  only**. Current schema is click-and-collect only (no shipping states). Needs a per-product
  shippable flag + shipping states before checkout is meaningful.
- **Cart persistence** (guest = localStorage, logged-in = DB).
- **Age gate** — Alan's policy: 18+ for card purchases, any age with a parent, prefers 18
  (this is shop policy, safe to state; NOT a statement of the law).
- ContactForm → `inquiries` table wiring (now unblocked; Supabase is live).

## Key gotchas / rules (read before working)

- **Free-tier auto-pause** recurs every ~7 idle days. If admin login dies with "Failed to fetch",
  that's it: restore from the Supabase dashboard. Before launch: Pro plan or a keep-alive ping.
- Real Supabase credentials live in `artifacts/strike-arms/.env.local`; the committed `.env`
  holds placeholders only. **`.env.local` is NOT committed, so a freshly-created git worktree
  won't have it** — copy it in from a sibling worktree or the admin app boots against the
  placeholder host and every login fails with a network error ("Invalid login credentials"
  only appears once the real creds are loaded). `.gitignore` now covers `**/.env.local`
  (it previously had no `.env*` rule at all). `supabase/.temp/` (CLI link) is also local-only.
- `supabase db push` is blocked by the permission classifier — the **user** must run it
  (`echo y | npx supabase db push`, from the worktree). Non-interactive run needs `echo y |`.
- **No emojis anywhere** — lucide-react icons only. Irish/British English.
- **Never invent Irish airsoft/firearms law.** Legal content stays question-framed /
  primary-source-cited / flagged for a solicitor. See the publication warning in
  `alan-interview-answers.md`.
- CLAUDE.md hard rules: no file >300 lines, no function >80 lines, `@/` aliases, no `any`,
  no `console.log`, layer rule (pages→hooks→data(repository)→Supabase; components never import
  data/). Typecheck must pass before finishing:
  `npx tsc -p tsconfig.json --noEmit` from `artifacts/strike-arms/`.
- Commits end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; push with
  `git push origin HEAD:main`.
- **Stay lean** — do NOT run big multi-agent workflows or the deep-research harness (a prior
  106-agent run torched the user's usage).

## Relevant files

- `supabase/migrations/001–006` · `supabase/config.toml` · `supabase/seed.sql` (WRONG brands —
  dev/demo only, do not seed production)
- `artifacts/strike-arms/src/pages/admin/**` · `src/data/*-repository.ts` · `src/hooks/use-*`
- `artifacts/strike-arms/src/lib/{supabase,admin-auth-context}.ts(x)`
- `artifacts/strike-arms/seo/alan-interview-answers.md` (23 July block at top = authoritative)
- `docs/build-backlog.md` (the full site+commerce+admin+infra list) · `docs/auth-roles.md`

## Suggested next step

Pick ONE with the user: **(a)** Stripe checkout + webhook, or **(b)** the mixed-fulfilment
schema change (prerequisite for a truthful checkout). If Alan has since sent the brand list,
**(c)** reseed the catalogue instead. Confirm which before starting.
