import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BRAND_LOGOS, FEATURED_BRAND_LOGO, MARQUEE_LOGOS, interleaveFeatured } from './brand-logos.ts';

const logo = (name: string) => ({ name, src: `/${name}`, width: 1, height: 1 });

test('the featured logo is every third one', () => {
  const featured = logo('F');
  const names = interleaveFeatured([logo('A'), logo('B'), logo('C'), logo('D'), logo('E')], featured, 3).map(
    (entry) => entry.name,
  );
  assert.deepEqual(names, ['A', 'B', 'F', 'C', 'D', 'F', 'E']);
});

test('the carousel keeps every brand and slots Evolution in', () => {
  const others = MARQUEE_LOGOS.filter((entry) => entry !== FEATURED_BRAND_LOGO);
  assert.deepEqual(others, BRAND_LOGOS);
  assert.equal(MARQUEE_LOGOS[2], FEATURED_BRAND_LOGO);
});
