// 입사·퇴사 달 4대보험료 (2026-11-23). 계산: lib/kr-payroll-month-2026.ts joinLeaveMonths (2026 요율은 kr-rates-2026).
import { useState } from "react";
import { joinLeaveMonths } from "../../../lib/kr-payroll-month-2026";
import NumberField from "../payroll/NumberField";
import { track } from "../viz/track";

const TOOL_ID = "join-leave-month-insurance-calculator";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const inputCls = "min-h-11 w-full rounded-md border border-border bg-background px-3 text-base";

export default function JoinLeaveInsurance() {
  const [join, setJoin] = useState("2026-03-15");
  const [leave, setLeave] = useState("2026-06-10");
  const [hasLeave, setHasLeave] = useState(true);
  const [pay, setPay] = useState(3_000_000);
  const [optIn, setOptIn] = useState(false);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(join) && (!hasLeave || (/^\d{4}-\d{2}-\d{2}$/.test(leave) && leave >= join));
  const r = valid ? joinLeaveMonths({ join, leave: hasLeave ? leave : undefined, monthlyPay: pay, pensionFromJoinMonth: optIn }) : null;
  const mark = () => track("tool_calculate", { tool_id: TOOL_ID }, true);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2" aria-label="입력">
        <label className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">입사일
          <input type="date" className={inputCls} value={join} onChange={(e) => { setJoin(e.currentTarget.value); mark(); }} />
        </label>
        <div className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
          <label className="flex min-h-6 items-center gap-2"><input type="checkbox" className="size-4" checked={hasLeave} onChange={() => setHasLeave(!hasLeave)} />퇴사함(마지막 근무일)</label>
          <input type="date" aria-label="마지막 근무일" className={inputCls} value={leave} disabled={!hasLeave} onChange={(e) => { setLeave(e.currentTarget.value); mark(); }} />
        </div>
        <NumberField label="보수월액(비과세 제외)" value={pay} onChange={(v) => { setPay(v); mark(); }} suffix="원" step={10000} />
        <label className="flex min-h-11 items-center gap-2 self-end text-sm"><input type="checkbox" className="size-5" checked={optIn} onChange={() => { setOptIn(!optIn); mark(); }} />월 중간 입사지만 국민연금을 입사 달부터 내기 희망</label>
      </section>

      {!r ? <p className="text-sm text-destructive">날짜를 확인해 주세요. 마지막 근무일은 입사일 이후여야 해요.</p> : (
        <section aria-labelledby="jl-table" className="space-y-3">
          <h2 id="jl-table" className="text-lg font-semibold">달별 근로자 부담 보험료</h2>
          <p className="text-sm text-muted-foreground">국민연금 {r.firstPensionMonth}부터 · 건강·장기요양 {r.firstHealthMonth}부터 · 고용 {r.firstEmploymentMonth}부터{r.lastMonth && ` · ${r.lastMonth}까지`}</p>
          <ul className="space-y-2">
            {r.lines.map((l) => (
              <li key={l.month} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold tabular-nums">{l.month}</span>
                  <span className="font-mono font-semibold">{won(l.total)}{l.employmentCheck && " + 고용보험(확인 필요)"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">연금 {won(l.pension)} · 건강 {won(l.health)} · 장기요양 {won(l.care)} · 고용 {l.employmentCheck ? "확인 필요" : won(l.employment)}</p>
                {l.notes.map((n) => (<p key={n} className="mt-1 text-xs">{n}</p>))}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">회사 부담분은 빼고 근로자 부담분만 보여요. 건강보험은 퇴사 때 그해 보수로 다시 정산해요.</p>
        </section>
      )}
    </div>
  );
}
