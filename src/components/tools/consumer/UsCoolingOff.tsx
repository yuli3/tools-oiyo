// US FTC Cooling-Off Rule (16 CFR 429). Logic: lib/world-consumer-pack-2026.ts
import { useState } from "react";
import { CONSUMER_AS_OF, usCoolingOff, type UsPlace } from "../../../lib/world-consumer-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";
import { coolingCurve } from "./CoolingCurve";

const TOOL_ID = "ftc-cooling-off-rule-deadline";

export default function UsCoolingOff() {
  const [x, setX] = useState({ place: "home" as UsPlace, price: 500, saleDate: "2026-11-20", excludedItem: false, cancelSent: "", elapsed: 1 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usCoolingOff({ ...x, saleDate: x.saleDate || undefined, cancelSent: x.cancelSent || undefined });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={coolingCurve({ start: x.saleDate, lastDay: r.lastDay, title: "Days left to cancel after the sale", caption: "Three business days; Saturdays count, Sundays don't.", xLabel: "Days since sale", yLabel: "Days left", unit: (n) => `${Math.round(n)} d`, current: x.elapsed, onPick: (n) => upd({ elapsed: n }), max: 7 })}
    >
      {(mode) => (
        <>
          <ChoiceChips<UsPlace> legend="Where did you buy it?" value={x.place} options={[{ value: "home", label: "At my home" }, { value: "temporary", label: "Hotel, fair or other temporary place" }, { value: "online", label: "Online, mail or phone" }, { value: "sellerStore", label: "Seller's store" }]} onChange={(v) => upd({ place: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Price" value={x.price} onChange={(v) => upd({ price: v })} suffix="$" step={10} />
            <DateField label="Sale date" value={x.saleDate} onChange={(v) => upd({ saleDate: v })} />
            {mode === "expert" && <DateField label="Day you sent the cancellation" value={x.cancelSent} onChange={(v) => upd({ cancelSent: v })} />}
          </div>
          {mode === "expert" && <ChoiceChips<"y" | "n"> legend="Real estate, insurance, securities, or a vehicle at a temporary location?" value={x.excludedItem ? "y" : "n"} options={[{ value: "n", label: "No" }, { value: "y", label: "Yes" }]} onChange={(v) => upd({ excludedItem: v === "y" })} />}
          <LaborResult mode={mode} headline={r.lastDay ? `Cancel by midnight on ${r.lastDay}` : r.covered ? "You have three business days" : "The FTC Cooling-Off Rule doesn't cover this sale"} items={r.items} dates={r.dates} datesTitle="Deadline" note={`General information from the FTC Cooling-Off Rule (16 CFR 429, consumer.ftc.gov). State laws may give more. Not legal advice. Updated ${CONSUMER_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
