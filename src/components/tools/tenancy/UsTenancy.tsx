// California and New York tenancy: deposit cap, return deadline, notice and rent-increase limits. Logic: lib/world-tenancy-pack-2026.ts
import { useState } from "react";
import { CA_RENT_CAP_2026, TENANCY_AS_OF, usLandlordDays, usTenancy, type CaRegion, type UsState } from "../../../lib/world-tenancy-pack-2026";
import LaborResult from "../labor/LaborResult";
import ChoiceChips from "../payroll/ChoiceChips";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "california-new-york-security-deposit-notice";
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
type YN = "yes" | "no";
const YESNO = [{ value: "no" as const, label: "No" }, { value: "yes" as const, label: "Yes" }];

export default function UsTenancy() {
  const [x, setX] = useState({ state: "CA" as UsState, rent: 2400, deposit: 2400, moveOut: "2026-12-01", noticeDate: "2026-11-30", monthsLived: 18, smallLandlord: false, assistance: false, region: "la" as CaRegion, leaseMonths: 12, nycStabilized: false, leaseStart: "2026-10-01", twoYear: false });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = usTenancy({ ...x, moveOut: x.moveOut || undefined, noticeDate: x.noticeDate || undefined });
  const yn = (legend: string, v: boolean, on: (b: boolean) => void) => <ChoiceChips<YN> legend={legend} value={v ? "yes" : "no"} options={YESNO} onChange={(c) => on(c === "yes")} />;
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="en"
      currency="USD"
      curve={{
        title: "Landlord notice by how long you have lived there", caption: x.state === "CA" ? "California: 30 days under 1 year, 60 days after; 90 days with rental assistance." : "New York: 30 / 60 / 90 days by occupancy or lease length (non-renewal or a 5%+ increase).",
        xLabel: "Months lived there", yLabel: "Notice days", min: 0, max: 36, step: 1, current: x.monthsLived,
        f: (m) => usLandlordDays(x.state, m, x.assistance, x.state === "NY" ? x.leaseMonths : 0), formatX: (m) => `${Math.round(m)} mo`, formatY: (n) => `${Math.round(n)} days`,
        onPick: (m) => upd({ monthsLived: m }), marks: [{ at: 12, label: "1 year" }, ...(x.state === "NY" ? [{ at: 24, label: "2 years" }] : [])],
      }}
    >
      {(mode) => (
    <>
      <ChoiceChips<UsState> legend="State" value={x.state} options={[{ value: "CA", label: "California" }, { value: "NY", label: "New York" }]} onChange={(v) => upd({ state: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Monthly rent" value={x.rent} onChange={(v) => upd({ rent: v })} suffix="$" step={50} />
        <NumberField label="Security deposit" value={x.deposit} onChange={(v) => upd({ deposit: v })} suffix="$" step={50} />
        <NumberField label="Months you have lived there" value={x.monthsLived} onChange={(v) => upd({ monthsLived: Math.round(v) })} suffix="mo" />
        <DateField label="Move-out date" value={x.moveOut} onChange={(v) => upd({ moveOut: v })} />
        {mode === "expert" && <DateField label="Date notice is given" value={x.noticeDate} onChange={(v) => upd({ noticeDate: v })} />}
        {x.state === "NY" && mode === "expert" && <NumberField label="Lease length" value={x.leaseMonths} onChange={(v) => upd({ leaseMonths: Math.round(v) })} suffix="mo" />}
      </div>
      {x.state === "CA" ? (
        <>
          <ChoiceChips<CaRegion> legend="Region (AB 1482 maximum, 8/2026–7/2027)" value={x.region} options={(Object.keys(CA_RENT_CAP_2026) as CaRegion[]).map((k) => ({ value: k, label: `${CA_RENT_CAP_2026[k].label.split(" (")[0]} ${CA_RENT_CAP_2026[k].pct}%` }))} onChange={(v) => upd({ region: v })} />
          {mode === "expert" && <div className="flex flex-wrap gap-3">{yn("Small landlord (2 properties, 4 units max)", x.smallLandlord, (b) => upd({ smallLandlord: b }))}{yn("Rental assistance", x.assistance, (b) => upd({ assistance: b }))}</div>}
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          {yn("NYC rent-stabilized", x.nycStabilized, (b) => upd({ nycStabilized: b }))}
          {x.nycStabilized && <><DateField label="Renewal lease start" value={x.leaseStart} onChange={(v) => upd({ leaseStart: v })} />{yn("2-year renewal", x.twoYear, (b) => upd({ twoYear: b }))}</>}
        </div>
      )}
      <LaborResult mode={mode} headline={`Deposit cap ${usd(r.cap)} · returned within ${r.returnDays} days`} sub={r.maxIncreasePct !== null ? `Rent increase limit: ${r.maxIncreasePct}% (up to ${usd(x.rent * (1 + r.maxIncreasePct / 100))})` : undefined} items={r.items} dates={r.dates} datesTitle="Key dates" note={`General information and estimates from the California Attorney General, California Courts Self-Help, the DRE landlord-tenant guide, nysenate.gov, the NY Attorney General and NYC Rent Guidelines Board. Local rent control can add rules. Not legal advice. Help: selfhelp.courts.ca.gov; NY AG 1-800-771-7755; NYC 311. Updated ${TENANCY_AS_OF}. Your numbers stay in your browser.`} />
    </>
      )}
    </CurveShell>
  );
}
