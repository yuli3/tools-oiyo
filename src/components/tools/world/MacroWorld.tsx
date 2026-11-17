// 탄단지(매크로) 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 MacroScenario. 문구: lib/health-i18n-2.ts
import { useMemo } from "react";
import { MACRO_NAMES, MACRO_PRESETS_L, gL, macroAssumptionsL, macroBarsL, macroPlainL } from "../../../lib/health-i18n-2";
import { n1 } from "../../../lib/health-i18n";
import { MACRO_PRESETS, macroResult, proteinOf, type MacroLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["calories", "weight", "protein", "fat"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<MacroLite>, k: Key[]) => void;
const EXAMPLE: MacroLite = { calories: 2000, weight: 70, protein: 0.3, fat: 0.3 };

const T = {
  en: { cal: "Calories you eat a day", q1: "How much do you eat a day?", h1: "Not sure? Get it from the daily calories (TDEE) calculator first.", q2: "Which diet split?", preset: "Diet split (protein/carbs/fat %)", result: "daily protein", sweep: "More fat means fewer carbs; protein grams stay the same.", chart: "Grams per nutrient a day", cap: "Fat has 9 kcal per gram, so it shows fewer grams at the same share.", ask: ["With kidney disease, talk to your clinician before eating more protein.", "Cutting carbs sharply while on diabetes medication can cause low blood sugar."] },
  ja: { cal: "1日に食べるカロリー", q1: "1日にどのくらい食べますか？", h1: "わからなければ、先に消費カロリー（TDEE）計算で求めてください。", q2: "どんな食事バランスにしますか？", preset: "食事バランス（たんぱく質/炭水化物/脂質 %）", result: "1日のたんぱく質", sweep: "脂質を増やすとその分炭水化物が減ります。たんぱく質のグラム数は変わりません。", chart: "栄養素ごとの1日のグラム数", cap: "脂質は1gで9kcalなので、同じ割合でもグラム数が少なくなります。", ask: ["腎臓病がある場合は、たんぱく質を増やす前に医師に相談してください。", "糖尿病の薬を飲んでいて炭水化物を大きく減らすと、低血糖になることがあります。"] },
  zh: { cal: "每天摄入热量", q1: "每天吃多少？", h1: "不清楚的话，先用每日消耗（TDEE）计算器算一下。", q2: "选哪种饮食比例？", preset: "饮食比例（蛋白质/碳水/脂肪 %）", result: "每日蛋白质", sweep: "脂肪增加，碳水相应减少；蛋白质克数不变。", chart: "各营养素每日克数", cap: "脂肪每克9kcal，所以同样比例下克数更少。", ask: ["有肾病的人，增加蛋白质前请先咨询医生。", "服用降糖药时大幅减少碳水，可能引起低血糖。"] },
  fr: { cal: "Calories par jour", q1: "Combien mangez-vous par jour ?", h1: "Vous ne savez pas ? Calculez-le d'abord avec le calculateur de dépense calorique (TDEE).", q2: "Quelle répartition ?", preset: "Répartition (protéines/glucides/lipides %)", result: "les protéines par jour", sweep: "Plus de lipides, c'est autant de glucides en moins ; les grammes de protéines ne bougent pas.", chart: "Grammes par nutriment et par jour", cap: "Les lipides apportent 9 kcal par gramme : à part égale, moins de grammes.", ask: ["En cas de maladie rénale, parlez-en à votre médecin avant d'augmenter les protéines.", "Réduire fortement les glucides sous traitement antidiabétique peut provoquer une hypoglycémie."] },
  es: { cal: "Calorías al día", q1: "¿Cuánto comes al día?", h1: "¿No lo sabes? Calcúlalo antes con la calculadora de gasto calórico (TDEE).", q2: "¿Qué reparto quieres?", preset: "Reparto (proteína/carbohidratos/grasa %)", result: "la proteína diaria", sweep: "Más grasa significa menos carbohidratos; los gramos de proteína no cambian.", chart: "Gramos por nutriente al día", cap: "La grasa aporta 9 kcal por gramo, así que a igual proporción pesa menos.", ask: ["Si tienes enfermedad renal, consulta a tu médico antes de subir la proteína.", "Recortar mucho los carbohidratos tomando medicación para la diabetes puede causar hipoglucemia."] },
};

export default function MacroWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const g = (n: number) => gL(n, lang);
  const assumptions = useMemo(() => macroAssumptionsL(lang), [lang]);
  const summary = useMemo(() => macroPlainL(lang), [lang]);
  const opts = MACRO_PRESETS.map((p, n) => ({ value: String(n), label: `${MACRO_PRESETS_L[lang][n]} ${Math.round(p.p * 100)}/${Math.round((1 - p.p - p.f) * 100)}/${Math.round(p.f * 100)}` }));
  const base = (i: MacroLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.cal} value={i.calories} onChange={(v) => edit({ calories: v }, ["calories"])} suffix="kcal" step={50} min={800} />
      <NumberField label={b.weight} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={30} />
    </div>
  );
  const preset = (i: MacroLite, edit: Edit) => {
    const cur = MACRO_PRESETS.findIndex((p) => Math.abs(p.p - i.protein) < 0.005 && Math.abs(p.f - i.fat) < 0.005);
    return (
      <ChoiceChips<string>
        legend={t.preset}
        value={cur < 0 ? "" : String(cur)}
        options={opts}
        onChange={(v) => {
          const p = MACRO_PRESETS[Number(v)];
          edit({ protein: p.p, fat: p.f }, ["protein", "fat"]);
        }}
      />
    );
  };
  return (
    <ScenarioTool<MacroLite, Key>
      lang={lang}
      currency="USD"
      toolId="macro-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={proteinOf}
      resultName={t.result}
      formatResult={g}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["calories", "weight"], body: (
          <>
            {base(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">
              <a className="underline" href={`/${lang}/tdee-calculator/`}>{t.h1}</a>
            </p>
          </>
        ) },
        { title: t.q2, keys: ["protein", "fat"], body: preset(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {base(input, edit)}
          {preset(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = macroResult(i);
        return [
          { label: MACRO_NAMES.PROT[lang], value: g(r.proteinG), tone: "primary" },
          { label: MACRO_NAMES.CARB[lang], value: g(r.carbsG) },
          { label: MACRO_NAMES.FAT[lang], value: g(r.fatG) },
        ];
      }}
      sliders={["calories", "protein", "fat"]}
      sweepCaption={(a) => (a.key === "fat" ? t.sweep : undefined)}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={macroBarsL(i, lang)} format={g} />}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = macroResult(i);
        return (
          <ResultSteps
            steps={[
              `${MACRO_NAMES.PROT[lang]} = ${i.calories} × ${Math.round(r.p * 100)}% ÷ 4 = ${g(r.proteinG)} (${n1(r.perKg, lang)} g/kg)`,
              `${MACRO_NAMES.CARB[lang]} = ${i.calories} × ${Math.round(r.c * 100)}% ÷ 4 = ${g(r.carbsG)}`,
              `${MACRO_NAMES.FAT[lang]} = ${i.calories} × ${Math.round(r.f * 100)}% ÷ 9 = ${g(r.fatG)}`,
            ]}
            next={nextLinks(lang, ["tdee-calculator", "bmi-calculator"])}
          />
        );
      }}
    />
  );
}
