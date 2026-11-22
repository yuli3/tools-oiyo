// Labour practice checks (JP 36協定 overtime caps, UK 12.07% holiday accrual). Logic: lib/world-labor-practice-2026.ts
import { useState } from "react";
import { LABOR_PRACTICE_AS_OF, jpOvertimeCheck, ukIrregularHoliday, type JpSector } from "../../../lib/world-labor-practice-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

type C = "JP" | "UK";
type YN = "no" | "yes";
const TOOL_ID = "overtime-cap-holiday-accrual-check";
const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");
const SECTORS: { value: JpSector; label: string }[] = [{ value: "general", label: "一般" }, { value: "driver", label: "自動車運転" }, { value: "construction_disaster", label: "建設 (災害復旧)" }, { value: "doctor_a", label: "医師 A・連携B" }, { value: "doctor_bc", label: "医師 B・C" }];

export default function LaborPractice() {
  const [x, setX] = useState({ country: "JP" as C, base: 30, peak: 70, peakMonths: 3, holiday: 8, special: "yes" as YN, henkei: "no" as YN, sector: "general" as JpSector, hours: 120, periods: 12 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const jp = x.country === "JP";
  const months = (peak: number) => Array.from({ length: 12 }, (_, i) => ({ overtime: i < x.peakMonths ? peak : x.base, holiday: i < x.peakMonths ? x.holiday : 0 }));
  const run = (peak: number) => jpOvertimeCheck({ months: months(peak), special: x.special === "yes", henkei: x.henkei === "yes", sector: x.sector });
  const j = run(x.peak);
  const u = ukIrregularHoliday({ hours: Array.from({ length: Math.max(1, Math.min(53, Math.round(x.periods))) }, () => x.hours) });
  const curve = jp
    ? { title: "Highest 2–6 month average (overtime + holiday work)", caption: "Busy months first, then normal months; the line at 80 hours is the average cap with a special clause.", xLabel: "Overtime in busy months (hours)", yLabel: "Highest average", min: 0, max: 150, step: 1, current: x.peak, f: (v: number) => { const r = run(v); return r.ok ? r.maxAverage : 0; }, formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ peak: Math.round(v) }), marks: [{ at: 80, label: "80h" }, { at: 100, label: "100h" }] }
    : { title: "Holiday accrued by hours worked", caption: "12.07% of the hours worked in each pay period.", xLabel: "Hours per pay period", yLabel: "Holiday hours accrued in total", min: 0, max: 200, step: 1, current: x.hours, f: (v: number) => { const r = ukIrregularHoliday({ hours: Array.from({ length: Math.max(1, Math.round(x.periods)) }, () => v) }); return r.ok ? r.totalHours : 0; }, formatX: fmt, formatY: fmt, onPick: (v: number) => upd({ hours: Math.round(v) }), marks: [] };
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={jp ? "JPY" : "GBP"} curve={curve}>
      {(mode) => (
        <>
          <ChoiceChips<C> legend="Country" value={x.country} options={[{ value: "JP", label: "Japan (36協定)" }, { value: "UK", label: "UK (irregular hours)" }]} onChange={(v) => upd({ country: v })} />
          {jp ? (
            <>
              <ChoiceChips<JpSector> legend="業種" value={x.sector} options={SECTORS} onChange={(v) => upd({ sector: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceChips<YN> legend="特別条項付き36協定" value={x.special} options={[{ value: "no", label: "なし" }, { value: "yes", label: "あり" }]} onChange={(v) => upd({ special: v })} />
                <ChoiceChips<YN> legend="1年単位の変形労働時間制" value={x.henkei} options={[{ value: "no", label: "いいえ" }, { value: "yes", label: "はい" }]} onChange={(v) => upd({ henkei: v })} />
                <NumberField label="通常月の時間外労働 (時間)" value={x.base} onChange={(v) => upd({ base: v })} step={1} />
                <NumberField label="繁忙月の時間外労働 (時間)" value={x.peak} onChange={(v) => upd({ peak: v })} step={1} />
                <NumberField label="繁忙月の数 (連続)" value={x.peakMonths} onChange={(v) => upd({ peakMonths: Math.max(0, Math.min(12, Math.round(v))) })} step={1} />
                <NumberField label="繁忙月の休日労働 (時間)" value={x.holiday} onChange={(v) => upd({ holiday: v })} step={1} />
              </div>
              {j.ok && <LaborResult mode={mode} headline={j.compliant ? "上限の範囲内です" : `上限超過 ${j.violations.length}件`} sub={`年間の時間外 ${fmt(j.yearOvertime)}時間 · 2〜6か月平均の最大 ${fmt(j.maxAverage)}時間 · 45時間超 ${j.monthsOver45}か月`} items={[...j.violations.map((v) => ({ tone: "warn", text: v, cite: "労働基準法第36条" })), ...j.items] as never} dates={[]} datesTitle="" note={`MHLW leaflets. Not legal advice. Updated ${LABOR_PRACTICE_AS_OF}. What you type stays in your browser.`} />}
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Hours worked per pay period" value={x.hours} onChange={(v) => upd({ hours: v })} step={1} />
                <NumberField label="Number of pay periods" value={x.periods} onChange={(v) => upd({ periods: v })} step={1} />
              </div>
              {u.ok && <LaborResult mode={mode} headline={`${fmt(u.totalHours)} hours of holiday accrued`} sub={`${fmt(u.perPeriod[0])} hours per pay period at 12.07%`} items={u.items as never} dates={[]} datesTitle="" note={`GOV.UK guidance. Not legal advice. Updated ${LABOR_PRACTICE_AS_OF}. What you type stays in your browser.`} />}
            </>
          )}
        </>
      )}
    </CurveShell>
  );
}
