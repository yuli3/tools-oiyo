// 다국어(en·ja·zh·fr·es) 색인 페이지 → 아직 안 읽힌 돈 되는 도구 링크 표를 만들어요 (2026-11-23).
// WHY: tools 1,472주소 중 색인 293개, Google은 읽은 페이지를 거의 다 색인해요(크롤했지만 미색인 2개).
// 막힌 곳은 품질이 아니라 발견·크롤이라, noindex로 주소를 줄이지 않고(2026-10-06 결정)
// 자주 다시 읽히는 색인 페이지에서 금융·세금·급여 도구로 링크를 걸어 크롤을 그쪽으로 모아요.
// 사용: npm run build && node scripts/build-crawl-links-intl.mjs <tools-index-status.csv>
//   CSV: company-brain projects/oiyo-ecosystem/tools-index-status-YYYY-MM-DD.csv (url,coverage,lastCrawl)
// 결과: src/data/crawl-links-intl.ts (손으로 고치지 않아요. 다음 색인 조사 뒤 다시 만들어요.)
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const LOCALES = ["en", "ja", "zh", "fr", "es"];
const PER_SOURCE = 4; // 색인 페이지 하나에 새 링크 최대 4개
const PER_TARGET = 2; // 미색인 도구 하나에 색인 페이지 2곳에서 링크
// 돈 되는 주제(광고 단가가 높은 금융·세금·급여·보험·부동산). slug 기준.
const MONEY = /tax|salary|loan|mortgage|pension|interest|invest|saving|rent|retire|inherit|vat|income|fee|budget|debt|roi|yield|wage|pay|severance|leave|insurance|stock|dividend|fire|compound|price|cost|deposit|inflation|currency|exchange|net-worth|credit|annuit|benefit|unemploy/;

const csvPath = process.argv[2];
if (!csvPath) throw new Error("CSV 경로가 필요해요");
const status = new Map();
for (const line of readFileSync(csvPath, "utf8").split("\n").slice(1)) {
  const [url, coverage] = line.split(",");
  if (url) status.set(new URL(url).pathname, coverage);
}
const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>https:\/\/tools\.oiyo\.net([^<]+)<\/loc>/g)].map((m) => m[1]);

const html = (p) => readFileSync(`dist${p}index.html`, "utf8");
const label = (p) => {
  const h1 = html(p).match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const t = (h1 ? h1[1] : html(p).match(/<title>([^<]*)/)[1]).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  return t.split(/\s[—|–]\s|\s-\s/)[0].trim();
};
const inbound = new Map();
for (const u of urls) {
  for (const m of html(u).matchAll(/href="(\/[^"#?]*)"/g)) {
    const h = m[1].endsWith("/") ? m[1] : `${m[1]}/`;
    if (h !== u) inbound.set(h, (inbound.get(h) ?? 0) + 1);
  }
}
const slugOf = (u) => u.split("/")[2];
const tokens = (s) => new Set(s.split("-").filter((w) => !["calculator", "converter", "checker", "tool", "simulator", "planner"].includes(w)));
// 한 단계 주소(/xx/slug/)만 대상이에요. 값별 페이지·간단계산기 하위 페이지는 넣지 않아요.
const isTool = (u, loc) => new RegExp(`^/${loc}/[^/]+/$`).test(u) && existsSync(`dist${u}index.html`);
// 소스 페이지가 RelatedUtilities를 그리는지: 같은 slug 파일이 그 부품(또는 그걸 감싼 셸)을 쓰는지 봐요.
const SHELLS = ["RelatedUtilities", "KrFinancePage", "SmallUtilityPage", "W7ToolPage", "UnitToolPage"];
const rendersRelated = (loc, slug) => {
  for (const f of [`src/pages/[locale]/${slug}.astro`, `src/pages/${loc}/${slug}.astro`, `src/pages/[locale]/${slug}/index.astro`, `src/pages/${loc}/${slug}/index.astro`]) {
    if (existsSync(f)) return SHELLS.some((s) => readFileSync(f, "utf8").includes(s));
  }
  return false;
};

// 지난번에 이 표로 건 링크는 "이미 링크됨"으로 보지 않아요(다시 돌려도 결과가 같게).
const prev = new Set();
if (existsSync("src/data/crawl-links-intl.ts")) {
  let loc = "";
  for (const line of readFileSync("src/data/crawl-links-intl.ts", "utf8").split("\n")) {
    const l = line.match(/^  (\w+): \{$/);
    if (l) loc = l[1];
    const m = line.match(/^    "([^"]+)": \[(.*)\],$/);
    if (m) for (const t of m[2].matchAll(/slug: "([^"]+)"/g)) prev.add(`/${loc}/${m[1]}/ /${loc}/${t[1]}/`);
  }
}
const out = {};
for (const loc of LOCALES) {
  const tools = urls.filter((u) => isTool(u, loc));
  const sources = tools.filter((u) => status.get(u) === "indexed" && rendersRelated(loc, slugOf(u)));
  const targets = tools
    .filter((u) => status.get(u) !== "indexed" && MONEY.test(slugOf(u)))
    .sort((a, b) => (inbound.get(a) ?? 0) - (inbound.get(b) ?? 0) || a.localeCompare(b));
  const load = new Map(sources.map((s) => [s, []]));
  for (const t of targets) {
    const tt = tokens(slugOf(t));
    const ranked = sources
      .filter((s) => load.get(s).length < PER_SOURCE && (prev.has(`${s} ${t}`) || !html(s).includes(`href="${t}"`)))
      .map((s) => {
        const st = tokens(slugOf(s));
        const overlap = [...tt].filter((w) => st.has(w)).length;
        return { s, score: overlap * 10 + (MONEY.test(slugOf(s)) ? 5 : 0) - load.get(s).length };
      })
      .sort((a, b) => b.score - a.score || a.s.localeCompare(b.s));
    for (const { s } of ranked.slice(0, PER_TARGET)) load.get(s).push(t);
  }
  out[loc] = {};
  for (const [s, ts] of [...load].sort()) {
    if (ts.length) out[loc][slugOf(s)] = ts.map((t) => ({ slug: slugOf(t), label: label(t) }));
  }
  const linked = new Set(Object.values(out[loc]).flat().map((l) => l.slug));
  console.log(`${loc}: 색인 소스 ${sources.length}, 미색인 돈 도구 ${targets.length}, 연결 ${linked.size}`);
}

const body = `// 자동 생성: node scripts/build-crawl-links-intl.mjs <tools-index-status.csv> (손으로 고치지 않아요)
// 다국어 색인 페이지 slug → 아직 Google이 읽지 않은 금융·세금·급여 도구. RelatedUtilities가 맨 앞에 그려요.
// 2026-11-23 기준 CSV: company-brain projects/oiyo-ecosystem/tools-index-status-2026-11-21.csv
import type { CrawlLink } from "./crawl-links";
export const CRAWL_LINKS_INTL: Record<string, Record<string, CrawlLink[]>> = {
${Object.entries(out).map(([loc, m]) => `  ${loc}: {\n${Object.entries(m).map(([s, ls]) => `    ${JSON.stringify(s)}: [${ls.map((l) => `{ slug: ${JSON.stringify(l.slug)}, label: ${JSON.stringify(l.label)} }`).join(", ")}],`).join("\n")}\n  },`).join("\n")}
};
`;
writeFileSync("src/data/crawl-links-intl.ts", body);
