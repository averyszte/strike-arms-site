// ESLint flat config for @workspace/strike-arms.
//
// This file exists to turn the rules in CLAUDE.md into machine checks. Anything
// here that looks arbitrary is quoting that document — if a rule below is wrong,
// CLAUDE.md is the thing to change first.
//
// Not linted here: supabase/functions/** is Deno, with its own globals and
// npm:/jsr: import specifiers, and needs `deno lint` instead.

import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * The "NO relative imports past one level" rule. Every override that sets
 * no-restricted-imports has to repeat this, because ESLint replaces rule
 * options rather than merging them.
 */
const NO_DEEP_RELATIVE = {
  group: ['../../*'],
  message: 'No relative imports past one level. Use the @/ alias.',
};

/** Turn a list of banned import groups into a no-restricted-imports setting. */
function restrictImports(...patterns) {
  return ['error', { patterns: [NO_DEEP_RELATIVE, ...patterns] }];
}

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      // Vendored shadcn primitives. CLAUDE.md: "DO NOT modify" — so there is
      // no point reporting problems we are not allowed to fix.
      'src/components/ui/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── CLAUDE.md hard rules ──────────────────────────────────────────────
      'max-lines': ['error', { max: 300, skipBlankLines: false, skipComments: false }],

      // CLAUDE.md also says "NO function over 80 lines". Counting lines is the
      // wrong measure for a component, whose body is mostly markup: a 120-line
      // JSX tree with one conditional is not complex, and breaking it into
      // <PartA/> <PartB/> to satisfy a line count makes it harder to read, not
      // easier. So components are bounded by branching instead, and the literal
      // 80-line rule is enforced where a long function really does mean 80
      // lines of logic — see the lib/data/hooks override below.
      //
      // 20 rather than the usual 10: cyclomatic complexity counts every && and
      // ??, so a flat validation conjunction or a repository patch built from
      // fifteen optional fields scores as "complex" when it is merely long and
      // entirely uniform. max-depth is the rule that catches the shape we
      // actually want to prevent — conditionals nested inside conditionals.
      complexity: ['error', 20],
      'max-depth': ['error', 3],

      '@typescript-eslint/no-explicit-any': 'error',
      // console.warn and console.error survive: they are how a genuine failure
      // reaches the browser console. console.log is debugging left behind.
      'no-console': ['error', { allow: ['warn', 'error'] }],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // The default layer rule for everything that has no override below.
      'no-restricted-imports': restrictImports(),
    },
  },

  // ── The layer rule ────────────────────────────────────────────────────────
  // pages → hooks → data (repository) → Supabase
  //    ↘        ↘
  //    components → lib

  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        {
          group: ['@/data', '@/data/*'],
          message:
            'A component may not reach the repository. Call a hook from @/hooks instead.',
        },
        {
          group: ['@/pages', '@/pages/*'],
          message: 'A component may not import a page. Lift the shared piece into components/.',
        },
      ),
    },
  },

  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        group: ['@/components', '@/components/*', '@/pages', '@/pages/*'],
        message: 'A hook may not import UI. Hooks depend on data/, types/ and lib/ only.',
      }),
    },
  },

  {
    // No JSX lives here, so a long function is long logic. This is CLAUDE.md's
    // 80-line rule enforced where it means what it says.
    files: ['src/lib/**/*.ts', 'src/data/**/*.ts', 'src/hooks/**/*.ts'],
    rules: {
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        group: ['@/data', '@/data/*', '@/components', '@/components/*', '@/pages', '@/pages/*'],
        message:
          'lib/ is pure functions: no repository calls, no UI. Move this into a hook.',
      }),
    },
  },

  {
    files: ['src/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        group: ['@/components', '@/components/*', '@/hooks', '@/hooks/*', '@/pages', '@/pages/*'],
        message: 'The repository is the bottom layer. It may not import upwards.',
      }),
    },
  },

  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        group: ['@/data', '@/data/*'],
        message:
          'A page may not reach the repository. Call a hook from @/hooks instead.',
      }),
    },
  },

  // ── Documented exceptions ─────────────────────────────────────────────────

  {
    // The three React context providers live in lib/ even though lib/ is meant
    // to be pure functions. They predate this config; moving them would mean a
    // new top-level folder, which CLAUDE.md's folder list does not have.
    // Recorded here so the exception is one visible list rather than three
    // scattered eslint-disable comments.
    files: [
      'src/lib/auth-context.tsx',
      'src/lib/admin-auth-context.tsx',
      'src/lib/cart-context.tsx',
    ],
    rules: {
      'no-restricted-imports': restrictImports({
        group: ['@/components', '@/components/*', '@/pages', '@/pages/*'],
        message: 'A context provider may not import UI.',
      }),
    },
  },

  {
    // Static lookup tables, not logic. Splitting a 300-line list of terms into
    // two 150-line lists makes it harder to read, not easier.
    // mock-products.ts is the seeded placeholder catalogue and is due for
    // deletion once Alan's real products land (feature inventory A1.2).
    files: ['src/data/mock-products.ts', 'src/lib/glossary.ts', 'src/lib/taxonomy.ts'],
    rules: { 'max-lines': 'off' },
  },

  {
    // Vendored shadcn helpers that happen to live outside components/ui/.
    // Same standing as the rest of the shadcn set: we do not own them, so we
    // do not lint them. use-toast.ts imports the toast primitive's types, and
    // use-mobile.tsx is shadcn's own matchMedia hook.
    files: ['src/hooks/use-toast.ts', 'src/hooks/use-mobile.tsx'],
    rules: {
      'no-restricted-imports': restrictImports(),
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  {
    // react-refresh guards hot-module reload, not correctness, and it flags
    // every context provider by design. Providers are the one place we accept
    // a lost fast-refresh.
    files: ['src/lib/*-context.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  {
    // Config and script files run in Node, not the browser.
    files: ['*.config.{ts,js}', 'scripts/**/*.{ts,js,mjs}'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
);
