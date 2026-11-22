// 구독형 달력(webcal) 피드 (2026-11-22, 창의 제안 #1)
// 한 번 구독하면 구글·아이폰·아웃룩 달력이 매일 이 파일을 다시 읽어요. 일정 하나하나에 관련 도구 링크를 붙여요.
// 세금 마감은 biz-checklist의 taxCalendar(토·일·공휴일이면 다음 영업일)를 그대로 써요. 새 계산은 없어요.
// 공휴일은 kr-calendar.mjs, 24절기는 astronomy-engine으로 태양 황경을 빌드할 때 계산해요(한국 표준시 날짜).
import { SearchSunLongitude } from "astronomy-engine";
import { getHolidays } from "./kr-calendar.mjs";
import { taxCalendar, type TaxProfile } from "./biz-checklist.ts";

export const FEEDS_AS_OF = "2026-11-22";
export const FEED_YEARS = [2026, 2027];
const SITE = "https://tools.oiyo.net";

export interface FeedEvent {
  date: string; // YYYY-MM-DD (하루 종일)
  title: string;
  description: string;
  url: string;
  /** 며칠 전에 알릴지. 없으면 알림 없음 */
  alarmDays?: number;
}

export interface FeedDef {
  slug: string;
  name: string;
  short: string;
  who: string;
  group: "life" | "tax";
}

export const FEEDS: FeedDef[] = [
  { slug: "kr-holidays", name: "대한민국 공휴일", short: "공휴일·대체공휴일", who: "누구나", group: "life" },
  { slug: "kr-solar-terms", name: "24절기", short: "입춘·동지 같은 24절기", who: "누구나", group: "life" },
  { slug: "kr-tax-indiv-general", name: "세금 마감: 개인 일반과세자", short: "부가세·종합소득세 마감", who: "개인 일반과세자(직원 없음)", group: "tax" },
  { slug: "kr-tax-indiv-simple", name: "세금 마감: 개인 간이과세자", short: "간이 부가세·종합소득세 마감", who: "개인 간이과세자(직원 없음)", group: "tax" },
  { slug: "kr-tax-indiv-exempt", name: "세금 마감: 면세 개인사업자", short: "사업장현황신고·종합소득세 마감", who: "면세 개인사업자(직원 없음)", group: "tax" },
  { slug: "kr-tax-corp", name: "세금 마감: 법인(12월 결산)", short: "법인세·부가세 마감", who: "12월 결산 일반 법인(직원 없음)", group: "tax" },
  { slug: "kr-tax-employer", name: "세금 마감: 직원·프리랜서에게 돈 주는 사업장", short: "원천세·지급명세서 마감(매월)", who: "위 피드에 더해 구독", group: "tax" },
];

const CHECKLIST = `${SITE}/ko/business-must-do-checklist/`;
const PAGE = `${SITE}/ko/calendar-subscribe/`;

function toolFor(title: string): string {
  if (title.includes("부가세")) return `${SITE}/ko/vat-calculator/`;
  if (title.includes("지급명세서")) return `${SITE}/ko/withholding-statement-penalty-calculator/`;
  return CHECKLIST;
}

const PROFILES: Record<string, TaxProfile> = {
  "kr-tax-indiv-general": { entity: "indiv", vat: "general", employer: false },
  "kr-tax-indiv-simple": { entity: "indiv", vat: "simple", employer: false },
  "kr-tax-indiv-exempt": { entity: "indiv", vat: "exempt", employer: false },
  "kr-tax-corp": { entity: "corp", vat: "general", employer: false },
};

function taxEvents(year: number, slug: string): FeedEvent[] {
  let events;
  if (slug === "kr-tax-employer") {
    // 직원이 있을 때만 생기는 일정 = employer:true 결과에서 employer:false 결과를 뺀 것
    const base = new Set(taxCalendar(year, { entity: "indiv", vat: "general", employer: false }).events.map((e) => e.title + e.due));
    events = taxCalendar(year, { entity: "indiv", vat: "general", employer: true }).events.filter((e) => !base.has(e.title + e.due));
  } else {
    events = taxCalendar(year, PROFILES[slug]).events;
  }
  return events.map((e) => {
    const moved = e.due !== e.statutory ? ` 법정 기한 ${e.statutory}이 휴일이라 다음 영업일로 옮겼어요.` : "";
    const url = toolFor(e.title);
    return {
      date: e.due,
      title: e.title,
      description: `근거: ${e.basis}.${e.note ? ` ${e.note}.` : ""}${moved} 일정은 참고용이에요. 고지서·홈택스 안내를 꼭 함께 확인하세요. 미리 계산하기: ${url}`,
      url,
      alarmDays: 7,
    };
  });
}

