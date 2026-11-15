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
 * Only indexable pages go in (N-005, N-009). A page that carries a noindex
 * tag is left out, because a sitemap that lists noindexed URLs is a
 * contradiction Search Console reports:
 *   - /gift-cards, until it has real copy (GiftCards.tsx sets noindex);
 *   - /sale while nothing is on sale (Sale.tsx sets noindex when empty);
 *   - brands with fewer than MIN_INDEXED_BRAND_PRODUCTS products, and the
 *     placeholder brands, which have no page at all (brand-page-meta.ts and
 *     brands.ts hold the same two rules for the pages themselves).
 *
 * Run: pnpm --filter @workspace/strike-arms run sitemap
 *
 * The build runs it with --keep-on-error. There, a failed read leaves the
 * committed public/sitemap.xml in place with a loud warning instead of
 * failing the deploy: a sitemap a few days old is better than no urgent fix
 * reaching a live shop because Supabase blinked. A manual run still fails.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SITE_URL = 'https://strikearms.ie';

/** PostgREST caps a response at 1000 rows however many you ask for. */
const PAGE_SIZE = 1000;

/** Keep in step with src/lib/brands.ts UNLISTED_BRANDS. */
const UNLISTED_BRANDS = new Set(['unbranded']);

/** Keep in step with src/lib/brand-page-meta.ts MIN_INDEXED_BRAND_PRODUCTS. */
const MIN_INDEXED_BRAND_PRODUCTS = 3;

/** Static pages that are in the sitemap only while they have products. */
const SALE_PATH = '/sale';

const KEEP_ON_ERROR = process.argv.includes('--keep-on-error');

// Stable routes that exist today. Add new pages here as they ship.
const STATIC_PATHS = [
  '/',
  '/store',
  '/store/rifles',
  '/store/pistols',
  '/store/consumables',
  '/store/accessories',
  '/store/gear',
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
  '/pre-loved',
  '/evolution',
  '/jumble',
  '/safety-equipment',
  // /gift-cards is left out while the page is noindexed ("Coming soon").
  '/contact',
  '/privacy',
  '/terms',
  '/returns',
  '/delivery',
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
  '/guides/airsoft-upgrades',
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
 * Vite itself would read, with Vite's precedence: `.env.local` beats `.env`,
 * and a variable already in the process environment beats both. The last
 * part matters in the Pages build, where the real values come from the
 * environment and the committed `.env` must not override them.
 *
 * Not a general .env parser: two known keys, no quoting rules, no expansion.
 * Anything cleverer belongs in a dependency, and this script does not deserve
 * one.
 */
function readEnv() {
  const found = {};
  for (const name of ['.env', '.env.local']) {
    const file = resolve(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) found[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return { ...found, ...process.env };
}

function fail(message) {
  if (KEEP_ON_ERROR && existsSync(resolve(ROOT, 'public/sitemap.xml'))) {
    console.warn(`sitemap: WARNING ${message}`);
    console.warn('sitemap: WARNING keeping the committed public/sitemap.xml unchanged.');
    process.exit(0);
  }
  console.error(`sitemap: ${message}`);
  process.exit(1);
}

async function fetchPublishedProducts(url, key) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const query =
      `${url}/rest/v1/products` +
      `?select=slug,brand,sale_price_cents,updated_at&is_published=eq.true&order=slug.asc` +
      `&limit=${PAGE_SIZE}&offset=${offset}`;

    let response;
    try {
      response = await fetch(query, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
    } catch (error) {
      fail(`could not reach Supabase: ${error instanceof Error ? error.message : error}`);
    }
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
 * One entry per brand with a page worth indexing.
 *
 * `/brands/:slug` 404s when a brand has no published products, so listing
 * every name in src/lib/brands.ts -- as this script used to -- puts known
 * 404s in the sitemap. Counting published rows asks the same question the
 * page itself asks.
 *
 * Placeholder brands such as "unbranded" have no page (BrandPage 404s on
 * them), and brands with only one or two products are noindexed, so neither
 * is listed.
 *
 * A brand's lastmod is its most recently updated product, because that is
 * what changes the page.
 */
function brandEntries(rows) {
  const latest = new Map();
  const counts = new Map();
  for (const row of rows) {
    if (!row.brand || UNLISTED_BRANDS.has(row.brand)) continue;
    counts.set(row.brand, (counts.get(row.brand) ?? 0) + 1);
    const date = isoDate(row.updated_at);
    const current = latest.get(row.brand);
    if (current === undefined || (date && (!current || date > current))) {
      latest.set(row.brand, date);
    }
  }
  return Array.from(latest.entries())
    .filter(([slug]) => counts.get(slug) >= MIN_INDEXED_BRAND_PRODUCTS)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([slug, lastmod]) => ({ path: `/brands/${slug}`, lastmod }));
}

/** The static pages, less /sale when nothing is on sale. */
function staticEntries(rows) {
  const hasSale = rows.some((row) => row.sale_price_cents !== null);
  return STATIC_PATHS.filter((path) => path !== SALE_PATH || hasSale).map((path) => ({
    path,
    lastmod: null,
  }));
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
  const statics = staticEntries(rows);
  const entries = [
    ...statics,
    ...brands,
    ...rows.map((row) => ({ path: `/products/${row.slug}`, lastmod: isoDate(row.updated_at) })),
  ];

  const body = entries.map(urlEntry).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml, 'utf8');

  console.log(
    `Wrote ${entries.length} URLs to public/sitemap.xml ` +
      `(${statics.length} static, ${brands.length} brands, ${rows.length} products).`,
  );
}

build();
