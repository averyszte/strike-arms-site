/**
 * Prerender every page in the sitemap to static HTML, after `vite build`.
 *
 * Without this every URL served the same empty index.html, and a page's
 * title, description, canonical, content and structured data existed only
 * once JavaScript had run. Google renders JavaScript, eventually; link
 * previews (WhatsApp, Facebook, Slack), Bing's first pass and the AI crawlers
 * mostly do not. Now each page arrives with all of that in the HTML, and the
 * browser hydrates it (main.tsx) instead of building it from nothing.
 *
 * How:
 *   - dist/server/entry-server.js is the app built for Node (vite build
 *     --ssr). renderPage() loads a route's catalogue data from Supabase with
 *     the anon key, the same view a visitor gets, then renders it.
 *   - The routes are the <loc>s in the built sitemap.xml, so a page is
 *     prerendered exactly when it is meant to be indexed.
 *   - Each page goes to <path>.html: Pages serves /store/rifles from
 *     store/rifles.html with no redirect, where store/rifles/index.html
 *     would 308 to a trailing slash.
 *   - "/" goes to home-page.html, which public/_redirects rewrites / to.
 *     index.html stays the plain shell, because Pages also serves it for any
 *     path with no file (the cart, checkout, account, admin), and those must
 *     not arrive showing the home page.
 *
 * A page that cannot be rendered (Supabase down, a query error) keeps the
 * plain shell, with a warning: it still works in a browser exactly as before,
 * and a missed prerender must never stop an urgent fix reaching the shop.
 *
 * A product published after the last build has no file yet, so it gets the
 * plain shell (rendered in the browser, as every page was before this) until
 * the next build. Rebuild when products change (a deploy hook).
 *
 * Run: pnpm --filter @workspace/strike-arms run build (this is its last step).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(HERE, '..', 'dist', 'public');
const SERVER_ENTRY = resolve(HERE, '..', 'dist', 'server', 'entry-server.js');

/** Pages rendered at once. Each one is a handful of Supabase reads. */
const CONCURRENCY = 6;

function readRoutes() {
  const sitemap = readFileSync(resolve(PUBLIC_DIR, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return [...new Set(locs.map((loc) => new URL(loc).pathname))];
}

function outputFile(path) {
  if (path === '/') return resolve(PUBLIC_DIR, 'home-page.html');
  const relative = path.replace(/^\/+|\/+$/g, '');
  if (!relative || relative.split('/').includes('..')) throw new Error(`unsafe path ${path}`);
  return resolve(PUBLIC_DIR, `${relative}.html`);
}

function writePage(path, html) {
  const file = outputFile(path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

async function prerenderRoute(entry, shell, path) {
  try {
    const page = await entry.renderPage(path);
    if (page) {
      writePage(path, entry.buildPrerenderedHtml(shell, path, page.markup, page.dehydratedState));
      return { path };
    }
    return { path, problem: 'a query failed or never finished' };
  } catch (error) {
    return { path, problem: error instanceof Error ? error.message : String(error) };
  }
}

/** "/" is rewritten to home-page.html, so it must exist even unrendered. */
function ensureHomePage(shell, results) {
  if (results.some((result) => result.path === '/' && !result.problem)) return;
  writePage('/', shell);
}

/** Runs `task` over `items`, at most `limit` at a time, in order of results. */
async function runPooled(items, limit, task) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      results.push(await task(item));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const started = Date.now();
  const shell = readFileSync(resolve(PUBLIC_DIR, 'index.html'), 'utf8');
  const entry = await import(pathToFileURL(SERVER_ENTRY).href);
  const routes = readRoutes();

  const results = await runPooled(routes, CONCURRENCY, (path) => prerenderRoute(entry, shell, path));
  ensureHomePage(shell, results);
  const failed = results.filter((result) => result.problem);
  for (const { path, problem } of failed) {
    console.warn(`prerender: WARNING ${path} kept the plain shell: ${problem}`);
  }
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`prerender: ${results.length - failed.length} of ${routes.length} pages in ${seconds}s`);
}

main().catch((error) => {
  // Even a failure to start (no server bundle) must leave a working "/".
  console.warn(`prerender: WARNING nothing was prerendered: ${error instanceof Error ? error.message : error}`);
  writePage('/', readFileSync(resolve(PUBLIC_DIR, 'index.html'), 'utf8'));
})
  // Exit explicitly: each page's query cache keeps garbage-collection timers
  // (five minutes) and the Supabase client keeps its own, so Node would
  // otherwise sit idle long after the last page was written.
  .finally(() => process.exit(0));
