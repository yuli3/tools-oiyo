// 체지방률 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 BodyFatScenario. 미 해군 둘레법(cm). 문구: lib/health-i18n.ts
import { useMemo } from "react";
import { bodyFatAssumptionsL, bodyFatBandL, bodyFatPlainL, kgL, n1 } from "../../../lib/health-i18n";
import { bodyFatPct, bodyFatResult, type BodyFatLite, type Sex } from "../../../lib/health-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY, sexOptions } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["sex", "height", "weight", "waist", "neck", "hip"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<BodyFatLite>, k: Key[]) => void;
const EXAMPLE: BodyFatLite = { sex: "m", height: 175, weight: 75, waist: 86, neck: 38, hip: 96 };

const T = {
  en: { waist: "Waist", neck: "Neck", hip: "Hips", q1: "Sex, height and weight", q2: "Measure with a tape", h2: (m: boolean) => `Measure the neck just below the Adam's apple and the waist ${m ? "at the navel" : "at its narrowest"}. No tape? Keep the example and use the charts to get a feel.`, result: "body fat", pct: "Body fat", fat: "Fat mass", band: "Category", sweep: "Waist size moves the result most. Measure at the same spot each time.", chart: "If your waist shrinks", now: (w: number) => `Now ${w} cm`, less: (d: number) => `${d} cm less`, ask: ["The tape method is accurate to about ±3 points and may differ from scales or DEXA.", "For adults. Categories follow the American Council on Exercise (ACE)."], s2: "Fat mass" },
  ja: { waist: "腹囲", neck: "首回り", hip: "ヒップ", q1: "性別・身長・体重を教えてください", q2: "メジャーで周囲を測ってください", h2: (m: boolean) => `首はのどぼとけのすぐ下、腹囲は${m ? "へその高さ" : "いちばん細い所"}で測ります。メジャーがなければ例のままで、グラフで感覚をつかんでください。`, result: "体脂肪率", pct: "体脂肪率", fat: "体脂肪量", band: "判定", sweep: "腹囲が結果をいちばん大きく変えます。毎回同じ位置で測りましょう。", chart: "腹囲が減ると", now: (w: number) => `今 ${w}cm`, less: (d: number) => `${d}cm減ると`, ask: ["周囲長法は±3ポイントほどの誤差があり、体組成計とは違うことがあります。", "成人向けです。判定区分は米国運動評議会（ACE）の分類です。"], s2: "体脂肪量" },
  zh: { waist: "腰围", neck: "颈围", hip: "臀围", q1: "性别、身高、体重", q2: "用软尺量围度", h2: (m: boolean) => `颈围在喉结下方量，腰围在${m ? "肚脐高度" : "最细处"}量。没有软尺就保留示例，用图表感受一下。`, result: "体脂率", pct: "体脂率", fat: "脂肪重量", band: "判定", sweep: "腰围对结果影响最大。每次在同一位置量。", chart: "腰围减少后", now: (w: number) => `现在 ${w}cm`, less: (d: number) => `减${d}cm`, ask: ["围度法误差约±3个百分点，可能与体脂秤或DEXA不同。", "适用于成人。分级参考美国运动委员会（ACE）。"], s2: "脂肪重量" },
  fr: { waist: "Tour de taille", neck: "Tour de cou", hip: "Tour de hanches", q1: "Sexe, taille et poids", q2: "Mesurez avec un mètre ruban", h2: (m: boolean) => `Mesurez le cou juste sous la pomme d'Adam et la taille ${m ? "au niveau du nombril" : "à l'endroit le plus fin"}. Pas de mètre ? Gardez l'exemple et explorez les graphiques.`, result: "la masse grasse", pct: "Masse grasse", fat: "Graisse", band: "Catégorie", sweep: "Le tour de taille pèse le plus. Mesurez toujours au même endroit.", chart: "Si votre tour de taille diminue", now: (w: number) => `Aujourd'hui ${w} cm`, less: (d: number) => `${d} cm de moins`, ask: ["La méthode du mètre ruban a une marge d'environ ±3 points ; elle peut différer d'une balance ou d'un DEXA.", "Pour les adultes. Catégories de l'American Council on Exercise (ACE)."], s2: "Masse de graisse" },
  es: { waist: "Cintura", neck: "Cuello", hip: "Cadera", q1: "Sexo, altura y peso", q2: "Mide con una cinta métrica", h2: (m: boolean) => `Mide el cuello justo debajo de la nuez y la cintura ${m ? "a la altura del ombligo" : "en la parte más estrecha"}. ¿Sin cinta? Deja el ejemplo y explora los gráficos.`, result: "la grasa corporal", pct: "Grasa corporal", fat: "Masa grasa", band: "Categoría", sweep: "La cintura es lo que más mueve el resultado. Mide siempre en el mismo sitio.", chart: "Si reduces cintura", now: (w: number) => `Ahora ${w} cm`, less: (d: number) => `${d} cm menos`, ask: ["El método de la cinta tiene un margen de unos ±3 puntos y puede diferir de una báscula o un DEXA.", "Para adultos. Categorías del American Council on Exercise (ACE)."], s2: "Masa grasa" },
};

