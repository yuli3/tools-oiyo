import { useState } from "react";
import { AU_SUPER, auSuper, type AuYear } from "../../../lib/plan-gap-4-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const aud = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function AuSuper() {
  const [year, setYear] = useState<AuYear>("2025-26");
  const [salary, setSalary] = useState("120000");
  const [ss, setSs] = useState("10000");
  const [pd, setPd] = useState("0");
  const [cf, setCf] = useState("0");
  const [tsb, setTsb] = useState(true);
  const [inc, setInc] = useState("120000");
  const [ncc, setNcc] = useState("0");
  const [mr, setMr] = useState("32");
  let r: ReturnType<typeof auSuper> | null = null;
  try {
    r = auSuper({ year, salary: num(salary), salarySacrifice: num(ss), personalDeductible: num(pd), unusedCarryForward: num(cf), tsbUnder500k: tsb, div293Income: num(inc), nonConcessional: num(ncc), marginalRatePct: num(mr) });
  } catch {
    r = null;
  }
  const rows: [string, string, (v: string) => void][] = [
    ["Salary (ordinary time earnings, AUD a year)", salary, setSalary],
    ["Salary sacrifice to super", ss, setSs],
    ["Personal contributions you will claim as a deduction", pd, setPd],
    ["Unused concessional cap from the last 5 years", cf, setCf],
    ["Income for Division 293 (taxable income etc., before super)", inc, setInc],
    ["After-tax (non-concessional) contributions", ncc, setNcc],
    ["Your marginal tax rate incl. Medicare levy (%)", mr, setMr],
  ];
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">Financial year<select className={field} value={year} onChange={(e) => setYear(e.target.value as AuYear)}><option value="2025-26">2025-26</option><option value="2026-27">2026-27</option></select></label>
        {rows.map(([label, value, set]) => (
          <label key={label} className="block text-sm">{label}<input inputMode="decimal" className={field} value={value} onChange={(e) => set(e.target.value)} /></label>
        ))}
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={tsb} onChange={(e) => setTsb(e.target.checked)} />Total super balance under {aud(AU_SUPER.carryForwardTsb)} on 30 June last year</label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>Enter amounts of 0 or more.</p>
        ) : (
          <>
            <p className="text-xl font-bold">{r.excess > 0 ? `${aud(r.excess)} over your concessional cap` : `${aud(r.roomLeft)} of concessional cap left`}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Employer super guarantee at {AU_SUPER.sgPct}%: {aud(r.sg)}</li>
              <li>Concessional contributions: {aud(r.concessional)} of {aud(r.cap)} available</li>
              <li>15% contributions tax paid by the fund: {aud(r.contributionsTax)}</li>
              <li>Division 293 tax: {aud(r.div293)}</li>
              <li>On your extra {aud(r.voluntary)}: income tax saved about {aud(r.incomeTaxSaved)}, less super tax {aud(r.superTaxOnVoluntary)} and Division 293 = {aud(r.netSaving)}</li>
              <li>Non-concessional cap {aud(r.nonConcessionalCap)}{r.nonConcessionalOver ? " — you are over the one-year cap; check whether bring-forward applies to you." : "."}</li>
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </>
        )}
        <p className="mt-3 text-sm">Your unused cap and total super balance are in ATO online services via myGov. Free help: Moneysmart (ASIC) and the ATO on 13 10 20.</p>
      </section>
    </div>
  );
}
