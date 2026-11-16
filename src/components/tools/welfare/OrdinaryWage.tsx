// 통상임금·연장수당 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { WELFARE_AS_OF, MIN_WAGE_2026, ordinaryWage, type OrdinaryWageInput } from "../../../lib/kr-welfare-2026";
import { ORDINARY_ASSUMPTIONS, ordinaryPremium } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "ordinary-wage-calculator";
const EXAMPLE: OrdinaryWageInput = { basePay: 2_500_000, fixedAllowances: 300_000, bonusAnnual: 6_000_000, bonusConditional: true, overtime: 20, night: 0, holiday: 0, monthlyHours: 209 };

export default function OrdinaryWage() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<OrdinaryWageInput>("welfare-ordinary", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<OrdinaryWageInput>) => setInput({ ...input, ...p });
  const r = ordinaryWage(input);

  const reasons: string[] = [`한 달 통상임금 ${roughWon(r.monthly)}을 ${r.hours}시간으로 나눠 시급 ${exactWon(r.hourly)}이에요.`];
  if (r.ruling) reasons.push(`상여금에 "지급일에 재직 중"같은 조건이 붙어 있어도 2024년 12월 대법원 판결 뒤로는 통상임금에 들어가요. 판결 전 방식(시급 ${exactWon(r.hourlyBefore)})보다 연장수당이 한 달 ${roughWon(r.diffMonthly)} 늘어요.`);
  else if (input.bonusAnnual > 0) reasons.push("조건 없이 정기적으로 주는 상여금은 판결 전에도 통상임금이었어요.");
  if (input.smallFirm) reasons.push("5인 미만 사업장은 연장·야간·휴일 가산(50%)이 없고 일한 시간만큼만 받아요.");
  else reasons.push("연장근로는 시급의 1.5배, 밤 10시~아침 6시는 0.5배를 더, 휴일 8시간까지 1.5배·넘으면 2배예요.");
  if (r.belowMinWage) reasons.push(`기본급과 고정수당을 시간으로 나눈 값이 2026년 최저임금 ${MIN_WAGE_2026.toLocaleString("ko-KR")}원보다 낮아 보여요. 최저임금 산입 범위로 다시 확인하세요.`);

  const memo = () =>
    [
      `[통상임금 추정] 기준일 ${WELFARE_AS_OF}`,
      `기본급 ${exactWon(input.basePay)} + 고정수당 ${exactWon(input.fixedAllowances)} + 정기상여 ${exactWon(input.bonusAnnual)}/12 = 월 ${exactWon(r.monthly)} ÷ ${r.hours}시간 = 시급 ${exactWon(r.hourly)}`,
      `연장 ${input.overtime}시간·야간 ${input.night}시간·휴일 ${input.holiday}시간 법정 수당 월 ${exactWon(r.premium.total)} (판결 전 방식 ${exactWon(r.premiumBefore.total)}, 차이 연 ${exactWon(r.diffAnnual)})`,
      "근거: 근로기준법 제56조, 대법원 2024. 12. 19. 2020다247190 전원합의체 판결.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label="월 기본급" value={input.basePay} onChange={(v) => edit({ basePay: v })} />
          <MoneyField label={easy ? "매달 고정으로 받는 수당" : "월 고정수당(직무·자격·근속·식대 등)"} value={input.fixedAllowances} onChange={(v) => edit({ fixedAllowances: v })} />
          <MoneyField label={easy ? "1년에 받는 정기 상여" : "연 정기상여금"} value={input.bonusAnnual} onChange={(v) => edit({ bonusAnnual: v })} />
        </div>
        <ChoiceChips legend={easy ? "상여금 받는 날 회사에 다니고 있어야만 받나요?" : "상여금 재직 조건(또는 근무일수 조건)"} value={input.bonusConditional ? "yes" : "no"} options={[...YES_NO]} onChange={(v) => edit({ bonusConditional: v === "yes" })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="한 달 연장근로" value={input.overtime} onChange={(v) => edit({ overtime: Math.max(0, v) })} suffix="시간" />
          <NumberField label="한 달 야간근로(밤 10시~6시)" value={input.night} onChange={(v) => edit({ night: Math.max(0, v) })} suffix="시간" />
          <NumberField label="한 달 휴일근로" value={input.holiday} onChange={(v) => edit({ holiday: Math.max(0, v) })} suffix="시간" />
        </div>
        <ChoiceChips legend="회사 직원 수" value={input.smallFirm ? "small" : "regular"} options={[{ value: "regular", label: "5인 이상" }, { value: "small", label: "5인 미만" }]} onChange={(v) => edit({ smallFirm: v === "small" })} />
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="월 소정근로시간(주 40시간 = 209)" value={input.monthlyHours ?? 209} onChange={(v) => edit({ monthlyHours: Math.max(1, v) })} suffix="시간" />
            <NumberField label="휴일근로 중 하루 8시간 넘는 시간" value={input.holidayOver8 ?? 0} onChange={(v) => edit({ holidayOver8: Math.max(0, v) })} suffix="시간" />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.ruling && r.diffMonthly > 0 ? `통상임금 시급은 ${exactWon(r.hourly)}이고, 상여금을 넣으면 연장수당이 1년에 약 ${roughWon(r.diffAnnual)} 늘어요(추정).` : `통상임금 시급은 ${exactWon(r.hourly)}, 한 달 법정 수당은 약 ${roughWon(r.premium.total)}이에요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "시간급 통상임금", value: exactWon(r.hourly) },
            { label: "한 달 연장·야간·휴일 수당", value: money(r.premium.total) },
            { label: "연차수당 1일분", value: money(r.daily) },
          ]}
        >
          {r.ruling && (
            <CompareBars
              title="2024년 12월 판결 전후 한 달 수당"
              caption="판결 전에는 재직 조건 붙은 상여를 빼고 계산했어요."
              items={[
                { label: "판결 전 방식", value: r.premiumBefore.total },
                { label: "지금(상여 포함)", value: r.premium.total, current: true },
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
          assumptions={ORDINARY_ASSUMPTIONS}
          evaluate={ordinaryPremium}
          sliders={["overtime", "bonusAnnual"]}
          sweeps={["overtime", "bonusAnnual", "fixedAllowances"]}
          yLabel="한 달 법정 수당"
          formatY={roughWon}
          caption={(key) => (key === "overtime" ? "연장근로는 1주 12시간(한 달 약 52시간)까지가 법정 한도예요." : "통상임금에 들어가는 돈이 늘면 시급과 모든 가산수당이 같이 올라요.")}
        />
        {easy ? (
          <HowToApply
            title="덜 받았다면 이렇게 해요"
            items={["급여명세서에서 시급 계산 방법(통상임금 시급)이 적혀 있는지 봐요(2021년부터 의무).", "회사에 차액을 요청하고, 안 되면 고용노동부 노동포털(labor.moel.go.kr)에 임금체불 진정을 내요.", "임금은 3년이 지나면 청구할 수 없어서 오래된 달부터 서둘러야 해요."]}
            note="판결은 2024년 12월 19일 이후 임금분부터 적용돼요(이미 소송 중인 사건 제외). 이 결과는 추정이에요."
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
