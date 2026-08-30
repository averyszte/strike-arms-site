/**
 * Generate public/sitemap.xml from the static routes plus every product slug.
 *
 * Interim generator: reads slugs out of the mock catalogue by regex. When the
 * catalogue moves to Supabase, replace readProductSlugs() with a DB query (or
 * move sitemap generation into a Cloudflare Pages Function per the playbook).
 *
 * Run: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const SITE_URL = 'https://strikearms.ie';

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
 * Brand slugs come from the same map the site labels brands with. A brand
 * listed there with nothing published 404s on /brands/:slug, so this over-lists
 * in exactly the way readProductSlugs() does -- both want the DB query this
 * generator gets when it moves to Supabase.
 */
function readBrandSlugs() {
  const file = resolve(ROOT, 'src/lib/brands.ts');
  const source = readFileSync(file, 'utf8');
  const slugs = [];
  const re = /^ {2}'([a-z0-9-]+)':/gm;
  let match;
  while ((match = re.exec(source)) !== null) slugs.push(match[1]);
  return slugs;
}

function readProductSlugs() {
  const file = resolve(ROOT, 'src/data/mock-products.ts');
  const source = readFileSync(file, 'utf8');
  const slugs = [];
  const re = /slug:\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(source)) !== null) slugs.push(match[1]);
  return slugs;
}

function urlEntry(path) {
  return `  <url>\n    <loc>${SITE_URL}${path}</loc>\n  </url>`;
}

function build() {
  const productPaths = readProductSlugs().map((slug) => `/products/${slug}`);
  const brandPaths = readBrandSlugs().map((slug) => `/brands/${slug}`);
  const all = [...STATIC_PATHS, ...brandPaths, ...productPaths];
  const body = all.map(urlEntry).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  const out = resolve(ROOT, 'public/sitemap.xml');
  writeFileSync(out, xml, 'utf8');
  console.log(`Wrote ${all.length} URLs to public/sitemap.xml`);
}

build();
