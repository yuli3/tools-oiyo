// UK cancellation period (Consumer Contracts Regulations 2013). Logic: lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, ukCoolingOff, type UkKind } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "uk-consumer-cancellation-period";

export default function UkCoolingOff() {
  const [x, setX] = useState({ kind: "goods" as UkKind, date: "2026-11-20", infoGiven: true, infoDate: "", elapsed: 3 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const goods = x.kind !== "services";
  const r = ukCoolingOff({ kind: x.kind, delivered: goods ? x.date : undefined, contractDate: goods ? undefined : x.date, infoGiven: x.infoGiven, infoDate: x.infoDate || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="GBP"
      curve={coolingCurve({ start: x.date, lastDay: r.lastDay, title: "Days left to cancel as time passes", caption: "Counted from the start date you entered. Send your cancellation before it reaches zero.", xLabel: "Days since start", yLabel: "Days left", unit: (n) => `${Math.round(n)} d`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 20 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<UkKind> legend="What did you buy?" value={x.kind} options={[{ value: "goods", label: "Goods" }, { value: "multipleGoods", label: "Several items, separate deliveries" }, { value: "regularDelivery", label: "Regular deliveries" }, { value: "services", label: "A service" }]} onChange={(v) => upd({ kind: v })} />
          <DateField label={goods ? "Day the goods arrived" : "Day the contract was made"} value={x.date} onChange={(v) => upd({ date: v })} />
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Did the trader tell you about your right to cancel?" value={x.infoGiven ? "y" : "n"} options={[{ value: "y", label: "Yes" }, { value: "n", label: "No" }]} onChange={(v) => upd({ infoGiven: v === "y" })} />}
          {mode === "expert" && !x.infoGiven && <DateField label="Day you finally got the information (if any)" value={x.infoDate} onChange={(v) => upd({ infoDate: v })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `Cancel by ${r.lastDay}` : "You have 14 days"} sub="Online, phone and doorstep contracts" items={r.items} dates={r.dates} datesTitle="Deadline" note={`General information from the Consumer Contracts Regulations 2013 (legislation.gov.uk). Not legal advice. For help, contact the Citizens Advice consumer service. Updated ${CONSUMER_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
