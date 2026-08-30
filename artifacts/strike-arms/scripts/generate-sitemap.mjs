/**
 * Generate public/sitemap.xml from the static routes plus every published
 * product and brand, read from Supabase.
 *
 * It used to read slugs out of src/data/mock-products.ts by regex. That was
 * accurate right up until it wasn't: the database was seeded from that file,
 * so the two agreed exactly, and would have gone on agreeing until the first
 * time Alan added, renamed or unpublished anything in the admin. After that
 * the sitemap would have advertised URLs that 404 and hidden ones that exist,
 * with nothing anywhere to notice. A wrong sitemap that looks right is worse
 * than no sitemap.
 *
 * So it asks the database, and it fails loudly when it cannot. There is
 * deliberately no fallback to the old file: quietly shipping last month's
 * sitemap is the exact failure this replaced.
 *
 * It reads published rows through the anon key, which is the same view a
 * visitor gets -- the right definition of "indexable".
 *
 * Run: pnpm --filter @workspace/strike-arms run sitemap
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SITE_URL = 'https://strikearms.ie';

/** PostgREST caps a response at 1000 rows however many you ask for. */
const PAGE_SIZE = 1000;

// Stable routes that exist today. Add new pages here as they ship.
const STATIC_PATHS = [
  '/',
  '/store',
  '/store/rifles',
  '/store/pistols',
  '/store/consumables',
  '/store/accessories',
  '/store/gear',
  '/store/parts',
  '/store/more',
  // Promoted subcategories (own canonical SEO pages)
  '/store/rifles/aeg-rifles',
  '/store/rifles/gbbr',
  '/store/rifles/sniper',
  '/store/pistols/gbb-pistols',
  '/store/consumables/bbs',
  '/store/consumables/bio-bbs',
  '/store/consumables/green-gas',
  '/store/consumables/co2',
  '/store/consumables/batteries',
  '/store/gear/eye-protection',
  '/brands',
  '/new',
  '/sale',
  '/gift-cards',
  '/contact',
  '/privacy',
  '/airsoft-law',
  '/where-to-play',
  '/glossary',
  '/guides',
  '/guides/beginners-guide',
  '/guides/first-airsoft-gun',
  '/guides/aeg-vs-gbb-vs-spring',
  '/guides/fps-and-joules-explained',
  '/guides/airsoft-bb-weight-guide',
  '/guides/airsoft-battery-lipo-guide',
  '/guides/airsoft-gas-types',
  '/guides/loadout-cqb',
  '/guides/loadout-woodland',
  '/guides/airsoft-maintenance',
  '/services',
  '/services/repairs',
  '/services/upgrades',
  '/services/hop-up-tuning',
  '/services/gearbox-rebuilds',
  '/services/custom-builds',
  '/services/chrono-service',
  '/about',
];

/**
 * The two Vite variables, from the process environment or from the env files
 * Vite itself would read. `.env.local` wins, as it does for a dev server.
 *
 * Not a general .env parser: two known keys, no quoting rules, no expansion.
 * Anything cleverer belongs in a dependency, and this script does not deserve
 * one.
 */
function readEnv() {
  const found = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    const file = resolve(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) found[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return found;
}

function fail(message) {
  console.error(`sitemap: ${message}`);
  process.exit(1);
}

async function fetchPublishedProducts(url, key) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const query =
      `${url}/rest/v1/products` +
      `?select=slug,brand,updated_at&is_published=eq.true&order=slug.asc` +
      `&limit=${PAGE_SIZE}&offset=${offset}`;

    const response = await fetch(query, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!response.ok) {
      fail(`Supabase answered ${response.status} ${response.statusText}. ${await response.text()}`);
    }

    const page = await response.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

/** `2026-08-30` -- the only part of a timestamp a sitemap consumer uses. */
function isoDate(timestamp) {
  return typeof timestamp === 'string' ? timestamp.slice(0, 10) : null;
}

/**
 * One entry per brand that actually has something published.
 *
 * `/brands/:slug` 404s when a brand has no published products, so listing
 * every name in src/lib/brands.ts -- as this script used to -- puts known
 * 404s in the sitemap. Counting published rows asks the same question the
 * page itself asks.
 *
 * A brand's lastmod is its most recently updated product, because that is
 * what changes the page.
 */
function brandEntries(rows) {
  const latest = new Map();
  for (const row of rows) {
    if (!row.brand) continue;
    const date = isoDate(row.updated_at);
    const current = latest.get(row.brand);
    if (current === undefined || (date && (!current || date > current))) {
      latest.set(row.brand, date);
    }
  }
  return Array.from(latest.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([slug, lastmod]) => ({ path: `/brands/${slug}`, lastmod }));
}

function urlEntry({ path, lastmod }) {
  const modified = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>${modified}\n  </url>`;
}

async function build() {
  const env = readEnv();
  const url = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !key || url.includes('your-project')) {
    fail(
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set, in .env.local or in the ' +
        'environment. Refusing to write a sitemap from stale local data.',
    );
  }

  const rows = await fetchPublishedProducts(url, key);
  if (rows.length === 0) {
    fail('no published products came back -- far likelier a broken query than an empty shop.');
  }

  const brands = brandEntries(rows);
  const entries = [
    ...STATIC_PATHS.map((path) => ({ path, lastmod: null })),
    ...brands,
    ...rows.map((row) => ({ path: `/products/${row.slug}`, lastmod: isoDate(row.updated_at) })),
  ];

  const body = entries.map(urlEntry).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf8');

  console.log(
    `Wrote ${entries.length} URLs to public/sitemap.xml ` +
      `(${STATIC_PATHS.length} static, ${brands.length} brands, ${rows.length} products).`,
  );
}

build();
