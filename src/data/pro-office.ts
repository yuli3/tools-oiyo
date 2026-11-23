// 전문가 사무소 허브 (2026-11-23, 세운 요청: 세무·노무·행정·법무 전문가 스킬을 모아 나라별로 특화, 사무소를 방문한 느낌, 상담 때 쓰는 필수 프로그램급).
// 새 계산은 없어요. 이미 있는 도구(tools.oiyo.net), MCP 도구(api.oiyo.net), Claude 스킬(oiyo-skills)을 "건물 → 층(나라) → 방(분야)"으로 묶어요.
// 한국 층은 pro-competencies.ts(직업 × 역량)에서, 해외 층은 world-law-intake-2026.ts WORLD_TOOLS와 HELP에서 가져와요.
// 이름 경계: 우리는 자격사 사무소가 아니에요. "세무사" 같은 자격 이름을 도구 이름에 쓰지 않고, 방 이름은 분야(세무·노무·행정·법무)로만 불러요.
import { COMPETENCIES, SKILLS, TOOL_NAMES, isGap, type JobId } from "./pro-competencies.ts";
import { lawGuides } from "./law-guides.ts";
import { HELP, WORLD_TOOLS, type Area, type Country } from "../lib/world-law-intake-2026.ts";

export const OFFICE_AS_OF = "2026-11-23";
export type RoomId = "tax" | "labor" | "admin" | "legal";
export type OfficeLocale = "ko" | "en" | "ja" | "fr" | "es" | "zh";
export type FloorId = "KR" | Country | "CA" | "AU";
export type OfficeTool = { href: string; title: string; who: "pro" | "public"; mcp?: string };
export type OfficeSkill = { id: string; zip: string };
export type Room = { id: RoomId; tools: OfficeTool[]; skills: OfficeSkill[]; help: string[]; gaps: number };
export type Floor = { id: FloorId; flag: string; mcp: string; rooms: Room[] };

export const ROOMS: RoomId[] = ["tax", "labor", "admin", "legal"];
const zip = (dir: string) => `/downloads/${dir === "kr-tax-advisor" ? "oiyo-kr-tax-advisor" : dir}-skill.zip`;

// ── 한국 본관: 직업 → 방 ──
const KR_JOBS: Record<RoomId, JobId[]> = { tax: ["tax", "cpa"], labor: ["labor", "safety"], admin: ["admin", "customs", "broker", "architect"], legal: ["court", "family", "patent"] };
const KR_HELP: Record<RoomId, string[]> = {
  tax: ["국세상담센터 126", "홈택스 상담·전자신고"],
  labor: ["고용노동부 고객상담센터 1350", "근로복지공단 1588-0075"],
  admin: ["정부민원안내콜센터 110", "정부24 민원"],
  legal: ["대한법률구조공단 132", "법원 전자소송·인터넷등기소"],
};
// 사무소에서 만든 보충 도구(상담 실무용). 맨 앞에 보여요.
const KR_OFFICE_TOOLS: Partial<Record<RoomId, OfficeTool[]>> = {
  tax: [{ href: "/ko/client-deadline-board/", title: "고객별 신고 마감 보드", who: "pro" }, { href: "/ko/midyear-leaver-year-end-settlement/", title: "중도퇴사자 연말정산 미리보기", who: "public" }],
};
const krTitle = (slug: string) => TOOL_NAMES[slug] ?? lawGuides.find((g) => g.slug === slug)?.title ?? slug;
function krRoom(id: RoomId): Room {
  const list = COMPETENCIES.filter((c) => KR_JOBS[id].includes(c.job));
  const seen = new Map<string, OfficeTool>();
  for (const c of list) for (const s of c.tools) {
    const who = c.audience.includes("public") ? "public" : "pro";
    const prev = seen.get(s);
    if (!prev) seen.set(s, { href: `/ko/${s}/`, title: krTitle(s), who });
    else if (who === "public") prev.who = "public";
  }
  const skills = [...new Set(list.flatMap((c) => c.skills))].filter((s) => SKILLS[s]).map((s) => ({ id: s, zip: SKILLS[s].zip }));
  const own = KR_OFFICE_TOOLS[id] ?? [];
  const tools = [...own, ...[...seen.values()].filter((t) => !own.some((o) => o.href === t.href))];
  return { id, tools, skills, help: KR_HELP[id], gaps: list.filter(isGap).length };
}

