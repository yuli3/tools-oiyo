import { useState } from "react";
import { JP_FURUSATO_RATES, jpFurusatoLimit } from "../../../lib/new-calc-5-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const yen = (n: number) => `${Math.round(n).toLocaleString("ja-JP")}円`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function JpFurusato() {
  const [levy, setLevy] = useState("200000");
  const [rate, setRate] = useState("10");
  const [don, setDon] = useState("");
  let r: ReturnType<typeof jpFurusatoLimit> | null = null;
  try { r = jpFurusatoLimit({ residentIncomeLevy: num(levy), incomeTaxRatePct: num(rate), donation: don.trim() ? num(don) : undefined }); } catch { r = null; }
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm">住民税の所得割額（円）<input inputMode="numeric" className={field} value={levy} onChange={(e) => setLevy(e.target.value)} /></label>
        <label className="block text-sm">所得税の税率<select className={field} value={rate} onChange={(e) => setRate(e.target.value)}>{JP_FURUSATO_RATES.map((p) => <option key={p} value={p}>{p}%</option>)}</select></label>
        <label className="block text-sm">寄附予定額（任意）<input inputMode="numeric" className={field} value={don} onChange={(e) => setDon(e.target.value)} /></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>所得割額と税率を入れてください。</p> : (
          <>
            <p className="text-xl font-bold">自己負担2,000円で済む寄附の目安：{yen(r.limit)}</p>
            <p className="mt-1 text-sm">所得割額 × {r.coefficientPct}% + 2,000円</p>
            {r.breakdown && (
              <ul className="mt-2 space-y-1 text-sm">
                <li>所得税（復興特別所得税を含む）：{yen(r.breakdown.incomeTax)}</li>
                <li>住民税 基本分：{yen(r.breakdown.residentBasic)}</li>
                <li>住民税 特例分：{yen(r.breakdown.residentSpecial)}{r.breakdown.capped ? "（所得割額の2割で頭打ち）" : ""}</li>
                <li>実質負担：{yen(r.breakdown.selfBurden)}</li>
              </ul>
            )}
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </>
        )}
      </section>
    </div>
  );
}
