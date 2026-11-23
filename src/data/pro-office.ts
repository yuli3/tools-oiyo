// 전문가 사무소 허브 (2026-11-23, 세운 요청: 세무·노무·행정·법무 전문가 스킬을 모아 나라별로 특화, 사무소를 방문한 느낌, 상담 때 쓰는 필수 프로그램급).
// 새 계산은 없어요. 이미 있는 도구(tools.oiyo.net), MCP 도구(api.oiyo.net), Claude 스킬(oiyo-skills)을 "건물 → 층(나라) → 방(분야)"으로 묶어요.
// 한국 층은 pro-competencies.ts(직업 × 역량)에서, 해외 층은 world-law-intake-2026.ts WORLD_TOOLS와 HELP에서 가져와요.
// 이름 경계: 우리는 자격사 사무소가 아니에요. "세무사" 같은 자격 이름을 도구 이름에 쓰지 않고, 방 이름은 분야(세무·노무·행정·법무)로만 불러요.
import { COMPETENCIES, SKILLS, TOOL_NAMES, isGap, type JobId } from "./pro-competencies.ts";
import { lawGuides } from "./law-guides.ts";
import { HELP, WORLD_TOOLS, type Area, type Country } from "../lib/world-law-intake-2026.ts";

export const OFFICE_AS_OF = "2026-11-23";
export type RoomId = "tax" | "labor" | "admin" | "legal" | "plan";
export type OfficeLocale = "ko" | "en" | "ja" | "fr" | "es" | "zh";
export type FloorId = "KR" | Country | "CA" | "AU";
export type OfficeTool = { href: string; title: string; who: "pro" | "public"; mcp?: string };
export type OfficeSkill = { id: string; zip: string };
export type Room = { id: RoomId; tools: OfficeTool[]; skills: OfficeSkill[]; help: string[]; gaps: number };
export type Floor = { id: FloorId; flag: string; mcp: string; rooms: Room[] };

export const ROOMS: RoomId[] = ["tax", "labor", "admin", "legal", "plan"];
const zip = (dir: string) => `/downloads/${dir === "kr-tax-advisor" ? "oiyo-kr-tax-advisor" : dir}-skill.zip`;

