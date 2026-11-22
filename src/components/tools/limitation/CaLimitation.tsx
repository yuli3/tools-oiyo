// California statutes of limitations and small claims limits. Logic: lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { CA_YEARS, LIMITATION_AS_OF, caLimitation, type CaClaim } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { limitCurve } from "./LimitCurve";

const TOOL_ID = "california-statute-of-limitations-small-claims";

export default function CaLimitation() {
  const [x, setX] = useState({ claim: "writtenContract" as CaClaim, start: "2023-05-01", amount: 5_000, business: false, today: "2026-11-22", elapsed: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = caLimitation({ claim: x.claim, start: x.start || undefined, amount: x.amount, business: x.business, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={limitCurve({ start: x.start, deadline: r.deadline, title: "Years left to file as time passes", caption: `${CA_YEARS[x.claim].years}-year deadline from the start date.`, xLabel: "Years since start", yLabel: "Years left", unit: (n) => `${n} y`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 5 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<CaClaim> legend="Type of claim" value={x.claim} options={[{ value: "writtenContract", label: "Written contract" }, { value: "oralContract", label: "Oral contract" }, { value: "property", label: "Property damage" }, { value: "injury", label: "Personal injury" }, { value: "defamation", label: "Libel or slander" }]} onChange={(v) => upd({ claim: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label="Start date (breach, injury or damage)" value={x.start} onChange={(v) => upd({ start: v })} />
            <NumberField label="Amount" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="$" step={100} />
            {mode === "expert" && <DateField label="Today's date" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Suing for a business?" value={x.business ? "y" : "n"} options={[{ value: "n", label: "No ($12,500 limit)" }, { value: "y", label: "Yes ($6,250 limit)" }]} onChange={(v) => upd({ business: v === "y" })} />}
          <LaborResult mode={mode} headline={r.deadline ? `File by ${r.deadline}${r.status === "expired" ? " (already passed)" : ""}` : "Enter a start date"} items={r.items} dates={r.dates} datesTitle="Deadline" note={`General information from California Courts Self-Help and a superior court small claims FAQ. Not legal advice. Updated ${LIMITATION_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
