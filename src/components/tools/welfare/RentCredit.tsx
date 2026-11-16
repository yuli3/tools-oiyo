// 월세 세액공제 (2026-11-16). 계산: lib/kr-welfare-2026.ts.
import { useMemo } from "react";
import { WELFARE_AS_OF, RENT_CREDIT, monthlyRentCredit, type RentInput } from "../../../lib/kr-welfare-2026";
import { RENT_ASSUMPTIONS, rentTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "monthly-rent-tax-credit-calculator";
const EXAMPLE: RentInput = { income: 42_000_000, incomeType: "wage", monthlyRent: 600_000, months: 12 };
const CHECKS = ["12월 31일 기준 집이 없는 세대주예요(세대주가 공제를 안 받으면 세대원도 돼요).", "전용 85㎡ 이하이거나 기준시가 4억 원 이하인 집이에요(오피스텔·고시원도 돼요).", "임대차계약서 주소로 전입신고를 했어요.", "계좌이체 내역 등 월세를 낸 증빙이 있어요."];

export default function RentCredit() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<RentInput>("welfare-rent", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<RentInput>) => setInput({ ...input, ...p });
  const r = monthlyRentCredit(input);
  const assumptions = useMemo(() => RENT_ASSUMPTIONS(input), [input.incomeType]);
  const k = input.incomeType === "wage" ? "wage" : "comp";
  const reasons: string[] = [];
  if (r.rate === 0) reasons.push(`${input.incomeType === "wage" ? "총급여" : "종합소득금액"}이 ${roughWon(RENT_CREDIT.low[k])}을 넘어 월세 세액공제를 받을 수 없어요. 대신 신용카드 등 소득공제는 받을 수 있어요.`);
  else reasons.push(`소득이 ${roughWon(r.rate === 0.17 ? RENT_CREDIT.high[k] : RENT_CREDIT.low[k])} 이하라 낸 월세의 ${Math.round(r.rate * 100)}%를 세금에서 빼 줘요.`);
  if (r.overLimit) reasons.push("1년에 낸 월세가 1,000만 원을 넘어서 1,000만 원까지만 계산했어요.");
  if (r.limitedByTax) reasons.push("낼 세금보다 공제가 커서 낼 세금만큼만 줄어요(남는 몫은 돌려주지 않아요).");
  reasons.push("지방소득세(소득세의 10%)도 같이 줄어서 그만큼 더 돌려받아요.");

  const memo = () =>
    [
      `[월세 세액공제 추정] 기준일 ${WELFARE_AS_OF}`,
      `${input.incomeType === "wage" ? "총급여" : "종합소득금액"} ${exactWon(input.income)}, 월세 ${exactWon(input.monthlyRent)} × ${input.months}개월 = ${exactWon(r.paid)}`,
      `공제 대상 ${exactWon(r.base)} × ${Math.round(r.rate * 100)}% = 소득세 ${exactWon(r.credit)} + 지방소득세 ${exactWon(r.local)} = ${exactWon(r.total)}`,
      "근거: 조세특례제한법 제95조의2(2024년 이후 지급분 한도 1,000만 원·17%/15%).",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<RentInput["incomeType"]> legend={easy ? "어떻게 돈을 버나요?" : "소득 기준"} value={input.incomeType} options={[{ value: "wage", label: "회사에서 월급(총급여)" }, { value: "comprehensive", label: "사업·프리랜서(종합소득금액)" }]} onChange={(v) => edit({ incomeType: v })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <MoneyField label={easy ? (input.incomeType === "wage" ? "1년 연봉(비과세 빼고)" : "1년 소득(경비 뺀 금액)") : input.incomeType === "wage" ? "총급여" : "종합소득금액"} value={input.income} onChange={(v) => edit({ income: v })} />
          <MoneyField label="한 달 월세(관리비 빼고)" value={input.monthlyRent} onChange={(v) => edit({ monthlyRent: v })} />
          <NumberField label="올해 월세를 낸 달" value={input.months} onChange={(v) => edit({ months: Math.min(12, Math.max(0, Math.round(v))) })} suffix="개월" />
        </div>
        {!easy && (
          <MoneyField label="다른 세액공제 뒤 남은 산출세액(모르면 비워 두세요)" value={input.taxBeforeCredit ?? 0} onChange={(v) => edit({ taxBeforeCredit: v > 0 ? v : undefined })} hint="0이면 한도 없이 계산해요" />
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.total > 0 ? `연말정산·종합소득세에서 약 ${roughWon(r.total)}을 덜 내요(추정).` : "이 소득이면 월세 세액공제를 받을 수 없어요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "1년 낸 월세", value: money(r.paid) },
            { label: "공제율", value: `${Math.round(r.rate * 100)}%` },
            { label: "줄어드는 세금(지방세 포함)", value: money(r.total) },
          ]}
        />
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={rentTotal}
          sliders={["monthlyRent"]}
          sweeps={["monthlyRent", "income"]}
          yLabel="줄어드는 세금"
          formatY={roughWon}
          noTornado
          caption={(key) => (key === "income" ? "소득이 기준을 한 원이라도 넘으면 공제율이 계단처럼 떨어져요." : "월세가 한 달 약 83만 원(연 1,000만 원)을 넘으면 더 늘지 않아요.")}
        />
        {easy ? (
          <HowToApply
            title="받을 수 있는지 먼저 확인해요"
            items={[...CHECKS, "회사 연말정산 때 '월세액 세액공제 명세서'와 계약서·이체 내역을 내요. 놓쳤다면 5월 종합소득세 신고나 5년 안에 경정청구로 돌려받아요."]}
            note="집주인 동의는 필요 없어요. 이 결과는 추정이에요."
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
