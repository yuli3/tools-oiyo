// National corporate income tax 2026 (JP, UK, US, FR, ES, DE). Logic: lib/world-corporate-tax-2026.ts
import { useState } from "react";
import { CIT_AS_OF, corporateTax, type CitCountry, type CitInput } from "../../../lib/world-corporate-tax-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "corporate-tax-calculator-2026";
const C: { value: CitCountry; label: string }[] = [{ value: "JP", label: "Japan" }, { value: "UK", label: "UK" }, { value: "US", label: "US" }, { value: "FR", label: "France" }, { value: "ES", label: "Spain" }, { value: "DE", label: "Germany" }];
const CUR: Record<CitCountry, string> = { JP: "JPY", UK: "GBP", US: "USD", FR: "EUR", ES: "EUR", DE: "EUR" };
const DEF: Record<CitCountry, number> = { JP: 10_000_000, UK: 100_000, US: 100_000, FR: 100_000, ES: 100_000, DE: 100_000 };
type YN = "no" | "yes";
type EsKind = NonNullable<CitInput["esKind"]>;
const ES_K: { value: EsKind; label: string }[] = [{ value: "general", label: "General" }, { value: "micro", label: "Micro (turnover < €1m)" }, { value: "reduced", label: "Reduced size (art. 101)" }, { value: "new", label: "Newly created" }, { value: "patrimonial", label: "Holding of assets" }];
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const YNO = [{ value: "no" as YN, label: "No" }, { value: "yes" as YN, label: "Yes" }];

export default function CorporateTax() {
  const [x, setX] = useState({ country: "UK" as CitCountry, profit: 100_000, flag: "no" as YN, excluded: "no" as YN, associated: 0, distributions: 0, esKind: "general" as EsKind, hebesatz: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const on = x.flag === "yes";
  const calc = (v: number) => corporateTax({ country: x.country, profit: v, smallCapital: on, excludedSme: x.excluded === "yes", frSme: on, associated: x.associated, distributions: x.distributions, esKind: x.esKind, hebesatz: x.hebesatz });
  const r = calc(x.profit);
  const cur = CUR[x.country];
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={cur}
      curve={{ title: "Corporate tax by taxable profit", caption: "Statutory national rate; the line bends where reduced bands end.", xLabel: "Taxable profit", yLabel: "Tax", min: 0, max: Math.max(DEF[x.country] * 2, x.profit * 2), step: Math.max(100, Math.round(Math.max(DEF[x.country], x.profit) / 50)), current: x.profit, f: (v) => calc(v).total, formatX: fmt, formatY: fmt, onPick: (v) => upd({ profit: v }), marks: [] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<CitCountry> legend="Country" value={x.country} options={C} onChange={(v) => upd({ country: v, profit: DEF[v], flag: "no", excluded: "no" })} />
          <NumberField label={`Taxable profit (${cur})`} value={x.profit} onChange={(v) => upd({ profit: v })} step={1000} />
          {x.country === "JP" && <ChoiceChips<YN> legend="Capital ¥100 million or less (not a subsidiary of a large company)" value={x.flag} options={YNO} onChange={(v) => upd({ flag: v })} />}
          {x.country === "JP" && on && mode === "expert" && <ChoiceChips<YN> legend="適用除外事業者 (措法42の3の2)" value={x.excluded} options={YNO} onChange={(v) => upd({ excluded: v })} />}
          {x.country === "FR" && <ChoiceChips<YN> legend="Turnover ≤ €10m and at least 75% held by individuals" value={x.flag} options={YNO} onChange={(v) => upd({ flag: v })} />}
          {x.country === "ES" && <ChoiceChips<EsKind> legend="Type of company" value={x.esKind} options={ES_K} onChange={(v) => upd({ esKind: v })} />}
          {x.country === "UK" && <NumberField label="Associated companies" value={x.associated} onChange={(v) => upd({ associated: v })} step={1} />}
          {x.country === "UK" && mode === "expert" && <NumberField label="Exempt distributions received (£)" value={x.distributions} onChange={(v) => upd({ distributions: v })} step={1000} />}
          {x.country === "DE" && <NumberField label="Gewerbesteuer Hebesatz of the municipality (%, 0 = skip)" value={x.hebesatz} onChange={(v) => upd({ hebesatz: v })} step={10} />}
          <LaborResult mode={mode} headline={`Corporate tax ${fmt(r.total)} ${cur}`} sub={`Effective ${r.effective}% of taxable profit${r.local != null ? ` (KSt ${fmt(r.tax)} + GewSt ${fmt(r.local)})` : ""}`} items={r.items as never} dates={[]} datesTitle="" note={`Statutory rates from the tax authorities' pages. Not tax advice. Updated ${CIT_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
