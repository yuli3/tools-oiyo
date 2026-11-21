import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CRAWL_LINKS } from "./crawl-links.ts";

const exists = (slug: string) => existsSync(`src/pages/ko/${slug}.astro`) || existsSync(`src/pages/[locale]/${slug}.astro`) || existsSync(`src/pages/ko/${slug}/index.astro`);

test("색인 페이지 → 새 도구 링크: 양쪽 slug가 실제 ko 페이지예요", () => {
  for (const [from, links] of Object.entries(CRAWL_LINKS)) {
    assert.ok(exists(from), from);
    assert.ok(links.length > 0 && links.length <= 6, from);
    for (const l of links) {
      assert.ok(exists(l.slug), `${from} → ${l.slug}`);
      assert.notEqual(l.slug, from);
    }
  }
});
