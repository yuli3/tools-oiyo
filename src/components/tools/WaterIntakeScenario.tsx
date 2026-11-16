// 물 섭취량 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts waterResult.
import { WATER_ACTIVITY, WATER_ASSUMPTIONS, WATER_TEMP, ml, waterOf, waterPlain, waterResult, type WaterActivity, type WaterLite, type WaterTemp } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import BridgeChart from "./viz/BridgeChart";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["weight", "activity", "temp", "alcohol"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: WaterLite = { weight: 65, activity: "moderate", temp: "normal", alcohol: 0 };
const ACTS = (Object.keys(WATER_ACTIVITY) as WaterActivity[]).map((a) => ({ value: a, label: WATER_ACTIVITY[a].label }));
const TEMPS = (Object.keys(WATER_TEMP) as WaterTemp[]).map((a) => ({ value: a, label: WATER_TEMP[a].label }));
type Edit = (p: Partial<WaterLite>, k: Key[]) => void;

export default function WaterIntakeScenario() {
  const day = (input: WaterLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<WaterActivity> legend="오늘 운동량" value={input.activity} options={ACTS} onChange={(v) => edit({ activity: v }, ["activity"])} />
      <ChoiceChips<WaterTemp> legend="날씨" value={input.temp} options={TEMPS} onChange={(v) => edit({ temp: v }, ["temp"])} />
      <NumberField label="마신 술" value={input.alcohol} onChange={(v) => edit({ alcohol: v }, ["alcohol"])} suffix="잔" step={1} min={0} />
    </div>
  );
  const weight = (input: WaterLite, edit: Edit) => (
    <NumberField label="몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
  );
  return (
    <ScenarioTool<WaterLite, Key>
      toolId="water-intake-calculator"
      example={EXAMPLE}
      assumptions={WATER_ASSUMPTIONS}
      keys={KEYS}
      evaluate={waterOf}
      resultName="하루 마실 물"
      formatResult={ml}
      questions={({ input, edit }) => [
        { title: "몸무게가 얼마예요?", keys: ["weight"], body: weight(input, edit) },
        { title: "오늘 하루는 어땠나요?", keys: ["activity", "temp", "alcohol"], body: day(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {weight(input, edit)}
          {day(input, edit)}
        </div>
      )}
      summary={waterPlain}
      metrics={(i) => {
        const r = waterResult(i);
        return [
          { label: "하루 마실 물", value: ml(r.total), tone: "primary" },
          { label: "250ml 컵", value: `${r.cups}잔` },
          { label: "기본(30ml/kg)", value: ml(r.base) },
        ];
      }}
      sliders={["weight", "alcohol"]}
      charts={(i) => {
        const r = waterResult(i);
        return (
          <BridgeChart
            title="마실 물이 쌓이는 과정"
            steps={[
              { label: "몸무게 기본", value: r.base, kind: "total" },
              { label: "운동", value: r.act, kind: "add" },
              { label: "날씨", value: r.temp, kind: "add" },
              { label: "술", value: r.alcohol, kind: "add" },
              { label: "합계", value: r.total, kind: "total" },
            ]}
            format={ml}
          />
        );
      }}
      askTitle="미리 알아 둘 점"
      ask={["신장·심장 질환으로 수분 제한을 받고 있다면 의료진 지시를 먼저 따르세요.", "한두 시간에 1리터 넘게 몰아 마시지 마세요."]}
      expertFooter={(i) => {
        const r = waterResult(i);
        return (
          <ResultSteps
            steps={[`기본 = ${i.weight}kg × 30ml = ${ml(r.base)}`, `+ 운동 ${ml(r.act)} + 날씨 ${ml(r.temp)} + 술 ${i.alcohol}잔 × 200ml`, `= ${ml(r.total)} (250ml ${r.cups}잔)`]}
            next={[{ href: "/ko/caffeine-calculator/", label: "카페인" }, { href: "/ko/tdee-calculator/", label: "하루 소비 열량" }]}
          />
        );
      }}
    />
  );
}
