// 고객별 신고 마감 보드 (2026-11-23, 실무 오피스 보충 도구 #1)
// 실무자가 맡은 고객 여러 명의 세금·노무 마감을 한 화면에 모아요. 새 기한 값은 없어요:
// biz-checklist의 taxCalendar(법정 기한 + 토·일·공휴일이면 다음 영업일)를 고객마다 돌려서 날짜별로 합쳐요.
import { taxCalendar, type TaxProfile } from "./biz-checklist.ts";

export const BOARD_AS_OF = "2026-11-23";

export interface Client {
  id: string;
  name: string;
  profile: TaxProfile;
}

export interface BoardItem {
  due: string;
  statutory: string;
  title: string;
  basis: string;
  note?: string;
  area: string;
  clients: string[];
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** 고객들의 일정을 날짜·제목별로 합쳐요. from 이상 to 이하만. */
export function clientBoard(clients: Client[], from: string, to: string): BoardItem[] {
  const years = new Set<number>();
  for (let y = +from.slice(0, 4); y <= +to.slice(0, 4); y++) years.add(y);
  const map = new Map<string, BoardItem>();
  for (const c of clients) {
    for (const y of years) {
      for (const e of taxCalendar(y, c.profile).events) {
        if (e.due < from || e.due > to) continue;
        const key = `${e.due}|${e.title}`;
        const prev = map.get(key);
        if (prev) { if (!prev.clients.includes(c.name)) prev.clients.push(c.name); }
        else map.set(key, { due: e.due, statutory: e.statutory, title: e.title, basis: e.basis, note: e.note, area: e.area, clients: [c.name] });
      }
    }
  }
  return [...map.values()].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.title < b.title ? -1 : 1));
}

/** 오늘부터 며칠 남았는지와 급한 정도 */
export function urgency(today: string, due: string): { days: number; level: "late" | "today" | "week" | "month" | "later" } {
  const days = dayDiff(today, due);
  const level = days < 0 ? "late" : days === 0 ? "today" : days <= 7 ? "week" : days <= 31 ? "month" : "later";
  return { days, level };
}

/** 고객별 남은 건수 요약 */
export function perClient(items: BoardItem[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) for (const n of it.clients) out[n] = (out[n] ?? 0) + 1;
  return out;
}

// calendar-feeds.ts의 fold와 같아요(그 파일은 astronomy-engine을 불러서 화면 번들이 커지므로 따로 둬요).
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > (parts.length === 0 ? 75 : 74)) { parts.push(cur); cur = ""; bytes = 0; }
    cur += ch;
    bytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const compact = (d: string) => d.replace(/-/g, "");
const nextDay = (d: string) => { const t = new Date(`${d}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10).replace(/-/g, ""); };
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(36); }

/** 내려받기용 .ics. 고객 이름은 일정 제목 앞에 붙어요. 브라우저에서만 만들어요. */
export function boardIcs(items: BoardItem[], stamp = BOARD_AS_OF, alarmDays = 3): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OIYO Tools//client deadline board//KO", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:고객 신고 마감", "X-WR-TIMEZONE:Asia/Seoul"];
  for (const it of items) {
    const who = it.clients.join("·");
    const summary = `[${who}] ${it.title}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:board-${compact(it.due)}-${hash(summary)}@tools.oiyo.net`,
      `DTSTAMP:${compact(stamp)}T000000Z`,
      `DTSTART;VALUE=DATE:${compact(it.due)}`,
      `DTEND;VALUE=DATE:${nextDay(it.due)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(`${it.basis}${it.statutory !== it.due ? ` · 법정 기한 ${it.statutory}(휴일이라 다음 영업일)` : ""}${it.note ? ` · ${it.note}` : ""}`)}`,
      "TRANSP:TRANSPARENT",
    );
    if (alarmDays > 0) lines.push("BEGIN:VALARM", `TRIGGER:-P${alarmDays}D`, "ACTION:DISPLAY", `DESCRIPTION:${esc(`${summary} ${alarmDays}일 전`)}`, "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
