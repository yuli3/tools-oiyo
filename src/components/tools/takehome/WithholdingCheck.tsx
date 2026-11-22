// Domestic withholding on payments to non-residents (JP, US, FR, ES, TW, DE). Logic: lib/world-withholding-2026.ts
import { useState } from "react";
import { WHT_AS_OF, withholding, type WhtCountry, type WhtType } from "../../../lib/world-withholding-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "withholding-tax-non-resident-payments";
const C: { value: WhtCountry; label: string }[] = [{ value: "JP", label: "Japan" }, { value: "US", label: "US" }, { value: "FR", label: "France" }, { value: "ES", label: "Spain" }, { value: "TW", label: "Taiwan" }, { value: "DE", label: "Germany" }];
const T: { value: WhtType; label: string }[] = [{ value: "royalty", label: "Royalties" }, { value: "services", label: "Services" }, { value: "interest", label: "Interest" }, { value: "dividend", label: "Dividends" }, { value: "salary", label: "Salary" }, { value: "director", label: "Director's fees" }, { value: "rent", label: "Rent" }];
const CUR: Record<WhtCountry, string> = { JP: "JPY", US: "USD", FR: "EUR", ES: "EUR", TW: "TWD", DE: "EUR" };
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
type YN = "no" | "yes";

export default function WithholdingCheck() {
  const [x, setX] = useState({ country: "JP" as WhtCountry, type: "royalty" as WhtType, amount: 1_000_000, flag: "no" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const on = x.flag === "yes";
  const calc = (v: number) => withholding({ country: x.country, type: x.type, amount: v, listedShares: on, euEea: on, listedBond: on, lowPay: on, etnc: on });
  const r = calc(x.amount);
  const flagLabel = x.country === "ES" ? "Recipient resident in the EU, Iceland or Norway" : x.country === "FR" ? "Recipient in a non-cooperative state (ETNC)" : x.country === "JP" && x.type === "dividend" ? "Listed shares (holder under 3%)" : x.country === "TW" && x.type === "salary" ? "Full-month pay at most 1.5 × basic wage" : x.country === "TW" && x.type === "interest" ? "Listed bonds or short-term notes" : "";
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency={CUR[x.country]}
      curve={{ title: "Tax withheld by amount paid", caption: "Domestic rate only; a tax treaty can lower it.", xLabel: "Amount paid", yLabel: "Tax withheld", min: 0, max: Math.max(10_000, x.amount * 2), step: Math.max(100, Math.round(x.amount / 50)), current: x.amount, f: (v) => calc(v).tax ?? 0, formatX: fmt, formatY: fmt, onPick: (v) => upd({ amount: v }), marks: [] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<WhtCountry> legend="Country of the payer" value={x.country} options={C} onChange={(v) => upd({ country: v, flag: "no" })} />
          <ChoiceChips<WhtType> legend="Type of payment" value={x.type} options={T} onChange={(v) => upd({ type: v, flag: "no" })} />
          <NumberField label={`Amount paid (${CUR[x.country]})`} value={x.amount} onChange={(v) => upd({ amount: v })} step={1000} />
          {flagLabel && <ChoiceChips<YN> legend={flagLabel} value={x.flag} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} onChange={(v) => upd({ flag: v })} />}
          <LaborResult mode={mode} headline={r.rate == null ? "Not computed for this payment" : `Withhold ${r.rate}%: ${fmt(r.tax ?? 0)} ${CUR[x.country]}`} sub={r.rate == null ? "The page we read does not give a rate for this type." : `Net to the recipient ${fmt(r.net ?? 0)} ${CUR[x.country]}`} items={r.items as never} dates={[]} datesTitle="" note={`Domestic rates from the tax authorities' pages. Not tax advice. Updated ${WHT_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
