// 표준 체중 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts idealResult.
import type { Sex } from "../../lib/health-scenarios";
import { IDEAL_ASSUMPTIONS, idealFormulas, idealPlain, idealResult, kgOne, standardOf, type IdealLite } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["sex", "height", "weight"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: IdealLite = { sex: "m", height: 172, weight: 72 };
const SEX: { value: Sex; label: string }[] = [{ value: "m", label: "남성" }, { value: "f", label: "여성" }];

export default function IdealWeightScenario() {
  const fields = (input: IdealLite, edit: (p: Partial<IdealLite>, k: Key[]) => void) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend="성별" value={input.sex} options={SEX} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="키" value={input.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={120} />
        <NumberField label="지금 몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
      </div>
    </div>
  );
  return (
    <ScenarioTool<IdealLite, Key>
      toolId="ideal-weight-calculator"
      example={EXAMPLE}
      assumptions={IDEAL_ASSUMPTIONS}
      keys={KEYS}
      evaluate={standardOf}
      resultName="표준 체중"
      formatResult={kgOne}
      questions={({ input, edit }) => [{ title: "몸에 대해 알려 주세요", keys: ["sex", "height", "weight"], body: fields(input, edit) }]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={idealPlain}
      metrics={(i) => {
        const r = idealResult(i);
        return [
          { label: "표준 체중", value: kgOne(r.std), tone: "primary" },
          { label: "건강한 범위", value: `${kgOne(r.low)}~${kgOne(r.high)}` },
          { label: "지금과 차이", value: `${r.gap >= 0 ? "+" : "−"}${kgOne(Math.abs(r.gap))}` },
        ];
      }}
      sliders={["height"]}
      charts={(i) => <CompareBars title="공식별 표준 체중" caption="Devine·Robinson·Miller·Hamwi는 서양 공식이라 키가 작을수록 낮게 나와요." items={idealFormulas(i)} format={kgOne} />}
      askTitle="미리 알아 둘 점"
      ask={["표준 체중은 목표 하나가 아니라 범위로 보세요.", "성장기 청소년은 성인 공식 대신 성장 도표로 보세요."]}
      expertFooter={(i) => {
        const r = idealResult(i);
        return (
          <ResultSteps
            steps={[
              `표준 체중 = (${i.height}/100)² × ${i.sex === "m" ? 22 : 21} = ${kgOne(r.std)}`,
              `건강한 범위 = 키² × 18.5 ~ 22.9 = ${kgOne(r.low)} ~ ${kgOne(r.high)}`,
              `공식 6개 범위 ${kgOne(r.min)} ~ ${kgOne(r.max)}`,
            ]}
            next={[{ href: "/ko/bmi-calculator/", label: "BMI" }, { href: "/ko/body-fat-calculator/", label: "체지방률" }]}
          />
        );
      }}
    />
  );
}
