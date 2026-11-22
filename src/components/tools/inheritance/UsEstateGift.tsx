// US federal estate and gift tax: 2026 exclusions and due dates. Logic: lib/world-inheritance-pack-2026.ts
import { useState } from "react";
import { INHERITANCE_AS_OF, US_EXCLUSION_2026, usEstateGift } from "../../../lib/world-inheritance-pack-2026";
import LaborResult from "../labor/LaborResult";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "us-estate-gift-tax-exclusion-2026";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function UsEstateGift() {
  const [x, setX] = useState({ estate: 5_000_000, death: "2026-02-28", gift: 25_000, giftYear: 2026 });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usEstateGift({ estate: x.estate, death: x.death || undefined, giftToOnePerson: x.gift, giftYear: x.giftYear });
  return (
    <CurveShell toolId={TOOL_ID} lang="en" currency="USD"
      curve={{ title: "How much of the estate is above the 2026 exclusion", caption: "Federal basic exclusion $15,000,000 per person in 2026.", xLabel: "Estate", yLabel: "Above exclusion", min: 0, max: 30_000_000, step: 500_000, current: x.estate, f: (v) => usEstateGift({ estate: v }).overExclusion, formatX: usd, formatY: usd, onPick: (v) => upd({ estate: v }), marks: [{ at: US_EXCLUSION_2026, label: "$15M" }] }}
    >
      {(mode) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Gross estate" value={x.estate} onChange={(v) => upd({ estate: v })} suffix="$" step={100_000} />
            <DateField label="Date of death" value={x.death} onChange={(v) => upd({ death: v })} />
            <NumberField label="Gifts to one person this year" value={x.gift} onChange={(v) => upd({ gift: v })} suffix="$" step={1_000} />
            {mode === "expert" && <NumberField label="Gift year" value={x.giftYear} onChange={(v) => upd({ giftYear: v })} step={1} />}
          </div>
          <LaborResult mode={mode} headline={r.overExclusion ? `${usd(r.overExclusion)} above the 2026 exclusion` : "Within the 2026 federal exclusion"} sub="Basic exclusion $15,000,000 · annual gift exclusion $19,000" items={r.items} dates={r.dates} datesTitle="Due dates" note={`General information from irs.gov. Estate tax rates are not calculated. Not tax advice. Updated ${INHERITANCE_AS_OF}. What you type stays in your browser.`} />
        </>
      )}
    </CurveShell>
  );
}
