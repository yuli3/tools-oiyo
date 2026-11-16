// 포괄임금 고정 연장수당 점검 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { useMemo } from "react";
import { WELFARE_AS_OF, MIN_WAGE_2026, fixedOvertimeCheck, type FixedOtInput } from "../../../lib/kr-welfare-2026";
import { FIXED_OT_ASSUMPTIONS, fixedOtShort } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "fixed-overtime-pay-checker";
const EXAMPLE: FixedOtInput = { basePay: 2_508_000, fixedOtPay: 300_000, overtime: 30, night: 4, holiday: 0, months: 12, monthlyHours: 209 };

export default function FixedOvertimeCheck() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<FixedOtInput>("welfare-fixed-ot", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<FixedOtInput>) => setInput({ ...input, ...p });
  const r = fixedOvertimeCheck(input);
  const assumptions = useMemo(() => FIXED_OT_ASSUMPTIONS(input), [input.basePay, input.fixedOtPay, input.monthlyHours, input.smallFirm]);

  const reasons: string[] = [`기본급·고정수당 ${roughWon(input.basePay)}을 ${input.monthlyHours ?? 209}시간으로 나눈 시급 ${exactWon(r.hourly)}로 계산했어요.`];
  reasons.push(`고정 연장수당 ${roughWon(r.fixed)}은 연장근로 약 ${r.coveredHours}시간 몫이에요.`);
  if (r.shortMonthly > 0) reasons.push(`실제로 일한 시간의 법정 수당이 ${roughWon(r.legal.total)}이라 한 달 ${roughWon(r.shortMonthly)}이 모자라요. 포괄임금 계약이어도 이 차액은 받을 수 있어요.`);
  else reasons.push("고정 수당이 실제 일한 시간의 법정 수당보다 많아서 모자란 돈은 없어요.");
  if (r.belowMinWage) reasons.push(`시급이 2026년 최저임금 ${MIN_WAGE_2026.toLocaleString("ko-KR")}원보다 낮아요. 한 달 약 ${roughWon(r.minWageGap)}이 모자랄 수 있어요.`);
  if (input.smallFirm) reasons.push("5인 미만 사업장은 가산(50%) 없이 일한 시간만큼만 계산해요.");

  const memo = () =>
    [
      `[포괄임금 고정 연장수당 점검] 기준일 ${WELFARE_AS_OF}`,
      `시급 ${exactWon(r.hourly)}, 연장 ${input.overtime}시간·야간 ${input.night}시간·휴일 ${input.holiday}시간 법정 수당 ${exactWon(r.legal.total)}`,
      `고정 수당 ${exactWon(r.fixed)} → 월 부족액 ${exactWon(r.shortMonthly)} × ${r.months}개월 = ${exactWon(r.shortTotal)}`,
      "근거: 근로기준법 제56조·제49조(임금채권 3년), 대법원 2010다5441.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "월급에서 고정 연장수당을 뺀 돈" : "기본급 + 고정수당(고정 연장수당 제외)"} value={input.basePay} onChange={(v) => edit({ basePay: v })} />
          <MoneyField label={easy ? "급여명세서의 고정 연장수당(시간외수당)" : "고정 연장·야간·휴일 수당"} value={input.fixedOtPay} onChange={(v) => edit({ fixedOtPay: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="실제 한 달 연장근로" value={input.overtime} onChange={(v) => edit({ overtime: Math.max(0, v) })} suffix="시간" />
          <NumberField label="실제 야간근로(밤 10시~6시)" value={input.night} onChange={(v) => edit({ night: Math.max(0, v) })} suffix="시간" />
          <NumberField label="실제 휴일근로" value={input.holiday} onChange={(v) => edit({ holiday: Math.max(0, v) })} suffix="시간" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="이렇게 일한 개월 수(최대 36)" value={input.months ?? 36} onChange={(v) => edit({ months: Math.max(0, Math.min(36, Math.round(v))) })} suffix="개월" />
          <ChoiceChips legend="회사 직원 수" value={input.smallFirm ? "small" : "regular"} options={[{ value: "regular", label: "5인 이상" }, { value: "small", label: "5인 미만" }]} onChange={(v) => edit({ smallFirm: v === "small" })} />
        </div>
        {!easy && <NumberField label="월 소정근로시간(주 40시간 = 209)" value={input.monthlyHours ?? 209} onChange={(v) => edit({ monthlyHours: Math.max(1, v) })} suffix="시간" />}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.shortTotal > 0 ? `${r.months}개월 동안 약 ${roughWon(r.shortTotal)}을 덜 받았을 수 있어요(한 달 ${roughWon(r.shortMonthly)}, 추정).` : "고정 연장수당이 실제 일한 시간을 덮고 있어요(추정)."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "법정 수당(한 달)", value: money(r.legal.total) },
            { label: "받는 고정 수당", value: money(r.fixed) },
            { label: "모자란 돈 합계", value: money(r.shortTotal) },
          ]}
        >
          <CompareBars
            title="한 달 받는 돈과 받아야 할 돈"
            items={[
              { label: "고정 연장수당", value: r.fixed, current: true },
              { label: "법정 연장·야간·휴일 수당", value: r.legal.total },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={fixedOtShort}
          sliders={["overtime", "fixedOtPay"]}
          sweeps={["overtime", "fixedOtPay", "months"]}
          yLabel="모자란 돈 합계"
          formatY={roughWon}
          caption={(key) => (key === "overtime" ? "고정 수당이 덮는 시간을 넘는 순간부터 모자란 돈이 생겨요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="모자란 돈을 받으려면"
            items={["출퇴근 기록(교통카드, 메신저·메일 시간, 출입 기록)을 모아 두세요.", "회사에 차액을 요청하고, 안 되면 노동포털(labor.moel.go.kr)에 임금체불 진정을 내요. 비용은 없어요.", "임금은 3년이 지나면 청구할 수 없어요. 퇴직했다면 14일 안에 정산해야 하고 늦으면 연 20% 지연이자가 붙어요."]}
            note="실제 근로시간을 셀 수 있는 사무직은 포괄임금 계약 자체가 무효일 수 있어요. 이 결과는 추정이에요."
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
