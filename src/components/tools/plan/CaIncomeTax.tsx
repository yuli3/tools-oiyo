import { useState } from "react";
import { caIncomeTax2025 } from "../../../lib/new-calc-5-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function CaIncomeTax() {
  const [inc, setInc] = useState("90000");
  const [filing, setFiling] = useState<"single" | "mfj">("single");
  let r: ReturnType<typeof caIncomeTax2025> | null = null;
  try { r = caIncomeTax2025({ taxableIncome: num(inc), filing }); } catch { r = null; }
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">California taxable income, 2025 (USD)<input inputMode="decimal" className={field} value={inc} onChange={(e) => setInc(e.target.value)} /></label>
        <label className="block text-sm">Filing status<select className={field} value={filing} onChange={(e) => setFiling(e.target.value as "single" | "mfj")}><option value="single">Single or married filing separately</option><option value="mfj">Married filing jointly or qualifying surviving spouse</option></select></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>Enter a taxable income of 0 or more.</p> : (
          <>
            <p className="text-xl font-bold">California tax for 2025: {usd(r.tax)}</p>
            <ul className="mt-2 space-y-1 text-sm"><li>Marginal rate {r.marginalPct}% · average rate {r.averagePct}%</li></ul>
            <p className="mt-3 text-xs text-muted-foreground">{r.note}</p>
          </>
        )}
      </section>
    </div>
  );
}
