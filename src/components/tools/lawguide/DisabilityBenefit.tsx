// 산재 장해급여 연금·일시금 비교 (2026-11-21, 전수조사 남은 빈칸). 계산: lib/kr-injury-disability-2026.ts (법령 길잡이 스킬 guide.mjs calc disability와 같은 코드)
import { useState } from "react";
import { DISABILITY_AS_OF, DISABILITY_NOTE, WAGE_CAP_2026, disabilityBenefit } from "../../../lib/kr-injury-disability-2026";
import DateField from "../payroll/DateField";
import NumberField from "../payroll/NumberField";
import CurveShell, { krwShort } from "../viz/CurveShell";
import { track } from "../viz/track";

const TOOL_ID = "industrial-injury-disability-calculator";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export default function DisabilityBenefit() {
  const [x, setX] = useState({ grade: 7, avgWage: 150_000, healed: "" });
  const upd = (p: Partial<typeof x>) => { setX({ ...x, ...p }); track("tool_calculate", { tool_id: TOOL_ID }, true); };
  const r = disabilityBenefit({ grade: x.grade, avgWage: x.avgWage, healed: x.healed || undefined });
  const box = "rounded-md border border-border bg-card px-4 py-4 text-sm";
  return (
    <CurveShell
      toolId={TOOL_ID}
      lang="ko"
      currency="KRW"
      curve={{
        title: "1일 평균임금에 따라 장해급여가 이렇게 바뀌어요", caption: "연금 등급은 해마다 받는 연금, 8~14급은 일시금이에요. 최저·최고 보상기준 밖은 평평해요.",
        xLabel: "1일 평균임금", yLabel: "장해급여", min: 50_000, max: 320_000, step: 1_000, current: x.avgWage,
        f: (v) => { const b = disabilityBenefit({ grade: x.grade, avgWage: v }); return b.pensionAnnual ?? b.lumpSum ?? 0; },
        formatX: (n: number) => `${Math.round(n / 1000).toLocaleString("ko-KR")}천 원`, formatY: krwShort,
        onPick: (v) => upd({ avgWage: v }),
        marks: [{ at: WAGE_CAP_2026.min, label: "최저 보상기준" }, { at: WAGE_CAP_2026.max, label: "최고 보상기준" }],
      }}
    >
      {() => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="장해등급(1~14급)" suffix="급" value={x.grade} onChange={(v) => upd({ grade: Math.min(14, Math.max(1, Math.round(v))) })} />
        <NumberField label="1일 평균임금(사고 전 3개월 임금 ÷ 일수)" suffix="원" value={x.avgWage} onChange={(v) => upd({ avgWage: Math.max(0, v) })} />
        <DateField label="치유(증상 고정)일, 모르면 비워요" value={x.healed} onChange={(v) => upd({ healed: v })} />
      </div>
      <div className={box} aria-live="polite">
        <p className="text-lg font-semibold text-foreground">
          {r.form === "pension-only" && `${r.grade}급은 연금으로만 받아요: 해마다 ${won(r.pensionAnnual ?? 0)}`}
          {r.form === "choice" && `${r.grade}급은 연금과 일시금 중 골라요`}
          {r.form === "lump-only" && `${r.grade}급은 일시금으로 받아요: ${won(r.lumpSum ?? 0)}`}
        </p>
        {r.form === "choice" && (
          <>
            <p className="mt-1 text-foreground">연금: 해마다 {won(r.pensionAnnual ?? 0)}(월 약 {won(r.pensionMonthly ?? 0)}, {r.pensionDays}일분) · 일시금: {won(r.lumpSum ?? 0)}({r.lumpDays}일분)</p>
            <p className="mt-1 text-foreground">일시금은 연금 약 {r.breakEvenYears}년치예요. 그보다 오래 받을 것 같으면 연금이 더 많아요.</p>
          </>
        )}
        {r.capped && <p className="mt-1 text-warning">평균임금이 2026년 {r.capped === "max" ? `최고보상기준금액 ${won(WAGE_CAP_2026.max)}` : `최저보상기준금액 ${won(WAGE_CAP_2026.min)}`}으로 바뀌어 계산됐어요.</p>}
        {r.advance.length > 0 && <p className="mt-1 text-muted-foreground">연금 선급(신청 시): {r.advance.map((a) => `처음 ${a.years}년분의 1/2 ${won(a.amount)}`).join(" · ")}</p>}
        {r.claimBy && <p className="mt-1 text-foreground">청구 시효: <span className="font-mono">{r.claimBy}</span>까지(5년)</p>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{DISABILITY_NOTE} 기준일 {DISABILITY_AS_OF}. 입력값은 서버로 보내지 않아요.</p>
    </>
      )}
    </CurveShell>
  );
}