// ── 해외 층: 분야(area) → 방 ──
const AREA_ROOM: Record<Area, RoomId> = { tax: "tax", labor: "labor", tenancy: "admin", consumer: "admin", claims: "legal" };
const COUNTRY_TAX_SKILL: Partial<Record<FloorId, string[]>> = {
  JP: ["oiyo-jp-tax-guide"], US: ["oiyo-us-tax-guide"], FR: ["oiyo-fr-tax-guide"], ES: ["oiyo-es-tax-guide"], CN: ["oiyo-cn-tax-guide"], UK: ["oiyo-uk-tax-guide"], TW: ["oiyo-tw-tax-guide"], DE: ["oiyo-de-guide"], SG: ["oiyo-sg-guide"],
};
// Which countries each world skill really covers (from each SKILL.md description, 2026-11-23). A skill shows only on floors it covers.
const WORLD_ROOM_SKILLS: Record<RoomId, [string, FloorId[]][]> = {
  tax: [["oiyo-world-tax-season-guide", ["US", "JP", "CA", "AU"]], ["oiyo-world-take-home-guide", ["JP", "UK", "US", "FR", "ES"]], ["oiyo-world-withholding-guide", ["JP", "US", "FR", "ES", "TW", "DE"]], ["oiyo-world-corporate-tax-guide", ["JP", "UK", "US", "FR", "ES", "DE"]], ["oiyo-small-business-vat-guide", ["DE", "SG"]], ["oiyo-world-einvoice-guide", ["FR", "JP", "ES"]], ["oiyo-world-tax-residency-guide", ["US", "UK", "ES", "TW", "JP", "FR"]], ["oiyo-world-company-calendar", ["JP", "UK", "US", "FR"]]],
  labor: [["oiyo-world-labor-guide", ["JP", "UK", "US", "FR", "ES", "CN", "TW"]], ["oiyo-labor-practice-guide", ["JP", "UK"]], ["oiyo-world-employer-cost-guide", ["JP", "UK", "US", "ES"]], ["oiyo-world-parental-pay-guide", ["UK", "JP", "DE"]]],
  admin: [["oiyo-world-tenancy-guide", ["JP", "UK", "US", "FR", "ES", "CN", "TW"]], ["oiyo-world-consumer-guide", ["JP", "UK", "FR", "ES", "CN", "TW", "US"]], ["oiyo-world-home-purchase-guide", ["UK", "JP", "FR", "ES", "CN"]]],
  legal: [["oiyo-world-claims-guide", ["JP", "UK", "US", "FR", "TW", "CN"]], ["oiyo-world-inheritance-guide", ["JP", "UK", "US", "FR", "TW"]], ["oiyo-world-late-payment-guide", ["DE", "FR", "ES", "UK"]], ["oiyo-court-fee-guide", ["JP", "DE"]], ["oiyo-fresh-start-guide", ["TW", "ES"]], ["oiyo-de-everyday-law-guide", ["DE"]]],
};
const EXTRA: Record<"CA" | "AU", OfficeTool[]> = {
  CA: [
    { href: "/en/canada-take-home-pay-calculator-2026/", title: "Take-home pay 2026 (federal, Ontario, BC, Alberta)", who: "public", mcp: "calculate_ca_take_home" },
    { href: "/en/canada-mortgage-stress-test-calculator/", title: "Mortgage stress test", who: "public" },
    { href: "/en/canada-federal-vacation-calculator/", title: "Federal vacation pay", who: "public" },
    { href: "/en/canada-federal-holiday-pay-calculator/", title: "Federal holiday pay", who: "public" },
  ],
  AU: [
    { href: "/en/australia-take-home-pay-calculator-2026-27/", title: "Take-home pay 2026-27 (tax, Medicare, super)", who: "public", mcp: "calculate_au_take_home" },
    { href: "/en/australia-job-offer-comparison/", title: "Job offer comparison", who: "public" },
    { href: "/en/australia-annual-leave-accrual-calculator/", title: "Annual leave accrual", who: "public" },
  ],
};
const EXTRA_ROOM: Record<string, RoomId> = { "canada-mortgage-stress-test-calculator": "admin", "canada-federal-vacation-calculator": "labor", "canada-federal-holiday-pay-calculator": "labor", "australia-job-offer-comparison": "labor", "australia-annual-leave-accrual-calculator": "labor" };
const rel = (url: string) => url.replace("https://tools.oiyo.net", "");
function worldRoom(fl: FloorId, id: RoomId): Room {
  let tools: OfficeTool[];
  let help: string[] = [];
  if (fl === "CA" || fl === "AU") {
    tools = EXTRA[fl].filter((t) => (EXTRA_ROOM[t.href.split("/")[2]] ?? "tax") === id);
  } else {
    const c = fl as Country;
    const seen = new Set<string>();
    tools = WORLD_TOOLS.filter((t) => t.country === c && AREA_ROOM[t.area] === id && !seen.has(t.page) && seen.add(t.page))
      .map((t) => ({ href: rel(t.page), title: t.title, who: t.audience === "pro" ? "pro" : "public", mcp: t.mcp }));
    help = [...new Set((Object.keys(AREA_ROOM) as Area[]).filter((a) => AREA_ROOM[a] === id).map((a) => HELP[c][a]).filter(Boolean))];
  }
  const skills = [...(id === "tax" ? COUNTRY_TAX_SKILL[fl] ?? [] : []), ...WORLD_ROOM_SKILLS[id].filter(([, c]) => c.includes(fl)).map(([s]) => s), ...(id === "tax" && fl !== "CA" && fl !== "AU" ? ["oiyo-world-law-intake"] : [])].map((s) => ({ id: s, zip: zip(s) }));
  return { id, tools, skills, help, gaps: 0 };
}

