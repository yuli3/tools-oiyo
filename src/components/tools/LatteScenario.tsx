// 라떼 효과 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/world-money-scenarios.ts latteResult.
import { LATTE_ASSUMPTIONS, LATTE_PER_MONTH, latteFv, lattePlain, latteResult, type LatteFrequency, type LatteLite } from "../../lib/world-money-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import MoneyField from "./viz/MoneyField";
import ScenarioTool from "./viz/ScenarioTool";
import { exactWon } from "./viz/format";

const KEYS = ["cost", "freq", "rate", "years"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: LatteLite = { cost: 5_000, freq: "weekdays", rate: 0.05, years: 20 };
const FREQ: { value: LatteFrequency; label: string }[] = [
  { value: "daily", label: "매일" },
  { value: "weekdays", label: "평일만" },
  { value: "weekly", label: "주 1번" },
];
const pctField = (v: number) => Number((v * 100).toFixed(2));

export default function LatteScenario() {
  const how = (input: LatteLite, edit: (p: Partial<LatteLite>, k: Key[]) => void) => (
    <div className="space-y-3">
      <MoneyField label="한 번에 쓰는 돈(커피·담배·배달비 등)" value={input.cost} onChange={(v) => edit({ cost: v }, ["cost"])} />
      <ChoiceChips<LatteFrequency> legend="얼마나 자주" value={input.freq} options={FREQ} onChange={(v) => edit({ freq: v }, ["freq"])} />
    </div>
  );
  const grow = (input: LatteLite, edit: (p: Partial<LatteLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="연 수익률" value={pctField(input.rate)} onChange={(v) => edit({ rate: v / 100 }, ["rate"])} suffix="%" step={0.5} />
      <NumberField label="기간" value={input.years} onChange={(v) => edit({ years: v }, ["years"])} suffix="년" step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<LatteLite, Key>
      toolId="latte-factor-calculator"
      example={EXAMPLE}
      assumptions={LATTE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={latteFv}
      resultName="모이는 돈"
      questions={({ input, edit }) => [
        { title: "습관처럼 나가는 돈은 얼마인가요?", keys: ["cost", "freq"], body: how(input, edit) },
        { title: "그 돈을 모아 몇 년 굴릴까요?", keys: ["rate", "years"], body: (
          <>
            {grow(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">적금이면 3%, 주식 지수 장기 평균은 7% 안팎이에요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {how(input, edit)}
          {grow(input, edit)}
        </div>
      )}
      summary={lattePlain}
      metrics={(i, s) => {
        const r = latteResult(i);
        return [
          { label: "한 달에 모으는 돈", value: s.money(r.monthly) },
          { label: `${i.years}년 뒤`, value: s.money(r.fv), tone: "primary" },
          { label: "복리로 붙은 돈", value: s.money(r.gain) },
        ];
      }}
      sliders={["cost", "years", "rate"]}
      charts={(i, s) => (
        <CompareBars
          title="기간별로 모이는 돈"
          items={[10, 20, 30].map((y) => ({ label: `${y}년`, value: latteFv({ ...i, years: y }), current: y === i.years }))}
          format={s.money}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={[`한 달 횟수는 매일 ${LATTE_PER_MONTH.daily}번, 평일 ${LATTE_PER_MONTH.weekdays}번, 주 1번 ${LATTE_PER_MONTH.weekly}번으로 봤어요.`, "세금·물가·가격 인상은 넣지 않았어요."]}
      expertFooter={(i) => {
        const r = latteResult(i);
        return (
          <ResultSteps
            steps={[`월 금액 = ${exactWon(i.cost)} × ${LATTE_PER_MONTH[i.freq]}회 = ${exactWon(r.monthly)}`, `FV = 월 금액 × ((1+r)^n − 1) ÷ r = ${exactWon(r.fv)}`]}
            next={[{ href: "/ko/compound-interest-calculator/", label: "복리" }, { href: "/ko/savings-comparison-calculator/", label: "저축 상품 비교" }]}
          />
        );
      }}
    />
  );
}
