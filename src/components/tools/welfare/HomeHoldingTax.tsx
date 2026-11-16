// 종합부동산세(주택분) (2026-11-16). 계산: lib/kr-home-tax-2026.ts.
import { useMemo } from "react";
import { HOME_TAX_AS_OF, comprehensiveRealEstateTax, creThreshold, type CreInput } from "../../../lib/kr-home-tax-2026";
import { CRE_ASSUMPTIONS, creTotal } from "../../../lib/kr-welfare-scenarios";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import CompareBars from "../viz/CompareBars";
import ModeToggle from "../viz/ModeToggle";
import MoneyField from "../viz/MoneyField";
import { exactWon, roughWon } from "../viz/format";
import { useAdvisoryMode } from "../viz/useAdvisoryMode";
import { CopyMemo, HowToApply, ResultCard, ScenarioBlock, YES_NO, useSaved } from "./common";

const TOOL_ID = "comprehensive-real-estate-tax-calculator";
const EXAMPLE: CreInput = { prices: [1_500_000_000], oneHouse: true, age: 62, holdYears: 7 };

export default function HomeHoldingTax() {
  const [mode, setMode] = useAdvisoryMode(TOOL_ID);
  const [input, setInput, reset] = useSaved<CreInput>("welfare-cre", EXAMPLE);
  const easy = mode === "easy";
  const money = easy ? roughWon : exactWon;
  const edit = (p: Partial<CreInput>) => setInput({ ...input, ...p });
  const prices = input.prices.length > 0 ? input.prices : [0];
  const setPrice = (k: number, v: number) => edit({ prices: prices.map((p, j) => (j === k ? v : p)) });
  const r = comprehensiveRealEstateTax(input);
  const single = prices.length === 1 && !input.corporate;
  const assumptions = useMemo(() => CRE_ASSUMPTIONS(input), [input.oneHouse, input.prices.length, input.corporate]);
  const sliders = assumptions.map((a) => a.key);

  const reasons: string[] = [];
  if (r.totalTax === 0) reasons.push(`공시가격 합계가 ${roughWon(r.deduction)} 이하라 종부세를 내지 않아요. 재산세만 내요.`);
  else {
    reasons.push(`공시가격 합계 ${roughWon(r.total)}에서 ${roughWon(r.deduction)}을 빼고 60%를 곱한 ${roughWon(r.base)}에 세율을 매겨요.`);
    if (r.heavy) reasons.push("집이 3채 이상이고 과세표준이 12억 원을 넘는 몫은 더 높은 세율(2~5%)이 붙어요.");
    reasons.push(`같은 몫에 이미 낸 재산세 ${roughWon(r.overlap)}는 빼 줘요.`);
    if (r.creditRate > 0) reasons.push(`나이와 보유 기간 덕분에 ${Math.round(r.creditRate * 100)}%를 깎아 줘요(최대 80%).`);
    reasons.push("종부세의 20%를 농어촌특별세로 같이 내요.");
    if (r.installment) reasons.push("세금이 250만 원을 넘어서 일부를 6개월 뒤에 나눠 낼 수 있어요.");
  }

  const memo = () =>
    [
      `[종합부동산세(주택분) 추정] 기준일 ${HOME_TAX_AS_OF}`,
      `주택 ${r.houses}채, 공시가격 합계 ${exactWon(r.total)}, 공제 ${exactWon(r.deduction)}, 과세표준 ${exactWon(r.base)}`,
      `산출세액 ${exactWon(r.rawTax)} − 재산세 중복분 ${exactWon(r.overlap)} − 세액공제 ${exactWon(r.credit)} = 종부세 ${exactWon(r.tax)}`,
      `농어촌특별세 ${exactWon(r.rural)}, 합계 ${exactWon(r.totalTax)}`,
      "근거: 종합부동산세법 제8조·제9조, 농어촌특별세법 제5조. 세부담 상한은 반영하지 않았어요.",
      `https://tools.oiyo.net/ko/${TOOL_ID}/`,
    ].join("\n");

  return (
    <div className="space-y-5">
      <ModeToggle mode={mode} onChange={setMode} />
      <section aria-label="입력" className="space-y-4">
        <div className="space-y-2">
          {prices.map((p, k) => (
            <div key={k} className="flex items-end gap-2">
              <div className="flex-1">
                <MoneyField label={easy ? `${k + 1}번째 집 공시가격` : `주택 ${k + 1} 공시가격(6월 1일)`} value={p} onChange={(v) => setPrice(k, v)} />
              </div>
              {prices.length > 1 && (
                <button type="button" onClick={() => edit({ prices: prices.filter((_, j) => j !== k) })} className="mb-6 min-h-11 rounded-md border border-border px-3 text-sm text-muted-foreground hover:bg-muted" aria-label={`${k + 1}번째 집 빼기`}>
                  빼기
                </button>
              )}
            </div>
          ))}
          {prices.length < 6 && (
            <button type="button" onClick={() => edit({ prices: [...prices, 500_000_000] })} className="min-h-11 rounded-md border border-border px-3 text-sm text-foreground hover:bg-muted">
              집 하나 더 넣기
            </button>
          )}
        </div>
        {single && (
          <ChoiceChips legend={easy ? "우리 집(세대 전체)에 집이 이것 하나뿐인가요?" : "1세대 1주택"} value={input.oneHouse ? "yes" : "no"} options={[...YES_NO]} onChange={(v) => edit({ oneHouse: v === "yes" })} />
        )}
        {single && input.oneHouse && (
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="나이(6월 1일 기준)" value={input.age ?? 0} onChange={(v) => edit({ age: Math.max(0, Math.round(v)) })} suffix="세" />
            <NumberField label="보유 기간" value={input.holdYears ?? 0} onChange={(v) => edit({ holdYears: Math.max(0, Math.round(v)) })} suffix="년" />
          </div>
        )}
        {!easy && (
          <ChoiceChips legend="소유자" value={input.corporate ? "corp" : "person"} options={[{ value: "person", label: "개인" }, { value: "corp", label: "법인(공제 없음)" }]} onChange={(v) => edit({ corporate: v === "corp" })} />
        )}
      </section>

      <div className="space-y-4 rounded-md border border-border bg-card px-4 py-4">
        <ResultCard
          headline={r.totalTax > 0 ? `올해 12월에 종부세 약 ${roughWon(r.totalTax)}을 내요(농어촌특별세 포함, 추정).` : `종부세 대상이 아니에요(공시가격 합계 ${roughWon(creThreshold(r.oneHouse))} 이하).`}
          reasons={reasons}
          easy={easy}
          stats={[
            { label: "과세표준", value: money(r.base) },
            { label: "종부세", value: money(r.tax) },
            { label: "농특세 포함 합계", value: money(r.totalTax) },
          ]}
        >
          {!easy && r.rawTax > 0 && (
            <CompareBars
              title="세액이 줄어드는 순서"
              items={[
                { label: "산출세액", value: r.rawTax },
                { label: "재산세 중복분 뺀 뒤", value: r.rawTax - r.overlap },
                { label: "세액공제 뒤 종부세", value: r.tax, current: true },
              ]}
              format={exactWon}
            />
          )}
        </ResultCard>
        <ScenarioBlock
          toolId={TOOL_ID}
          mode={mode}
          input={input}
          onSlide={setInput}
          assumptions={assumptions}
          evaluate={creTotal}
          sliders={sliders}
          sweeps={sliders}
          yLabel="종부세(농특세 포함)"
          formatY={roughWon}
          noTornado={sliders.length < 2}
          caption={(key) => (key === "total" ? "공시가격이 오르면 공제선을 넘는 순간부터 세금이 생기고, 구간마다 기울기가 가팔라져요." : "나이·보유 기간이 기준을 넘는 해에 공제율이 계단처럼 올라요.")}
        />
        {easy ? (
          <HowToApply
            title="이렇게 내요"
            items={["11월 말 국세청이 고지서를 보내요(홈택스·손택스에서도 볼 수 있어요).", "12월 1일~15일에 내요. 250만 원이 넘으면 일부를 6개월 뒤로 나눠 낼 수 있어요.", "부부 공동명의 1주택이면 9월 16일~30일에 1주택 특례를 신청할 수 있어요."]}
            note="전년보다 세금이 크게 늘면 세부담 상한(150%)이 적용될 수 있어요. 이 결과는 추정이에요."
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
