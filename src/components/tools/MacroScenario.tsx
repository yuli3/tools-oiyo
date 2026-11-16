// 탄단지(매크로) (2026-11-17 쉬운 설명·가정 변화 적용, 한국어 페이지). 계산: lib/health2-scenarios.ts macroResult.
import { MACRO_ASSUMPTIONS, MACRO_PRESETS, grams, macroBars, macroPlain, macroResult, proteinOf, type MacroLite } from "../../lib/health2-scenarios";
import ChoiceChips from "./payroll/ChoiceChips";
import NumberField from "./payroll/NumberField";
import ResultSteps from "./payroll/ResultSteps";
import CompareBars from "./viz/CompareBars";
import ScenarioTool from "./viz/ScenarioTool";

const KEYS = ["calories", "weight", "protein", "fat"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: MacroLite = { calories: 2000, weight: 70, protein: 0.3, fat: 0.3 };
const OPTIONS = MACRO_PRESETS.map((p) => ({ value: p.label, label: `${p.label} ${Math.round(p.p * 100)}/${Math.round((1 - p.p - p.f) * 100)}/${Math.round(p.f * 100)}` }));
type Edit = (p: Partial<MacroLite>, k: Key[]) => void;

export default function MacroScenario() {
  const base = (input: MacroLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label="하루 먹는 열량" value={input.calories} onChange={(v) => edit({ calories: v }, ["calories"])} suffix="kcal" step={50} min={800} />
      <NumberField label="몸무게" value={input.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={30} />
    </div>
  );
  const preset = (input: MacroLite, edit: Edit) => {
    const cur = MACRO_PRESETS.find((p) => Math.abs(p.p - input.protein) < 0.005 && Math.abs(p.f - input.fat) < 0.005)?.label ?? "";
    return (
      <ChoiceChips<string>
        legend="식단 비율 (단백질/탄수/지방 %)"
        value={cur}
        options={OPTIONS}
        onChange={(v) => {
          const p = MACRO_PRESETS.find((x) => x.label === v)!;
          edit({ protein: p.p, fat: p.f }, ["protein", "fat"]);
        }}
      />
    );
  };
  return (
    <ScenarioTool<MacroLite, Key>
      toolId="macro-calculator"
      example={EXAMPLE}
      assumptions={MACRO_ASSUMPTIONS}
      keys={KEYS}
      evaluate={proteinOf}
      resultName="하루 단백질"
      formatResult={grams}
      questions={({ input, edit }) => [
        { title: "하루에 얼마나 먹나요?", keys: ["calories", "weight"], body: (
          <>
            {base(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">모르면 <a className="underline" href="/ko/tdee-calculator/">하루 소비 열량 계산기</a>에서 먼저 구해 오세요.</p>
          </>
        ) },
        { title: "어떤 식단으로 먹을까요?", keys: ["protein", "fat"], body: preset(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {base(input, edit)}
          {preset(input, edit)}
        </div>
      )}
      summary={macroPlain}
      metrics={(i) => {
        const r = macroResult(i);
        return [
          { label: "단백질", value: grams(r.proteinG), tone: "primary" },
          { label: "탄수화물", value: grams(r.carbsG) },
          { label: "지방", value: grams(r.fatG) },
        ];
      }}
      sliders={["calories", "protein", "fat"]}
      sweepCaption={(a) => (a.key === "fat" ? "지방을 늘리면 탄수화물이 그만큼 줄어요. 단백질 g은 그대로예요." : undefined)}
      charts={(i) => <CompareBars title="영양소별 하루 g" caption="지방은 1g에 9kcal라 같은 비율이어도 g이 적어요." items={macroBars(i)} format={grams} />}
      askTitle="미리 알아 둘 점"
      ask={["신장 질환이 있으면 단백질을 늘리기 전에 의료진과 상의하세요.", "당뇨약을 먹는 중에 탄수화물을 크게 줄이면 저혈당이 올 수 있어요."]}
      expertFooter={(i) => {
        const r = macroResult(i);
        return (
          <ResultSteps
            steps={[
              `단백질 = ${i.calories} × ${Math.round(r.p * 100)}% ÷ 4 = ${grams(r.proteinG)} (${(Math.round(r.perKg * 10) / 10).toLocaleString("ko-KR")}g/kg)`,
              `탄수화물 = ${i.calories} × ${Math.round(r.c * 100)}% ÷ 4 = ${grams(r.carbsG)}`,
              `지방 = ${i.calories} × ${Math.round(r.f * 100)}% ÷ 9 = ${grams(r.fatG)}`,
            ]}
            next={[{ href: "/ko/tdee-calculator/", label: "하루 소비 열량" }, { href: "/ko/bmi-calculator/", label: "BMI" }]}
          />
        );
      }}
    />
  );
}
