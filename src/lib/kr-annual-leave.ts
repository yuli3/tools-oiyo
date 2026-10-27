// 한국 연차유급휴가 (근로기준법 제60조, 상시 5인 이상 사업장). Checked 2026-10-27.
// - 1년 미만(또는 출근율 80% 미만): 1개월 개근마다 1일, 최대 11일(제60조 제2항).
// - 1년간 80% 이상 출근: 15일(제1항). 3년 이상이면 최초 1년을 넘는 매 2년마다 1일, 총 25일 한도(제4항).
// - 연차는 1년(또는 1개월) 근로를 마친 다음 날 근로관계가 있어야 생겨요(대법원 2021다227100,
//   고용노동부 2021-12-16 행정해석). 그래서 딱 1년(365일)만 일하고 끝나면 15일은 생기지 않아요.
// - 기간 계산은 입사일을 1일째로 세고, 해당일이 없는 달은 다음 달 1일에 생긴다고 봐요.

export const ANNUAL_LEAVE_AS_OF = "2026-10-27";

const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** 입사일에서 months개월 뒤 연차가 생기는 날. 해당일이 없으면 다음 달 1일. */
export function arisingDate(start: string, months: number): string {
  const [y, m, d] = start.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return d <= last ? iso(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), d)) : iso(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 1));
}

/** 근속 n년을 채운 날 생기는 연차일수. */
export function yearlyLeaveDays(completedYears: number): number {
  if (completedYears < 1) return 0;
  return Math.min(25, 15 + Math.floor((completedYears - 1) / 2));
}

export interface LeaveStatus {
  completedYears: number;
  completedMonths: number;
  /** 지금 기준 가장 최근에 생긴(또는 1년 차에 쌓인) 연차일수 */
  current: number;
  currentKind: "monthly" | "yearly";
  next: { date: string; days: number; kind: "monthly" | "yearly" };
}

/** asOf에 근로관계가 유지되고 매달 개근·출근율 80% 이상이라고 가정한 연차 현황. */
export function annualLeaveStatus(start: string, asOf: string): LeaveStatus | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(asOf) || utc(asOf) < utc(start)) return null;
  let months = 0;
  while (utc(arisingDate(start, months + 1)) <= utc(asOf)) months++;
  const years = Math.floor(months / 12);
  if (years < 1) {
    const nextMonths = months + 1;
    return {
      completedYears: 0,
      completedMonths: months,
      current: Math.min(11, months),
      currentKind: "monthly",
      next: nextMonths === 12 ? { date: arisingDate(start, 12), days: 15, kind: "yearly" } : { date: arisingDate(start, nextMonths), days: 1, kind: "monthly" },
    };
  }
  return {
    completedYears: years,
    completedMonths: months,
    current: yearlyLeaveDays(years),
    currentKind: "yearly",
    next: { date: arisingDate(start, (years + 1) * 12), days: yearlyLeaveDays(years + 1), kind: "yearly" },
  };
}

/** 미사용 연차수당 = 남은 일수 × 1일 통상임금(통상시급 × 1일 소정근로시간). */
export function unusedLeavePay(unusedDays: number, hourlyWage: number, dailyHours: number): number {
  return Math.floor(Math.max(0, unusedDays) * Math.max(0, hourlyWage) * Math.max(0, dailyHours));
}
