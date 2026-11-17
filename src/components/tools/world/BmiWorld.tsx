// BMI 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 BmiScenario. 판정 구간은 나라 기준(WHO·日本肥満学会·中国): lib/health-i18n.ts
import { useMemo } from "react";
import { BMI_BANDS_L, BMI_LINES, bmiAssumptionsL, bmiMarksL, bmiPlainL, bmiResultL, kgL, n1 } from "../../../lib/health-i18n";
import { bmiOf, type BmiLite } from "../../../lib/health-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["height", "weight"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<BmiLite>, k: Key[]) => void;
const EXAMPLE: Record<WL, BmiLite> = { en: { height: 175, weight: 80 }, ja: { height: 170, weight: 65 }, zh: { height: 170, weight: 66 }, fr: { height: 172, weight: 72 }, es: { height: 172, weight: 74 } };

const T = {
  en: { q: "What are your height and weight?", band: "Category (WHO)", normal: "Healthy weight", sweep: "Dotted lines mark the weights for BMI 18.5, 25 and 30.", chart: "Weight at each BMI threshold (your height)", cap: "Where each category starts.", ask: ["For adults. Children and teens need age-based growth charts.", "With lots of muscle or during pregnancy, BMI can misread your health."], s2: "Categories: under 18.5 underweight, 18.5–24.9 healthy, 25–29.9 overweight, 30+ obesity (WHO)" },
  ja: { q: "身長と体重を教えてください", band: "判定（日本肥満学会）", normal: "普通体重", sweep: "点線はBMI 18.5・25・30になる体重です。", chart: "BMIの区切りごとの体重（この身長）", cap: "各区分が始まる体重です。", ask: ["成人向けです。子どもはカウプ指数・ローレル指数や成長曲線で見ます。", "筋肉量が多い人や妊娠中は、BMIが実際の状態と違うことがあります。"], s2: "区分: 18.5未満 低体重、25未満 普通体重、25以上 肥満（30・35・40で2〜4度）" },
  zh: { q: "请填写身高和体重", band: "判定（中国标准）", normal: "正常体重", sweep: "虚线是BMI 18.5、24、28对应的体重。", chart: "各BMI分界对应的体重（此身高）", cap: "各区间开始的体重。", ask: ["适用于成人。儿童青少年要看年龄别生长标准。", "肌肉量大或怀孕时，BMI可能与实际情况不符。"], s2: "区间：<18.5 体重过低，18.5~23.9 正常，24~27.9 超重，≥28 肥胖（WS/T 428）" },
  fr: { q: "Quelles sont votre taille et votre poids ?", band: "Catégorie (OMS)", normal: "Poids normal", sweep: "Les pointillés marquent les poids correspondant à un IMC de 18,5, 25 et 30.", chart: "Poids à chaque seuil d'IMC (votre taille)", cap: "Début de chaque catégorie.", ask: ["Pour les adultes. Pour les enfants, on utilise les courbes de corpulence.", "Avec beaucoup de muscle ou pendant la grossesse, l'IMC peut tromper."], s2: "Catégories : < 18,5 maigreur, 18,5–24,9 normal, 25–29,9 surpoids, ≥ 30 obésité (OMS)" },
  es: { q: "¿Cuál es tu altura y tu peso?", band: "Categoría (OMS)", normal: "Peso normal", sweep: "Las líneas de puntos marcan el peso para un IMC de 18,5, 25 y 30.", chart: "Peso en cada umbral de IMC (tu altura)", cap: "Donde empieza cada categoría.", ask: ["Para adultos. En niños se usan tablas de crecimiento por edad.", "Con mucho músculo o durante el embarazo, el IMC puede engañar."], s2: "Categorías: < 18,5 bajo peso, 18,5–24,9 normal, 25–29,9 sobrepeso, ≥ 30 obesidad (OMS)" },
};

export default function BmiWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const one = (n: number) => n1(n, lang);
  const kg = (n: number) => kgL(n, lang);
  const assumptions = useMemo(() => bmiAssumptionsL(lang), [lang]);
  const summary = useMemo(() => bmiPlainL(lang), [lang]);
  const fields = (i: BmiLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={b.height} value={i.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={100} />
      <NumberField label={b.weight} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
    </div>
  );
  const lines = BMI_LINES[lang];
  const bands = BMI_BANDS_L[lang];
  return (
    <ScenarioTool<BmiLite, Key>
      lang={lang}
      currency="USD"
      toolId="bmi-calculator"
      example={EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={bmiOf}
      resultName="BMI"
      formatResult={one}
      marksFor={(key, i) => (key === "weight" ? bmiMarksL(i, lang) : undefined)}
      questions={({ input, edit }) => [{ title: t.q, keys: ["height", "weight"], body: fields(input, edit) }]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={summary}
      metrics={(i) => {
        const r = bmiResultL(i, lang);
        return [
          { label: "BMI", value: one(r.bmi), tone: "primary" },
          { label: t.band, value: r.band },
          { label: t.normal, value: `${kg(r.low)}–${kg(r.high)}` },
        ];
      }}
      sliders={["weight"]}
      sweepCaption={() => t.sweep}
      charts={(i) => {
        const now = bmiOf(i);
        return (
          <CompareBars
            title={t.chart}
            caption={t.cap}
            items={lines.map((x, k) => ({ label: `BMI ${one(x)} ${bands.find((y) => x < y.max)!.label}`, value: x * Math.pow(i.height / 100, 2), current: now >= x && now < (lines[k + 1] ?? Infinity) }))}
            format={kg}
          />
        );
      }}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = bmiResultL(i, lang);
        return (
          <ResultSteps
            steps={[`BMI = ${kg(i.weight)} ÷ (${(i.height / 100).toFixed(2)} m)² = ${r.bmi.toFixed(2)}`, t.s2]}
            next={nextLinks(lang, ["body-fat-calculator", "tdee-calculator"])}
          />
        );
      }}
    />
  );
}