function holidayEvents(year: number): FeedEvent[] {
  return (getHolidays(year) as { date: string; name: string }[]).map((h) => ({
    date: h.date,
    title: h.name,
    description: `쉬는 날이에요. 연차를 붙이면 며칠 쉴 수 있는지: ${SITE}/ko/annual-leave-combo-2027/`,
    url: `${SITE}/ko/annual-leave-combo-2027/`,
  }));
}

// 황경 0°(춘분)부터 15°씩
const TERM_NAMES = ["춘분", "청명", "곡우", "입하", "소만", "망종", "하지", "소서", "대서", "입추", "처서", "백로", "추분", "한로", "상강", "입동", "소설", "대설", "동지", "소한", "대한", "입춘", "우수", "경칩"];

export interface SolarTerm { name: string; longitude: number; date: string; timeKst: string }

/** 그해(한국 표준시 1월 1일부터) 24절기. 태양 황경이 15°의 배수가 되는 순간을 찾아요. */
export function solarTerms(year: number): SolarTerm[] {
  const start = new Date(Date.UTC(year, 0, 1) - 9 * 3600_000); // KST 1월 1일 0시
  const out: SolarTerm[] = [];
  TERM_NAMES.forEach((name, i) => {
    const lon = i * 15;
    const t = SearchSunLongitude(lon, start, 366);
    if (!t) return;
    const kst = new Date(t.date.getTime() + 9 * 3600_000);
    const iso = kst.toISOString();
    out.push({ name, longitude: lon, date: iso.slice(0, 10), timeKst: iso.slice(11, 16) });
  });
  return out.filter((s) => s.date.startsWith(String(year))).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function termEvents(year: number): FeedEvent[] {
  return solarTerms(year).map((s) => ({
    date: s.date,
    title: s.name,
    description: `태양 황경 ${s.longitude}° · ${s.timeKst} (한국 표준시, 천문 계산). ${PAGE}`,
    url: PAGE,
  }));
}

export function feedEvents(slug: string, years = slug === "kr-solar-terms" ? [...FEED_YEARS, 2028] : FEED_YEARS): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const y of years) {
    if (slug === "kr-holidays") out.push(...holidayEvents(y));
    else if (slug === "kr-solar-terms") out.push(...termEvents(y));
    else out.push(...taxEvents(y, slug));
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ───────── iCalendar(RFC 5545) ─────────
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** 한 줄 75바이트로 접기(UTF-8 글자 중간에서 자르지 않음) */
export function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // 이어지는 줄은 앞 공백 1바이트
    if (bytes + b > limit) {
      parts.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h.toString(36);
}

const nextDay = (d: string) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 1);
  return t.toISOString().slice(0, 10).replace(/-/g, "");
};

export function buildIcs(feed: FeedDef, events = feedEvents(feed.slug)): string {
  const stamp = FEEDS_AS_OF.replace(/-/g, "") + "T000000Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OIYO Tools//calendar feeds//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(`OIYO ${feed.name}`)}`,
    `X-WR-CALDESC:${esc(`${feed.short}. 매일 새로 읽어요. ${PAGE}`)}`,
    "X-WR-TIMEZONE:Asia/Seoul",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];
  for (const e of events) {
    const d = e.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${feed.slug}-${d}-${hash(e.title)}@tools.oiyo.net`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${nextDay(e.date)}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.description)}`,
      `URL:${e.url}`,
      "TRANSP:TRANSPARENT",
    );
    if (e.alarmDays) {
      lines.push("BEGIN:VALARM", `TRIGGER:-P${e.alarmDays}D`, "ACTION:DISPLAY", `DESCRIPTION:${esc(`${e.title} ${e.alarmDays}일 전`)}`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export const feedUrl = (slug: string) => `${SITE}/cal/${slug}.ics`;
export const webcalUrl = (slug: string) => feedUrl(slug).replace(/^https:/, "webcal:");
export const googleAddUrl = (slug: string) => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(slug))}`;
