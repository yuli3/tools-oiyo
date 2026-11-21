// F-2-7 points (English, 2026-11-21, plan-20 #15). Same engine as the Korean page: lib/kr-f27-points-2026.ts.
import { useState } from "react";
import { F27_AS_OF, F27_PASS, f27Points, type Degree, type F27Input, type FineTier } from "../../../lib/kr-f27-points-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "korea-f27-points-calculator";
type Uni = "none" | "bachelor" | "master" | "phd";
const UNI: { value: Uni; label: string }[] = [{ value: "none", label: "None" }, { value: "bachelor", label: "Bachelor's" }, { value: "master", label: "Master's" }, { value: "phd", label: "PhD" }];
const yn = (v: boolean) => (v ? "yes" : "no") as "yes" | "no";
const YN = [{ value: "no" as const, label: "No" }, { value: "yes" as const, label: "Yes" }];
const KOREAN = [0, 3, 5, 10, 15, 20];

export default function F27PointsEn() {
  const [x, setX] = useState<F27Input>({ age: 31, degree: "master", stemOrDouble: true, korean: 4, income: 45_000_000, koreanUniDegree: "master", topUniDegree: "none", volunteer: 0, immigration: "none", criminal: "none" });
  const upd = (p: Partial<F27Input>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = f27Points(x);
  const gaps: string[] = [];
  if (!r.pass) {
    const k = Math.min(5, Math.floor(Number(x.korean) || 0));
    if (r.korean < 20) gaps.push(`One more Korean level adds ${KOREAN[k + 1] - r.korean} points (the higher of TOPIK or the KIIP social integration program).`);
    if (r.income < 60) gaps.push("A higher income band changes the score a lot (based on your tax office income certificate).");
    if (r.bonus < 40) gaps.push("Bonus points (ministry recommendation, KIIP level 5, a Korean degree, volunteering) count up to 40.");
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Age (full years)" suffix="years" value={x.age} onChange={(v) => upd({ age: Math.max(0, Math.round(v)) })} />
        <NumberField label="TOPIK level or KIIP stage (higher one, 0–5)" value={x.korean} onChange={(v) => upd({ korean: Math.min(5, Math.max(0, Math.round(v))) })} />
        <NumberField label="Annual income (income certificate)" suffix="× KRW 10,000" value={x.income / 10_000} onChange={(v) => upd({ income: Math.max(0, v) * 10_000 })} />
      </div>
      <ChoiceChips<Degree> legend="Highest degree" value={x.degree} options={[{ value: "none", label: "None" }, { value: "associate", label: "Associate" }, { value: "bachelor", label: "Bachelor's" }, { value: "master", label: "Master's" }, { value: "phd", label: "PhD" }]} onChange={(v) => upd({ degree: v })} />
      <div className="flex flex-wrap gap-3">
        <ChoiceChips<"no" | "yes"> legend="STEM degree, or two or more degrees" value={yn(!!x.stemOrDouble)} options={YN} onChange={(v) => upd({ stemOrDouble: v === "yes" })} />
        <ChoiceChips<"no" | "yes"> legend="Recommended by a central ministry" value={yn(!!x.ministryRecommend)} options={YN} onChange={(v) => upd({ ministryRecommend: v === "yes" })} />
        <ChoiceChips<"no" | "yes"> legend="Completed KIIP level 5" value={yn(!!x.kiip5)} options={YN} onChange={(v) => upd({ kiip5: v === "yes" })} />
        <ChoiceChips<"no" | "yes"> legend="Talent from a Korean War participant country" value={yn(!!x.warCountry)} options={YN} onChange={(v) => upd({ warCountry: v === "yes" })} />
      </div>
      <ChoiceChips<Uni> legend="Degree from a Korean university (bonus)" value={x.koreanUniDegree ?? "none"} options={UNI} onChange={(v) => upd({ koreanUniDegree: v })} />
      <ChoiceChips<Uni> legend="Degree from a top world university (QS 500 / THE 200, bonus)" value={x.topUniDegree ?? "none"} options={UNI} onChange={(v) => upd({ topUniDegree: v })} />
      <ChoiceChips<"0" | "1" | "2" | "3"> legend="Volunteering in Korea" value={String(x.volunteer ?? 0) as "0"} options={[{ value: "0", label: "Under 1 year" }, { value: "1", label: "1–2 years" }, { value: "2", label: "2–3 years" }, { value: "3", label: "3+ years" }]} onChange={(v) => upd({ volunteer: Number(v) as 0 | 1 | 2 | 3 })} />
      <ChoiceChips<FineTier> legend="Immigration Act fines in the last 3 years" value={x.immigration ?? "none"} options={[{ value: "none", label: "None" }, { value: "low", label: "KRW 0.5–1M" }, { value: "mid", label: "KRW 1–3M" }, { value: "high", label: "KRW 3M+ or departure order" }]} onChange={(v) => upd({ immigration: v })} />
      <ChoiceChips<FineTier> legend="Criminal fines (final over 3 years ago)" value={x.criminal ?? "none"} options={[{ value: "none", label: "None" }, { value: "low", label: "Under KRW 2M" }, { value: "mid", label: "KRW 2–3M" }, { value: "high", label: "KRW 3M+" }]} onChange={(v) => upd({ criminal: v })} />
      <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
        <p className="text-lg font-semibold text-foreground">{r.total} points · {r.pass ? `${F27_PASS} or more, so you meet the points requirement` : `${r.need} more points needed`}</p>
        <p className="mt-1 text-foreground">Age {r.age} + education {r.education} + Korean {r.korean} + income {r.income} = {r.base}, bonus {r.bonus}{r.bonusRaw > r.bonus ? ` (of ${r.bonusRaw}, capped at 40)` : ""}, deductions −{r.penalty}</p>
        {gaps.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{gaps.map((g) => <li key={g}>{g}</li>)}</ul>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">An estimate of the F-2-7 points score. First check that you are eligible (for example 3+ years of lawful stay on E-1 to E-7 or D-5 to D-9) and have no disqualifications (such as a KRW 3M+ fine in the last 3 years). Apply by booking a visit on HiKorea. Scores change when the notice changes. Source: Ministry of Justice Notice 2025-408. Checked {F27_AS_OF}. Nothing you enter leaves your browser.</p>
    </div>
  );
}
