# Close-out: L6 platform

**Commits:** `e0ca49d` and `c9f105e` (wave 3B). **Verification:** at `9e58dc2`, all items pass.

## What changed
- **M-057, CI.**
  - A GitHub Actions workflow runs the typecheck, eslint with `--max-warnings 0`, and the node tests.
  - It also runs a deno check from `supabase/functions`. That check is advisory for now.
- **M-058, the runbook.** The launch runbook is rewritten:
  - hosted setup;
  - the Stripe live switch;
  - the launch flip;
  - secret rotation;
  - the MFA developer reset (D4).
- **M-059, caching.** Cache headers for `/images` and `/videos`.
- **M-060, old scaffold.** The Express API server, the drizzle `lib/db`, the generated API client packages, `post-merge.sh` and the root tsconfig are deleted.
- **M-061, dependencies.**
  - The unused Replit vite plugins, the API client and `react-icons` are removed.
  - Runtime libraries moved to `dependencies`.
  - pnpm 11 `allowBuilds` replaces `onlyBuiltDependencies`, so esbuild's postinstall runs.
- **M-062, TypeScript.** Stricter tsconfig flags.
- **M-063, docs.** Drift fixed: React 19.1, the current task, the retired feature inventory, and the CLAUDE.md backend line.
  - Close-out fix: the docs that still pointed at `lib/cart-context` and `lib/admin-auth-context` now give the new paths.
  - Close-out fix: the runbook's image-sweep step now matches migration 045.
- **M-064, edge functions.** `supabase/functions/deno.json` pins supabase-js and stripe.

## Deferred, and why
- **`noUncheckedIndexedAccess`.** Turning it on gives 45 errors to work through. It is a strictness pass, not a launch fix.
- **The Replit leftovers.** `artifacts/mockup-sandbox`, `replit.md` and `.replit` remain. They are outside the shipped site.
- **W-08, generated types.** Generate the database types with `supabase gen types` once migrations 040 to 049 are applied. Generating them now would describe a schema that does not exist yet.
- **The CI deno job** stays `continue-on-error` until it has run green once on `main`.

## Noticed, not touched
- **Whether the deploy uses `deno.json`.** Check whether `supabase functions deploy` picks up the shared `supabase/functions/deno.json`.
  - Every import already uses a full `npm:` specifier, so the deploy works either way.
  - If it does not pick it up, add per-function import maps later.

## Do not re-audit
- The cache headers.
- The scaffold removal.
- The dependency classification.
- The CI gates.

## Rejected on merit
- None.
