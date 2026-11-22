/**
 * 연차 꿀조합(징검다리 휴가) 찾기 (2026-11-21). 순수 함수.
 * 주말·공휴일(KR_HOLIDAYS)·회사 휴무일을 쉬는 날로 보고, 연차 N일 이하로 만들 수 있는
 * 가장 긴 연속 휴무 구간을 찾아요. 날짜는 모두 UTC 자정 기준 "YYYY-MM-DD" 문자열로 다뤄요
 * (브라우저 시간대에 따라 하루 밀리지 않게).
 */
import { KR_HOLIDAYS } from "./kr-business-day.ts";

export interface BridgeWindow {
  start: string;
  end: string;
  /** 연속으로 쉬는 날 수 */
  days: number;
  /** 써야 하는 연차 날짜 */
  leave: string[];
  /** 연차 1일당 쉬는 날 */
  ratio: number;
}

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const parse = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

export function holidaySet(year: number, extra: string[] = [], skip: string[] = []): Set<string> {
  const set = new Set<string>();
  for (const y of [year - 1, year, year + 1]) for (const md of KR_HOLIDAYS[y] ?? []) set.add(`${y}-${md}`);
  for (const d of extra) set.add(d);
  for (const d of skip) set.delete(d);
  return set;
}

export function isOff(d: string, holidays: Set<string>, saturdayWork = false): boolean {
  const wd = new Date(parse(d)).getUTCDay();
  return wd === 0 || (wd === 6 && !saturdayWork) || holidays.has(d);
}

/** 그 해 날짜 목록(앞뒤로 10일 여유: 연말·연초 연휴도 이어 보이게) */
export function yearDays(year: number): string[] {
  const out: string[] = [];
  for (let t = Date.UTC(year, 0, 1) - 10 * DAY; t <= Date.UTC(year, 11, 31) + 10 * DAY; t += DAY) out.push(iso(t));
  return out;
}

/**
 * 연차 maxLeave일 이하로 만들 수 있는 연속 휴무 구간(앞뒤를 쉬는 날로 끝까지 늘린 것).
 * 시작일이 그 해에 걸친 것만, 연차를 1일 이상 쓰는 것만. 긴 순 → 연차 적은 순.
 */
export function bridgeWindows(year: number, maxLeave: number, opts: { extra?: string[]; skip?: string[]; saturdayWork?: boolean; minDays?: number; /** 다른 나라 공휴일 표(있으면 KR 표 대신) */ holidays?: Set<string>; /** 이 날짜 이전에 시작하는 구간은 빼요 */ fromDate?: string; /** 평일 공휴일이 하나도 안 낀 구간은 빼요 */ requireHoliday?: boolean; /** 주말이어도 출근하는 날(중국 调休 등) */ workdays?: Set<string> } = {}): BridgeWindow[] {
  const hol = opts.holidays ? new Set([...opts.holidays, ...(opts.extra ?? [])]) : holidaySet(year, opts.extra, opts.skip);
  const days = yearDays(year);
  const off = days.map((d) => !opts.workdays?.has(d) && isOff(d, hol, opts.saturdayWork));
  const n = days.length;
  const seen = new Map<string, BridgeWindow>();
  for (let i = 0; i < n; i++) {
    if (i > 0 && off[i - 1]) continue; // 구간은 쉬는 날 바로 다음 칸에서 시작하지 않게(왼쪽 끝까지 늘린 것만)
    let used = 0;
    const leave: string[] = [];
    for (let j = i; j < n; j++) {
      if (!off[j]) {
        if (used === maxLeave) break;
        used++;
        leave.push(days[j]);
      }
      const rightClosed = j + 1 >= n || !off[j + 1];
      if (!rightClosed || used === 0) continue;
      const len = j - i + 1;
      if (len < (opts.minDays ?? 3)) continue;
      const start = days[i];
      if (start.slice(0, 4) !== String(year) && days[j].slice(0, 4) !== String(year)) continue;
      if (opts.fromDate && start < opts.fromDate) continue;
      if (opts.requireHoliday && !days.slice(i, j + 1).some((d) => hol.has(d) && ![0, 6].includes(new Date(parse(d)).getUTCDay()))) continue;
      const w: BridgeWindow = { start, end: days[j], days: len, leave: [...leave], ratio: len / used };
      const key = `${start}|${days[j]}`;
      const prev = seen.get(key);
      if (!prev || prev.leave.length > w.leave.length) seen.set(key, w);
    }
  }
  return [...seen.values()].sort((a, b) => b.days - a.days || a.leave.length - b.leave.length || a.start.localeCompare(b.start));
}

/** 연차 1~maxLeave일 각각의 최장 연휴 */
export function bestByLeave(year: number, maxLeave: number, opts: Parameters<typeof bridgeWindows>[2] = {}): { leave: number; best: BridgeWindow | null }[] {
  return Array.from({ length: maxLeave }, (_, k) => {
    const ws = bridgeWindows(year, k + 1, opts).filter((w) => w.leave.length === k + 1);
    return { leave: k + 1, best: ws[0] ?? null };
  });
}

/** 효율 좋은 순(연차 1일당 쉬는 날) — 겹치는 구간은 하나만 */
export function topEfficient(year: number, maxLeave: number, limit = 10, opts: Parameters<typeof bridgeWindows>[2] = {}): BridgeWindow[] {
  // 그냥 금요일 하나 붙인 3일 주말은 빼요(공휴일이 끼어야 꿀조합).
  const ws = bridgeWindows(year, maxLeave, { minDays: 4, ...opts }).sort((a, b) => b.ratio - a.ratio || b.days - a.days || a.start.localeCompare(b.start));
  const out: BridgeWindow[] = [];
  for (const w of ws) {
    if (out.some((o) => !(w.end < o.start || w.start > o.end))) continue;
    out.push(w);
    if (out.length >= limit) break;
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

/** 그 해 공휴일(주말 제외 평일에 떨어지는 것) 수 */
export function weekdayHolidays(year: number): number {
  const hol = holidaySet(year);
  return [...hol].filter((d) => d.startsWith(`${year}-`) && ![0, 6].includes(new Date(parse(d)).getUTCDay())).length;
}