export const FLAGS: Record<FloorId, string> = { KR: "🇰🇷", JP: "🇯🇵", US: "🇺🇸", UK: "🇬🇧", FR: "🇫🇷", ES: "🇪🇸", CN: "🇨🇳", TW: "🇹🇼", DE: "🇩🇪", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺" };
const MCP = "https://api.oiyo.net/mcp";
export function floor(id: FloorId): Floor {
  return { id, flag: FLAGS[id], mcp: id === "KR" ? MCP : `${MCP}/world`, rooms: ROOMS.map((r) => (id === "KR" ? krRoom(r) : worldRoom(id, r))) };
}
export const FLOOR_ORDER: Record<OfficeLocale, FloorId[]> = {
  ko: ["KR", "JP", "US", "CN", "TW", "UK", "DE", "FR", "ES", "SG", "CA", "AU"],
  en: ["US", "UK", "CA", "AU", "SG", "JP", "DE", "FR", "ES", "CN", "TW"],
  ja: ["JP", "US", "UK", "CN", "TW", "DE", "FR", "ES", "SG", "CA", "AU"],
  fr: ["FR", "ES", "DE", "UK", "US", "CA", "JP", "CN", "TW", "SG", "AU"],
  es: ["ES", "FR", "US", "UK", "DE", "JP", "CN", "TW", "SG", "CA", "AU"],
  zh: ["CN", "TW", "SG", "JP", "US", "UK", "DE", "FR", "ES", "CA", "AU"],
};
export const officeFloors = (loc: OfficeLocale) => FLOOR_ORDER[loc].map(floor);
export const OFFICE_SLUGS: Record<OfficeLocale, string> = { ko: "pro-office", en: "professional-office-tools", ja: "senmonka-jimusho-tools", fr: "cabinet-conseil-outils", es: "despacho-profesional-herramientas", zh: "zhuanye-shiwusuo-gongju" };
