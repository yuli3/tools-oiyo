import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CRAWL_LINKS_INTL } from "./crawl-links-intl.ts";

const exists = (loc: string, slug: string) =>
  [`src/pages/[locale]/${slug}.astro`, `src/pages/${loc}/${slug}.astro`, `src/pages/[locale]/${slug}/index.astro`, `src/pages/${loc}/${slug}/index.astro`].some((f) => existsSync(f));

test("다국어 색인 페이지 → 새 돈 도구 링크: 양쪽 slug가 실제 페이지이고 한 곳에 4개 이하예요", () => {
  assert.ok(!("ko" in CRAWL_LINKS_INTL), "ko는 crawl-links.ts에서 손으로 골라요");
  for (const [loc, map] of Object.entries(CRAWL_LINKS_INTL)) {
    for (const [from, links] of Object.entries(map)) {
      assert.ok(exists(loc, from), `${loc}/${from}`);
      assert.ok(links.length > 0 && links.length <= 4, `${loc}/${from}`);
      for (const l of links) {
        assert.ok(exists(loc, l.slug), `${loc}/${from} → ${l.slug}`);
        assert.notEqual(l.slug, from);
        assert.ok(l.label.length > 0);
      }
    }
  }
});
