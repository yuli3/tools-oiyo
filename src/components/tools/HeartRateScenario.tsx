// 심박수 구간 (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts heartResult.
import { HEART_ASSUMPTIONS, HR_ZONES, bpm, heartMid, heartPlain, heartResult, type HeartLite } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["age", "resting", "zone"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: HeartLite = { age: 35, resting: 0, zone: 1 };
const ZONES = HR_ZONES.map((z, n) => ({ value: String(n), label: z.label }));
type Edit = (p: Partial<HeartLite>, k: Key[]) => void;

export default function HeartRateScenario() {
  const body = (input: HeartLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="나이" value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix="세" step={1} min={10} />
      <NumberField label="가만히 있을 때 심박수(모르면 0)" value={input.resting} onChange={(v) => edit({ resting: v }, ["resting"])} suffix="회/분" step={1} min={0} />
    </div>
  );
  const zone = (input: HeartLite, edit: Edit) => (
    <ChoiceChips<string> legend="운동 강도" value={String(input.zone)} options={ZONES} onChange={(v) => edit({ zone: Number(v) }, ["zone"])} />
  );
  return (
    <ScenarioTool<HeartLite, Key>
      toolId="heart-rate-calculator"
      example={EXAMPLE}
      assumptions={HEART_ASSUMPTIONS}
      keys={KEYS}
      evaluate={heartMid}
      resultName="목표 심박수(가운데)"
      formatResult={bpm}
      questions={({ input, edit }) => [
        { title: "나이와 평소 맥박을 알려 주세요", keys: ["age", "resting"], body: body(input, edit) },
        { title: "어떤 운동을 하려고 하나요?", keys: ["zone"], body: (
          <>
            {zone(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">걷기·가벼운 달리기는 2구간, 숨이 찬 달리기는 3~4구간이에요.</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {zone(input, edit)}
        </div>
      )}
      summary={heartPlain}
      metrics={(i) => {
        const r = heartResult(i);
        return [
          { label: "목표 구간", value: `${Math.round(r.z.from)}~${Math.round(r.z.to)}회/분`, tone: "primary" },
          { label: "최대 심박수", value: bpm(r.max) },
          { label: "계산 방식", value: r.karvonen ? "카보넨" : "최대 심박수 %" },
        ];
      }}
      sliders={["age", "resting"]}
      sweepCaption={(a) => (a.key === "resting" ? "안정 시 심박수를 넣으면 카보넨 공식으로 바뀌어요. 0이면 최대 심박수 비율로 계산해요." : undefined)}
      charts={(i) => (
        <CompareBars
          title="구간별 심박수 위쪽 끝"
          caption="막대 끝이 각 구간의 상한이에요."
          items={heartResult(i).zones.map((z, n) => ({ label: `${z.label} (${Math.round(z.from)}~)`, value: z.to, current: n === i.zone }))}
          format={bpm}
        />
      )}
      askTitle="미리 알아 둘 점"
      ask={["심장 질환·고혈압이 있거나 베타차단제를 먹으면 심박수 목표가 달라져요. 의료진과 정하세요.", "가슴 통증·어지럼이 있으면 바로 멈추세요."]}
      expertFooter={(i) => {
        const r = heartResult(i);
        return (
          <ResultSteps
            steps={[
              `최대 심박수 = 220 − ${i.age} = ${bpm(r.max)} (Tanaka 208 − 0.7×나이 = ${bpm(r.tanaka)})`,
              r.karvonen
                ? `카보넨: ${i.resting} + ${Math.round(r.z.lo * 100)}~${Math.round(r.z.hi * 100)}% × (${r.max} − ${i.resting})`
                : `최대 심박수 × ${Math.round(r.z.lo * 100)}~${Math.round(r.z.hi * 100)}%`,
              `= ${Math.round(r.z.from)} ~ ${Math.round(r.z.to)}회/분`,
            ]}
            next={[{ href: "/ko/tdee-calculator/", label: "하루 소비 열량" }, { href: "/ko/one-rep-max-calculator/", label: "1RM" }]}
          />
        );
      }}
    />
  );
}
