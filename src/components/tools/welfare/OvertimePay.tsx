// 연장·야간·휴일수당 (2026-11-16 개편). 공식은 통상임금·포괄임금 도구와 같은 premiumPay(lib/kr-welfare-2026.ts) 하나만 써요.
import { MIN_WAGE_2026, WELFARE_AS_OF, premiumPay } from "../../../lib/kr-welfare-2026";
import { OVERTIME_ASSUMPTIONS, overtimeTotal, type OvertimeInput } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "overtime-pay-calculator";
const EXAMPLE: OvertimeInput = { hourly: MIN_WAGE_2026, overtime: 10, night: 5, holiday: 8, holidayOver8: 0 };

export default function OvertimePay() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<OvertimeInput>("welfare-overtime", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<OvertimeInput>) => setInput({ ...input, ...p });
  const r = premiumPay(input.hourly, input, input.smallFirm);
  const reasons: string[] = [];
  if (input.smallFirm) reasons.push("직원 5명 미만 회사는 50% 가산이 없어서 일한 시간만큼만 받아요(야간 가산도 없어요).");
  else reasons.push("연장근로는 시급의 1.5배, 밤 10시~아침 6시는 0.5배를 더, 휴일은 8시간까지 1.5배·넘으면 2배예요.");
  if (input.hourly < MIN_WAGE_2026) reasons.push(`시급이 2026년 최저임금 ${MIN_WAGE_2026.toLocaleString("ko-KR")}원보다 낮아요. 최저임금부터 확인하세요.`);
  reasons.push("상여금·고정수당이 있으면 시급이 기본급만으로 계산한 것보다 높아요. 통상임금 계산기로 시급부터 구해 보세요.");

  const memo = () =>
    [
      `[연장·야간·휴일수당] 기준일 ${WELFARE_AS_OF}`,
      `시급 ${exactWon(input.hourly)}, 연장 ${input.overtime}시간·야간 ${input.night}시간·휴일 ${input.holiday}시간(8시간 초과 ${input.holidayOver8 ?? 0}시간)${input.smallFirm ? ", 5인 미만" : ""}`,
      `연장 ${exactWon(r.overtime)} + 야간 가산 ${exactWon(r.night)} + 휴일 ${exactWon(r.holiday)} = ${exactWon(r.total)}`,
      "근거: 근로기준법 제56조, 제11조.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <MoneyField label={easy ? "시급(모르면 통상임금 계산기에서 구해요)" : "시간급 통상임금"} value={input.hourly} onChange={(v) => edit({ hourly: v })} hint={easy ? "월급만 안다면 월급 ÷ 209" : undefined} />
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="연장근로" value={input.overtime} onChange={(v) => edit({ overtime: Math.max(0, v) })} suffix="시간" step={0.5} />
          <NumberField label="야간근로(밤 10시~6시)" value={input.night} onChange={(v) => edit({ night: Math.max(0, v) })} suffix="시간" step={0.5} />
          <NumberField label="휴일근로" value={input.holiday} onChange={(v) => edit({ holiday: Math.max(0, v) })} suffix="시간" step={0.5} />
        </div>
        {!easy && <NumberField label="휴일근로 중 하루 8시간 넘는 시간" value={input.holidayOver8 ?? 0} onChange={(v) => edit({ holidayOver8: Math.max(0, v) })} suffix="시간" step={0.5} />}
        <ChoiceChips legend="회사 직원 수" value={input.smallFirm ? "small" : "regular"} options={[{ value: "regular", label: "5인 이상" }, { value: "small", label: "5인 미만" }]} onChange={(v) => edit({ smallFirm: v === "small" })} />
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`연장·야간·휴일수당은 모두 약 ${roughWon(r.total)}이에요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "연장근로수당", value: money(r.overtime) },
            { label: "야간 가산", value: money(r.night) },
            { label: "휴일근로수당", value: money(r.holiday) },
          ]}
        >
          {!input.smallFirm && r.total > 0 && (
            <CompareBars
              title="5인 이상과 5인 미만 비교"
              caption="같은 시간을 일해도 5인 미만 회사는 가산이 없어요."
              items={[
                { label: "5인 이상(가산 포함)", value: r.total, current: true },
                { label: "5인 미만(가산 없음)", value: premiumPay(input.hourly, input, true).total },
              ]}
              format={money}
            />
          )}
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={OVERTIME_ASSUMPTIONS}
          evaluate={overtimeTotal}
          sliders={["overtime", "hourly"]}
          sweeps={["overtime", "night", "holiday", "hourly"]}
          yLabel="수당 합계"
          formatY={roughWon}
          caption={(key) => (key === "overtime" ? "연장근로는 1주 12시간(한 달 약 52시간)이 법정 한도예요." : undefined)}
        />
        {easy ? (
          <p className="text-sm leading-6 text-muted-foreground">
            상여금이 있다면 <a className="underline" href="/ko/ordinary-wage-calculator/">통상임금 계산기</a>로 시급을 먼저 구하고, 시간외수당이 매달 고정이라면 <a className="underline" href="/ko/fixed-overtime-pay-checker/">포괄임금 고정 연장수당 점검</a>으로 덜 받은 돈이 있는지 확인하세요.
          </p>
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
