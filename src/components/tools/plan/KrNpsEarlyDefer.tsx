import { useState } from "react";
import { KR_NPS, krNpsEarlyDefer } from "../../../lib/plan-gap-4-2026";

const field = "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/,/g, "")));

export default function KrNpsEarlyDefer() {
  const [birth, setBirth] = useState("1966");
  const [monthly, setMonthly] = useState("1000000");
  const [mode, setMode] = useState<"early" | "defer">("early");
  const [years, setYears] = useState("1");
  const [months, setMonths] = useState("12");
  const [share, setShare] = useState("100");
  const [until, setUntil] = useState("85");
  let r: ReturnType<typeof krNpsEarlyDefer> | null = null;
  try {
    r = krNpsEarlyDefer({ birthYear: num(birth), monthly: num(monthly), mode, earlyYears: num(years), deferMonths: num(months), deferSharePct: num(share), untilAge: num(until) });
  } catch {
    r = null;
  }
  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm">출생연도<input inputMode="numeric" className={field} value={birth} onChange={(e) => setBirth(e.target.value)} /></label>
        <label className="block text-sm">정상 수령 나이의 월 예상 연금액(원, 부양가족연금 제외)<input inputMode="numeric" className={field} value={monthly} onChange={(e) => setMonthly(e.target.value)} /></label>
        <fieldset className="text-sm sm:col-span-2">
          <legend>어떻게 받을까요?</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {(["early", "defer"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`min-h-11 rounded-lg border px-4 ${mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{m === "early" ? "일찍 받기(조기)" : "늦춰 받기(연기)"}</button>
            ))}
          </div>
        </fieldset>
        {mode === "early" ? (
          <label className="block text-sm">몇 년 일찍(1~5년)<select className={field} value={years} onChange={(e) => setYears(e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}년 일찍 · {100 - 6 * n}%</option>)}</select></label>
        ) : (
          <>
            <label className="block text-sm">몇 개월 늦춰(1~60개월)<input inputMode="numeric" className={field} value={months} onChange={(e) => setMonths(e.target.value)} /></label>
            <label className="block text-sm">늦출 비율<select className={field} value={share} onChange={(e) => setShare(e.target.value)}>{KR_NPS.partialShares.map((p) => <option key={p} value={p}>{p === 100 ? "전부" : `${p}%만`}</option>)}</select></label>
          </>
        )}
        <label className="block text-sm">몇 살까지 합계를 볼까요?<input inputMode="numeric" className={field} value={until} onChange={(e) => setUntil(e.target.value)} /></label>
      </section>
      <section className="rounded-xl border border-border bg-muted p-4" aria-live="polite">
        {!r ? (
          <p>1953~2010년생, 월 연금액, 조기 1~5년 또는 연기 1~60개월을 넣어 주세요.</p>
        ) : (
          <>
            <p className="text-xl font-bold">{r.startAge}세부터 매달 {won(r.monthly)} ({r.ratePct}%)</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>정상 수령: {r.normalAge}세부터 매달 {won(r.monthly / (r.ratePct / 100))} 기준 · 조기 수령은 {r.earlyAge}세부터 가능</li>
              {r.partialKeep > 0 && <li>늦추지 않은 몫 {won(r.partialKeep)}은 {r.normalAge}세부터 그대로 받아요.</li>}
              <li>{r.untilAge}세까지 합계: 선택 {won(r.chosenTotal)} · 정상 {won(r.normalTotal)} · 차이 {won(r.difference)}</li>
              <li>{r.breakEvenAge === null ? "110세까지 합계가 역전되지 않아요." : mode === "early" ? `${r.breakEvenAge}세쯤부터 정상 수령의 합계가 더 많아져요.` : `${r.breakEvenAge}세쯤부터 늦춰 받은 쪽의 합계가 더 많아져요.`}</li>
            </ul>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </>
        )}
        <p className="mt-3 text-sm">내 예상 연금액은 국민연금공단 「내 연금 알아보기」나 1355에서 확인할 수 있어요. 조기 수령 중 소득이 A값({KR_NPS.aValue2026.toLocaleString("ko-KR")}원)을 넘으면 지급이 정지돼요.</p>
      </section>
    </div>
  );
}
