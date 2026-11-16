// 가족 간 저가 양수도 점검 (2026-11-16, Gemini 이전 B). 계산: lib/kr-household-tax-2026.ts lowPriceSale.
import { FAMILY_2026, HOUSEHOLD_TAX_AS_OF, lowPriceSale, type LowPriceSaleInput } from "../../../lib/kr-household-tax-2026";
import { LOW_PRICE_ASSUMPTIONS, lowPriceGift } from "../../../lib/kr-welfare-scenarios";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, useSaved } from "./common";

const TOOL_ID = "family-low-price-sale-checker";
const EXAMPLE: LowPriceSaleInput = { marketValue: 1_100_000_000, price: 700_000_000, deductionLeft: FAMILY_2026.childDeduction };

export default function LowPriceSale() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<LowPriceSaleInput>("household-low-price", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<LowPriceSaleInput>) => setInput({ ...input, ...p });
  const r = lowPriceSale(input);
  const assumptions = LOW_PRICE_ASSUMPTIONS(input);

  const reasons: string[] = [
    `시가보다 ${roughWon(r.diff)} 싸게 거래해요.`,
    r.giftTaxable
      ? `사는 사람: 차이가 시가의 30%와 3억 원 중 적은 ${roughWon(r.giftLine)} 이상이라, 그 기준을 뺀 ${roughWon(r.gift)}을 증여로 봐요(상증법 제35조).`
      : `사는 사람: 차이가 ${roughWon(r.giftLine)}(시가 30%와 3억 중 적은 값) 미만이라 증여세가 없어요.`,
    r.sellerRecalc
      ? `파는 사람: 차이가 시가의 5%와 3억 원 중 적은 ${roughWon(r.transferLine)} 이상이라, 양도세는 거래가가 아니라 시가 ${roughWon(r.marketValue)}로 다시 계산해요(소득세법 제101조).`
      : `파는 사람: 차이가 ${roughWon(r.transferLine)} 미만이라 양도세는 실제 거래가로 계산해요.`,
    `두 문제를 모두 피하려면 ${roughWon(Math.max(r.noGiftAbove, r.noRecalcAbove + 1))} 이상에 거래해야 해요.`,
  ];

  const memo = () =>
    [
      `[가족 간 저가 양수도 점검] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `시가 ${exactWon(r.marketValue)}, 거래가 ${exactWon(r.price)}, 차이 ${exactWon(r.diff)}`,
      `증여: 기준 ${exactWon(r.giftLine)} → ${r.giftTaxable ? `증여재산 ${exactWon(r.gift)}, 증여세 ${exactWon(r.giftTax)}` : "과세 없음"}`,
      `양도세: 기준 ${exactWon(r.transferLine)} → ${r.sellerRecalc ? `양도가액 시가 ${exactWon(r.marketValue)}로 재계산` : "거래가 인정"}`,
      "근거: 상증법 제35조, 시행령 제26조, 소득세법 제101조, 시행령 제167조③. 배우자·직계 양도 시 제44조 증여 추정도 확인.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "집 시세(주변 거래가·감정가)" : "시가(매매사례가액·감정가액)"} value={input.marketValue} onChange={(v) => edit({ marketValue: v })} />
          <MoneyField label={easy ? "가족끼리 정한 값" : "실제 거래가액"} value={input.price} onChange={(v) => edit({ price: v })} />
          {!easy && <MoneyField label="사는 사람의 남은 증여재산공제" value={input.deductionLeft ?? FAMILY_2026.childDeduction} onChange={(v) => edit({ deductionLeft: v })} />}
        </div>
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={
            r.giftTaxable || r.sellerRecalc
              ? `${[r.giftTaxable ? `증여 약 ${roughWon(r.gift)}` : null, r.sellerRecalc ? "양도세 시가 재계산" : null].filter(Boolean).join(", ")} 문제가 생겨요(추정).`
              : "이 값이면 증여세·양도세 재계산 문제가 없어요(추정)."
          }
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "싸게 산 금액", value: money(r.diff) },
            { label: "증여재산", value: money(r.gift) },
            { label: "증여세", value: money(r.giftTax) },
          ]}
        >
          <CompareBars
            title="얼마까지 싸게 팔아도 되나"
            caption="거래가가 이 선보다 높으면 각 문제가 사라져요."
            items={[
              { label: "실제 거래가", value: r.price, current: true },
              { label: "증여 없는 최저가", value: r.noGiftAbove },
              { label: "양도세 재계산 없는 최저가", value: r.noRecalcAbove + 1 },
              { label: "시가", value: r.marketValue },
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
          evaluate={lowPriceGift}
          sliders={["price"]}
          sweeps={["price", "marketValue"]}
          yLabel="증여재산가액"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "price" ? "거래가가 '증여 경계'보다 낮아질수록 1원당 1원씩 증여가 늘어요. '양도세 경계'보다 낮으면 파는 사람 양도세는 시가로 계산해요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 해요"
            items={[
              "거래 전에 감정평가를 받거나 비슷한 집의 최근 거래가를 모아 시가 근거를 남겨요.",
              "대금은 반드시 계좌로 주고받아요. 대금을 돌려받거나 안 주면 전체가 증여가 될 수 있어요.",
              "증여가 생기면 산 날이 속한 달 말일부터 3개월 안에 증여세를, 파는 사람은 2개월 안에 양도세를 신고해요.",
              "1세대 1주택 비과세(12억 이하)도 시가로 다시 판정될 수 있어요.",
            ]}
            note="법령 정보이며 세무 대리·자문이 아니에요. 시가 판정이 결과를 좌우해요."
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
