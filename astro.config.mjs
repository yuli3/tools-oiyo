// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
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
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
