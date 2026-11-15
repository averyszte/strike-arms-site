import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * public/llms.txt is hand-written. These checks stop it drifting from the
 * site: every link must be a page the sitemap lists, and the shop's details
 * must match site-config.ts.
 */
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const LLMS = read('../../public/llms.txt');
const SITEMAP = read('../../public/sitemap.xml');
const SITE_CONFIG = read('./site-config.ts');

const SITEMAP_URLS = new Set([...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const LINKS = [...LLMS.matchAll(/\]\((https:\/\/strikearms\.ie[^)]*)\)/g)].map((m) => m[1]);

test('llms.txt starts with an H1 and a blockquote summary', () => {
  const lines = LLMS.split('\n');
  assert.match(lines[0], /^# \S/);
  assert.match(lines[2], /^> \S/);
});

test('every llms.txt page link is in the sitemap', () => {
  assert.ok(LINKS.length > 20);
  const missing = LINKS.filter((url) => !url.endsWith('/sitemap.xml') && !SITEMAP_URLS.has(url));
  assert.deepEqual(missing, []);
});

test('llms.txt shop details match site-config', () => {
  for (const key of ['streetAddress', 'postalCode', 'telephone', 'email']) {
    const value = SITE_CONFIG.match(new RegExp(`${key}: '([^']+)'`))?.[1];
    assert.ok(value, `site-config has ${key}`);
    assert.ok(LLMS.includes(value), `llms.txt mentions ${key} ${value}`);
  }
});
