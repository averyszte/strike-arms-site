# CLAUDE.md — Strike Arms

Read this file before writing any code. These rules are not optional.

## On session start (read this first)

Before responding to my first message in any new session:

1. Read every file in `/docs/` (architecture, api-plan, auth-roles, client-context, current-task, database-plan)
2. Read every file in `/skills/` (coding-rules, ai-pairing-skill, plus the domain skills — cloudflare, conversion, dashboard, security, seo, supabase, ui-ux)
3. Reply with a short confirmation (<100 words) containing:
   - The stack (1 line)
   - The layer rule (1 line)
   - 3 specific hard rules from coding-rules.md
   - The current task from docs/current-task.md, or "no current task set"
4. Then wait for my actual instruction. Do NOT start writing code yet.

If anything I ask later conflicts with a rule in those docs, stop and flag the conflict instead of silently breaking the rule.

## Project summary

- **Stack:** React 18 + Vite + TypeScript, Tailwind + shadcn/ui, wouter (routing), react-helmet-async (meta), @tanstack/react-query (data), framer-motion (animation)
- **Backend (when added):** Supabase (Postgres + Auth + Storage + RLS + Edge Functions). The Express scaffold in `artifacts/api-server/` is unused — do not extend it.
- **Payments:** Stripe Checkout (hosted, not Elements). Webhook handler lives in a Supabase Edge Function.
- **Deploy:** Cloudflare Pages.
- **Monorepo:** pnpm workspaces. The site is in `artifacts/strike-arms/`.

## Folder structure — do not deviate

```
artifacts/strike-arms/src/
├── types/             # shared TypeScript types, one domain per file
├── data/              # repository pattern — ONLY place that calls Supabase or external APIs
├── hooks/             # React hooks, one hook per file
├── lib/               # pure utility functions, named by purpose
├── components/        # UI components, one component per file
│   ├── ui/            # shadcn primitives — DO NOT modify
│   └── catalog/       # catalog-specific components
└── pages/             # route components, one per route
```

## Hard rules

- NO file over 300 lines. If you're about to exceed it, split first.
- NO function over 80 lines. Extract helpers.
- NO files named `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`. Name by purpose.
- NO direct Supabase / API calls outside `src/data/`. Components use hooks, hooks use the repository.
- NO inline business logic in JSX. Extract to a hook or pure function.
- NO relative imports past one level. Use `@/` aliases (`@/components/foo`, not `../../components/foo`).
- NO new wrapper around a single shadcn primitive. Use the primitive directly.
- NO `any` type. Use `unknown` and narrow, or model it properly.
- NO `console.log` in committed code.

## Naming

- Files: `kebab-case.ts` (`product-card.tsx`, `format-price.ts`)
- Components: `PascalCase` (`ProductCard`)
- Hooks: `useFoo` (file: `use-foo.ts`, export: `useFoo`)
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types / Interfaces: `PascalCase`
- Booleans: `isFoo`, `hasFoo`, `shouldFoo`, `canFoo`

## Layer rule (dependencies flow one direction)

```
pages  →  hooks  →  data (repository)  →  Supabase / external services
   ↘        ↘
   components  →  lib
```

- A component MAY import from `lib/`, `hooks/`, `types/`, `components/ui/`
- A component MAY NOT import from `pages/` or `data/`
- A hook MAY import from `data/`, `types/`, `lib/`
- A hook MAY NOT import from `components/`
- `lib/` files are pure functions — no React, no Supabase, no side effects

## Before finishing any task

1. `pnpm --filter @workspace/strike-arms run typecheck` — must pass
2. `pnpm --filter @workspace/strike-arms run lint` — must pass with zero warnings (once ESLint is set up)
3. If any file you created or grew crosses 250 lines, propose how to split it before continuing

## When in doubt

Stop and ask. Don't guess. Don't invent file paths. Don't pick a stack we haven't agreed on. Don't add a feature that wasn't requested.

## Related docs

- `docs/architecture.md` — project-level architecture decisions
- `docs/auth-roles.md` — auth model and roles
- `docs/api-plan.md` — API surface and integration points
- `skills/coding-rules.md` — general coding conventions
- (Add an `ARCHITECTURE.md` from the template repo if not present)
