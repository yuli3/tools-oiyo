// 자녀 예상 키 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 ChildHeightScenario. 문구: lib/health-i18n-2.ts
import { useMemo } from "react";
import { childAssumptionsL, childPlainL, cmL } from "../../../lib/health-i18n-2";
import type { Sex } from "../../../lib/health-scenarios";
import { childOf, childResult, type ChildLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["father", "mother", "sex"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<ChildLite>, k: Key[]) => void;
const EXAMPLE: ChildLite = { father: 178, mother: 165, sex: "m" };

const T = {
  en: { father: "Father's height", mother: "Mother's height", child: "Child", son: "Son", daughter: "Daughter", q1: "Parents' heights", q2: "Son or daughter?", result: "predicted height", pred: "Predicted height", low: "Lower end", high: "Upper end", sweep: "Each 1 cm in a parent's height moves the prediction by 0.5 cm.", chart: "Predicted height range", cap: "Most children end up between the lower and upper ends.", mid: "Predicted", ask: ["If a child is much shorter than peers or grows less than 4 cm a year, see a paediatrician.", "Signs of early puberty (girls before 8, boys before 9) are worth an early check."], range: "Range ±8.5 cm" },
  ja: { father: "父の身長", mother: "母の身長", child: "子ども", son: "息子", daughter: "娘", q1: "両親の身長を教えてください", q2: "息子さんですか、娘さんですか？", result: "予想身長", pred: "予想身長", low: "下限", high: "上限", sweep: "親の身長が1cm変わると、予想身長は0.5cm変わります。", chart: "予想身長の範囲", cap: "多くの子どもは下限〜上限の間に入ります。", mid: "予想", ask: ["同年代よりかなり小さい、または1年に4cm未満しか伸びない場合は小児科に相談してください。", "思春期が早い兆候（女の子8歳前、男の子9歳前）があれば早めに受診しましょう。"], range: "範囲 ±8.5cm" },
  zh: { father: "父亲身高", mother: "母亲身高", child: "孩子", son: "儿子", daughter: "女儿", q1: "父母身高", q2: "儿子还是女儿？", result: "预测身高", pred: "预测身高", low: "下限", high: "上限", sweep: "父母身高每变1cm，预测身高变0.5cm。", chart: "预测身高范围", cap: "大多数孩子落在下限和上限之间。", mid: "预测", ask: ["明显比同龄人矮或一年长不到4cm，请看儿科。", "有性早熟迹象（女孩8岁前、男孩9岁前）请尽早就诊。"], range: "范围 ±8.5cm" },
  fr: { father: "Taille du père", mother: "Taille de la mère", child: "Enfant", son: "Fils", daughter: "Fille", q1: "Taille des parents", q2: "Fils ou fille ?", result: "la taille prévue", pred: "Taille prévue", low: "Bas de fourchette", high: "Haut de fourchette", sweep: "Chaque centimètre de plus chez un parent ajoute 0,5 cm à la prévision.", chart: "Fourchette de taille prévue", cap: "La plupart des enfants finissent entre le bas et le haut de la fourchette.", mid: "Prévu", ask: ["Si l'enfant est bien plus petit que les autres ou grandit de moins de 4 cm par an, consultez un pédiatre.", "Des signes de puberté précoce (fille avant 8 ans, garçon avant 9 ans) justifient une consultation rapide."], range: "Fourchette ±8,5 cm" },
  es: { father: "Altura del padre", mother: "Altura de la madre", child: "Hijo o hija", son: "Hijo", daughter: "Hija", q1: "Altura de los padres", q2: "¿Hijo o hija?", result: "la altura prevista", pred: "Altura prevista", low: "Mínimo", high: "Máximo", sweep: "Cada centímetro de un progenitor mueve la previsión 0,5 cm.", chart: "Rango de altura prevista", cap: "La mayoría acaba entre el mínimo y el máximo.", mid: "Prevista", ask: ["Si es mucho más bajo que sus compañeros o crece menos de 4 cm al año, consulta al pediatra.", "Ante señales de pubertad precoz (niñas antes de 8, niños antes de 9) consulta pronto."], range: "Rango ±8,5 cm" },
};

export default function ChildHeightWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const cm = (n: number) => cmL(n, lang);
  const assumptions = useMemo(() => childAssumptionsL(lang), [lang]);
  const summary = useMemo(() => childPlainL(lang), [lang]);
  const sexes: { value: Sex; label: string }[] = [{ value: "m", label: t.son }, { value: "f", label: t.daughter }];
  const parents = (i: ChildLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.father} value={i.father} onChange={(v) => edit({ father: v }, ["father"])} suffix="cm" step={1} min={130} />
      <NumberField label={t.mother} value={i.mother} onChange={(v) => edit({ mother: v }, ["mother"])} suffix="cm" step={1} min={130} />
    </div>
  );
  const sex = (i: ChildLite, edit: Edit) => <ChoiceChips<Sex> legend={t.child} value={i.sex} options={sexes} onChange={(v) => edit({ sex: v }, ["sex"])} />;
  return (
    <ScenarioTool<ChildLite, Key>
      lang={lang}
      currency="USD"
      toolId="child-height-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={childOf}
      resultName={t.result}
      formatResult={cm}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["father", "mother"], body: parents(input, edit) },
        { title: t.q2, keys: ["sex"], body: sex(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {parents(input, edit)}
          {sex(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = childResult(i);
        return [
          { label: t.pred, value: cm(r.mid), tone: "primary" },
          { label: t.low, value: cm(r.low) },
          { label: t.high, value: cm(r.high) },
        ];
      }}
      sliders={["father", "mother"]}
      sweepCaption={() => t.sweep}
      charts={(i) => {
        const r = childResult(i);
        return (
          <CompareBars
            title={t.chart}
            caption={t.cap}
            items={[
              { label: `${t.low} (−8.5 cm)`, value: r.low },
              { label: t.mid, value: r.mid, current: true },
              { label: `${t.high} (+8.5 cm)`, value: r.high },
            ]}
            format={cm}
          />
        );
      }}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = childResult(i);
        return (
          <ResultSteps
            steps={[`(${i.father} + ${i.mother} ${i.sex === "m" ? "+ 13" : "− 13"}) ÷ 2 = ${cm(r.mid)}`, `${t.range} = ${cm(r.low)} – ${cm(r.high)}`]}
            next={nextLinks(lang, ["bmi-calculator", "ideal-weight-calculator"])}
          />
        );
      }}
    />
  );
}
