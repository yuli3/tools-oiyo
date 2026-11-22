// UK statutory residence test (simplified). Logic: lib/world-tax-residency-2026.ts
import { useState } from "react";
import { RESIDENCY_AS_OF, ukStatutoryResidence } from "../../../lib/world-tax-residency-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "uk-statutory-residence-test-calculator";
type YN = "y" | "n";

export default function UkResidency() {
  const [x, setX] = useState({ days: 100, prior: "y" as YN, ties: 2, abroad: "n" as YN, ukWorkDays: 0, home: "n" as YN, work: "n" as YN });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const input = { residentInPrior3: x.prior === "y", ties: x.ties, fullTimeAbroad: x.abroad === "y", ukWorkDays: x.ukWorkDays, onlyHomeInUk: x.home === "y", fullTimeUkWork: x.work === "y" };
  const r = ukStatutoryResidence({ days: x.days, ...input });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={{ title: "Resident or not, by UK days in the tax year", caption: "1 = UK resident, 0 = not, with your answers about ties and work.", xLabel: "Days in the UK (6 April to 5 April)", yLabel: "UK resident", min: 0, max: 366, step: 1, current: x.days, f: (v) => (ukStatutoryResidence({ days: v, ...input }).verdict === "resident" ? 1 : 0), formatX: (n) => `${Math.round(n)} d`, formatY: (n) => (n ? "yes" : "no"), onPick: (v) => upd({ days: v }), marks: [{ at: 16, label: "16" }, { at: 46, label: "46" }, { at: 91, label: "91" }, { at: 121, label: "121" }, { at: 183, label: "183" }] }}
    >
      {(mode) => (
        <>
          <ChoiceChips<YN> legend="Were you UK resident in any of the last 3 tax years?" value={x.prior} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ prior: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Days in the UK this tax year" value={x.days} onChange={(v) => upd({ days: v })} step={1} />
            <NumberField label={`UK ties (family, accommodation, work, 90-day${x.prior === "y" ? ", country" : ""})`} value={x.ties} onChange={(v) => upd({ ties: v })} step={1} />
          </div>
          {mode === "expert" && (
            <>
              <ChoiceChips<YN> legend="Working full time abroad all year?" value={x.abroad} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes" }]} onChange={(v) => upd({ abroad: v })} />
              {x.abroad === "y" && <NumberField label="Days working in the UK (more than 3 hours)" value={x.ukWorkDays} onChange={(v) => upd({ ukWorkDays: v })} step={1} />}
              <ChoiceChips<YN> legend="Is your only home in the UK (91+ days in a row)?" value={x.home} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes" }]} onChange={(v) => upd({ home: v })} />
              <ChoiceChips<YN> legend="Full-time work in the UK for 365 days?" value={x.work} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes" }]} onChange={(v) => upd({ work: v })} />
            </>
          )}
          <LaborResult mode={mode} headline={r.verdict === "resident" ? "UK resident for this tax year" : "Not UK resident for this tax year"} sub={r.test} items={r.items} dates={[]} datesTitle="" note={`Simplified from gov.uk and HMRC guidance note RDR3. Not tax advice. Updated ${RESIDENCY_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
