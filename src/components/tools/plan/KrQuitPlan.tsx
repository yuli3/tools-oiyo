import { useState } from "react";
import { krQuitPlan } from "../../../lib/new-calc-5-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function KrQuitPlan() {
  const [wage, setWage] = useState("3000000");
  const [years, setYears] = useState("5");
  const [bonus, setBonus] = useState("0");
  const [leave, setLeave] = useState("0");
  const [ins, setIns] = useState("5");
  const [over50, setOver50] = useState(false);
  const [inv, setInv] = useState(true);
  let r: ReturnType<typeof krQuitPlan> | null = null;
  try { r = krQuitPlan({ monthlyWage: num(wage), years: num(years), annualBonus: num(bonus) || 0, annualLeavePay: num(leave) || 0, insuredYears: num(ins), age50OrDisabled: over50, involuntary: inv }); } catch { r = null; }
  const inp = (label: string, v: string, set: (s: string) => void) => <label className="block text-sm">{label}<input inputMode="decimal" className={field} value={v} onChange={(e) => set(e.target.value)} /></label>;
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        {inp("최근 3개월 월평균 임금(세전, 원)", wage, setWage)}
        {inp("이 회사에서 일한 기간(년)", years, setYears)}
        {inp("1년 상여금(원)", bonus, setBonus)}
        {inp("1년 연차수당(원)", leave, setLeave)}
        {inp("고용보험 가입 기간(년, 전 직장 포함)", ins, setIns)}
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={over50} onChange={(e) => setOver50(e.target.checked)} />50세 이상이거나 장애인이에요</label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-5" checked={inv} onChange={(e) => setInv(e.target.checked)} />권고사직·계약 만료처럼 비자발적으로 그만둬요</label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? <p>임금과 기간을 넣어 주세요.</p> : (
          <>
            <p className="text-xl font-bold">퇴사 뒤 받는 돈 약 {won(r.total)}</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>퇴직금 {won(r.severanceGross)} − 퇴직소득세 {won(r.severanceTax)} = {won(r.severanceNet)}</li>
              <li>{r.unemploymentEligible ? `실업급여 하루 ${won(r.unemploymentDaily)} × ${r.unemploymentDays}일 = ${won(r.unemploymentTotal)}` : "실업급여: 비자발적 이직이 아니거나 가입 기간이 짧아 계산에서 뺐어요."}</li>
            </ul>
            <h3 className="mt-3 font-semibold">기한</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{r.deadlines.map((d) => <li key={d}>{d}</li>)}</ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            <p className="mt-3 text-sm">이어서 보기: <a className="text-primary underline underline-offset-4" href="/ko/voluntary-quit-unemployment-checker/">자진 퇴사 실업급여 예외</a> · <a className="text-primary underline underline-offset-4" href="/ko/health-insurance-leaver-settlement/">퇴사 건강보험 정산</a> · <a className="text-primary underline underline-offset-4" href="/ko/midyear-leaver-year-end-settlement/">중도퇴사 연말정산</a></p>
          </>
        )}
      </section>
    </div>
  );
}
