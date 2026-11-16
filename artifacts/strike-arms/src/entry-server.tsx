/**
 * Build-time prerender entry (scripts/prerender.mjs). Renders one route to
 * HTML in Node, with its catalogue data already loaded, so crawlers and link
 * previews that never run JavaScript see the real page.
 *
 * Not part of the browser bundle: Vite builds it separately with --ssr.
 */
import { Readable } from "node:stream";
import { prerenderToNodeStream } from "react-dom/static";
import { dehydrate, type Query, type QueryClient } from "@tanstack/react-query";

import App from "@/App";
import { createQueryClient } from "@/lib/create-query-client";

/** Rounds of "render, then fetch what it asked for". Recommendations need two. */
const MAX_DATA_ROUNDS = 5;

export interface PrerenderedPage {
  /** Everything React rendered, hoisted head tags first (see split-head-tags). */
  markup: string;
  /** React Query's cache, for the browser to hydrate from. */
  dehydratedState: unknown;
}

async function renderMarkup(client: QueryClient, path: string, search: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <App queryClient={client} ssrPath={path} ssrSearch={search} />,
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude as Readable) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * The `enabled` a useQuery passed. The cache keeps the hook's options on the
 * query, but types them without it, so it is read and narrowed here.
 */
function isEnabled(query: Query): boolean {
  const { enabled } = query.options as { enabled?: unknown };
  if (typeof enabled === "function") return (enabled as (q: Query) => boolean)(query) !== false;
  return enabled !== false;
}

/** Queries the last render asked for that have no data yet. */
function waitingQueries(client: QueryClient): Query[] {
  return client
    .getQueryCache()
    .getAll()
    .filter((query) => query.state.data === undefined && query.state.status !== "error")
    .filter(isEnabled);
}

/**
 * Renders `path` until every query it uses has data. A render on the server
 * never fetches; it only registers its queries in the cache. Each round
 * fetches those, then renders again, which can register more (a product's
 * recommendations only appear once the product has loaded).
 *
 * Returns null when a query fails: the route then keeps the plain shell
 * rather than shipping an error state as the page.
 */
export async function renderPage(path: string, search = ""): Promise<PrerenderedPage | null> {
  const client = createQueryClient();
  for (let round = 0; round < MAX_DATA_ROUNDS; round += 1) {
    await renderMarkup(client, path, search);
    const waiting = waitingQueries(client);
    if (waiting.length === 0) break;
    await Promise.all(waiting.map((query) => query.fetch().catch(() => undefined)));
  }

  const hasFailed = client.getQueryCache().getAll().some((query) => query.state.status === "error");
  if (hasFailed || waitingQueries(client).length > 0) return null;

  const markup = await renderMarkup(client, path, search);
  return { markup, dehydratedState: dehydrate(client) };
}

export { buildPrerenderedHtml } from "@/lib/prerender-html";
