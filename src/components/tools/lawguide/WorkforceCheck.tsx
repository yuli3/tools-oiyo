// 상시근로자 수·근무표 점검 (2026-11-20, 전수조사 6번). 계산: lib/kr-workforce-2026.ts (법령 길잡이 스킬 guide.mjs calc workforce와 같은 코드)
import { useState } from "react";
import { WORKFORCE_AS_OF, WORKFORCE_NOTE, checkSchedule, headcountThresholds, type Shift } from "../../../lib/kr-workforce-2026";
import ChoiceChips from "../payroll/ChoiceChips";
import { track } from "../viz/track";

const TOOL_ID = "workforce-schedule-check";
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];
type Mode = "count" | "schedule";
const TONE: Record<string, string> = { warn: "text-red-700 dark:text-red-300", info: "text-foreground", good: "text-emerald-700 dark:text-emerald-300" };

export default function WorkforceCheck() {
  const [mode, setMode] = useState<Mode>("count");
  const [daily, setDaily] = useState("6 6 6 6 6 4 4 4 4 4 6 6 6 6 6 4 4 4 4 4 6 6");
  const [shifts, setShifts] = useState<(Shift & { on: boolean })[]>(DAYS.map((day, i) => ({ day, start: "09:00", end: "19:00", breakMin: 60, on: i < 5 })));
  const [small, setSmall] = useState(false);
  const [minor, setMinor] = useState(false);
  const tick = () => track("tool_calculate", { tool_id: TOOL_ID }, true);
  const nums = daily.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n) && n >= 0 && daily.trim() !== "");
  const th = headcountThresholds(nums);
  const sc = checkSchedule({ shifts: shifts.filter((s) => s.on), small, minor });
  const setShift = (i: number, p: Partial<Shift & { on: boolean }>) => { setShifts(shifts.map((s, j) => (j === i ? { ...s, ...p } : s))); tick(); };
  const input = "min-h-11 rounded-md border border-border bg-background px-2 font-mono text-base text-foreground";
  return (
    <div className="space-y-5">
      <ChoiceChips<Mode> legend="무엇을 볼까요?" value={mode} options={[{ value: "count", label: "상시근로자 수(5인 이상?)" }, { value: "schedule", label: "근무표 점검(52시간·휴게)" }]} onChange={(v) => { setMode(v); tick(); }} />
      {mode === "count" ? (
        <>
          <label className="block">
            <span className="text-sm font-medium text-muted-foreground">지난 1개월 가동일마다 일한 사람 수(띄어쓰기로 구분, 알바·단시간 포함, 파견 제외)</span>
            <textarea value={daily} onChange={(e) => { setDaily(e.target.value); tick(); }} rows={3} className="mt-1 w-full rounded-md border border-border bg-background p-3 font-mono text-base text-foreground" />
          </label>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">{th[0].opDays ? `상시근로자 ${th[0].average}명 · 5인 이상 규정 ${th[0].applies ? "적용" : "미적용"}` : "숫자를 넣어 주세요"}</p>
            {th[0].opDays > 0 && <p className="mt-1 text-muted-foreground">가동일 {th[0].opDays}일, 연인원 {th[0].total}명. {th[0].reason}</p>}
            <ul className="mt-2 space-y-1 text-foreground">
              {th.map((t) => <li key={t.n}>{t.n}명 기준({t.what}): {t.applies ? "해당" : "해당 안 함"}</li>)}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <ChoiceChips<"no" | "yes"> legend="상시 5명 미만인가요?" value={small ? "yes" : "no"} options={[{ value: "no", label: "5명 이상" }, { value: "yes", label: "5명 미만" }]} onChange={(v) => { setSmall(v === "yes"); tick(); }} />
            <ChoiceChips<"no" | "yes"> legend="18세 미만인가요?" value={minor ? "yes" : "no"} options={[{ value: "no", label: "아니요" }, { value: "yes", label: "예" }]} onChange={(v) => { setMinor(v === "yes"); tick(); }} />
          </div>
          <div className="space-y-2">
            {shifts.map((s, i) => (
              <div key={s.day} className="flex flex-wrap items-center gap-2 text-sm">
                <label className="flex min-h-11 w-14 items-center gap-1"><input type="checkbox" checked={s.on} onChange={(e) => setShift(i, { on: e.target.checked })} className="size-5" />{s.day}</label>
                <input aria-label={`${s.day} 시작`} type="time" value={s.start} disabled={!s.on} onChange={(e) => setShift(i, { start: e.target.value })} className={input} />
                <span>~</span>
                <input aria-label={`${s.day} 끝`} type="time" value={s.end} disabled={!s.on} onChange={(e) => setShift(i, { end: e.target.value })} className={input} />
                <input aria-label={`${s.day} 휴게(분)`} type="number" inputMode="numeric" value={s.breakMin} disabled={!s.on} onChange={(e) => setShift(i, { breakMin: Math.max(0, Number(e.target.value)) })} className={`${input} w-20`} />
                <span className="text-muted-foreground">분 휴게</span>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-card px-4 py-4 text-sm" aria-live="polite">
            <p className="text-lg font-semibold text-foreground">주 {sc.total}시간 · 연장 {sc.overtime}시간 · {sc.limitOk ? "한도 안" : "한도 초과"}</p>
            <ul className="mt-2 space-y-1">
              {sc.issues.map((it, i) => <li key={i} className={TONE[it.tone]}>{it.text} <span className="text-muted-foreground">({it.cite})</span></li>)}
            </ul>
          </div>
        </>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{WORKFORCE_NOTE} 기준일 {WORKFORCE_AS_OF}. 입력값은 서버로 보내지 않아요. <a className="underline" href="/ko/overtime-pay-calculator/">연장수당 계산</a> · <a className="underline" href="/ko/weekly-holiday-pay-calculator/">주휴수당 계산</a></p>
    </div>
  );
}
