// 카페인 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts caffeineLeft.
import { CAFFEINE_ASSUMPTIONS, CAFFEINE_DRINKS, caffeineCurve, caffeineLeft, caffeinePlain, hoursUntil, mg, type CaffeineLite } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["amount", "gap", "halfLife"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: CaffeineLite = { amount: 150, gap: 9, halfLife: 5 };
const DRINKS = CAFFEINE_DRINKS.map((d) => ({ value: String(d.mg), label: `${d.label} (${d.mg}mg)` }));
type Edit = (p: Partial<CaffeineLite>, k: Key[]) => void;

export default function CaffeineScenario() {
  const amount = (input: CaffeineLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<string> legend="무엇을 마셨나요?" value={String(input.amount)} options={DRINKS} onChange={(v) => edit({ amount: Number(v) }, ["amount"])} />
      <NumberField label="카페인 양(직접)" value={input.amount} onChange={(v) => edit({ amount: v }, ["amount"])} suffix="mg" step={10} min={0} />
    </div>
  );
  const gap = (input: CaffeineLite, edit: Edit) => (
    <NumberField label="마시고 잠들 때까지" value={input.gap} onChange={(v) => edit({ gap: v }, ["gap"])} suffix="시간" step={1} min={0} />
  );
  return (
    <ScenarioTool<CaffeineLite, Key>
      toolId="caffeine-calculator"
      example={EXAMPLE}
      assumptions={CAFFEINE_ASSUMPTIONS}
      keys={KEYS}
      evaluate={caffeineLeft}
      resultName="잠들 때 남은 카페인"
      formatResult={mg}
      questions={({ input, edit }) => [
        { title: "무엇을 마셨나요?", keys: ["amount"], body: amount(input, edit) },
        { title: "마시고 몇 시간 뒤에 자나요?", keys: ["gap"], body: (
          <>
            {gap(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">오후 2시에 마시고 밤 11시에 자면 9시간이에요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {amount(input, edit)}
          {gap(input, edit)}
          <NumberField label="반감기" value={input.halfLife} onChange={(v) => edit({ halfLife: v }, ["halfLife"])} suffix="시간" step={0.5} min={2} />
        </div>
      )}
      summary={caffeinePlain}
      metrics={(i) => [
        { label: "잠들 때 남은 양", value: mg(caffeineLeft(i)), tone: "primary" },
        { label: "50mg 밑까지", value: `${Math.ceil(hoursUntil(i, 50))}시간` },
        { label: "반감기", value: `${i.halfLife}시간` },
      ]}
      sliders={["amount", "gap", "halfLife"]}
      sweepCaption={(a) => (a.key === "halfLife" ? "반감기는 사람마다 3~7시간 정도로 달라요. 임신·피임약이면 더 길어요." : undefined)}
      charts={(i) => <CompareBars title="시간이 지나며 남는 카페인" caption="마신 뒤 2시간마다 남은 양이에요." items={caffeineCurve(i)} format={mg} />}
      askTitle="미리 알아 둘 점"
      ask={["임신 중이면 하루 300mg 이하로 줄이고 의료진과 상의하세요.", "불면이 계속되면 카페인을 오후 2시 전으로 옮겨 보세요."]}
      expertFooter={(i) => (
        <ResultSteps
          steps={[`남은 양 = ${i.amount} × 0.5^(${i.gap} ÷ ${i.halfLife}) = ${mg(caffeineLeft(i))}`, `50mg 밑까지 = ${i.halfLife} × log₂(${i.amount} ÷ 50) ≈ ${Math.ceil(hoursUntil(i, 50))}시간`]}
          next={[{ href: "/ko/water-intake-calculator/", label: "물 섭취량" }, { href: "/ko/heart-rate-calculator/", label: "심박수 구간" }]}
        />
      )}
    />
  );
}
