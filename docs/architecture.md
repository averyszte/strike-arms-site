# Architecture Standards

This document defines how every project is structured. It is the source of truth when reviewing code, onboarding contributors, or instructing AI assistants.

## Philosophy

Software gets worse over time unless you actively prevent it. The biggest sources of decay:

1. **Files that grow without limits** — "just for now" becomes a 2000-line monster.
2. **Dumping-ground modules** — `utils.ts`, `helpers.ts`, `common.ts` accumulate unrelated logic.
3. **Mixed concerns** — business logic in JSX, DB calls in components, types redefined everywhere.
4. **Inconsistent shape** — every project organized differently means slow context-switching and predictable bugs.

Every rule below exists to prevent one of those failure modes.

## Standard folder shape

```
src/
├── types/             # shared TypeScript types, one domain per file
├── data/              # repository pattern — only place that talks to external services
├── hooks/             # React hooks, one hook per file
├── lib/               # pure utility functions, named by purpose
├── components/        # UI components, one component per file
│   ├── ui/            # primitives (shadcn, etc.) — do not modify
│   └── [feature]/     # feature-specific components grouped in subfolders
└── pages/             # route components, one per route
```

Variations require justification.

## The layer rule

Dependencies flow one direction only.

```
pages (routes)
   ↓
hooks (React state + side effects)
   ↓
data (repository — abstracts external services)
   ↓
external services (database, payment, email, storage)
```

- **components** and **lib** are shared across layers
- **lib** is pure functions (no React, no side effects) — usable from any layer
- **components** can be used by pages and other components; rarely by hooks

A component must never call an external service directly. It calls a hook, which calls the repository, which calls the service. This makes backend swaps trivial — replace the repository, nothing else changes.

## File size rules

- **No file over 300 lines** (pure data files are exempt)
- **No function over 80 lines**

Why: 300 lines fits on one screen zoomed out. Larger files require scrolling and held context. The cost of splitting is much smaller than the cost of navigating bloat.

When you're about to grow past 250 lines, stop and ask:

- Does this file do more than one thing? → Split by concern.
- Are there logical sections inside it? → Each becomes its own file.
- Is half data and half logic? → Data goes to `lib/foo-data.ts`, logic stays.

## When to refactor (signals)

- You copy-pasted code → extract a function or component
- A function takes 5+ arguments → wants a config object or splitting
- A component has 10+ props → it's doing too much
- A useState becomes complex → consider useReducer or a custom hook
- Same data is computed in multiple places → memoize once in a hook
- A file imports >15 things → probably too coupled

## Decision boundaries (what lives where)

| Concern | Lives in |
|---|---|
| Types shared across components/hooks | `types/` |
| External service calls (DB, API, payment, storage) | `data/` only |
| React state and effects | `hooks/` |
| Pure data transforms (date format, price format, slug builder) | `lib/` |
| One-off helpers used by a single component | inline in that component file |
| Component rendering UI | `components/` |
| Route component (page) | `pages/` |
| Constants used across the app | `lib/constants.ts` or per-domain (`lib/pricing-constants.ts`) |
| URL state (filters, pagination) | the URL itself, via the router |
| Server data cache | React Query, never local state |

## Enforcement

What actually enforces these rules in this repo (corrected 2026-11-14, audit
items M-057 and M-063; an earlier version listed Prettier, Husky and
lint-staged, none of which are set up):

1. **CLAUDE.md**: AI assistants read it at the start of every session.
2. **TypeScript**: `artifacts/strike-arms/tsconfig.json` runs with `strict`,
   `noUnusedLocals` and `noUnusedParameters`.
   Run: `pnpm --filter @workspace/strike-arms run typecheck`.
3. **ESLint**: `artifacts/strike-arms/eslint.config.js` encodes the file-size,
   layer, `any` and `console.log` rules. It must pass with zero warnings.
   Run: `pnpm --filter @workspace/strike-arms exec eslint . --max-warnings 0`.
4. **CI**: `.github/workflows/ci.yml` runs install, typecheck, lint with
   `--max-warnings 0` and the tests (once a `test` script exists) on every push
   to `main` and every pull request. A second job runs `deno check` on the edge
   functions; it is advisory until `supabase/functions/deno.json` pins the
   imports (M-064).
5. **Code review**: catches what tooling misses.

Not in place: Prettier is installed at the root but no format check runs, and
there is no pre-commit hook (no Husky, no lint-staged). CI is the gate. The
edge functions under `supabase/functions/` are Deno and are not covered by the
ESLint config.

Bypassing any layer (gratuitous `eslint-disable`, merging with CI red,
merging without review) is a process violation.

## Breaking a rule

Rules are not laws. If a rule prevents a genuinely better solution:

1. Document the case in the PR description
2. Get sign-off
3. If it becomes a pattern, update this document — don't let exceptions become shadow conventions
