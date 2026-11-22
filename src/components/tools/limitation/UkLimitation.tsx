// England & Wales limitation periods and money claim fees. Logic: lib/world-limitation-pack-2026.ts
import { useState } from "react";
import { LIMITATION_AS_OF, ukClaimFee, ukLimitation, type UkClaim } from "../../../lib/world-limitation-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-limitation-period-small-claims";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkLimitation() {
  const [x, setX] = useState({ claim: "contract" as UkClaim, accrued: "2021-06-01", knowledge: "", amount: 2_500, today: "2026-11-22" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukLimitation({ claim: x.claim, accrued: x.accrued || undefined, knowledge: x.knowledge || undefined, amount: x.amount, today: x.today || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Court fee to start a money claim", caption: "Fixed fees up to £10,000, then 5% of the claim (max £10,000).", xLabel: "Amount claimed", yLabel: "Fee", min: 0, max: 50_000, step: 250, current: x.amount, f: ukClaimFee, formatX: gbp, formatY: gbp, onPick: (v) => upd({ amount: v }), marks: [{ at: 10_000, label: "small claims" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<UkClaim> legend="What is the claim about?" value={x.claim} options={[{ value: "contract", label: "Unpaid money / contract" }, { value: "tort", label: "Damage or negligence" }, { value: "injury", label: "Personal injury" }]} onChange={(v) => upd({ claim: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DateField label={x.claim === "contract" ? "Date the payment was due or the contract was broken" : "Date of the damage or injury"} value={x.accrued} onChange={(v) => upd({ accrued: v })} />
            {x.claim === "injury" && <DateField label="Date you knew about the injury (if later)" value={x.knowledge} onChange={(v) => upd({ knowledge: v })} />}
            <NumberField label="Amount claimed" value={x.amount} onChange={(v) => upd({ amount: v })} suffix="£" step={100} />
            {mode === "expert" && <DateField label="Today's date" value={x.today} onChange={(v) => upd({ today: v })} />}
          </div>
          <LaborResult mode={mode} headline={r.deadline ? `Issue the claim by ${r.deadline}${r.status === "expired" ? " (already passed)" : ""}` : "Enter a date to see the limitation date"} sub={r.fee !== null ? `Court fee ${gbp(r.fee)}` : undefined} items={r.items} dates={r.dates} datesTitle="Deadline" note={`General information from the Limitation Act 1980 (legislation.gov.uk), gov.uk court fees and Citizens Advice. England and Wales only. Not legal advice. Updated ${LIMITATION_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