// ── 한국 본관: 직업 → 방 ──
const KR_JOBS: Record<Exclude<RoomId, "plan">, JobId[]> = { tax: ["tax", "cpa"], labor: ["labor", "safety"], admin: ["admin", "customs", "broker", "architect"], legal: ["court", "family", "patent"] };
const KR_HELP: Record<Exclude<RoomId, "plan">, string[]> = {
  tax: ["국세상담센터 126", "홈택스 상담·전자신고"],
  labor: ["고용노동부 고객상담센터 1350", "근로복지공단 1588-0075"],
  admin: ["정부민원안내콜센터 110", "정부24 민원"],
  legal: ["대한법률구조공단 132", "법원 전자소송·인터넷등기소"],
};
// 사무소에서 만든 보충 도구(상담 실무용). 맨 앞에 보여요.
const KR_OFFICE_TOOLS: Partial<Record<RoomId, OfficeTool[]>> = {
  tax: [{ href: "/ko/client-deadline-board/", title: "고객별 신고 마감 보드", who: "pro" }, { href: "/ko/midyear-leaver-year-end-settlement/", title: "중도퇴사자 연말정산 미리보기", who: "public" }, { href: "/ko/simplified-withholding-tax-calculator/", title: "간이세액표 월 원천징수", who: "pro" }],
  labor: [{ href: "/ko/quit-one-stop-calculator/", title: "퇴사 원스톱 (퇴직금·세금·실업급여)", who: "public" }, { href: "/ko/join-leave-month-insurance-calculator/", title: "입사·퇴사 달 4대보험료", who: "pro" }],
  admin: [{ href: "/ko/job-desk/", title: "직업별 세금·노무 창구", who: "public" }, { href: "/ko/life-event-navigator/", title: "인생 사건 내비", who: "public" }],
};
const krTitle = (slug: string) => TOOL_NAMES[slug] ?? lawGuides.find((g) => g.slug === slug)?.title ?? slug;
function krRoom(id: Exclude<RoomId, "plan">): Room {
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
const AREA_ROOM: Record<Area, Exclude<RoomId, "plan">> = { tax: "tax", labor: "labor", tenancy: "admin", consumer: "admin", claims: "legal" };
const COUNTRY_TAX_SKILL: Partial<Record<FloorId, string[]>> = {
  JP: ["oiyo-jp-tax-guide"], US: ["oiyo-us-tax-guide"], FR: ["oiyo-fr-tax-guide"], ES: ["oiyo-es-tax-guide"], CN: ["oiyo-cn-tax-guide"], UK: ["oiyo-uk-tax-guide"], TW: ["oiyo-tw-tax-guide"], DE: ["oiyo-de-guide"], SG: ["oiyo-sg-guide"],
};
// Which countries each world skill really covers (from each SKILL.md description, 2026-11-23). A skill shows only on floors it covers.
const WORLD_ROOM_SKILLS: Record<Exclude<RoomId, "plan">, [string, FloorId[]][]> = {
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
const EXTRA_ROOM: Record<string, Exclude<RoomId, "plan">> = { "canada-mortgage-stress-test-calculator": "admin", "canada-federal-vacation-calculator": "labor", "canada-federal-holiday-pay-calculator": "labor", "australia-job-offer-comparison": "labor", "australia-annual-leave-accrual-calculator": "labor" };
const rel = (url: string) => url.replace("https://tools.oiyo.net", "");
function worldRoom(fl: FloorId, id: Exclude<RoomId, "plan">): Room {
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

// ── 재무설계실 (2026-11-23, 세운 요청: 재무설계 전문가도 나라별로) ──
// 새 계산은 없어요. 나라마다 이미 있는 저축·연금·절세계좌·대출 도구를 그 나라 제도 이름 그대로 모아요.
// 해외 무료 창구는 2026-11-23에 공식 사이트에서 이름·번호를 확인한 것만 적었어요(확인 못 한 나라는 비워 둠).
// 투자 권유·상품 추천은 하지 않아요. 방 이름은 분야(재무설계)로만 부르고 자격 이름을 쓰지 않아요.
const PLAN_TOOLS: Partial<Record<FloorId, OfficeTool[]>> = {
  KR: [
    { href: "/ko/money-planner/", title: "월급 나누기·저축 플래너", who: "public" },
    { href: "/ko/tax-savings-roadmap/", title: "절세 로드맵", who: "public" },
    { href: "/ko/isa-calculator/", title: "ISA 계산기", who: "public" },
    { href: "/ko/isa-vs-pension-calculator/", title: "ISA vs 연금저축", who: "public" },
    { href: "/ko/pension-tax-calculator/", title: "연금저축·IRP 세액공제", who: "public" },
    { href: "/ko/private-pension-separate-tax-calculator/", title: "사적연금 분리과세 vs 종합과세", who: "pro" },
    { href: "/ko/retirement-pension-db-dc-calculator/", title: "퇴직연금 DB vs DC", who: "public" },
    { href: "/ko/youth-future-savings-calculator/", title: "청년미래적금", who: "public" },
    { href: "/ko/savings-comparison-calculator/", title: "예적금 비교", who: "public" },
    { href: "/ko/national-pension-estimate-calculator/", title: "국민연금 예상 수령액", who: "public" },
    { href: "/ko/national-pension-early-deferred-calculator/", title: "국민연금 조기·연기 수령 비교", who: "public" },
  ],
  JP: [
    { href: "/ja/money-planner/", title: "給料の分け方・貯蓄プランナー", who: "public" },
    { href: "/ja/nisa-limit-planner/", title: "新NISA 枠プランナー", who: "public" },
    { href: "/ja/furusato-nozei-limit-calculator/", title: "ふるさと納税 控除上限", who: "public" },
    { href: "/ja/pension-tax-calculator/", title: "iDeCo 受取時の税金", who: "public" },
    { href: "/ja/housing-loan-deduction-calculator/", title: "住宅ローン控除", who: "public" },
  ],
  CN: [
    { href: "/zh/money-planner/", title: "工资分配与储蓄规划器", who: "public" },
    { href: "/zh/personal-pension-tax-calculator/", title: "个人养老金 缴费抵税", who: "public" },
    { href: "/zh/pension-tax-calculator/", title: "个人养老金 领取个税", who: "public" },
    { href: "/zh/housing-provident-fund-combo-loan-calculator/", title: "公积金组合贷款", who: "public" },
  ],
  FR: [
    { href: "/fr/money-planner/", title: "Planificateur de budget et d’épargne", who: "public" },
    { href: "/fr/pension-tax-calculator/", title: "Fiscalité de sortie du PER", who: "public" },
    { href: "/fr/france-surendettement-budget/", title: "Budget et surendettement", who: "public" },
  ],
  ES: [
    { href: "/es/money-planner/", title: "Planificador de nómina y ahorro", who: "public" },
    { href: "/es/pension-tax-calculator/", title: "Rescate del plan de pensiones", who: "public" },
  ],
  US: [
    { href: "/en/us-401k-ira-limits-calculator/", title: "401(k) and IRA limits", who: "public" },
    { href: "/en/social-security-claiming-age-calculator/", title: "Social Security claiming age", who: "public" },
  ],
  UK: [
    { href: "/en/uk-pension-tax-relief-calculator/", title: "Pension tax relief", who: "public" },
    { href: "/en/uk-marriage-allowance-calculator/", title: "Marriage Allowance", who: "public" },
    { href: "/en/lifetime-isa-bonus-calculator/", title: "Lifetime ISA bonus", who: "public" },
    { href: "/en/uk-student-loan-plan-2-plan-5-calculator/", title: "Student loan Plan 2 / Plan 5", who: "public" },
  ],
  SG: [
    { href: "/en/singapore-cpf-contribution-calculator-2026/", title: "CPF contributions 2026", who: "public" },
    { href: "/en/cpf-housing-refund-calculator/", title: "CPF housing refund", who: "public" },
  ],
  CA: [{ href: "/en/canada-mortgage-stress-test-calculator/", title: "Mortgage stress test", who: "public" }],
  TW: [{ href: "/zh/taiwan-labor-pension-voluntary-contribution/", title: "勞退自提6%試算", who: "public" }],
  DE: [{ href: "/de/riester-ruerup-rechner/", title: "Riester- und Rürup-Rechner", who: "public" }],
  AU: [{ href: "/en/australia-super-contribution-caps-calculator/", title: "Super contribution caps and Division 293", who: "public" }],
};
const PLAN_HELP: Partial<Record<FloorId, string[]>> = {
  KR: ["금융감독원 1332 · 통합연금포털"],
  JP: ["金融庁 金融サービス利用者相談室 0570-016811", "日本年金機構 ねんきんダイヤル"],
  US: ["Social Security Administration (ssa.gov)"],
  UK: ["Check your State Pension forecast (GOV.UK)", "MoneyHelper pension calculator"],
  FR: ["Banque de France 34 14", "Info Retraite (simulateurs)"],
  ES: ["Banco de España · Portal del Cliente Bancario", "Seguridad Social 901 166 565"],
  CN: ["人社 12333"],
  TW: ["勞動部勞工保險局 (02)2396-1266"],
  DE: ["Deutsche Rentenversicherung 0800 1000 4800"],
  SG: ["CPF Board (cpf.gov.sg)"],
  AU: ["ATO 13 10 20 · Moneysmart (ASIC)"],
};
export const PLAN_FLOOR_TOOLS = PLAN_TOOLS;
// 재무설계 길잡이 스킬(oiyo-financial-planning-guide)이 계산하는 나라와, 같은 계산의 MCP 도구(api.oiyo.net /v1/planning).
const PLAN_SKILL_FLOORS: FloorId[] = ["KR", "US", "UK", "JP", "CN", "FR", "ES", "SG", "CA", "TW", "DE", "AU"];
const PLAN_MCP: Record<string, string> = {
  "/en/us-401k-ira-limits-calculator/": "calculate_us_retirement_limits",
  "/en/social-security-claiming-age-calculator/": "calculate_us_social_security_claiming",
  "/en/uk-pension-tax-relief-calculator/": "calculate_uk_pension_tax_relief",
  "/en/lifetime-isa-bonus-calculator/": "plan_uk_lifetime_isa",
  "/en/uk-student-loan-plan-2-plan-5-calculator/": "calculate_uk_student_loan_repayment",
  "/ja/nisa-limit-planner/": "plan_jp_nisa_limits",
  "/ja/housing-loan-deduction-calculator/": "calculate_jp_housing_loan_credit",
  "/zh/personal-pension-tax-calculator/": "calculate_cn_personal_pension_tax",
  "/zh/housing-provident-fund-combo-loan-calculator/": "calculate_cn_provident_fund_combo_loan",
  "/en/cpf-housing-refund-calculator/": "calculate_sg_cpf_housing_refund",
  "/en/canada-mortgage-stress-test-calculator/": "calculate_ca_mortgage_stress_test",
  "/ko/national-pension-early-deferred-calculator/": "compare_kr_national_pension_early_deferred",
  "/ko/national-pension-estimate-calculator/": "estimate_kr_national_pension",
  "/ja/furusato-nozei-limit-calculator/": "calculate_jp_furusato_limit",
  "/en/uk-marriage-allowance-calculator/": "check_uk_marriage_allowance",
  "/zh/taiwan-labor-pension-voluntary-contribution/": "calculate_tw_labor_pension_voluntary",
  "/de/riester-ruerup-rechner/": "calculate_de_riester_ruerup",
  "/en/australia-super-contribution-caps-calculator/": "calculate_au_super_contribution_caps",
};
function planRoom(fl: FloorId): Room {
  const tools = (PLAN_TOOLS[fl] ?? []).map((t) => (PLAN_MCP[t.href] && !t.mcp ? { ...t, mcp: PLAN_MCP[t.href] } : t));
  const skills = PLAN_SKILL_FLOORS.includes(fl) ? [{ id: "oiyo-financial-planning-guide", zip: zip("oiyo-financial-planning-guide") }] : [];
  return { id: "plan", tools, skills, help: PLAN_HELP[fl] ?? [], gaps: 0 };
}

export const FLAGS: Record<FloorId, string> = { KR: "🇰🇷", JP: "🇯🇵", US: "🇺🇸", UK: "🇬🇧", FR: "🇫🇷", ES: "🇪🇸", CN: "🇨🇳", TW: "🇹🇼", DE: "🇩🇪", SG: "🇸🇬", CA: "🇨🇦", AU: "🇦🇺" };
const MCP = "https://api.oiyo.net/mcp";
export function floor(id: FloorId): Floor {
  return { id, flag: FLAGS[id], mcp: id === "KR" ? MCP : `${MCP}/world`, rooms: ROOMS.map((r) => (r === "plan" ? planRoom(id) : id === "KR" ? krRoom(r) : worldRoom(id, r))) };
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
