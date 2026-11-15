import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Every 301 in public/_redirects must land on a page that exists (N-004).
 *
 * A redirect to a route nobody built is a 301 into the SPA's 404 view, which
 * throws away the old URL's equity as surely as having no rule at all. The
 * routes are read from the route files themselves, so a renamed page fails
 * here rather than in Search Console a month later.
 */

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

function routePatterns(): string[] {
  const source = read("../pages/routes/storefront-routes.tsx");
  const paths = Array.from(source.matchAll(/path="([^"]+)"/g), (match) => match[1]);
  return ["/", ...paths];
}

/** The Category union in types/product.ts: the only valid /store/:category values. */
function categorySlugs(): Set<string> {
  const source = read("../types/product.ts");
  const union = source.match(/export type Category =([^;]+);/);
  assert.ok(union, "Category type not found in types/product.ts");
  return new Set(Array.from(union[1].matchAll(/'([a-z-]+)'/g), (match) => match[1]));
}

function redirectRules(): { from: string; to: string; status: string }[] {
  return read("../../public/_redirects")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
}

function matchesRoute(target: string, pattern: string, categories: Set<string>): boolean {
  const targetParts = target.split("/");
  const patternParts = pattern.split("/");
  if (targetParts.length !== patternParts.length) return false;
  return patternParts.every((part, index) => {
    if (part === ":category") return categories.has(targetParts[index]);
    if (part.startsWith(":")) return targetParts[index].length > 0;
    return part === targetParts[index];
  });
}

test("every redirect target is a real storefront route", () => {
  const patterns = routePatterns();
  const categories = categorySlugs();
  const rules = redirectRules();
  assert.ok(rules.length > 0, "no rules parsed from _redirects");

  for (const rule of rules) {
    const path = rule.to.split("?")[0];
    const isRoute = patterns.some((pattern) => matchesRoute(path, pattern, categories));
    assert.ok(isRoute, `${rule.from} redirects to ${rule.to}, which is not a route`);
    assert.equal(rule.status, "301", `${rule.from} should be a 301`);
  }
});

test("no source path appears twice", () => {
  const sources = redirectRules().map((rule) => rule.from);
  assert.equal(new Set(sources).size, sources.length);
});
