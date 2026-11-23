// 전문가 사무소 허브 (2026-11-23, 세운 요청: 세무·노무·행정·법무 전문가 스킬을 모아 나라별로 특화, 사무소를 방문한 느낌, 상담 때 쓰는 필수 프로그램급).
// 새 계산은 없어요. 이미 있는 도구(tools.oiyo.net), MCP 도구(api.oiyo.net), Claude 스킬(oiyo-skills)을 "건물 → 층(나라) → 방(분야)"으로 묶어요.
// 한국 층은 pro-competencies.ts(직업 × 역량)에서, 해외 층은 world-law-intake-2026.ts WORLD_TOOLS와 HELP에서 가져와요.
// 이름 경계: 우리는 자격사 사무소가 아니에요. "세무사" 같은 자격 이름을 도구 이름에 쓰지 않고, 방 이름은 분야(세무·노무·행정·법무)로만 불러요.
import { COMPETENCIES, SKILLS, TOOL_NAMES, isGap, type JobId } from "./pro-competencies.ts";
import { lawGuides } from "./law-guides.ts";
import { HELP, WORLD_TOOLS, type Area, type Country } from "../lib/world-law-intake-2026.ts";

export const OFFICE_AS_OF = "2026-11-23";
export type BaseRoomId = "tax" | "labor" | "admin" | "legal" | "trade" | "plan";
/** 한국 본관에만 있는 방 (2026-11-23, CHOSEUN "다른 사무소·다른 직업"): 보험·부동산·창업경영·복지의료. 해외 층에는 아직 없어요. */
export type KrRoomId = "insurance" | "realty" | "biz" | "welfare";
export type RoomId = BaseRoomId | KrRoomId;
export type OfficeLocale = "ko" | "en" | "ja" | "fr" | "es" | "zh";
export type FloorId = "KR" | Country | "CA" | "AU";
export type OfficeTool = { href: string; title: string; who: "pro" | "public"; mcp?: string };
export type OfficeSkill = { id: string; zip: string };
export type Room = { id: RoomId; tools: OfficeTool[]; skills: OfficeSkill[]; help: string[]; gaps: number };
export type Floor = { id: FloorId; flag: string; mcp: string; rooms: Room[] };

export const ROOMS: BaseRoomId[] = ["tax", "labor", "admin", "legal", "trade", "plan"];
export const KR_ROOMS: RoomId[] = ["tax", "labor", "admin", "legal", "trade", "insurance", "realty", "biz", "welfare", "plan"];
export const ALL_ROOM_IDS: RoomId[] = KR_ROOMS;
const zip = (dir: string) => `/downloads/${dir === "kr-tax-advisor" ? "oiyo-kr-tax-advisor" : dir}-skill.zip`;

