// England & Northern Ireland SDLT on a home purchase. Logic: lib/world-home-purchase-2026.ts
import { useState } from "react";
import { HOME_AS_OF, ukSdlt } from "../../../lib/world-home-purchase-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-stamp-duty-calculator-2026";
type YN = "no" | "yes";
const YNO = [{ value: "no" as YN, label: "No" }, { value: "yes" as YN, label: "Yes" }];
const gbp = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;

export default function UkStampDuty() {
  const [x, setX] = useState({ price: 295_000, ftb: "no" as YN, add: "no" as YN, nr: "no" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const calc = (v: number) => ukSdlt({ price: v, firstTime: x.ftb === "yes", additional: x.add === "yes", nonResident: x.nr === "yes" });
  const r = calc(x.price);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Stamp Duty by purchase price", caption: "Each band is charged only on the part of the price inside it.", xLabel: "Price", yLabel: "SDLT", min: 0, max: Math.max(1_000_000, x.price * 2), step: 5_000, current: x.price, f: (v) => calc(v).tax, formatX: gbp, formatY: gbp, onPick: (v) => upd({ price: v }), marks: [{ at: 125_000, label: "£125k" }, { at: 250_000, label: "£250k" }, { at: 925_000, label: "£925k" }] }}
    >
      {(mode) => (
        <>
          <NumberField label="Purchase price (£)" value={x.price} onChange={(v) => upd({ price: v })} step={5000} />
          <ChoiceChips<YN> legend="First-time buyer (main home)" value={x.ftb} options={YNO} onChange={(v) => upd({ ftb: v })} />
          <ChoiceChips<YN> legend="You will own another residential property" value={x.add} options={YNO} onChange={(v) => upd({ add: v })} />
          <ChoiceChips<YN> legend="Non-UK resident buyer" value={x.nr} options={YNO} onChange={(v) => upd({ nr: v })} />
          <LaborResult mode={mode} headline={`Stamp Duty ${gbp(r.tax)}`} sub={x.price > 0 ? `${Math.round(r.tax / x.price * 10000) / 100}% of the price${r.firstTimeRelief ? ", with first-time buyer relief" : ""}` : ""} items={[...r.rows.map((b) => ({ tone: "info", text: `${gbp(b.from)} to ${gbp(b.to)} at ${b.rate}%: ${gbp(b.tax)}`, cite: "SDLT band" })), ...r.items] as never} dates={[]} datesTitle="" note={`Rates from GOV.UK. England and Northern Ireland only. Not tax advice. Updated ${HOME_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
