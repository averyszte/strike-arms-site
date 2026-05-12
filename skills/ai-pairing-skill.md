# AI Pairing Skill

How to work effectively with Cursor, Claude Code, and similar AI coding assistants without sliding into spaghetti.

## The failure mode

Left to default behavior, AI assistants:

- Dump new code into the nearest open file regardless of fit
- Reinvent abstractions instead of using existing ones
- Skip lint/typecheck steps
- Add features beyond what was asked
- Use `any` or `@ts-ignore` when types are inconvenient
- Don't split files that have grown too large
- Hallucinate file paths and function names that don't exist
- Generate impressive-looking code that doesn't actually work

These failures compound. Three weeks of unsupervised AI coding can produce a codebase no one wants to maintain.

## Defense in depth

Five layers. Each catches what the others miss.

### 1. CLAUDE.md / project rules file

Every project has a `CLAUDE.md` at the root that the AI reads on every session. It specifies:

- Stack (so it doesn't suggest the wrong libraries)
- Folder structure (so it knows where new code goes)
- Hard rules (file size limits, naming, banned patterns)
- Before-finish checklist (typecheck + lint must pass)

Non-negotiable. Without it, you're starting from scratch every session.

### 2. ESLint + pre-commit hooks

Talk is cheap. Automate enforcement.

Critical ESLint rules:

- `max-lines: 300`
- `max-lines-per-function: 80`
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/ban-ts-comment: error`
- `import/no-cycle: error`
- `import/no-relative-parent-imports: error`
- `no-console: warn`
- `@typescript-eslint/naming-convention` matching the table in `coding-rules.md`

Husky + lint-staged: bad code physically can't commit.

### 3. Specific prompts

Vague prompts produce vague code. Specific prompts produce structured code.

**Bad:** "Add a product detail page."

**Good:**
> Add product detail page at `src/pages/product-detail.tsx`. Use a `useProduct(slug)` hook (create at `src/hooks/use-product.ts` if missing). Render: image gallery, name, brand, price, short description, add-to-cart button. Match the existing dark theme. Run `pnpm run typecheck` after.

The specific version tells the AI where files go, what to use, what to render, and what success looks like.

### 4. Periodic audits

Every few features, prompt the AI:

> Audit `src/` for these issues, in priority order. Do not implement fixes yet:
>
> 1. Any file over 250 lines
> 2. Any function over 50 lines
> 3. Duplicated logic across files (3+ similar blocks)
> 4. Files named utils/helpers/common/misc
> 5. Business logic inside JSX (multi-line ternaries, switches, calculations)
> 6. Direct external-service calls outside `data/`
> 7. `any` type usage
> 8. Inconsistent naming
>
> Propose fixes for me to review before any code changes.

Run weekly. Apply what's worth applying.

### 5. Code review (human)

Tooling catches the obvious. A human catches:

- Scope creep — the AI added a feature you didn't ask for
- Hallucinated APIs — the AI called a method that doesn't exist
- Architectural drift — the AI added a new pattern instead of using an existing one
- Magical thinking — "should work" code that wasn't tested

Read every diff. Run the actual feature.

## Prompt patterns that work

### One logical unit per task

Don't ask for "build the cart, checkout, account, and admin." Break it:

- Prompt 1: cart → verify it works
- Prompt 2: checkout → verify
- ...

AI follows structure better with smaller scopes. Big prompts produce sweeping changes that are hard to review.

### Always specify file paths

Generic: "add a price formatter"

Specific: "add `formatPrice(cents: number): string` in `src/lib/format-price.ts`"

### Describe the contract, not the implementation

Generic: "make the filter work"

Specific: "the filter sidebar reads/writes filter state via the URL search params. Use `useSearchParams` (or the router equivalent). Filter changes update the URL with `replace`. Page reload preserves filter state."

The AI fills in the implementation; you've specified the behavior.

### Ask for a plan before implementation on big changes

For anything spanning >5 files or affecting architecture:

> Before implementing, give me your plan: list every file you'd create or modify with a one-line description of what changes in each. Wait for my approval before writing code.

You get to catch architectural mistakes before they ship.

### Run lint/typecheck yourself

After a task finishes, run `pnpm run typecheck && pnpm run lint` locally. If something fails, paste the error back — don't trust the AI's "all good!" claim.

## Anti-patterns to refuse

When the AI suggests these, push back:

- **"I'll just add an `any` type here for now"** — no, model the type
- **"I'll create a `helpers.ts` for this"** — no, name it by purpose
- **"I'll inline this logic in the JSX since it's small"** — no, extract anyway
- **"I'll skip typecheck since the change is small"** — no, run it
- **"I'll use `@ts-ignore` to bypass this error"** — no, fix the type
- **"I'll add this feature while I'm here"** — no, do exactly what was asked

## When the AI is right and you're wrong

It happens. If the AI insists on something you didn't ask for and it's actually correct (security fix, dependency vulnerability, real bug fix), accept it — but require a separate commit so the diff stays reviewable.

## Bottom line

Architecture isn't something you do — it's a system you set up so you can't *not* do it. CLAUDE.md + ESLint + specific prompts + periodic audits + human review = five layers of net. AI code can't slip through all five if you've set them up right.
