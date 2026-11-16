// 상장주식 대주주 양도소득세 (2026-11-16). 계산: lib/kr-household-tax-2026.ts.
import { HOUSEHOLD_TAX_AS_OF, MAJOR_2026, MARKET_LABEL, majorShareholderTax, type MajorShareholderInput, type StockMarket } from "../../../lib/kr-household-tax-2026";
import { MAJOR_ASSUMPTIONS, majorTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "stock-major-shareholder-tax-calculator";
const EXAMPLE: MajorShareholderInput = { market: "kospi", heldValue: 6_000_000_000, heldShare: 0, gain: 500_000_000, sme: false, overOneYear: true };
const MARKETS = (Object.keys(MARKET_LABEL) as StockMarket[]).map((value) => ({ value, label: MARKET_LABEL[value] }));
const SLIDERS = MAJOR_ASSUMPTIONS.map((a) => a.key);
const yn = (b: boolean | undefined) => (b ? "yes" : "no");
const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export default function MajorShareholderTax() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<MajorShareholderInput>("household-major-stock", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<MajorShareholderInput>) => setInput({ ...input, ...p });
  const r = majorShareholderTax(input);

  const reasons: string[] = [];
  if (r.isMajor) {
    if (r.byValue) reasons.push(`작년 말 이 종목을 ${roughWon(input.heldValue)}어치 갖고 있어서 50억 원 기준을 넘었어요.`);
    if (r.byShare) reasons.push(`지분율이 ${MARKET_LABEL[input.market]} 기준 ${pct(r.shareLine)} 이상이에요.`);
    reasons.push(`양도차익에서 기본공제 ${roughWon(r.deduction)}을 빼고 ${r.rateNote} 세율을 매긴 뒤 지방소득세 10%를 더했어요.`);
    if (r.byValue && !r.byShare) reasons.push(`올해 말 보유를 ${roughWon(r.cutToAvoid)} 넘게 줄이면 내년에 파는 몫부터는 대주주가 아니에요(지분율 기준은 따로 봐요).`);
  } else {
    reasons.push(`작년 말 보유가 50억 원 미만이고 지분율도 ${pct(r.shareLine)} 미만이라 장내에서 팔면 양도소득세가 없어요.`);
    if (r.ifMajor > 0) reasons.push(`대주주였다면 약 ${roughWon(r.ifMajor)}을 냈을 거예요. 작년 말 보유가 50억에 가까우면 연말 보유를 확인하세요.`);
  }
  reasons.push("대주주인지는 파는 날이 아니라 직전 사업연도 말(보통 작년 12월 마지막 거래일) 보유로 정해요.");

  const memo = () =>
    [
      `[상장주식 대주주 양도세 추정] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `${MARKET_LABEL[input.market]}, 작년 말 보유 ${exactWon(input.heldValue)}, 지분율 ${pct(input.heldShare ?? 0)} → ${r.isMajor ? "대주주" : "대주주 아님"}`,
      `양도차익 ${exactWon(input.gain)} - 기본공제 ${exactWon(r.deduction)} = 과세표준 ${exactWon(r.taxBase)}`,
      `양도소득세 ${exactWon(r.national)} + 지방소득세 ${exactWon(r.local)} = ${exactWon(r.total)} (실효 ${pct(r.effectiveRate)})`,
      "근거: 소득세법 제94조·제103조·제104조, 시행령 제157조. 증권거래세는 따로예요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <ChoiceChips<StockMarket> legend="어느 시장 종목인가요?" value={input.market} options={MARKETS} onChange={(v) => edit({ market: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "작년 마지막 거래일에 가진 이 종목 값" : "직전 사업연도 말 보유 시가(최대주주면 특수관계인 합산)"} value={input.heldValue} onChange={(v) => edit({ heldValue: v })} hint="50억 원 이상이면 대주주" />
          <MoneyField label={easy ? "올해 팔아서 번 돈(이익)" : "양도차익(양도가 - 취득가 - 필요경비)"} value={input.gain} onChange={(v) => edit({ gain: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceChips legend="1년 넘게 갖고 있었나요?" value={yn(input.overOneYear)} options={YES_NO} onChange={(v) => edit({ overOneYear: v === "yes" })} />
          <ChoiceChips legend="중소기업 주식인가요?" value={yn(input.sme)} options={YES_NO} onChange={(v) => edit({ sme: v === "yes" })} />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="작년 말 지분율" value={Math.round((input.heldShare ?? 0) * 10000) / 100} onChange={(v) => edit({ heldShare: Math.max(0, v) / 100 })} suffix="%" step={0.01} />
            <ChoiceChips legend="올해 다른 주식에서 기본공제 250만을 썼나요?" value={yn(input.deductionUsed)} options={YES_NO} onChange={(v) => edit({ deductionUsed: v === "yes" })} />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.isMajor ? `대주주라서 양도세 약 ${roughWon(r.total)}을 내요(추정).` : "대주주가 아니라 장내에서 팔면 양도세가 없어요."}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "대주주 여부", value: r.isMajor ? "대주주" : "아님" },
            { label: "과세표준", value: money(r.taxBase) },
            { label: "세금(지방세 포함)", value: money(r.total) },
          ]}
        >
          <CompareBars
            title="대주주일 때와 아닐 때, 같은 이익의 세금"
            caption="장내 매도 기준이에요. 대주주가 아니면 상장주식 양도세가 없어요."
            items={[
              { label: "대주주 아님", value: 0, current: !r.isMajor },
              { label: "대주주", value: r.ifMajor, current: r.isMajor },
            ]}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={MAJOR_ASSUMPTIONS}
          evaluate={majorTotal}
          sliders={SLIDERS}
          sweeps={SLIDERS}
          yLabel="양도세(지방세 포함)"
          formatY={roughWon}
          caption={(key) =>
            key === "heldValue"
              ? `작년 말 보유가 ${roughWon(MAJOR_2026.valueLine)}을 넘는 순간 세금이 0에서 한꺼번에 생겨요.`
              : key === "gain"
                ? "과세표준 3억 원까지는 20%, 넘는 몫은 25%예요(중소기업 외 1년 미만은 30%)."
                : undefined
          }
        />
        {easy ? (
          <HowToApply
            title="이렇게 신고해요"
            items={["대주주가 판 주식은 판 달이 속한 반기 말부터 2개월 안에 예정신고해요(1~6월 매도는 8월 말, 7~12월은 다음 해 2월 말).", "다음 해 5월 확정신고로 1년 치를 합쳐 정산해요.", "증권사에서 '양도소득 계산 자료'를 받아 홈택스로 신고하면 돼요."]}
            note="최대주주 가족 합산, 비상장주식, 해외주식은 따로 따져야 해요. 이 결과는 추정이에요."
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
