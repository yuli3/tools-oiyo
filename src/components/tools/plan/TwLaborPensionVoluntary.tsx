import { useState } from "react";
import { TW_LP, twLaborPensionVoluntary } from "../../../lib/plan-gap-4-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const nt = (n: number) => `${Math.round(n).toLocaleString("zh-TW")} 元`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function TwLaborPensionVoluntary() {
  const [wage, setWage] = useState("50000");
  const [pct, setPct] = useState("6");
  const [rate, setRate] = useState("12");
  let r: ReturnType<typeof twLaborPensionVoluntary> | null = null;
  try {
    r = twLaborPensionVoluntary({ monthlyWage: num(wage), voluntaryPct: num(pct), marginalRatePct: num(rate) });
  } catch {
    r = null;
  }
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <label className="block text-sm">月提繳工資（元）<input inputMode="numeric" className={field} value={wage} onChange={(e) => setWage(e.target.value)} /></label>
        <label className="block text-sm">自願提繳率<select className={field} value={pct} onChange={(e) => setPct(e.target.value)}>{[1, 2, 3, 4, 5, 6].map((p) => <option key={p} value={p}>{p}%</option>)}</select></label>
        <label className="block text-sm">綜所稅邊際稅率<select className={field} value={rate} onChange={(e) => setRate(e.target.value)}>{TW_LP.rates.map((p) => <option key={p} value={p}>{p}%</option>)}</select></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>請輸入月提繳工資，並選擇0～6%的自願提繳率。</p>
        ) : (
          <>
            <p className="text-xl font-bold">每年自提 {nt(r.annualVoluntary)}，約少繳稅 {nt(r.taxSaving)}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>每月自提：{nt(r.monthlyVoluntary)}（從薪資扣繳）</li>
              <li>雇主至少提繳6%：每年 {nt(r.employerAnnualMin)}</li>
              <li>個人專戶每年合計：{nt(r.totalAnnual)}</li>
              <li>扣掉節稅後的實際負擔：{nt(r.netCost)}</li>
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </>
        )}
        <p className="mt-3 text-sm">自提的錢要到60歲才能領，中途不能提領。查詢個人專戶：勞保局 e化服務系統或 (02)2396-1266。</p>
      </section>
    </div>
  );
}
