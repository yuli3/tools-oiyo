// Parental pay and child benefit (UK, Japan, Germany). Logic: lib/world-parental-pay-2026.ts
import { useState } from "react";
import { PARENTAL_AS_OF, deElterngeld, jpChildAllowance, jpChildcareLeave, ukChildBenefit, ukMaternityPay, type ParentalCountry } from "../../../lib/world-parental-pay-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "parental-pay-calculator-2026";
const C: { value: ParentalCountry; label: string }[] = [{ value: "UK", label: "UK" }, { value: "JP", label: "Japan" }, { value: "DE", label: "Germany" }];
const CUR: Record<ParentalCountry, string> = { UK: "GBP", JP: "JPY", DE: "EUR" };
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function ParentalPay() {
  const [x, setX] = useState({ country: "UK" as ParentalCountry, earn: { UK: 600, JP: 300_000, DE: 2_000 } as Record<ParentalCountry, number>, children: 1, ani: 50_000, months: 12, support: false, netAfter: 0, zve: 60_000, u3: 1, f3: 0, older: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const cur = CUR[x.country];
  const e = x.earn[x.country];
  const calc = (v: number) => {
    if (x.country === "UK") { const s = ukMaternityPay({ weeklyEarnings: v }); return { total: s.total, head: `SMP ${fmt(s.total)} GBP over 39 weeks`, sub: `£${s.weeklyFirst6}/week for 6 weeks, then £${s.weeklyNext33}/week for 33 weeks`, items: [...s.items, ...ukChildBenefit({ children: x.children, adjustedNetIncome: x.ani }).items] }; }
    if (x.country === "JP") { const j = jpChildcareLeave({ monthlyWage: v, months: x.months, support: x.support }); return j.ok ? { total: j.total, head: `育児休業給付 合計 ${fmt(j.total)}円`, sub: `${x.months}か月: 月 ${fmt(j.monthly67)}円 (67%) → ${fmt(j.monthly50)}円 (50%)`, items: [...j.items, ...jpChildAllowance({ under3: x.u3, from3: x.f3, supported19to22: x.older }).items] } : { total: 0, head: "Missing input", sub: j.error, items: [] }; }
    const d = deElterngeld({ netBefore: v, netAfter: x.netAfter, taxableIncome: x.zve, children: x.children });
    return { total: d.basic, head: d.eligible ? `Basiselterngeld ${fmt(d.basic)} € im Monat` : "Kein Elterngeld (Einkommensgrenze)", sub: `ElterngeldPlus ${fmt(d.plus)} € · Kindergeld ${fmt(d.kindergeld)} €`, items: d.items };
  };
  const r = calc(e);
  const max = x.country === "UK" ? 2_000 : x.country === "JP" ? 800_000 : 5_000;
  const xl = x.country === "UK" ? "Average weekly earnings (GBP)" : x.country === "JP" ? "休業開始時賃金月額 (円)" : "Netto vor der Geburt (€/Monat)";
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={cur}
      curve={{ title: x.country === "DE" ? "Elterngeld by net income" : "Total benefit by earnings", caption: "Statutory rates and caps; the curve flattens where the cap applies.", xLabel: xl, yLabel: x.country === "DE" ? "Monthly Elterngeld" : "Total over the leave", min: 0, max, step: max / 100, current: e, f: (v) => calc(v).total, formatX: fmt, formatY: fmt, onPick: (v) => upd({ earn: { ...x.earn, [x.country]: Math.round(v) } }), marks: [] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<ParentalCountry> legend="Country" value={x.country} options={C} onChange={(v) => upd({ country: v })} />
          <NumberField label={xl} value={e} onChange={(v) => upd({ earn: { ...x.earn, [x.country]: v } })} step={x.country === "JP" ? 10_000 : 50} />
          {x.country === "UK" && (<div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Children (Child Benefit)" value={x.children} onChange={(v) => upd({ children: v })} step={1} />
            <NumberField label="Higher adjusted net income in the household (GBP)" value={x.ani} onChange={(v) => upd({ ani: v })} step={1000} />
          </div>)}
          {x.country === "JP" && (<div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="育休の月数" value={x.months} onChange={(v) => upd({ months: v })} step={1} />
            <ChoiceChips<string> legend="出生後休業支援給付金 (13%)" value={x.support ? "y" : "n"} options={[{ value: "n", label: "含めない" }, { value: "y", label: "含める" }]} onChange={(v) => upd({ support: v === "y" })} />
            <NumberField label="児童手当: 3歳未満の子 (人)" value={x.u3} onChange={(v) => upd({ u3: v })} step={1} />
            <NumberField label="児童手当: 3歳〜高校生年代の子 (人)" value={x.f3} onChange={(v) => upd({ f3: v })} step={1} />
            {mode === "expert" && <NumberField label="高校生年代の後〜22歳年度末で生計を支える子 (人、第3子の数え方用)" value={x.older} onChange={(v) => upd({ older: v })} step={1} />}
          </div>)}
          {x.country === "DE" && (<div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Netto nach der Geburt (€/Monat)" value={x.netAfter} onChange={(v) => upd({ netAfter: v })} step={50} />
            <NumberField label="Zu versteuerndes Einkommen der Eltern (€/Jahr)" value={x.zve} onChange={(v) => upd({ zve: v })} step={5000} />
            <NumberField label="Kinder (Kindergeld)" value={x.children} onChange={(v) => upd({ children: v })} step={1} />
          </div>)}
          <LaborResult mode={mode} headline={r.head} sub={r.sub} items={r.items as never} dates={[]} datesTitle="" note={`Official 2026 rates. Eligibility is not checked. Updated ${PARENTAL_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