export default function BodyFatWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const pct = (n: number) => (Number.isFinite(n) ? `${n1(n, lang)}%` : "—");
  const assumptions = useMemo(() => bodyFatAssumptionsL(lang), [lang]);
  const summary = useMemo(() => bodyFatPlainL(lang), [lang]);
  const body = (i: BodyFatLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend={b.sex} value={i.sex} options={sexOptions(lang)} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={b.height} value={i.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={100} />
        <NumberField label={b.weight} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={20} />
      </div>
    </div>
  );
  const tape = (i: BodyFatLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberField label={t.waist} value={i.waist} onChange={(v) => edit({ waist: v }, ["waist"])} suffix="cm" step={0.5} min={40} />
      <NumberField label={t.neck} value={i.neck} onChange={(v) => edit({ neck: v }, ["neck"])} suffix="cm" step={0.5} min={20} />
      {i.sex === "f" && <NumberField label={t.hip} value={i.hip} onChange={(v) => edit({ hip: v }, ["hip"])} suffix="cm" step={0.5} min={50} />}
    </div>
  );
  return (
    <ScenarioTool<BodyFatLite, Key>
      lang={lang}
      currency="USD"
      toolId="body-fat-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={bodyFatPct}
      resultName={t.result}
      formatResult={pct}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["sex", "height", "weight"], body: body(input, edit) },
        { title: t.q2, keys: ["waist", "neck", "hip"], body: (
          <>
            {tape(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2(input.sex === "m")}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {tape(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = bodyFatResult(i);
        return [
          { label: t.pct, value: pct(r.pct), tone: "primary" },
          { label: t.fat, value: Number.isFinite(r.fat) ? kgL(r.fat, lang) : "—" },
          { label: t.band, value: bodyFatBandL(i, lang) },
        ];
      }}
      sliders={["waist", "neck", "hip"]}
      sweepCaption={(a) => (a.key === "waist" ? t.sweep : undefined)}
      charts={(i) => (
        <CompareBars title={t.chart} items={[0, 3, 6].map((d) => ({ label: d === 0 ? t.now(i.waist) : t.less(d), value: bodyFatPct({ ...i, waist: i.waist - d }), current: d === 0 }))} format={pct} />
      )}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = bodyFatResult(i);
        return (
          <ResultSteps
            steps={[
              i.sex === "m"
                ? `495 ÷ (1.0324 − 0.19077·log₁₀(${t.waist} ${i.waist} − ${t.neck} ${i.neck}) + 0.15456·log₁₀(${b.height} ${i.height})) − 450 = ${pct(r.pct)}`
                : `495 ÷ (1.29579 − 0.35004·log₁₀(${t.waist} ${i.waist} + ${t.hip} ${i.hip} − ${t.neck} ${i.neck}) + 0.221·log₁₀(${b.height} ${i.height})) − 450 = ${pct(r.pct)}`,
              `${t.s2} = ${kgL(i.weight, lang)} × ${pct(r.pct)} = ${Number.isFinite(r.fat) ? kgL(r.fat, lang) : "—"}`,
            ]}
            next={nextLinks(lang, ["bmi-calculator", "tdee-calculator"])}
          />
        );
      }}
    />
  );
}
