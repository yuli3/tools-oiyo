// UK Inheritance Tax: nil rate bands, 40%/36%, payment date, gift taper. Logic: lib/world-inheritance-pack-2026.ts
import { useState } from "react";
import { INHERITANCE_AS_OF, UK_TAPER, ukInheritance } from "../../../lib/world-inheritance-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-inheritance-tax-threshold-deadline";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkInheritance() {
  const [x, setX] = useState({ estate: 600_000, homeToDescendants: true, homeValue: 300_000, charity10: false, death: "2026-03-10" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukInheritance({ ...x, death: x.death || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Inheritance Tax as the estate grows", caption: `Threshold ${gbp(r.threshold)}, rate ${r.rate * 100}%.`, xLabel: "Estate", yLabel: "Tax", min: 0, max: 2_000_000, step: 25_000, current: x.estate, f: (v) => ukInheritance({ ...x, estate: v }).tax, formatX: gbp, formatY: gbp, onPick: (v) => upd({ estate: v }) }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Estate value (after gifts to spouse or charity)" value={x.estate} onChange={(v) => upd({ estate: v })} suffix="£" step={10_000} />
            <DateField label="Date of death" value={x.death} onChange={(v) => upd({ death: v })} />
            {mode === "expert" && x.homeToDescendants && <NumberField label="Value of the home left to children or grandchildren" value={x.homeValue} onChange={(v) => upd({ homeValue: v })} suffix="£" step={10_000} />}
          </div>
          <ChoiceChips<"y" | "n"> legend="Is the home left to children or grandchildren?" value={x.homeToDescendants ? "y" : "n"} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ homeToDescendants: v === "y" })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Does the will leave 10% or more of the net value to charity?" value={x.charity10 ? "y" : "n"} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes (36%)" }]} onChange={(v) => upd({ charity10: v === "y" })} />}
          <LaborResult mode={mode} headline={r.tax ? `Inheritance Tax about ${gbp(r.tax)}` : "No Inheritance Tax due"} sub={`Threshold ${gbp(r.threshold)}`} items={r.items} dates={r.dates} datesTitle="Deadline" note={`General information and estimates from gov.uk. Gifts made within 7 years of death are taxed on a sliding scale (${UK_TAPER.map(([y, rt]) => `under ${y} years ${rt * 100}%`).join(", ")}). Not tax advice. Updated ${INHERITANCE_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
