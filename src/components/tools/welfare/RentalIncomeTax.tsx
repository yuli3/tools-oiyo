// 주택임대소득세 (2026-11-16). 계산: lib/kr-home-tax-2026.ts.
import { useMemo } from "react";
import { HOME_TAX_AS_OF, RENTAL, rentalIncomeTax, type RentalInput } from "../../../lib/kr-home-tax-2026";
import { RENTAL_ASSUMPTIONS, rentalTax } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "housing-rental-income-tax-calculator";
const EXAMPLE: RentalInput = { houses: 2, annualRent: 12_000_000, deposits: 100_000_000, registered: false, otherIncome: 40_000_000 };

export default function RentalIncomeTax() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<RentalInput>("welfare-rental", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<RentalInput>) => setInput({ ...input, ...p });
  const r = rentalIncomeTax(input);
  const assumptions = useMemo(() => RENTAL_ASSUMPTIONS(input), [input.houses >= 3]);
  const sliders = assumptions.map((a) => a.key);

  const reasons: string[] = [];
  if (r.exempt) reasons.push("집이 1채뿐이고 기준시가 12억 원 이하라 월세 수입에 세금이 없어요(국외 주택은 빼고).");
  else {
    if (r.deemed > 0) reasons.push(`집이 3채 이상이고 보증금이 3억 원을 넘어서 보증금에도 이자 몫(간주임대료) ${roughWon(r.deemed)}을 수입으로 봐요.`);
    if (input.houses <= 2) reasons.push("집이 2채 이하면 전세 보증금에는 세금이 없어요(월세만 계산해요).");
    if (r.separateAllowed) reasons.push(`수입이 2천만 원 이하라 14%로 따로 끝내는 분리과세와 다른 소득과 합치는 종합과세 중 싼 쪽을 고를 수 있어요. 지금은 ${r.better === "separate" ? "분리과세" : "종합과세"}가 싸요.`);
    else reasons.push("수입이 2천만 원을 넘어서 다른 소득과 합쳐 종합과세로 내요.");
    if (r.basic > 0) reasons.push(`다른 소득이 2천만 원 이하라 ${roughWon(r.basic)}을 기본으로 빼 줘요.`);
    if (!input.registered) reasons.push("지자체·세무서에 임대 등록을 하면 경비율 60%, 기본공제 400만 원으로 세금이 줄어요.");
  }
  if (r.highTwoHouseNotice) reasons.push("2026년부터 기준시가 12억 원 넘는 집을 포함한 2주택자도 보증금 합계가 12억 원을 넘으면 간주임대료를 낼 수 있어요. 세무서에 확인하세요.");

  const memo = () =>
    [
      `[주택임대소득세 추정] 기준일 ${HOME_TAX_AS_OF}`,
      `주택 ${input.houses}채, 월세 수입 ${exactWon(input.annualRent)}, 보증금 ${exactWon(input.deposits)}, 간주임대료 ${exactWon(r.deemed)}`,
      `수입 ${exactWon(r.revenue)}, 분리과세 ${r.separateTax === null ? "불가" : exactWon(r.separateTax)}, 종합과세(증가분) ${exactWon(r.comprehensiveTax)} (지방소득세 포함)`,
      "근거: 소득세법 제12조·제25조·제64조의2. 간주임대료 이자율 3.1%(2025 귀속).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label={easy ? "집이 몇 채인가요(부부 합산)" : "보유 주택 수(부부 합산)"} value={input.houses} onChange={(v) => edit({ houses: Math.max(0, Math.min(20, Math.round(v))) })} suffix="채" />
          <MoneyField label="1년 월세 수입 합계" value={input.annualRent} onChange={(v) => edit({ annualRent: v })} />
          <MoneyField label="받은 보증금(전세금) 합계" value={input.deposits} onChange={(v) => edit({ deposits: v })} />
          <MoneyField label={easy ? "월급 등 다른 소득(1년)" : "다른 종합소득금액(근로소득금액 등)"} value={input.otherIncome} onChange={(v) => edit({ otherIncome: v })} />
        </div>
        {input.houses === 1 && (
          <ChoiceChips legend="그 집 기준시가가 12억 원을 넘나요?" value={input.highPriceOneHouse ? "yes" : "no"} options={[...YES_NO]} onChange={(v) => edit({ highPriceOneHouse: v === "yes" })} />
        )}
        <ChoiceChips legend={easy ? "구청과 세무서에 임대사업자로 등록했나요?" : "임대 등록(지자체·세무서 모두)"} value={input.registered ? "yes" : "no"} options={[...YES_NO]} onChange={(v) => edit({ registered: v === "yes" })} />
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label="다른 소득 과세표준(모르면 0 → 소득금액의 70%로 봐요)" value={input.otherTaxBase ?? 0} onChange={(v) => edit({ otherTaxBase: v > 0 ? v : undefined })} />
            <NumberField label="종합과세 때 실제 경비율(장부)" value={Math.round((input.actualExpenseRate ?? r.expenseRate) * 100)} onChange={(v) => edit({ actualExpenseRate: Math.max(0, Math.min(100, v)) / 100 })} suffix="%" />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.tax > 0 ? `내년 5월에 월세 소득세 약 ${roughWon(r.tax)}을 내요(지방소득세 포함, ${r.better === "separate" ? "분리과세" : "종합과세"}, 추정).` : r.exempt ? "1주택이라 월세 수입에 세금이 없어요." : "이 조건이면 낼 세금이 없어요(추정)."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "과세 수입(간주임대료 포함)", value: money(r.revenue) },
            { label: "분리과세 14%", value: r.separateTax === null ? "선택 불가" : money(r.separateTax) },
            { label: "종합과세(늘어나는 세금)", value: money(r.comprehensiveTax) },
          ]}
        >
          {r.separateTax !== null && (
            <CompareBars
              title="분리과세와 종합과세 비교"
              items={[
                { label: "분리과세(14%)", value: r.separateTax, current: r.better === "separate" },
                { label: "종합과세", value: r.comprehensiveTax, current: r.better === "comprehensive" },
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
          assumptions={assumptions}
          evaluate={rentalTax}
          sliders={sliders}
          sweeps={sliders}
          yLabel="월세 소득세"
          formatY={roughWon}
          caption={(key) => (key === "annualRent" ? `수입이 ${roughWon(RENTAL.separateLimit)}을 넘으면 분리과세를 못 고르고 종합과세로만 계산해요.` : key === "deposits" ? "보증금 합계가 3억 원을 넘는 몫의 60%에 이자율을 곱한 만큼 수입이 늘어요." : "다른 소득이 많을수록 종합과세 세율이 높아져 분리과세가 유리해져요.")}
        />
        {easy ? (
          <HowToApply
            title="이렇게 신고해요"
            items={["다음 해 2월 10일까지 사업장현황신고를 해요(홈택스, 면세사업자).", "5월 1일~31일 종합소득세 신고 때 주택임대소득을 넣어요(분리과세를 골라도 신고는 해야 해요).", "등록하지 않고 임대하면 수입의 0.2% 가산세가 붙을 수 있어요."]}
            note="소형주택(전용 40㎡ 이하·기준시가 2억 원 이하)은 간주임대료를 따질 때 주택 수에서 빠져요. 이 결과는 추정이에요."
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
