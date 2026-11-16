// 상속주택 감정평가 vs 공시가격 (2026-11-16, Gemini 이전 B 4차). 계산: lib/kr-household-tax-2026.ts inheritedValuation.
import { HOUSEHOLD_TAX_AS_OF, inheritedValuation, type InheritedValuationInput } from "../../../lib/kr-household-tax-2026";
import { VALUATION_ASSUMPTIONS, valuationGap } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "inherited-house-appraisal-vs-official-price-calculator";
const EXAMPLE: InheritedValuationInput = { official: 600_000_000, appraisal: 900_000_000, otherEstate: 200_000_000, spouse: false, spouseAmount: 0, salePrice: 1_000_000_000, yearsAfter: 1, appraisalFee: 2_000_000 };
const LABEL = { official: "공시가격으로 신고", appraisal: "감정평가로 신고" } as const;

export default function InheritedHouseValuation() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<InheritedValuationInput>("household-inherited-valuation", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<InheritedValuationInput>) => setInput({ ...input, ...p });
  const r = inheritedValuation(input);

  const reasons: string[] = [
    `상속받은 집을 팔 때 '산 값'은 상속 때 신고한 값이에요. 공시가격 ${roughWon(r.official.value)}로 신고하면 나중 양도세가 ${roughWon(r.official.transfer)}, 감정가 ${roughWon(r.appraisal.value)}면 ${roughWon(r.appraisal.transfer)}예요.`,
    `상속세는 공시가격일 때 ${roughWon(r.official.inheritance)}, 감정가일 때 ${roughWon(r.appraisal.inheritance)}예요(공제 ${roughWon(r.deductions)} 반영).`,
    r.appraisal.inheritance === 0 ? "감정가로 올려도 공제 안이라 상속세가 0이에요. 이럴 땐 감정평가가 거의 늘 유리해요." : "상속세율(10~50%)과 나중 양도세율(6~45%)을 비교해 더 낮은 쪽으로 평가액을 정하는 게 핵심이에요.",
    "아파트처럼 비슷한 매매 사례가 있으면 공시가격이 아니라 그 사례가로 평가될 수 있어요. 상속개시 전후 6개월 안 매매·감정가가 우선이에요.",
  ];

  const memo = () =>
    [
      `[상속주택 감정평가 vs 공시가격] 기준일 ${HOUSEHOLD_TAX_AS_OF}`,
      `공시가격 ${exactWon(r.official.value)}: 상속세 ${exactWon(r.official.inheritance)} + 양도세 ${exactWon(r.official.transfer)} = ${exactWon(r.official.total)}`,
      `감정평가 ${exactWon(r.appraisal.value)}: 상속세 ${exactWon(r.appraisal.inheritance)} + 양도세 ${exactWon(r.appraisal.transfer)} + 수수료 ${exactWon(r.appraisal.fee)} = ${exactWon(r.appraisal.total)}`,
      `유리: ${LABEL[r.better]} (차이 ${exactWon(r.saving)}), 나중 판매가 ${exactWon(input.salePrice)}, 상속 뒤 ${input.yearsAfter}년`,
      "근거: 상증법 제60조·제61조, 시행령 제20조의3·제49조, 소득세법 시행령 제163조⑨.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MoneyField label={easy ? "집 공시가격" : "기준시가(공동주택가격)"} value={input.official} onChange={(v) => edit({ official: v })} />
          <MoneyField label={easy ? "감정평가로 나올 값(시세 근처)" : "감정평가액"} value={input.appraisal} onChange={(v) => edit({ appraisal: v })} />
          <MoneyField label={easy ? "집 말고 물려받는 재산(빚 뺀 값)" : "기타 순상속재산"} value={input.otherEstate} onChange={(v) => edit({ otherEstate: v })} />
          <MoneyField label={easy ? "나중에 팔 값" : "예상 양도가액"} value={input.salePrice} onChange={(v) => edit({ salePrice: v })} />
          <ChoiceChips<"yes" | "no"> legend="배우자가 함께 상속받나요?" value={input.spouse ? "yes" : "no"} options={YES_NO} onChange={(v) => edit({ spouse: v === "yes" })} />
          <NumberField label={easy ? "몇 년 뒤에 팔까요" : "상속 뒤 보유기간"} value={input.yearsAfter} onChange={(v) => edit({ yearsAfter: Math.max(0, v) })} suffix="년" />
        </div>
        {!easy && (
          <div className="grid gap-3 sm:grid-cols-2">
            {input.spouse && <MoneyField label="배우자가 실제 받는 금액" value={input.spouseAmount ?? 0} onChange={(v) => edit({ spouseAmount: v })} hint="5억 미만이어도 5억 공제" />}
            <MoneyField label="감정평가수수료" value={input.appraisalFee ?? 2_000_000} onChange={(v) => edit({ appraisalFee: v })} hint="500만 원까지 상속재산에서 공제" />
          </div>
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={`${LABEL[r.better]}하는 쪽이 상속세와 나중 양도세를 합쳐 약 ${roughWon(r.saving)} 덜 내요(추정).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "공시가격 합계", value: money(r.official.total) },
            { label: "감정평가 합계", value: money(r.appraisal.total) },
            { label: "차이", value: money(r.saving) },
          ]}
        >
          <CompareBars
            title="상속세 + 양도세 + 수수료"
            items={(["official", "appraisal"] as const).map((id) => ({ label: LABEL[id], value: r[id].total, current: r.better === id }))}
            format={money}
          />
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={VALUATION_ASSUMPTIONS}
          evaluate={valuationGap}
          sliders={["appraisal", "salePrice"]}
          sweeps={["otherEstate", "appraisal", "salePrice"]}
          yLabel="공시가격 합계 − 감정평가 합계"
          formatY={roughWon}
          noTornado
          caption={(k) => (k === "otherEstate" ? "0보다 위면 감정평가가 유리해요. 다른 재산이 많아 상속세율이 높아질수록 공시가격 쪽으로 기울어요." : undefined)}
        />
        {easy ? (
          <HowToApply
            title="이렇게 활용해요"
            items={[
              "상속개시일 전후 6개월 안에 감정평가를 받아야 시가로 인정돼요. 기준시가 10억 원 이하면 1곳, 넘으면 2곳이 필요해요.",
              "상속세 신고는 돌아가신 달의 말일부터 6개월 안이에요. 그 안에 감정 여부를 정해요.",
              "곧 팔 계획이면 6개월 안 매매가가 그대로 시가가 되니 미리 계산해 봐요.",
            ]}
            note="법령 정보이며 세무 자문이 아니에요. 다른 집이 있어 비과세가 안 되는 경우로 계산했고, 동거주택 상속공제·가업상속은 넣지 않았어요."
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
