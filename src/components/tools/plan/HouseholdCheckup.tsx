import { useState } from "react";
import { householdCheckup } from "../../../lib/household-checkup-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const num = (s: string) => (s.trim() === "" ? 0 : Number(s.replace(/,/g, "")));
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const BADGE = { good: "bg-success/15 text-success", watch: "bg-warning/15 text-warning", fix: "bg-destructive/15 text-destructive" } as const;
const WORD = { good: "좋아요", watch: "살펴봐요", fix: "먼저 고쳐요" } as const;

export default function HouseholdCheckup() {
  const [v, setV] = useState({ net: "4000000", spend: "2000000", save: "600000", debt: "500000", ins: "400000", fund: "6000000" });
  let r: ReturnType<typeof householdCheckup> | null = null;
  try { r = householdCheckup({ monthlyNet: num(v.net), monthlySpend: num(v.spend), monthlySaving: num(v.save), monthlyDebtPay: num(v.debt), monthlyInsurance: num(v.ins), emergencyFund: num(v.fund) }); } catch { r = null; }
  const inp = (label: string, k: keyof typeof v) => <label className="block text-sm">{label}<input inputMode="numeric" className={field} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {inp("한 달 실수령(가구 합계, 원)", "net")}
        {inp("한 달 생활비(저축·보험료·대출 제외)", "spend")}
        {inp("한 달 저축·투자", "save")}
        {inp("한 달 대출 원리금 상환", "debt")}
        {inp("한 달 보장성 보험료", "ins")}
        {inp("바로 찾을 수 있는 예금(비상금)", "fund")}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>한 달 실수령액을 넣어 주세요.</p> : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2">
              {r.items.map((i) => (
                <li key={i.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="flex items-center justify-between gap-2 text-sm font-semibold">{i.label}<span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[i.status]}`}>{WORD[i.status]}</span></p>
                  <p className="mt-1 text-2xl font-bold">{i.value}</p>
                  <p className="text-xs text-muted-foreground">참고선 {i.line}</p>
                  <p className="mt-2 text-sm">{i.tip}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">쓰고 남는 돈: <b>{won(r.leftover)}</b> ({r.leftoverPct}%){r.leftover < 0 ? " · 지출이 수입보다 많아요." : ""}</p>
            <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
          </>
        )}
      </section>
    </div>
  );
}
