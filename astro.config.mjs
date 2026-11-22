// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import koRss from "./src/integrations/ko-rss.mjs";
import { lastmodFor, pageFileDates } from "./scripts/page-dates.mjs";

const PAGE_DATES = pageFileDates();

export default defineConfig({
  site: "https://tools.oiyo.net",
  output: "static",
  integrations: [
    sitemap({
      serialize(item) {
        const d = lastmodFor(new URL(item.url).pathname, PAGE_DATES);
        return d ? { ...item, lastmod: d } : item;
      },
    }),
    react(),
    koRss({ site: "https://tools.oiyo.net", title: "OIYO 도구 — 무료 계산기·변환기", description: "세금·급여·건강·단위 변환까지, 설치 없이 바로 쓰는 무료 계산기와 도구." }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
