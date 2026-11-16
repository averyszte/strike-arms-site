/**
 * Cloudflare Pages Function for /assets/*.
 *
 * Everything in /assets/ has a content hash in its name, so a real file there
 * is cached by browsers for a year (`immutable`). The danger is a request for
 * a file that does not exist (yet): with no 404.html, Pages answers it with
 * index.html. That page then got the year-long immutable header, and any
 * browser that asked for a new bundle while a deploy was rolling out kept the
 * HTML as its "script" for a year. The site rendered white for those people
 * (2026-11-15).
 *
 * So: a real asset passes through with the long cache header; the HTML
 * fallback becomes a 404 that nothing may cache, and the next load retries.
 *
 * Pages picks this file up from `functions/` at the project's root directory
 * (the repo root here). It runs for /assets/* only.
 */

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
}

const IMMUTABLE = "public, max-age=31536000, immutable";

export async function onRequest(context: PagesContext): Promise<Response> {
  const response = await context.next();
  const type = response.headers.get("Content-Type") ?? "";

  // A 304 (revalidation) passes through; only errors and the HTML fallback stop.
  if (response.status >= 400 || type.includes("text/html")) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Function responses do not reliably get the _headers rules, so set the
  // cache header here as well. set() replaces, so it is never doubled.
  const asset = new Response(response.body, response);
  asset.headers.set("Cache-Control", IMMUTABLE);
  asset.headers.set("X-Content-Type-Options", "nosniff");
  return asset;
}
