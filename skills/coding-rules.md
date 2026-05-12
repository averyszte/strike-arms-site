# Coding Rules

The non-negotiable practices for writing code in this organization.

## Hard rules

- NO file over 300 lines. Split first.
- NO function over 80 lines. Extract helpers.
- NO files named `utils.ts`, `helpers.ts`, `misc.ts`, `common.ts`. Name by purpose.
- NO direct external-service calls outside `src/data/`. Components use hooks; hooks use the repository.
- NO inline business logic in JSX. Extract to a hook or pure function.
- NO relative imports past one level. Use `@/` path aliases.
- NO new wrapper around a single primitive (shadcn, etc.) that adds no behavior.
- NO `any` type. Use `unknown` and narrow, or model properly.
- NO `// @ts-ignore` or `// @ts-expect-error`. Fix the type.
- NO `console.log` in committed code. Use a logger or remove.
- NO magic numbers / strings in business logic. Extract named constants.
- NO mutating props, state, or function arguments. Treat them as readonly.

## Naming conventions

| Kind | Convention | Example |
|---|---|---|
| File | kebab-case | `product-card.tsx`, `format-price.ts` |
| Component | PascalCase | `ProductCard` |
| Hook (file) | use-kebab.ts | `use-products.ts` |
| Hook (export) | useCamelCase | `useProducts` |
| Function | camelCase | `formatPrice` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_PRICE_CENTS` |
| Type / Interface | PascalCase | `Product`, `ProductFilters` |
| Boolean | is / has / should / can | `isLoading`, `hasFilter`, `shouldRetry` |

Pick once. Never deviate. Inconsistency is grep-hostile.

## Component rules

- **One component per file.** Helper components used by only one parent stay in that file; if reused, they get their own file.
- **No business logic in JSX.** A `.map()` is fine. A multi-line ternary, a switch, or a calculation that derives display values belongs in a hook or a pure function above the return.
- **Props use TypeScript types.** Use a named type (`type FooProps = {...}`), not `interface` unless extending.
- **Default props live in destructuring**, not React's `defaultProps`.
- **Children passed by composition** — prefer `<Card><CardHeader/>...</Card>` over `<Card header="..." body="..." />`.

## Hook rules

- **One hook per file.** Named `use-foo.ts`, exports `useFoo`.
- **Follow the rules of hooks.** Never conditional, always at the top of the component.
- **A hook can call other hooks.** Data hooks compose well — `useProducts` calling `useQuery` is healthy.
- **Side effects belong in `useEffect`** or in a callback returned from the hook. Don't side-effect during render.

## Repository rules

- **All external-service calls happen in `data/*-repository.ts` files.**
- **Read and write functions both go here**, even if writes are stubbed (`throw new Error('Not implemented')`).
- **The repository's function signatures are stable.** Swapping mock data → real backend changes the bodies, not the signatures.
- **Mock data files are imported by the repository only.** Components never import mock data directly.

## Imports

- **Use `@/` path aliases** for everything beyond one folder up.
- **Group imports** in this order, separated by blank lines:
  1. External packages (react, third-party)
  2. Internal aliases (`@/types`, `@/lib`, `@/hooks`, `@/components`)
  3. Relative imports (`./sibling`)
- **No barrel files** (index.ts that re-exports everything) except for `components/ui/`. Barrels hurt tree-shaking and obscure where things live.

## Comments

- **Default: no comments.** Names should explain what code does.
- **Comments are for WHY, not WHAT.** "Stripe sends events in non-deterministic order — sort by created" is good. "Loop through array" is noise.
- **No commented-out code.** Delete it; git remembers.
- **No `TODO` without an issue number.** `// TODO: handle edge case` rots. `// TODO(#142): handle edge case` doesn't.

## Error handling

- **Validate at boundaries** (user input, API responses). Trust internal calls.
- **Don't catch errors you can't handle.** A try/catch that re-throws or logs and continues is usually wrong.
- **Don't add defensive checks for impossible states.** Trust the type system. If `user.id` is `string` per the type, don't `if (user?.id)`.

## Async

- **Prefer `async/await` over `.then`.** Easier to read, easier to stack-trace.
- **Always handle errors.** Either via try/catch or by letting React Query / a framework handle them.
- **Don't fire-and-forget promises in components** without `void` or proper handling. Lint will flag.

## State

- **URL is the source of truth for shareable state** (filters, pagination, current view).
- **Server cache is the source of truth for server data** — use React Query, not local `useState`.
- **Local component state is for ephemeral UI** (modal open, hover, input draft).
- **Avoid global state managers** (Redux, Zustand) unless you have a real cross-cutting concern. Most apps don't.

## Styling

- **Tailwind utility classes**, not custom CSS, unless solving something Tailwind can't.
- **No inline `style` prop** for static styles. Use Tailwind classes.
- **Long className strings** (>100 chars) → extract via `cva` or a wrapper component.
- **No `!important`.** Solve the specificity problem properly.

## Performance defaults

- Images use `loading="lazy"` and `decoding="async"` below the fold.
- Hero/LCP images get `fetchpriority="high"` and a `preload` link.
- Routes are code-split via `React.lazy` for non-critical pages.
- Heavy lists use virtualization (`react-virtuoso` or similar) above ~100 items.
- Network calls are cached via React Query, not refetched on every mount.

## Before finishing any task

1. `pnpm run typecheck` — must pass
2. `pnpm run lint` — must pass with zero warnings
3. If any file you created or grew crosses 250 lines, propose how to split it
4. If you added a new dependency, justify it (smaller alternatives, bundle size impact)
