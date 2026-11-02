import { useState } from "react";
import { ukPensionRelief, UK_2026_27 } from "../../lib/country-pension-4";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const gbp = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function UkPensionRelief() {
  const [earnings, setEarnings] = useState("70000");
  const [net, setNet] = useState("8000");
  const e = num(earnings);
  const n = num(net);
  const r = Number.isFinite(e) && e >= 0 && e <= 10_000_000 && Number.isFinite(n) && n >= 0 && n <= 1_000_000 ? ukPensionRelief({ earnings: e, netContribution: n }) : null;

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">Earnings this tax year (GBP, before tax)<input inputMode="decimal" className={field} value={earnings} onChange={(ev) => setEarnings(ev.target.value)} /></label>
        <label className="block text-sm">You pay into a SIPP or personal pension (GBP, from your bank)<input inputMode="decimal" className={field} value={net} onChange={(ev) => setNet(ev.target.value)} /></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>Enter earnings and a payment of 0 or more.</p>
        ) : (
          <>
            <p className="text-xl font-bold">{gbp(r.gross)} goes into your pension</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Your provider claims {gbp(r.basicRelief)} basic-rate relief (20%) and adds it to the pot.</li>
              <li>
                {r.selfAssessmentRelief > 0
                  ? `Claim another ${gbp(r.selfAssessmentRelief)} through Self Assessment (or ask HMRC to change your tax code), so the real cost to you is ${gbp(r.effectiveCost)}.`
                  : "As a basic-rate taxpayer there is nothing more to claim."}
              </li>
              {r.overRelief > 0 && <li>Only {gbp(r.relievable)} gets relief: relief is limited to your earnings, or {gbp(UK_2026_27.noEarningsCap)} gross if that is higher.</li>}
              {r.overAnnualAllowance && <li>The gross amount is over the {gbp(UK_2026_27.annualAllowance)} annual allowance. Unused allowance from the last three years may cover it; otherwise a tax charge applies.</li>}
            </ul>
          </>
        )}
        <p className="mt-3 text-sm">2026/27 bands for England, Wales and Northern Ireland. Scotland uses its own rates. Workplace pensions taken through net pay or salary sacrifice get full relief automatically.</p>
      </section>
    </div>
  );
}
