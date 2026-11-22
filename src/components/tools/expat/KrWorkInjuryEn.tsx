// Korea work injury (산재) benefits in English (2026-11-22, pro-tools ongoing #6 EN versions).
// Same engines as the Korean pages: lib/kr-welfare-2026.ts (휴업급여) and lib/kr-injury-disability-2026.ts (장해급여). Nothing new is computed here.
import { useState } from "react";
import { INJURY_2026, averageDailyWage, injuryLeavePay } from "../../../lib/kr-welfare-2026";
import { DISABILITY_AS_OF, disabilityBenefit } from "../../../lib/kr-injury-disability-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

type Topic = "leave" | "disability";
const TOOL_ID = "korea-work-injury-benefits-calculator";
const won = (n: number) => `₩${Math.round(n).toLocaleString("en-US")}`;
const RULE: Record<string, string> = {
  regular: "70% of your average daily wage.",
  max: `Your average wage is above the 2026 cap (₩${INJURY_2026.maxBase.toLocaleString("en-US")} a day), so 70% of the cap is paid.`,
  low90: "70% would be too low, so it is raised to 90% of your average wage.",
  minWage: "70% would be too low, so it is raised to the minimum wage for a day (₩82,560).",
};
const FORM: Record<string, string> = { "pension-only": "Grades 1–3 are paid only as a pension.", choice: "Grades 4–7: you choose a pension or a lump sum.", "lump-only": "Grades 8–14 are paid only as a lump sum." };

export default function KrWorkInjuryEn() {
  const [x, setX] = useState({ topic: "leave" as Topic, monthly: 3_600_000, days: 60, grade: 7, healed: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const daily = Math.round(averageDailyWage(x.monthly * 3, 92));
  const leave = injuryLeavePay({ avgDailyWage: daily, days: x.days });
  const dis = disabilityBenefit({ grade: x.grade, avgWage: daily, healed: x.healed || undefined });
  const isLeave = x.topic === "leave";
  const curve = isLeave
    ? { title: "Daily leave pay by monthly wage", caption: "The 70% rule, the 90% / minimum-wage floor and the 2026 cap.", xLabel: "Monthly wage (3-month average)", yLabel: "Leave pay a day", min: 1_000_000, max: 10_000_000, step: 100_000, current: x.monthly, f: (m: number) => injuryLeavePay({ avgDailyWage: averageDailyWage(m * 3, 92), days: 10 }).daily, formatX: won, formatY: won, onPick: (m: number) => upd({ monthly: Math.round(m) }), marks: [] }
    : { title: "Disability benefit by grade", caption: "Lump sum (grades 4–14) or yearly pension (grades 1–3) at your average wage.", xLabel: "Disability grade", yLabel: "Amount", min: 1, max: 14, step: 1, current: x.grade, f: (g: number) => { const r = disabilityBenefit({ grade: g, avgWage: daily }); return r.lumpSum ?? r.pensionAnnual ?? 0; }, formatX: (g: number) => `Grade ${Math.round(g)}`, formatY: won, onPick: (g: number) => upd({ grade: Math.round(g) }), marks: [{ at: 3, label: "pension only" }, { at: 7, label: "choice ends" }] };
  const leaveItems = [
    { tone: "info" as const, text: RULE[leave.rule], cite: "Industrial Accident Compensation Insurance Act arts. 52, 54" },
    ...(leave.eligible ? [] : [{ tone: "warn" as const, text: "No leave pay if you cannot work for 3 days or fewer; your employer owes leave compensation for those days instead.", cite: "IACI Act art. 52" }]),
    { tone: "info" as const, text: "Average daily wage = wages of the 3 months before the accident ÷ the days in those months (about 92). Bonuses count in part.", cite: "Labor Standards Act art. 2(1)6" },
    { tone: "warn" as const, text: "Not computed here: the reduction for older workers and partial leave pay when you work part-time.", cite: "IACI Act" },
  ];
  const disItems = [
    { tone: "info" as const, text: FORM[dis.form], cite: "IACI Act art. 57, Annex 2" },
    ...(dis.capped ? [{ tone: "info" as const, text: dis.capped === "max" ? "Your average wage is above the cap, so the cap is used." : "Your average wage is below the floor, so the floor is used.", cite: "IACI Act art. 36 ⑦" }] : []),
    ...(dis.breakEvenYears ? [{ tone: "info" as const, text: `The lump sum equals about ${dis.breakEvenYears} years of the pension. If you expect to receive the pension longer than that, the pension pays more.`, cite: "IACI Act art. 57, Annex 2" }] : []),
    { tone: "warn" as const, text: "The grade is decided by COMWEL (근로복지공단) after your condition is fixed. If you disagree, request a review within 90 days of learning of the decision.", cite: "IACI Act art. 103" },
  ];
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="KRW" curve={curve}>
      {(mode) => (
        <>
          <ChoiceChips<Topic> legend="What do you want to check?" value={x.topic} options={[{ value: "leave", label: "Pay while I can't work (휴업급여)" }, { value: "disability", label: "Disability benefit (장해급여)" }]} onChange={(v) => upd({ topic: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Average monthly wage before the accident (₩, before tax)" value={x.monthly} onChange={(v) => upd({ monthly: v })} step={100_000} />
            {isLeave ? <NumberField label="Days you cannot work" value={x.days} onChange={(v) => upd({ days: v })} suffix="days" /> : <NumberField label="Disability grade (1 = most severe, 14)" value={x.grade} onChange={(v) => upd({ grade: Math.min(14, Math.max(1, Math.round(v) || 1)) })} />}
            {!isLeave && mode === "expert" && <DateField label="Date your condition was fixed (치유일)" value={x.healed} onChange={(v) => upd({ healed: v })} />}
          </div>
          {isLeave ? (
            <LaborResult mode={mode} headline={leave.eligible ? `${won(leave.total)} for ${leave.days} days` : "No leave pay for 3 days or fewer"} sub={`${won(leave.daily)} a day · average daily wage ${won(daily)}`} items={leaveItems} dates={[]} datesTitle="" note={`General information from Korean law, not legal advice or representation. 2026 cap and floor: Ministry of Employment and Labor Notice 2025-84. Checked ${DISABILITY_AS_OF}. Your inputs stay in your browser.`} />
          ) : (
            <LaborResult mode={mode} headline={dis.lumpSum != null ? `Lump sum ${won(dis.lumpSum)}` : `Pension ${won(dis.pensionAnnual ?? 0)} a year`} sub={`Grade ${dis.grade}${dis.pensionMonthly ? ` · pension about ${won(dis.pensionMonthly)} a month` : ""}${dis.claimBy ? ` · claim by ${dis.claimBy}` : ""}`} items={disItems} dates={[]} datesTitle="" note={`General information from Korean law, not legal advice or representation. Checked ${DISABILITY_AS_OF}. Your inputs stay in your browser.`} />
          )}
        </>
      )}
    </CurveShell>
  );
}
