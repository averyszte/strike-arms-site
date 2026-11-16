import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPrerenderedHtml, serialiseForScript, splitHeadTags } from "./prerender-html.ts";

const SHELL =
  '<html><head><meta charset="UTF-8" /><title>Strike Arms Airsoft</title>\n' +
  '<link rel="icon" href="/favicon.ico" /></head><body><div id="root"></div>' +
  '<script type="module" src="/assets/index.js"></script></body></html>';

const MARKUP =
  '<title>Product | Strike Arms</title><meta name="description" content="A rail"/>' +
  '<link rel="canonical" href="https://strikearms.ie/products/x"/><main><h1>Product</h1></main>';

test("splitHeadTags takes only the leading run of head tags", () => {
  const { headTags, body } = splitHeadTags(`${MARKUP}<meta name="late"/>`);
  assert.equal(headTags.length, 3);
  assert.equal(body, '<main><h1>Product</h1></main><meta name="late"/>');
});

test("splitHeadTags leaves markup with no head tags alone", () => {
  assert.deepEqual(splitHeadTags("<main></main>"), { headTags: [], body: "<main></main>" });
});

test("buildPrerenderedHtml swaps the static title for the page's tags", () => {
  const html = buildPrerenderedHtml(SHELL, "/products/x", MARKUP, { queries: [] });
  assert.ok(!html.includes("Strike Arms Airsoft"));
  assert.ok(html.includes('<title data-prerender="">Product | Strike Arms</title>'));
  assert.ok(html.includes('<link data-prerender="" rel="canonical"'));
  assert.ok(html.indexOf("data-prerender") < html.indexOf("</head>"));
  assert.ok(html.includes('<div id="root" data-prerendered-path="/products/x"><main>'));
  assert.ok(html.includes('<script id="rq-state" type="application/json">{"queries":[]}</script>'));
});

test("buildPrerenderedHtml does not read $ patterns in the page as replacements", () => {
  const html = buildPrerenderedHtml(SHELL, "/", "<p>$& off</p>", { price: "$1" });
  assert.ok(html.includes("<p>$& off</p>"));
  assert.ok(html.includes('{"price":"$1"}'));
});

test("buildPrerenderedHtml refuses a shell it does not recognise", () => {
  assert.throws(() => buildPrerenderedHtml("<html></html>", "/", MARKUP, {}));
});

test("serialiseForScript cannot close the script element", () => {
  const out = serialiseForScript({ text: "</script><!--" });
  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), { text: "</script><!--" });
});