// ── 한국 본관: 직업 → 방 ──
const KR_JOBS: Record<Exclude<RoomId, "plan">, JobId[]> = { tax: ["tax", "cpa"], labor: ["labor", "safety"], admin: ["admin"], legal: ["court", "family", "patent"], trade: ["customs"], insurance: ["actuary", "adjuster", "agent"], realty: ["broker", "appraiser", "architect", "housing"], biz: ["mgmt", "franchise"], welfare: ["social", "medic"] };
const KR_HELP: Record<Exclude<RoomId, "plan">, string[]> = {
  tax: ["국세상담센터 126", "홈택스 상담·전자신고"],
  labor: ["고용노동부 고객상담센터 1350", "근로복지공단 1588-0075"],
  admin: ["정부민원안내콜센터 110", "정부24 민원"],
  legal: ["대한법률구조공단 132", "법원 전자소송·인터넷등기소"],
  trade: [],
  insurance: ["금융감독원 1332 (보험 민원·분쟁조정)", "내보험다보여·내보험찾아줌"],
  realty: ["주택도시보증공사 1566-9009", "대한법률구조공단 132 (주택임대차분쟁조정)", "인터넷등기소"],
  biz: ["중소기업 통합콜센터 1357", "소상공인시장진흥공단 1588-5302"],
  welfare: ["보건복지상담센터 129", "복지로", "한국의료분쟁조정중재원 1670-2545"],
};
// 사무소에서 만든 보충 도구(상담 실무용). 맨 앞에 보여요.
const KR_OFFICE_TOOLS: Partial<Record<RoomId, OfficeTool[]>> = {
  tax: [{ href: "/ko/client-deadline-board/", title: "고객별 신고 마감 보드", who: "pro" }, { href: "/ko/midyear-leaver-year-end-settlement/", title: "중도퇴사자 연말정산 미리보기", who: "public" }, { href: "/ko/simplified-withholding-tax-calculator/", title: "간이세액표 월 원천징수", who: "pro" }, { href: "/ko/free-expert-representation-check/", title: "국선대리인 요건 확인", who: "public" }, { href: "/ko/capital-gains-necessary-expenses-check/", title: "양도세 필요경비 점검", who: "public" }],
  labor: [{ href: "/ko/life-event-navigator/#unpaid", title: "임금체불 때 할 일", who: "public" }, { href: "/ko/life-event-navigator/#injury", title: "산재 때 할 일", who: "public" }, { href: "/ko/quit-one-stop-calculator/", title: "퇴사 원스톱 (퇴직금·세금·실업급여)", who: "public" }, { href: "/ko/join-leave-month-insurance-calculator/", title: "입사·퇴사 달 4대보험료", who: "pro" }, { href: "/ko/free-expert-representation-check/", title: "노동위원회 무료 대리 요건", who: "public" }],
  admin: [{ href: "/ko/job-desk/", title: "직업별 세금·노무 창구", who: "public" }, { href: "/ko/before-expert-visit/", title: "전문가 상담 전 준비", who: "public" }, { href: "/ko/consult-memo-builder/", title: "상담 메모 만들기", who: "public" }, { href: "/ko/life-event-navigator/#refund", title: "온라인 구매 환불 거절", who: "public" }, { href: "/ko/life-event-navigator/", title: "인생 사건 내비", who: "public" }],
  insurance: [{ href: "/ko/life-event-navigator/#accident", title: "교통사고 때 할 일", who: "public" }],
  realty: [{ href: "/ko/life-event-navigator/#homebuy", title: "집 살 때 할 일·기한", who: "public" }, { href: "/ko/job-desk/#landlord", title: "집주인 창구", who: "public" }, { href: "/ko/life-event-navigator/#move", title: "이사·전월세 때 할 일", who: "public" }, { href: "/ko/capital-gains-necessary-expenses-check/", title: "양도세 필요경비 점검", who: "public" }, { href: "/ko/appraisal-fee-calculator/", title: "감정평가 수수료", who: "public" }, { href: "/ko/life-event-navigator/#shoplease", title: "상가 임대차·권리금", who: "public" }],
  legal: [{ href: "/ko/legal-aid-eligibility-check/", title: "법률구조공단 소송지원 대상", who: "public" }, { href: "/ko/demand-letter-builder/", title: "내용증명 작성 도우미", who: "public" }, { href: "/ko/life-event-navigator/#lend", title: "빌려준 돈 못 받을 때", who: "public" }, { href: "/ko/life-event-navigator/#divorce", title: "이혼할 때 할 일·기한", who: "public" }, { href: "/ko/life-event-navigator/#fraud", title: "보이스피싱·사기 피해", who: "public" }],
  biz: [{ href: "/ko/life-event-navigator/#startbiz", title: "사업 시작할 때 할 일", who: "public" }, { href: "/ko/life-event-navigator/#closebiz", title: "폐업할 때 할 일", who: "public" }, { href: "/ko/job-desk/#cafe", title: "가게 사장 창구", who: "public" }, { href: "/ko/business-must-do-checklist/", title: "사업자 필수 할 일", who: "public" }],
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
const AREA_ROOM: Record<Area, Exclude<BaseRoomId, "plan" | "trade">> = { tax: "tax", labor: "labor", tenancy: "admin", consumer: "admin", claims: "legal" };
const COUNTRY_TAX_SKILL: Partial<Record<FloorId, string[]>> = {
  JP: ["oiyo-jp-tax-guide"], US: ["oiyo-us-tax-guide"], FR: ["oiyo-fr-tax-guide"], ES: ["oiyo-es-tax-guide"], CN: ["oiyo-cn-tax-guide"], UK: ["oiyo-uk-tax-guide"], TW: ["oiyo-tw-tax-guide"], DE: ["oiyo-de-guide"], SG: ["oiyo-sg-guide"],
};
// Which countries each world skill really covers (from each SKILL.md description, 2026-11-23). A skill shows only on floors it covers.
const WORLD_ROOM_SKILLS: Record<Exclude<BaseRoomId, "plan" | "trade">, [string, FloorId[]][]> = {
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
const EXTRA_ROOM: Record<string, Exclude<BaseRoomId, "plan" | "trade">> = { "canada-mortgage-stress-test-calculator": "admin", "canada-federal-vacation-calculator": "labor", "canada-federal-holiday-pay-calculator": "labor", "australia-job-offer-comparison": "labor", "australia-annual-leave-accrual-calculator": "labor" };
const rel = (url: string) => url.replace("https://tools.oiyo.net", "");
// 나라별 페이지 중 WORLD_TOOLS 목록에 빠져 어느 방에도 안 보이던 것(2026-11-23 점검, 21개). 새 계산 없음, 연결만 해요.
const WORLD_EXTRA: Partial<Record<FloorId, Partial<Record<Exclude<BaseRoomId, "plan" | "trade">, OfficeTool[]>>>> = {
  CN: { tax: [{ href: "/zh/china-tax-agent-scope/", title: "谁可以代办涉税业务？涉税专业服务与免费办税渠道", who: "public" }] },
  DE: { labor: [
    { href: "/de/germany-annual-leave-minimum/", title: "Gesetzlicher Mindesturlaub bei fester Arbeitswoche", who: "public" },
    { href: "/de/germany-gross-offer-comparison/", title: "Bestätigte Brutto-Gehaltsangebote vergleichen", who: "public" },
    { href: "/de/germany-work-rest-guide/", title: "Arbeitszeit und Ruhezeiten: Unterlagen prüfen", who: "public" },
  ] },
  ES: { labor: [
    { href: "/es/spain-final-pay-checklist/", title: "Revisar el finiquito: documentos y conceptos", who: "public" },
    { href: "/es/spain-salary-payments-comparison/", title: "Comparar salario en 12 o 14 pagas: bruto anual", who: "public" },
  ] },
  FR: { labor: [{ href: "/fr/france-resignation-notice-guide/", title: "Trouver son préavis de démission", who: "public" }] },
  JP: { labor: [
    { href: "/ja/japan-overtime-calculator/", title: "日本の残業・深夜・法定休日手当を計算", who: "public" },
    { href: "/ja/japan-fixed-overtime-comparison/", title: "固定残業代と実際の時間外手当を比較", who: "public" },
  ] },
  SG: { labor: [
    { href: "/en/singapore-overtime-calculator/", title: "Singapore monthly-rated overtime pay breakdown", who: "public" },
    { href: "/en/singapore-rest-day-pay-calculator/", title: "Singapore rest-day pay: employer vs employee request", who: "public" },
    { href: "/en/singapore-incomplete-month-calculator/", title: "Singapore incomplete-month salary calculator", who: "public" },
  ] },
  TW: {
    tax: [{ href: "/zh/taiwan-tax-agent-scope/", title: "誰可以代理報稅？記帳士、會計師的業務範圍與免費稅務諮詢", who: "public" }],
    labor: [
      { href: "/zh/taiwan-annual-leave-calculator/", title: "台灣特休天數與週年制日曆", who: "public" },
      { href: "/zh/taiwan-overtime-pay-calculator/", title: "台灣月薪制加班費：平日、休息日與國定假日", who: "public" },
      { href: "/zh/taiwan-lianjia-2027/", title: "2027年（民國116年）連假與請假攻略", who: "public" },
    ],
  },
  UK: {
    tax: [{ href: "/en/uk-tax-adviser-registration-free-help/", title: "Who can deal with HMRC for you? Tax adviser registration and free tax help", who: "public" }],
    labor: [{ href: "/en/uk-annual-leave-planner-2027/", title: "Booking leave around 2027 bank holidays", who: "public" }],
    legal: [{ href: "/en/uk-debt-relief-options/", title: "UK debt options: DRO, IVA or bankruptcy (England & Wales)", who: "public" }],
  },
  US: {
    labor: [{ href: "/en/us-pto-planner-2027/", title: "Where to put PTO in 2027", who: "public" }],
    legal: [{ href: "/en/us-bankruptcy-income-worksheet/", title: "US bankruptcy income worksheet — six-month average", who: "public" }],
  },
};
export const WORLD_EXTRA_TOOLS = WORLD_EXTRA;
function worldRoom(fl: FloorId, id: Exclude<BaseRoomId, "plan" | "trade">): Room {
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
  const extra = (WORLD_EXTRA[fl]?.[id] ?? []).filter((x) => !tools.some((t) => t.href === x.href));
  tools = [...tools, ...extra];
  const skills = [...(id === "tax" ? COUNTRY_TAX_SKILL[fl] ?? [] : []), ...WORLD_ROOM_SKILLS[id].filter(([, c]) => c.includes(fl)).map(([s]) => s), ...(id === "tax" && fl !== "CA" && fl !== "AU" ? ["oiyo-world-law-intake"] : [])].map((s) => ({ id: s, zip: zip(s) }));
  return { id, tools, skills, help, gaps: 0 };
}

// ── 통관·무역실 (2026-11-23, 세운 요청: 다른 직업·사무소) ──
// 한국 본관은 관세(customs) 직업 도구를 이 방으로 옮겼어요. 해외 층은 소액 수입(직구·소포) 면세·과세 기준을
// 공식 원문으로 확인한 나라만 열어요(일본·영국·캐나다). 미국·EU·싱가포르·대만·호주·중국은 원문 미확인이라 비워 둬요.
// 관세 분류·통관 대리·세율 계산은 하지 않아요.
const TRADE_TOOLS: Partial<Record<FloorId, OfficeTool[]>> = {
  JP: [{ href: "/ja/japan-import-10000-yen-duty-free/", title: "個人輸入1万円以下の免税チェック", who: "public" }],
  UK: [{ href: "/en/uk-parcel-import-vat-duty-135/", title: "Parcel from abroad: VAT and duty check", who: "public" }],
  CA: [{ href: "/en/canada-mail-import-20-exemption/", title: "Mail import: $20 exemption check", who: "public" }],
};
const TRADE_HELP: Partial<Record<FloorId, string[]>> = {
  JP: ["税関 カスタムスアンサー"],
  UK: ["GOV.UK Trade Tariff"],
};
export const TRADE_FLOOR_TOOLS = TRADE_TOOLS;
function tradeRoom(fl: FloorId): Room {
  return { id: "trade", tools: TRADE_TOOLS[fl] ?? [], skills: [], help: TRADE_HELP[fl] ?? [], gaps: 0 };
}

// ── 재무설계실 (2026-11-23, 세운 요청: 재무설계 전문가도 나라별로) ──
// 새 계산은 없어요. 나라마다 이미 있는 저축·연금·절세계좌·대출 도구를 그 나라 제도 이름 그대로 모아요.
// 해외 무료 창구는 2026-11-23에 공식 사이트에서 이름·번호를 확인한 것만 적었어요(확인 못 한 나라는 비워 둠).
// 투자 권유·상품 추천은 하지 않아요. 방 이름은 분야(재무설계)로만 부르고 자격 이름을 쓰지 않아요.
const PLAN_TOOLS: Partial<Record<FloorId, OfficeTool[]>> = {
  KR: [
    { href: "/ko/household-money-checkup/", title: "가계 재무 건강검진", who: "public" },
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
  return { id, flag: FLAGS[id], mcp: id === "KR" ? MCP : `${MCP}/world`, rooms: id === "KR" ? KR_ROOMS.map((r) => (r === "plan" ? planRoom(id) : krRoom(r))) : ROOMS.map((r) => (r === "plan" ? planRoom(id) : r === "trade" ? tradeRoom(id) : worldRoom(id, r))) };
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
