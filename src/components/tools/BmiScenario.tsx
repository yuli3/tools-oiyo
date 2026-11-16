// BMI (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health-scenarios.ts bmiResult(대한비만학회 2022).
import { BMI_ASSUMPTIONS, BMI_BANDS, bmiMarks, bmiOf, bmiPlain, bmiResult, type BmiLite } from "../../lib/health-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["height", "weight"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: BmiLite = { height: 170, weight: 68 };
const one = (n: number) => (Math.round(n * 10) / 10).toLocaleString("ko-KR");
const kg = (n: number) => `${one(n)}kg`;

export default function BmiScenario() {
  const fields = (input: BmiLite, edit: (p: Partial<BmiLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="키" value={input.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={100} />
      <NumberField label="몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
    </div>
  );
  return (
    <ScenarioTool<BmiLite, Key>
      toolId="bmi-calculator"
      example={EXAMPLE}
      assumptions={BMI_ASSUMPTIONS}
      keys={KEYS}
      evaluate={bmiOf}
      resultName="BMI"
      formatResult={one}
      marksFor={(key, i) => (key === "weight" ? bmiMarks(i) : undefined)}
      questions={({ input, edit }) => [{ title: "키와 몸무게를 알려 주세요", keys: ["height", "weight"], body: fields(input, edit) }]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={bmiPlain}
      metrics={(i) => {
        const r = bmiResult(i);
        return [
          { label: "BMI", value: one(r.bmi), tone: "primary" },
          { label: "판정(한국 기준)", value: r.band },
          { label: "정상 체중", value: `${one(r.low)}~${one(r.high)}kg` },
        ];
      }}
      sliders={["weight"]}
      sweepCaption={() => "점선은 BMI 18.5·23·25가 되는 몸무게예요."}
      charts={(i) => (
        <CompareBars
          title="BMI 구간별 몸무게(이 키 기준)"
          caption="각 구간이 시작하는 몸무게예요."
          items={[18.5, 23, 25, 30].map((b) => ({ label: `BMI ${b} ${BMI_BANDS.find((x) => b < x.max)!.label}`, value: b * Math.pow(i.height / 100, 2), current: bmiOf(i) >= b && bmiOf(i) < (b === 18.5 ? 23 : b === 23 ? 25 : b === 25 ? 30 : Infinity) }))}
          format={kg}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["성인 기준이에요. 어린이·청소년은 나이별 성장 도표로 봐야 해요.", "근육량이 많거나 임신 중이면 BMI가 실제 상태와 다를 수 있어요."]}
      expertFooter={(i) => {
        const r = bmiResult(i);
        return (
          <ResultSteps
            steps={[`BMI = ${one(i.weight)}kg ÷ (${(i.height / 100).toFixed(2)}m)² = ${r.bmi.toFixed(2)}`, `구간: 18.5 미만 저체중, 23 미만 정상, 25 미만 비만 전단계, 30·35 미만 1·2단계, 그 이상 3단계 비만`]}
            next={[{ href: "/ko/body-fat-calculator/", label: "체지방률" }, { href: "/ko/tdee-calculator/", label: "하루 소비 열량" }]}
          />
        );
      }}
    />
  );
}
