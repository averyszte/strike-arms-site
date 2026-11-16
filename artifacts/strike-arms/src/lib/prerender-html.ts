/**
 * Splices one prerendered route into the built index.html (pure string work,
 * run by scripts/prerender.mjs through entry-server.tsx).
 *
 * React 19 hoists every <title>, <meta> and <link> a page renders into one run
 * at the very start of its output, so that run is the page's head and the
 * rest is the body. Each head tag gets a data-prerender attribute: main.tsx
 * removes them before React starts, because Helmet adds its own copies and
 * does not de-duplicate against tags already in the document.
 */

/** The id main.tsx reads the React Query cache from. */
export const QUERY_STATE_ELEMENT_ID = "rq-state";

/** On #root: the path this HTML was rendered for (main.tsx compares it). */
export const PRERENDERED_PATH_ATTRIBUTE = "data-prerendered-path";

/** On each head tag the prerender added (main.tsx removes them). */
export const PRERENDER_TAG_ATTRIBUTE = "data-prerender";

const LEADING_HEAD_TAG = /^(?:<title>[^<]*<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>)/;
const STATIC_TITLE = /<title>[^<]*<\/title>\s*/;
const EMPTY_ROOT = '<div id="root"></div>';

export interface SplitMarkup {
  headTags: string[];
  body: string;
}

/** Separates the hoisted head tags at the start of React's output from the body. */
export function splitHeadTags(markup: string): SplitMarkup {
  const headTags: string[] = [];
  let rest = markup;
  let match = rest.match(LEADING_HEAD_TAG);
  while (match) {
    headTags.push(match[0]);
    rest = rest.slice(match[0].length);
    match = rest.match(LEADING_HEAD_TAG);
  }
  return { headTags, body: rest };
}

function markAsPrerendered(tag: string): string {
  return tag.replace(/^<(title|meta|link)\b/, `<$1 ${PRERENDER_TAG_ATTRIBUTE}=""`);
}

/**
 * JSON is safe inside a script element once nothing in it can close the
 * element or open a comment: "<" is the only character that can start either.
 * The element is never run as script (main.tsx JSON.parses its text), so
 * nothing else needs escaping.
 */
export function serialiseForScript(value: unknown): string {
  // Backslash, then "u003c": the JSON escape for "<", which JSON.parse reads back.
  return JSON.stringify(value).replace(/</g, "\\" + "u003c");
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * The finished HTML for one route. Throws if the shell is not the one this
 * expects, so a change to index.html fails the build rather than shipping
 * pages with the content in the wrong place.
 */
export function buildPrerenderedHtml(
  shell: string,
  path: string,
  markup: string,
  dehydratedState: unknown,
): string {
  if (!shell.includes(EMPTY_ROOT) || !shell.includes("</head>") || !STATIC_TITLE.test(shell)) {
    throw new Error("index.html no longer has the <title>, </head> and empty #root this expects");
  }
  const { headTags, body } = splitHeadTags(markup);
  const head = headTags.map(markAsPrerendered).join("");
  const root =
    `<div id="root" ${PRERENDERED_PATH_ATTRIBUTE}="${escapeAttribute(path)}">${body}</div>` +
    `<script id="${QUERY_STATE_ELEMENT_ID}" type="application/json">` +
    `${serialiseForScript(dehydratedState)}</script>`;
  return shell
    .replace(STATIC_TITLE, "")
    .replace("</head>", () => `${head}</head>`)
    .replace(EMPTY_ROOT, () => root);
}
