// England tenancy: deposit cap, protection, notice and rent-increase dates. Logic: lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { TENANCY_AS_OF, ukTenancy } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "england-tenancy-deposit-notice-checker";
const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default function UkTenancy() {
  const [x, setX] = useState({ monthlyRent: 1300, deposit: 1500, received: "2026-11-01", start: "2026-11-01", agreed: "", noticeDate: "2026-11-30" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = ukTenancy({ ...x, received: x.received || undefined, start: x.start || undefined, agreed: x.agreed || undefined, noticeDate: x.noticeDate || undefined });
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="GBP"
      curve={{
        title: "Maximum deposit by monthly rent", caption: "5 weeks' rent while annual rent is under £50,000, then 6 weeks.",
        xLabel: "Monthly rent", yLabel: "Deposit cap", min: 500, max: 6000, step: 50, current: x.monthlyRent,
        f: (v) => ukTenancy({ monthlyRent: v, deposit: 0 }).cap, formatX: gbp, formatY: gbp,
        onPick: (v) => upd({ monthlyRent: v }), marks: [{ at: 50_000 / 12, label: "£50k a year" }],
      }}
    >
      {(mode) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Monthly rent" value={x.monthlyRent} onChange={(v) => upd({ monthlyRent: v })} suffix="£" step={25} />
        <NumberField label="Deposit paid" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="£" step={25} />
        <DateField label="Date the landlord received the deposit" value={x.received} onChange={(v) => upd({ received: v })} />
        <DateField label="Date you would give or get notice" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />
        {mode === "expert" && <DateField label="Tenancy start date" value={x.start} onChange={(v) => upd({ start: v })} />}
        {mode === "expert" && <DateField label="Date you agreed the deposit refund amount" value={x.agreed} onChange={(v) => upd({ agreed: v })} />}
      </div>
      <LaborResult mode={mode} headline={r.over > 0 ? `Deposit ${gbp(r.over)} over the ${r.capWeeks}-week cap` : `Deposit cap ${gbp(r.cap)} (${r.capWeeks} weeks' rent)`} items={r.items} dates={r.dates} datesTitle="Key dates" note={`General information and estimates for private tenancies in England, from legislation.gov.uk and gov.uk (Renters' Rights Act 2025 in force from 1 May 2026). Not legal advice. Free help: Shelter, Citizens Advice or your local council. Updated ${TENANCY_AS_OF}. Your numbers stay in your browser.`} />
    </>
      )}
    </CurveShell>
  );
}
