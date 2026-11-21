// Korean work-injury disability benefit (English, 2026-11-21, plan-20 #15). Same engine as the Korean page: lib/kr-injury-disability-2026.ts.
import { useState } from "react";
import { DISABILITY_AS_OF, WAGE_CAP_2026, disabilityBenefit } from "../../../lib/kr-injury-disability-2026";
import { useToday } from "../nts/Items";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import DeadlineChart from "../viz/DeadlineChart";
import CurveShell from "../viz/CurveShell";
import { VizLangProvider } from "../viz/i18n";
import { track } from "../viz/track";

const TOOL_ID = "korea-work-injury-disability-calculator";
const krw = (n: number) => `KRW ${Math.round(n).toLocaleString("en-US")}`;
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export default function DisabilityBenefitEn() {
  const [x, setX] = useState({ grade: 7, avgWage: 150_000, healed: "" });
  const today = useToday();
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = disabilityBenefit({ grade: x.grade, avgWage: x.avgWage, healed: x.healed || undefined });
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  const rows = r.claimBy && today ? [{ id: "claim", label: "Claim disability benefit (5-year limit)", due: r.claimBy, daysLeft: days(today, r.claimBy), cite: "IACI Act Art. 112" }] : [];
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="KRW" curve={{
        title: "How the benefit changes with your average daily wage", caption: "Pension grades show the yearly pension; grades 8–14 show the lump sum. The line is flat outside the 2026 minimum and maximum.",
        xLabel: "Average daily wage", yLabel: "Benefit", min: 50_000, max: 320_000, step: 1_000, current: x.avgWage,
        f: (v) => { const b = disabilityBenefit({ grade: x.grade, avgWage: v }); return b.pensionAnnual ?? b.lumpSum ?? 0; },
        formatX: (n: number) => `KRW ${Math.round(n / 1000)}k`, formatY: (n: number) => `KRW ${(Math.round(n / 1e5) / 10).toLocaleString("en-US")}M`,
        onPick: (v) => upd({ avgWage: v }),
        marks: [{ at: WAGE_CAP_2026.min, label: "minimum" }, { at: WAGE_CAP_2026.max, label: "maximum" }],
      }}>
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Disability grade (1–14)" value={x.grade} onChange={(v) => upd({ grade: Math.min(14, Math.max(1, Math.round(v))) })} />
        <NumberField label="Average daily wage (3 months' pay before the accident ÷ days)" suffix="KRW" value={x.avgWage} onChange={(v) => upd({ avgWage: Math.max(0, v) })} />
        <DateField label="Date your condition was fixed (leave blank if unknown)" value={x.healed} onChange={(v) => upd({ healed: v })} />
      </div>
      <div className={box} aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.form === "pension-only" && `Grade ${r.grade} is paid as a pension only: ${krw(r.pensionAnnual ?? 0)} a year`}
          {r.form === "choice" && `Grade ${r.grade} lets you choose a pension or a lump sum`}
          {r.form === "lump-only" && `Grade ${r.grade} is paid as a lump sum: ${krw(r.lumpSum ?? 0)}`}
        </p>
        {r.form === "choice" && (
          <>
            <p className="mt-1 text-foreground">Pension: {krw(r.pensionAnnual ?? 0)} a year (about {krw(r.pensionMonthly ?? 0)} a month, {r.pensionDays} days' wages) · Lump sum: {krw(r.lumpSum ?? 0)} ({r.lumpDays} days' wages)</p>
            <p className="mt-1 text-foreground">The lump sum equals about {r.breakEvenYears} years of pension. If you expect to receive it for longer, the pension pays more.</p>
          </>
        )}
        {r.capped && <p className="mt-1 text-warning">Your average wage was replaced by the 2026 {r.capped === "max" ? `maximum of ${krw(WAGE_CAP_2026.max)}` : `minimum of ${krw(WAGE_CAP_2026.min)}`} a day.</p>}
        {r.advance.length > 0 && <p className="mt-1 text-muted-foreground">Pension advance (on request): {r.advance.map((a) => `half of the first ${a.years} year${a.years > 1 ? "s" : ""}, ${krw(a.amount)}`).join(" · ")}</p>}
        {r.claimBy && <p className="mt-1 text-foreground">Claim by <span className="font-mono">{r.claimBy}</span> (5 years)</p>}
      </div>
      {rows.length > 0 && (
        <VizLangProvider value={{ lang: "en", currency: "KRW" }}>
          <DeadlineChart title="Time left to claim" caption="Counted from the day after your condition was fixed. Appeals against a decision have a separate 90-day limit." rows={rows} />
        </VizLangProvider>
      )}
      <p className="text-xs leading-5 text-muted-foreground">An estimate only. The Korea Workers' Compensation and Welfare Service (KCOMWEL, 1588-0075) sets your grade after treatment ends and works out your average wage from the 3 months before the accident. If you disagree with a decision, request a review within 90 days of learning of it. Sources: Industrial Accident Compensation Insurance Act Art. 36(7), 57 and Annex 2, 112; Ministry of Employment and Labor Notice 2025-84. Checked {DISABILITY_AS_OF}. Nothing you enter leaves your browser.</p>
    </>
      )}
    </CurveShell>
  );
}
