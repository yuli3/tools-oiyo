// 1RM (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts oneRmResult.
import { ONE_RM_ASSUMPTIONS, kgOne, oneRmOf, oneRmPlain, oneRmResult, repTable, type OneRmLite } from "../../lib/health2-scenarios";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["weight", "reps"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: OneRmLite = { weight: 60, reps: 8 };

export default function OneRepMaxScenario() {
  const fields = (input: OneRmLite, edit: (p: Partial<OneRmLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="든 무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={2.5} min={1} />
      <NumberField label="들어 올린 횟수" value={input.reps} onChange={(v) => edit({ reps: v }, ["reps"])} suffix="회" step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<OneRmLite, Key>
      toolId="one-rep-max-calculator"
      example={EXAMPLE}
      assumptions={ONE_RM_ASSUMPTIONS}
      keys={KEYS}
      evaluate={oneRmOf}
      resultName="1RM"
      formatResult={kgOne}
      questions={({ input, edit }) => [
        { title: "최근에 몇 kg을 몇 번 들었나요?", keys: ["weight", "reps"], body: (
          <>
            {fields(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">더는 못 들 때까지 한 세트 기록을 넣으세요. 3~8회가 가장 정확해요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={oneRmPlain}
      metrics={(i) => {
        const r = oneRmResult(i);
        return [
          { label: "1RM(평균)", value: kgOne(r.oneRm), tone: "primary" },
          { label: "Epley", value: kgOne(r.epley) },
          { label: "Brzycki", value: kgOne(r.brzycki) },
        ];
      }}
      sliders={["weight", "reps"]}
      charts={(i) => <CompareBars title="횟수별로 들 수 있는 무게" caption="1RM에서 거꾸로 계산했어요. 운동 계획 짤 때 쓰세요." items={repTable(i)} format={kgOne} />}
      askTitle="미리 알아 둘 점"
      ask={["실제 1RM 측정은 보조자와 안전바를 두고 하세요.", "허리·어깨 통증이 있으면 무게보다 자세를 먼저 점검하세요."]}
      expertFooter={(i) => {
        const r = oneRmResult(i);
        return (
          <ResultSteps
            steps={[
              `Epley = ${i.weight} × (1 + ${i.reps}/30) = ${kgOne(r.epley)}`,
              `Brzycki = ${i.weight} × 36 / (37 − ${i.reps}) = ${kgOne(r.brzycki)}`,
              `평균 = ${kgOne(r.oneRm)}`,
            ]}
            next={[{ href: "/ko/heart-rate-calculator/", label: "심박수 구간" }, { href: "/ko/macro-calculator/", label: "탄단지 비율" }]}
          />
        );
      }}
    />
  );
}
