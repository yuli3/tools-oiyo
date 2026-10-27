import { useState } from "react";
import { annualLeaveStatus, unusedLeavePay } from "../../lib/kr-annual-leave";
import DateField from "./payroll/DateField";
import NumberField from "./payroll/NumberField";

type Lang = "ko" | "en";
const T = {
  ko: {
    start: "입사일", asOf: "기준일(오늘 또는 마지막 근무일 다음 날)", hourly: "통상시급", hours: "1일 소정근로시간", unused: "남은 연차",
    won: "원", hoursUnit: "시간", days: "일",
    monthlyNow: (n: number, m: number) => `입사 ${m}개월 · 지금까지 생긴 월 단위 연차 ${n}일`,
    yearlyNow: (n: number, y: number) => `근속 ${y}년 · 올해 연차 ${n}일`,
    next: (d: string, n: number, yearly: boolean) => `다음: ${d}에 ${yearly ? `연차 ${n}일` : "1일"} 생겨요`,
    pay: "미사용 연차수당", payNote: (d: number, w: string) => `남은 ${d}일 × 1일 통상임금 ${w}`,
    invalid: "입사일과 기준일을 넣고, 기준일은 입사일 뒤로 맞춰 주세요.",
    notes: [
      "상시 5인 이상 사업장, 매달 개근·연간 출근율 80% 이상을 가정했어요.",
      "1년 미만 월 단위 연차(최대 11일)는 입사 1년이 되면 사라져요. 그전에 쓰거나 수당으로 받아요.",
      "1년(365일)만 일하고 끝나는 계약이면 15일은 생기지 않아요. 다음 날까지 근로관계가 있어야 해요.",
      "회사가 사용촉진(제61조)을 제대로 했다면 남은 연차의 수당 의무가 없을 수 있어요.",
    ],
  },
  en: {
    start: "Start date", asOf: "As of (today, or the day after your last working day)", hourly: "Ordinary hourly wage", hours: "Scheduled hours per day", unused: "Unused leave",
    won: "KRW", hoursUnit: "h", days: "days",
    monthlyNow: (n: number, m: number) => `${m} months in · ${n} monthly leave days so far`,
    yearlyNow: (n: number, y: number) => `${y} years of service · ${n} days this year`,
    next: (d: string, n: number, yearly: boolean) => `Next: ${yearly ? `${n} days` : "1 day"} on ${d}`,
    pay: "Unused leave allowance", payNote: (d: number, w: string) => `${d} unused days × daily ordinary wage ${w}`,
    invalid: "Enter a start date and an as-of date after it.",
    notes: [
      "Assumes a workplace with 5+ regular employees, full monthly attendance and 80%+ yearly attendance.",
      "First-year monthly leave (up to 11 days) expires one year after hire; use it or get paid for it.",
      "If a contract ends after exactly one year (365 days), the 15 days do not arise: the employment must continue into the next day.",
      "If the employer ran the statutory leave-use promotion (Art. 61), unused leave may not be paid.",
    ],
  },
} as const;

export default function KrAnnualLeaveCalculator({ locale }: { locale: Lang }) {
  const t = T[locale];
  const [start, setStart] = useState("2024-03-04");
  const [asOf, setAsOf] = useState("2026-10-27");
  const [hourly, setHourly] = useState(12_000);
  const [hours, setHours] = useState(8);
  const [unused, setUnused] = useState(5);
  const r = annualLeaveStatus(start, asOf);
  const money = (n: number) => `${Math.round(n).toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}${locale === "ko" ? "원" : " KRW"}`;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label={t.start} value={start} onChange={setStart} />
        <DateField label={t.asOf} value={asOf} onChange={setAsOf} />
        <NumberField label={t.hourly} value={hourly} onChange={setHourly} suffix={t.won} step={100} />
        <NumberField label={t.hours} value={hours} onChange={setHours} suffix={t.hoursUnit} step={1} />
        <NumberField label={t.unused} value={unused} onChange={setUnused} suffix={t.days} step={1} />
      </div>
      <div aria-live="polite" className="mt-5">
        {r === null ? (
          <p className="text-sm text-muted-foreground">{t.invalid}</p>
        ) : (
          <div className="rounded-md border border-border bg-background px-4 py-4">
            <p className="text-sm text-muted-foreground">{r.currentKind === "monthly" ? t.monthlyNow(r.current, r.completedMonths) : t.yearlyNow(r.current, r.completedYears)}</p>
            <p className="mt-1 font-mono text-3xl font-bold text-foreground">{r.current}{locale === "ko" ? "일" : " days"}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{t.next(r.next.date, r.next.days, r.next.kind === "yearly")}</p>
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-sm text-muted-foreground">{t.pay}</p>
              <p className="font-mono text-xl font-bold text-foreground">{money(unusedLeavePay(unused, hourly, hours))}</p>
              <p className="text-xs text-muted-foreground">{t.payNote(unused, money(hourly * hours))}</p>
            </div>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
              {t.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
