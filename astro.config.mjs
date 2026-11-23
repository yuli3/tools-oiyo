// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import koRss from "./src/integrations/ko-rss.mjs";
import { lastmodFor, pageFileDates } from "./scripts/page-dates.mjs";

const PAGE_DATES = pageFileDates();

export default defineConfig({
  site: "https://tools.oiyo.net",
  output: "static",
  integrations: [
    sitemap({
      // 블로그용 위젯(/ko/embed/)은 noindex라 사이트맵에서 빼요.
      filter: (page) => !page.includes("/embed/"),
      serialize(item) {
        const d = lastmodFor(new URL(item.url).pathname, PAGE_DATES);
        return d ? { ...item, lastmod: d } : item;
      },
    }),
    // React 컴포넌트를 Preact(compat)로 렌더한다: 클라이언트 런타임 215KB → 약 20KB (2026-11-22).
    preact({ compat: true }),
    koRss({ site: "https://tools.oiyo.net", title: "OIYO 도구 — 무료 계산기·변환기", description: "세금·급여·건강·단위 변환까지, 설치 없이 바로 쓰는 무료 계산기와 도구." }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
