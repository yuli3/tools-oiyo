// US substantial presence test. Logic: lib/world-tax-residency-2026.ts
import { useState } from "react";
import { RESIDENCY_AS_OF, usSubstantialPresence } from "../../../lib/world-tax-residency-2026";
import LaborResult from "../labor/LaborResult";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "us-substantial-presence-test-calculator";

export default function UsResidency() {
  const [x, setX] = useState({ current: 140, prior1: 120, prior2: 90, exemptDays: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usSubstantialPresence(x);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={{ title: "Weighted days by days in the US this year", caption: "This year's days + 1/3 of last year + 1/6 of the year before. 183 or more (with 31 this year) means resident.", xLabel: "Days in the US this year", yLabel: "Weighted total", min: 0, max: 365, step: 1, current: x.current, f: (v) => usSubstantialPresence({ ...x, current: v }).weighted, formatX: (n) => `${Math.round(n)} d`, formatY: (n) => `${Math.round(n)} d`, onPick: (v) => upd({ current: v }), marks: [{ at: 31, label: "31" }, { at: 183, label: "183" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Days in the US this year" value={x.current} onChange={(v) => upd({ current: v })} step={1} />
            <NumberField label="Days last year" value={x.prior1} onChange={(v) => upd({ prior1: v })} step={1} />
            <NumberField label="Days the year before" value={x.prior2} onChange={(v) => upd({ prior2: v })} step={1} />
            {mode === "expert" && <NumberField label="Days this year not counted (exempt, transit, commuting)" value={x.exemptDays} onChange={(v) => upd({ exemptDays: v })} step={1} />}
          </div>
          <LaborResult mode={mode} headline={r.verdict === "resident" ? `Resident for tax under the substantial presence test (${r.weighted} weighted days)` : `Not resident under the test (${r.weighted} weighted days, ${r.counted} this year)`} items={r.items} dates={[]} datesTitle="" note={`From the IRS substantial presence test page. Not tax advice. Updated ${RESIDENCY_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
