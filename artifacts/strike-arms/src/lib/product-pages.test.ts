import assert from "node:assert/strict";
import { test } from "node:test";

import type { Product, ProductListResult } from "@/types/product";
import { flattenProductPages, nextProductPage } from "./product-pages.ts";

function page(n: number, count: number, total: number): ProductListResult {
  const items = Array.from({ length: count }, (_, i) => ({ id: `${n}-${i}` }) as unknown as Product);
  return { items, total, page: n, pageSize: 2 };
}

test("asks for the next page while products remain", () => {
  const first = page(1, 2, 5);
  assert.equal(nextProductPage(first, [first]), 2);
});

test("stops once every product is loaded", () => {
  const pages = [page(1, 2, 4), page(2, 2, 4)];
  assert.equal(nextProductPage(pages[1], pages), undefined);
});

test("stops on an empty page even if the total says otherwise", () => {
  const pages = [page(1, 2, 9), page(2, 0, 9)];
  assert.equal(nextProductPage(pages[1], pages), undefined);
});

test("flattens the loaded pages up to the target, in order", () => {
  const pages = [page(1, 2, 5), page(2, 2, 5), page(3, 1, 5)];
  const shown = flattenProductPages(pages, 2);
  assert.deepEqual(shown.items.map((item) => item.id), ["1-0", "1-1", "2-0", "2-1"]);
  assert.equal(shown.total, 5);
});

test("no pages means nothing shown and a zero total", () => {
  assert.deepEqual(flattenProductPages([], 1), { items: [], total: 0 });
});
