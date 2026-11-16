// 부모 집 무상 거주·무상 담보 증여 점검 (2026-11-16, Gemini 이전 B). 계산: lib/kr-household-tax-2026.ts freeUseGift.
import { FAMILY_2026, HOUSEHOLD_TAX_AS_OF, freeUseGift, type FreeUseInput } from "../../../lib/kr-household-tax-2026";
import { FREE_USE_ASSUMPTIONS, freeUseAmount } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "parent-house-free-use-gift-checker";
const EXAMPLE: FreeUseInput = { propertyValue: 1_500_000_000, coResiding: false, collateralLoan: 0, collateralInterest: 0, deductionLeft: FAMILY_2026.childDeduction };

export default function FreeUseGift() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<FreeUseInput>("household-free-use", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<FreeUseInput>) => setInput({ ...input, ...p });
  const r = freeUseGift(input);

  const reasons: string[] = [];
  if (input.coResiding) reasons.push("집 주인인 부모님과 함께 사는 집은 무상사용 증여에서 빠져요(상증법 제37조① 단서).");
  else {
    reasons.push(`세법은 집값의 2%를 1년 사용료로 보고, 5년치를 연 10%로 할인해 합쳐요. ${roughWon(r.value)} 집이면 약 ${roughWon(r.fiveYear)}이에요.`);
    reasons.push(r.useTaxable ? `이 금액이 1억 원 이상이라 5년치 ${roughWon(r.useGift)}을 한 번에 증여로 봐요. 5년이 지나도 계속 살면 다시 계산해요.` : `1억 원 미만이라 증여가 아니에요. 집값이 약 ${roughWon(r.valueLine)} 이상이면 증여가 돼요.`);
  }
  if ((input.collateralLoan ?? 0) > 0)
    reasons.push(r.collateralTaxable ? `부모님 집을 담보로 빌린 돈은 4.6% 이자와 낸 이자의 차이 ${roughWon(r.collateralGift)}가 1천만 원 이상이라 증여예요(제37조②).` : "담보 이용 이익은 연 1천만 원 미만이라 증여가 아니에요(제37조②).");
  reasons.push("월세를 조금이라도 내고 있다면 시세보다 30% 넘게 싼지(제42조)를 따로 봐요.");

  const memo = () =>
    [
      `[부모 집 무상 거주 증여 점검] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `집값 ${exactWon(r.value)} × 2% = 연 ${exactWon(r.annual)}, 5년 현가(×${r.factor.toFixed(4)}) ${exactWon(r.fiveYear)} → ${r.useTaxable ? "증여(1억 이상)" : input.coResiding ? "동거 제외" : "증여 아님"}`,
      `무상 담보 이익 ${exactWon(r.collateralBenefit)} → ${r.collateralTaxable ? "증여" : "증여 아님"}`,
      `증여세 합계 ${exactWon(r.total)} (공제 ${exactWon(input.deductionLeft ?? FAMILY_2026.childDeduction)} 반영)`,
      "근거: 상증법 제37조, 시행령 제27조, 시행규칙 제10조(2%)·제10조의5(4.6%).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "부모님 집값(시세)" : "부동산 시가(없으면 기준시가)"} value={input.propertyValue} onChange={(v) => edit({ propertyValue: v })} hint="약 13.2억 이상이면 증여" />
          <ChoiceChips<"yes" | "no"> legend="부모님과 같이 사나요?" value={input.coResiding ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ coResiding: v === "yes" })} />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-3">
            <MoneyField label="그 집을 담보로 빌린 돈" value={input.collateralLoan ?? 0} onChange={(v) => edit({ collateralLoan: v })} />
            <MoneyField label="그 대출에 낸 연 이자" value={input.collateralInterest ?? 0} onChange={(v) => edit({ collateralInterest: v })} />
            <MoneyField label="남은 증여재산공제" value={input.deductionLeft ?? FAMILY_2026.childDeduction} onChange={(v) => edit({ deductionLeft: v })} />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.useTaxable || r.collateralTaxable ? `증여로 보는 이익 약 ${roughWon(r.useGift + r.collateralGift)}, 증여세 약 ${roughWon(r.total)}(추정).` : "공짜로 살아도 증여세 대상이 아니에요(추정)."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "1년 사용료(2%)", value: money(r.annual) },
            { label: "5년치 현재가치", value: money(r.fiveYear) },
            { label: "증여세", value: money(r.total) },
          ]}
        >
          <CompareBars
            title="5년치 무상사용 이익과 1억 기준"
            items={[
              { label: "5년치 이익", value: r.fiveYear, current: true },
              { label: "증여 기준", value: FAMILY_2026.useThreshold },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={FREE_USE_ASSUMPTIONS}
          evaluate={freeUseAmount}
          sliders={["propertyValue"]}
          sweeps={["propertyValue"]}
          yLabel="증여로 보는 이익"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "propertyValue" ? `집값이 약 ${roughWon(r.valueLine)}을 넘는 순간 5년치 이익 1억여 원이 한꺼번에 증여로 잡혀요.` : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 해요"
            items={[
              "증여가 되면 무상으로 살기 시작한 날이 속한 달 말일부터 3개월 안에 증여세를 신고해요.",
              "같이 사는 경우 주민등록과 실제 거주 증빙을 남겨 두세요.",
              "시세에 맞는 월세를 내고 계좌로 주고받으면 증여 문제는 없어지고, 부모님은 임대소득을 신고해요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 집값 평가(시가·감정가)에 따라 달라져요."
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
