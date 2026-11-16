// 산재 휴업급여 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { useState } from "react";
import { WELFARE_AS_OF, INJURY_2026, averageDailyWage, injuryLeavePay, type InjuryInput } from "../../../lib/kr-welfare-2026";
import { INJURY_ASSUMPTIONS, injuryDaily, injuryTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "industrial-accident-leave-pay-calculator";
const EXAMPLE: InjuryInput = { avgDailyWage: 120_000, days: 60 };
const RULE_TEXT = {
  regular: "하루 평균임금의 70%를 받아요.",
  max: `평균임금이 최고 보상기준(하루 ${INJURY_2026.maxBase.toLocaleString("ko-KR")}원)보다 많아 그 70%로 고정돼요.`,
  low90: "70%가 너무 적어 평균임금의 90%로 올려 줘요.",
  minWage: "70%가 너무 적어 최저임금(하루 82,560원)만큼 보장해요.",
} as const;

export default function InjuryLeave() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<InjuryInput>("welfare-injury", EXAMPLE);
  const [wageInput, setWageInput] = useState<"monthly" | "daily">("monthly");
  const [monthly, setMonthly] = useState(Math.round(EXAMPLE.avgDailyWage * 30.4));
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const r = injuryLeavePay(input);
  const reasons: string[] = [RULE_TEXT[r.rule]];
  if (!r.eligible) reasons.push("요양 기간이 3일 이하면 휴업급여가 없어요(회사가 평균임금 60% 이상 휴업보상을 줘요).");
  if (r.rule === "regular" && r.daily < 82_560) reasons.push("평균임금이 약 9.4만~11.8만 원이면 최저임금보다 적게 받는 '역전 구간'이에요. 법 구조 때문이라 고칠 수 없어요.");

  const memo = () =>
    [
      `[산재 휴업급여 추정] 기준일 ${WELFARE_AS_OF}`,
      `1일 평균임금 ${exactWon(input.avgDailyWage)}, 휴업 ${input.days}일`,
      `1일 휴업급여 ${exactWon(r.daily)}(${RULE_TEXT[r.rule]}), 합계 ${exactWon(r.total)}`,
      `근거: 산재보험법 제36조·제52조·제54조, 2026 최고 보상기준 ${INJURY_2026.maxBase.toLocaleString("ko-KR")}원·최저 ${INJURY_2026.minBase.toLocaleString("ko-KR")}원. 61세 이상 고령자 감액·부분휴업급여 미반영.`,
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<"monthly" | "daily"> legend="임금을 어떻게 넣을까요?" value={wageInput} options={[{ value: "monthly", label: "다치기 전 석 달 월급으로" }, { value: "daily", label: "1일 평균임금을 알아요" }]} onChange={setWageInput} />
        <div className="grid gap-3 sm:grid-cols-2">
          {wageInput === "monthly" ? (
            <MoneyField
              label={easy ? "다치기 전 석 달의 한 달 평균 월급(상여 포함, 세금 떼기 전)" : "사고 전 3개월 월평균 임금총액"}
              value={monthly}
              onChange={(v) => {
                setMonthly(v);
                setInput({ ...input, avgDailyWage: Math.round(averageDailyWage(v * 3, 92)) });
              }}
              hint="석 달 합계 ÷ 92일로 1일 평균임금을 구해요"
            />
          ) : (
            <MoneyField label="1일 평균임금" value={input.avgDailyWage} onChange={(v) => setInput({ ...input, avgDailyWage: v })} />
          )}
          <NumberField label={easy ? "일하지 못한(요양한) 날" : "휴업 일수"} value={input.days} onChange={(v) => setInput({ ...input, days: Math.max(0, Math.round(v)) })} suffix="일" />
        </div>
        {wageInput === "monthly" && <p className="text-xs text-muted-foreground">1일 평균임금 약 {exactWon(input.avgDailyWage)}로 계산해요. 정확한 값은 근로복지공단이 사고 전 3개월 날짜 수로 다시 나눠요.</p>}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.eligible ? `쉬는 동안 하루 약 ${roughWon(r.daily)}, ${r.days}일이면 모두 약 ${roughWon(r.total)}을 받아요(추정).` : "요양이 3일 이하라 휴업급여는 없어요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "1일 휴업급여", value: money(r.daily) },
            { label: "평균임금 대비", value: `${Math.round(r.ratio * 100)}%` },
            { label: `합계 (${r.days}일)`, value: money(r.total) },
          ]}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={INJURY_ASSUMPTIONS}
          evaluate={injuryDaily}
          sliders={["avgDailyWage"]}
          sweeps={["avgDailyWage"]}
          yLabel="1일 휴업급여"
          formatY={roughWon}
          noTornado
          caption={() => "평균임금이 낮을 때는 최저임금(82,560원)으로 보장되다가, 약 9.4만 원을 넘는 순간 70%로 바뀌어 잠깐 줄어들어요(역전 구간). 26.8만 원부터는 더 늘지 않아요."}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={INJURY_ASSUMPTIONS}
          evaluate={injuryTotal}
          sliders={["days"]}
          sweeps={["days"]}
          hideHeading
          yLabel="휴업급여 합계"
          formatY={roughWon}
          noTornado
          caption={() => "3일 이하는 0원이고, 4일째부터는 첫날부터 계산해요."}
        />
        {easy ? (
          <HowToApply
            items={[
              "병원에서 산재 신청(요양급여 신청)을 하면 병원이 근로복지공단에 대신 내 줄 수 있어요.",
              "승인되면 쉬는 동안 휴업급여를 근로복지공단(1588-0075)이나 고용·산재보험 토탈서비스에 청구해요.",
              "보통 한 달 단위로 의사 소견서와 함께 청구하고, 3년 안에 청구하지 않으면 사라져요.",
              "회사가 산재 신청을 막아도 근로자가 직접 신청할 수 있어요.",
            ]}
            note="61세 이상이 요양을 시작하고 2년이 지나면 휴업급여가 단계적으로 줄어요. 일하면서 치료받는 날은 부분휴업급여로 따로 계산해요."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <CopyMemo text={memo} />
            <button type="button" onClick={reset} className="min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
              예시로 되돌리기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
