// 자녀 예상 키 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts childResult.
import type { Sex } from "../../lib/health-scenarios";
import { CHILD_ASSUMPTIONS, childOf, childPlain, childResult, cmOne, type ChildLite } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["father", "mother", "sex"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: ChildLite = { father: 175, mother: 162, sex: "m" };
const SEX: { value: Sex; label: string }[] = [{ value: "m", label: "아들" }, { value: "f", label: "딸" }];

export default function ChildHeightScenario() {
  const parents = (input: ChildLite, edit: (p: Partial<ChildLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="아버지 키" value={input.father} onChange={(v) => edit({ father: v }, ["father"])} suffix="cm" step={1} min={130} />
      <NumberField label="어머니 키" value={input.mother} onChange={(v) => edit({ mother: v }, ["mother"])} suffix="cm" step={1} min={130} />
    </div>
  );
  const sex = (input: ChildLite, edit: (p: Partial<ChildLite>, k: Key[]) => void) => (
    <ChoiceChips<Sex> legend="자녀" value={input.sex} options={SEX} onChange={(v) => edit({ sex: v }, ["sex"])} />
  );
  return (
    <ScenarioTool<ChildLite, Key>
      toolId="child-height-calculator"
      example={EXAMPLE}
      assumptions={CHILD_ASSUMPTIONS}
      keys={KEYS}
      evaluate={childOf}
      resultName="예상 키"
      formatResult={cmOne}
      questions={({ input, edit }) => [
        { title: "부모 키를 알려 주세요", keys: ["father", "mother"], body: parents(input, edit) },
        { title: "아들인가요, 딸인가요?", keys: ["sex"], body: sex(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {parents(input, edit)}
          {sex(input, edit)}
        </div>
      )}
      summary={childPlain}
      metrics={(i) => {
        const r = childResult(i);
        return [
          { label: "예상 키", value: cmOne(r.mid), tone: "primary" },
          { label: "아래쪽", value: cmOne(r.low) },
          { label: "위쪽", value: cmOne(r.high) },
        ];
      }}
      sliders={["father", "mother"]}
      sweepCaption={() => "부모 키가 1cm 바뀌면 예상 키는 0.5cm 바뀌어요."}
      charts={(i) => {
        const r = childResult(i);
        return (
          <CompareBars
            title="예상 키 범위"
            caption="대부분의 아이가 아래쪽~위쪽 사이에 들어요."
            items={[
              { label: "아래쪽 (−8.5cm)", value: r.low },
              { label: "예상", value: r.mid, current: true },
              { label: "위쪽 (+8.5cm)", value: r.high },
            ]}
            format={cmOne}
          />
        );
      }}
      askTitle="미리 알아 둘 점"
      ask={["또래보다 많이 작거나 1년에 4cm 미만으로 자라면 소아청소년과 성장 진료를 받아 보세요.", "성조숙증이 의심되면(여아 8세 전, 남아 9세 전 2차 성징) 일찍 진료를 받으세요."]}
      expertFooter={(i) => {
        const r = childResult(i);
        return (
          <ResultSteps
            steps={[`(${i.father} + ${i.mother} ${i.sex === "m" ? "+ 13" : "− 13"}) ÷ 2 = ${cmOne(r.mid)}`, `범위 ±8.5cm = ${cmOne(r.low)} ~ ${cmOne(r.high)}`]}
            next={[{ href: "/ko/bmi-calculator/", label: "BMI" }, { href: "/ko/ideal-weight-calculator/", label: "표준 체중" }]}
          />
        );
      }}
    />
  );
}
