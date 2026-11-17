// 하루 소비 열량(TDEE) 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 TdeeScenario. 문구: lib/health-i18n.ts
import { useMemo } from "react";
import { ACTIVITY_L, kcalL, tdeeAssumptionsL, tdeeCompareL, tdeePlainL } from "../../../lib/health-i18n";
import { ACTIVITY, tdeeOf, tdeeResult, type Activity, type Sex, type TdeeLite } from "../../../lib/health-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY, sexOptions } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["sex", "age", "height", "weight", "activity"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<TdeeLite>, k: Key[]) => void;
const EXAMPLE: TdeeLite = { sex: "m", age: 30, height: 175, weight: 75, activity: "light" };

const T = {
  en: { act: "Usual activity", q2: "How active are you usually?", h2: "If unsure, pick one level lower. Most people overestimate their activity.", result: "daily calories", bmr: "Resting (BMR)", tdee: "Daily burn", loss: "To lose weight", chart: "Daily calories by activity level", cap: "Same body, only the activity level changes.", ask: ["If pregnant, breastfeeding or ill, ask a clinician.", "The weight-loss target never goes below 1,500 kcal for men or 1,200 kcal for women."], s3: (l: string, g: string, p: number) => `Lose −500 = ${l}, gain +300 = ${g}, protein ${p} g (1.6 g/kg)` },
  ja: { act: "ふだんの活動量", q2: "ふだんどのくらい動きますか？", h2: "迷ったら1段階低いほうを選んでください。多くの人は活動量を高く見積もりがちです。", result: "1日の消費カロリー", bmr: "基礎代謝", tdee: "1日の消費", loss: "減量の目安", chart: "活動量ごとの1日の消費カロリー", cap: "同じ体で活動量だけ変えています。", ask: ["妊娠・授乳中や持病がある場合は医師に相談してください。", "減量の目安は男性1,500kcal、女性1,200kcalを下回らないようにしています。"], s3: (l: string, g: string, p: number) => `減量 −500 = ${l}、増量 +300 = ${g}、たんぱく質 ${p}g（1.6g/kg）` },
  zh: { act: "日常活动量", q2: "平时活动量多大？", h2: "拿不准就选低一级。多数人会高估自己的活动量。", result: "每日消耗热量", bmr: "基础代谢", tdee: "每日消耗", loss: "减重目标", chart: "不同活动量的每日消耗", cap: "身体条件相同，只改变活动量。", ask: ["孕期、哺乳期或有疾病时请咨询医生。", "减重目标不低于男性1500kcal、女性1200kcal。"], s3: (l: string, g: string, p: number) => `减重 −500 = ${l}，增重 +300 = ${g}，蛋白质 ${p}g（1.6g/kg）` },
  fr: { act: "Activité habituelle", q2: "Quel est votre niveau d'activité ?", h2: "En cas de doute, choisissez le niveau en dessous : on surestime souvent son activité.", result: "la dépense quotidienne", bmr: "Métabolisme de base", tdee: "Dépense quotidienne", loss: "Pour maigrir", chart: "Dépense quotidienne selon l'activité", cap: "Même corps, seule l'activité change.", ask: ["En cas de grossesse, d'allaitement ou de maladie, demandez l'avis d'un professionnel.", "L'objectif minceur ne descend jamais sous 1 500 kcal (hommes) ou 1 200 kcal (femmes)."], s3: (l: string, g: string, p: number) => `Perte −500 = ${l}, prise +300 = ${g}, protéines ${p} g (1,6 g/kg)` },
  es: { act: "Actividad habitual", q2: "¿Cuánto te mueves normalmente?", h2: "Si dudas, elige un nivel más bajo: casi todos sobrestimamos la actividad.", result: "el gasto diario", bmr: "Metabolismo basal", tdee: "Gasto diario", loss: "Para adelgazar", chart: "Gasto diario según la actividad", cap: "Mismo cuerpo, solo cambia la actividad.", ask: ["Si estás embarazada, das el pecho o tienes una enfermedad, consulta a un profesional.", "El objetivo de pérdida nunca baja de 1.500 kcal en hombres ni de 1.200 kcal en mujeres."], s3: (l: string, g: string, p: number) => `Perder −500 = ${l}, ganar +300 = ${g}, proteína ${p} g (1,6 g/kg)` },
};

export default function TdeeWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const k = (n: number) => kcalL(n, lang);
  const assumptions = useMemo(() => tdeeAssumptionsL(lang), [lang]);
  const summary = useMemo(() => tdeePlainL(lang), [lang]);
  const acts = (Object.keys(ACTIVITY) as Activity[]).map((a) => ({ value: a, label: ACTIVITY_L[lang][a] }));
  const body = (i: TdeeLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<Sex> legend={b.sex} value={i.sex} options={sexOptions(lang)} onChange={(v) => edit({ sex: v }, ["sex"])} />
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label={b.age} value={i.age} onChange={(v) => edit({ age: v }, ["age"])} suffix={b.ageUnit} step={1} min={15} />
        <NumberField label={b.height} value={i.height} onChange={(v) => edit({ height: v }, ["height"])} suffix="cm" step={1} min={120} />
        <NumberField label={b.weight} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={0.5} min={30} />
      </div>
    </div>
  );
  const act = (i: TdeeLite, edit: Edit) => <ChoiceChips<Activity> legend={t.act} value={i.activity} options={acts} onChange={(v) => edit({ activity: v }, ["activity"])} />;
  return (
    <ScenarioTool<TdeeLite, Key>
      lang={lang}
      currency="USD"
      toolId="tdee-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={tdeeOf}
      resultName={t.result}
      formatResult={k}
      questions={({ input, edit }) => [
        { title: b.body, keys: ["sex", "age", "height", "weight"], body: body(input, edit) },
        { title: t.q2, keys: ["activity"], body: (
          <>
            {act(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {act(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = tdeeResult(i);
        return [
          { label: t.bmr, value: k(r.bmr) },
          { label: t.tdee, value: k(r.tdee), tone: "primary" },
          { label: t.loss, value: k(r.loss) },
        ];
      }}
      sliders={["weight", "age"]}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={tdeeCompareL(i, lang)} format={k} />}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = tdeeResult(i);
        return (
          <ResultSteps
            steps={[
              `BMR = 10 × ${i.weight} + 6.25 × ${i.height} − 5 × ${i.age} ${i.sex === "m" ? "+ 5" : "− 161"} = ${k(r.bmr)}`,
              `TDEE = BMR × ${ACTIVITY[i.activity].k} = ${k(r.tdee)}`,
              t.s3(k(r.loss), k(r.gain), Math.round(r.protein)),
            ]}
            next={nextLinks(lang, ["macro-calculator", "bmi-calculator"])}
          />
        );
      }}
    />
  );
}
