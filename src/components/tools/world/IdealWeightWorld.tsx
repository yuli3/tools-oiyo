// 표준 체중 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 IdealWeightScenario. 일본은 남녀 모두 BMI 22. 문구: lib/health-i18n-2.ts
import { useMemo } from "react";
import { idealAssumptionsL, idealFormulasL, idealPlainL, idealResultL, standardOfL, stdBmi } from "../../../lib/health-i18n-2";
import { NORMAL_TOP, kgL, n1 } from "../../../lib/health-i18n";
import type { Sex } from "../../../lib/health-scenarios";
import type { IdealLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY, sexOptions } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["sex", "height", "weight"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<IdealLite>, k: Key[]) => void;
const EXAMPLE: IdealLite = { sex: "m", height: 175, weight: 75 };

const T = {
  en: { now: "Current weight", result: "reference weight", std: "Reference weight", range: "Healthy range", gap: "Difference now", chart: "Reference weight by formula", cap: "Devine, Robinson, Miller and Hamwi come from medical dosing; they run low for shorter people.", ask: ["Treat a reference weight as a range, not one target.", "For children and teens, use growth charts instead of adult formulas."], s1: "Reference", s2: "Healthy range", s3: "Six formulas" },
  ja: { now: "今の体重", result: "標準体重", std: "標準体重", range: "普通体重の範囲", gap: "今との差", chart: "式ごとの標準体重", cap: "Devine・Robinson・Miller・Hamwiは欧米の式なので、背が低いほど低めに出ます。", ask: ["標準体重はひとつの目標ではなく範囲で見てください。", "成長期の子どもは大人の式ではなく成長曲線で見てください。"], s1: "標準体重", s2: "普通体重", s3: "6つの式" },
  zh: { now: "现在体重", result: "参考体重", std: "参考体重", range: "健康范围", gap: "与现在的差", chart: "各公式的参考体重", cap: "Devine、Robinson、Miller、Hamwi是西方公式，个子越矮结果越低。", ask: ["参考体重请看作一个范围，而不是单一目标。", "成长期的孩子请看生长曲线，不要用成人公式。"], s1: "参考体重", s2: "健康范围", s3: "6个公式" },
  fr: { now: "Poids actuel", result: "le poids de référence", std: "Poids de référence", range: "Plage saine", gap: "Écart actuel", chart: "Poids de référence selon la formule", cap: "Devine, Robinson, Miller et Hamwi viennent du dosage médical ; ils sous-estiment pour les petites tailles.", ask: ["Voyez le poids de référence comme une fourchette, pas un objectif unique.", "Pour les enfants et ados, utilisez les courbes de croissance."], s1: "Référence", s2: "Plage saine", s3: "Six formules" },
  es: { now: "Peso actual", result: "el peso de referencia", std: "Peso de referencia", range: "Rango saludable", gap: "Diferencia actual", chart: "Peso de referencia según la fórmula", cap: "Devine, Robinson, Miller y Hamwi vienen de la dosificación médica; dan valores bajos en personas bajas.", ask: ["Toma el peso de referencia como un rango, no como un único objetivo.", "En niños y adolescentes, usa las curvas de crecimiento."], s1: "Referencia", s2: "Rango saludable", s3: "Seis fórmulas" },
};

export default function IdealWeightWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const kg = (n: number) => kgL(n, lang);
  const assumptions = useMemo(() => idealAssumptionsL(lang), [lang]);
  const summary = useMemo(() => idealPlainL(lang), [lang]);
  const evaluate = useMemo(() => standardOfL(lang), [lang]);
  const fields = (i: IdealLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend={b.sex} value={i.sex} options={sexOptions(lang)} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={b.height} value={i.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={120} />
        <NumberField label={t.now} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
      </div>
    </div>
  );
  return (
    <ScenarioTool<IdealLite, Key>
      lang={lang}
      currency="USD"
      toolId="ideal-weight-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={evaluate}
      resultName={t.result}
      formatResult={kg}
      questions={({ input, edit }) => [{ title: b.body, keys: ["sex", "height", "weight"], body: fields(input, edit) }]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={summary}
      metrics={(i) => {
        const r = idealResultL(i, lang);
        return [
          { label: t.std, value: kg(r.std), tone: "primary" },
          { label: t.range, value: `${kg(r.low)}–${kg(r.high)}` },
          { label: t.gap, value: `${r.gap >= 0 ? "+" : "−"}${kg(Math.abs(r.gap))}` },
        ];
      }}
      sliders={["height"]}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={idealFormulasL(i, lang)} format={kg} />}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = idealResultL(i, lang);
        const top = n1(NORMAL_TOP[lang] - 0.1, lang);
        return (
          <ResultSteps
            steps={[
              `${t.s1} = (${i.height}/100)² × ${stdBmi(i, lang)} = ${kg(r.std)}`,
              `${t.s2} = ${b.height}² × 18.5 – ${top} = ${kg(r.low)} – ${kg(r.high)}`,
              `${t.s3}: ${kg(r.min)} – ${kg(r.max)}`,
            ]}
            next={nextLinks(lang, ["bmi-calculator", "body-fat-calculator"])}
          />
        );
      }}
    />
  );
}
