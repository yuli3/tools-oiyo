// 연차 관리대장 (여러 직원, 입사일 기준). 계산은 lib/kr-annual-leave.ts를 그대로 써요.
// 근로기준법 제60조(5인 이상): 1년 미만 매달 1일(최대 11일), 1년 80% 이상 출근 15일, 3년 이상 2년마다 1일(최대 25일).
// 사용 기한: 제60조(2026-11 현행 조문) — 1년간 쓰지 않으면 소멸, 다만 1년 미만 월차는 최초 1년 근로가 끝날 때까지.
import { ANNUAL_LEAVE_AS_OF, annualLeaveStatus, arisingDate } from "./kr-annual-leave.ts";

export const LEAVE_LEDGER_AS_OF = ANNUAL_LEAVE_AS_OF;

export interface LeaveRow { name: string; start: string; used: number }
export interface LeaveLine {
  name: string;
  start: string;
  ok: boolean;
  years: number;
  kind: "monthly" | "yearly" | "";
  granted: number;
  used: number;
  left: number;
  /** 지금 가진 연차를 써야 하는 마지막 날 (이날까지) */
  useBy: string;
  nextDate: string;
  nextDays: number;
}

const dayBefore = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
};

export function leaveLine(row: LeaveRow, asOf: string): LeaveLine {
  const s = annualLeaveStatus(row.start, asOf);
  const used = Math.max(0, Number(row.used) || 0);
  if (!s) return { name: row.name, start: row.start, ok: false, years: 0, kind: "", granted: 0, used, left: 0, useBy: "", nextDate: "", nextDays: 0 };
  // 연차가 생긴 날: 1년 미만이면 입사 1년 되는 날 전날까지, 1년 이상이면 최근 발생일부터 1년(다음 발생일 전날)까지
  const useBy = s.currentKind === "monthly" ? dayBefore(arisingDate(row.start, 12)) : dayBefore(arisingDate(row.start, (s.completedYears + 1) * 12));
  return {
    name: row.name, start: row.start, ok: true, years: s.completedYears, kind: s.currentKind,
    granted: s.current, used, left: Math.max(0, s.current - used), useBy,
    nextDate: s.next.date, nextDays: s.next.days,
  };
}

export function leaveLedger(rows: LeaveRow[], asOf: string) {
  const lines = rows.map((r) => leaveLine(r, asOf));
  const ok = lines.filter((l) => l.ok);
  return {
    lines,
    totals: { granted: ok.reduce((a, l) => a + l.granted, 0), used: ok.reduce((a, l) => a + l.used, 0), left: ok.reduce((a, l) => a + l.left, 0) },
    over: lines.filter((l) => l.ok && l.used > l.granted).map((l) => l.name),
  };
}

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
export function leaveCsv(rows: LeaveRow[], asOf: string): string {
  const { lines } = leaveLedger(rows, asOf);
  const head = ["성명", "입사일", "근속(년)", "구분", "발생", "사용", "남음", "사용 기한", "다음 발생일", "다음 발생 일수"];
  const body = lines.map((l) => [l.name, l.start, l.years, l.kind === "monthly" ? "1년 미만(매달)" : l.kind === "yearly" ? "연 단위" : "날짜 확인", l.granted, l.used, l.left, l.useBy, l.nextDate, l.nextDays]);
  return "﻿" + [head, ...body].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
