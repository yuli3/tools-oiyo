// US 2026 federal refund estimate (tax season Jan-Apr 2027). Logic: lib/world-tax-season-2027.ts
import { useState } from "react";
import { SEASON_AS_OF, usRefund2026, type UsFiling } from "../../../lib/world-tax-season-2027";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { useToday } from "../nts/Items";

const TOOL_ID = "us-tax-refund-estimator-2026";
const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;

export default function UsRefund2026() {
  const today = useToday() ?? SEASON_AS_OF;
  const [x, setX] = useState({ wages: 60_000, withheld: 6_000, filing: "single" as UsFiling, children: 0, otherIncome: 0, aged: 0 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usRefund2026({ ...x, today });
  const maxW = Math.max(10_000, Math.round((r.totalTax * 2 + 5_000) / 1000) * 1000);
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={{ title: "Refund by federal tax withheld", caption: "Box 2 of your W-2 against the 2026 tax. Above zero is a refund, below zero you owe.", xLabel: "Federal tax withheld (W-2 box 2)", yLabel: "Refund (+) or balance due (−)", min: 0, max: maxW, step: 100, current: Math.min(maxW, x.withheld), f: (w) => usRefund2026({ ...x, withheld: w, today }).refund, formatX: usd, formatY: usd, onPick: (w) => upd({ withheld: Math.round(w) }), marks: [{ at: r.totalTax, label: "break-even" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="2026 wages (W-2 box 1, $)" value={x.wages} onChange={(v) => upd({ wages: v })} step={1000} />
            <NumberField label="Federal tax withheld (W-2 box 2, $)" value={x.withheld} onChange={(v) => upd({ withheld: v })} step={100} />
            <NumberField label="Children under 17" value={x.children} onChange={(v) => upd({ children: Math.min(20, Math.round(v)) })} />
            {mode === "expert" && <NumberField label="Other income (interest, 1099, $)" value={x.otherIncome} onChange={(v) => upd({ otherIncome: v })} step={100} />}
            {mode === "expert" && <NumberField label="People 65+ or blind (you and spouse)" value={x.aged} onChange={(v) => upd({ aged: Math.min(4, Math.round(v)) })} />}
          </div>
          <ChoiceChips<UsFiling> legend="Filing status" value={x.filing} options={[{ value: "single", label: "Single" }, { value: "mfj", label: "Married filing jointly" }, { value: "hoh", label: "Head of household" }]} onChange={(v) => upd({ filing: v })} />
          <LaborResult mode={mode} headline={r.owe ? `You may owe about ${usd(-r.refund)}` : `Estimated refund: ${usd(r.refund)}`} sub={`Tax after credits ${usd(r.totalTax)} · withheld ${usd(r.withheld)}${r.actc ? ` · refundable child credit ${usd(r.actc)}` : ""} · due ${r.due} (${r.daysLeft} days)`} items={r.items} dates={[]} datesTitle="" note={`From Rev. Proc. 2025-32 and IRC §24. Federal only, not tax advice, and it does not prepare or file a return. For free help, see IRS Free File or VITA. Updated ${SEASON_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
