import { useState } from "react";
import { KR_NPS_FORMULA, krPensionEstimate } from "../../../lib/new-calc-5-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function KrPensionEstimate() {
  const [start, setStart] = useState("2010");
  const [end, setEnd] = useState("2040");
  const [income, setIncome] = useState("3000000");
  const [gap, setGap] = useState("0");
  const [spouse, setSpouse] = useState(false);
  const [deps, setDeps] = useState("0");
  let r: ReturnType<typeof krPensionEstimate> | null = null;
  try { r = krPensionEstimate({ startYear: num(start), endYear: num(end), monthlyIncome: num(income), gapMonths: num(gap) || 0, spouse, dependents: num(deps) || 0 }); } catch { r = null; }
  const inp = (label: string, v: string, set: (s: string) => void) => <label className="block text-sm">{label}<input inputMode="numeric" className={field} value={v} onChange={(e) => set(e.target.value)} /></label>;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {inp("가입 시작 연도", start, setStart)}
        {inp("마지막으로 낼 연도", end, setEnd)}
        {inp("평균 월 소득(원, 지금 돈 가치로)", income, setIncome)}
        {inp("중간에 안 낸 개월 수", gap, setGap)}
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={spouse} onChange={(e) => setSpouse(e.target.checked)} />배우자가 있어요</label>
        {inp("19세 미만 자녀·60세 이상 부모 수", deps, setDeps)}
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>1988년 이후 연도와 월 소득을 넣어 주세요.</p> : !r.eligible ? (
          <p className="text-lg font-bold">가입기간이 {r.years}년이라 10년(120개월)에 못 미쳐요. 노령연금 대신 반환일시금 대상이에요.</p>
        ) : (
          <>
            <p className="text-xl font-bold">매달 약 {won(r.monthly)} (지금 돈 가치)</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>가입기간 {r.years}년({r.months}개월) · 지급률 {r.payRatePct}%</li>
              <li>기본연금 {won(r.monthlyBasic)} + 부양가족연금 {won(r.monthlyFamily)}</li>
              <li>계산에 쓴 소득 {won(r.B)} (하한 {won(KR_NPS_FORMULA.incomeFloor)}·상한 {won(KR_NPS_FORMULA.incomeCap)}), A값 {won(KR_NPS_FORMULA.aValue)}</li>
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            <p className="mt-3 text-sm"><a className="text-primary underline underline-offset-4" href="/ko/national-pension-early-deferred-calculator/">이 금액으로 일찍 받기·늦춰 받기 비교하기</a></p>
          </>
        )}
      </section>
    </div>
  );
}
