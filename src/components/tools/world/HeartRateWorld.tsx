// 심박수 구간 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 HeartRateScenario. 문구: lib/health-i18n-2.ts
import { useMemo } from "react";
import { HR_ZONE_L, bpmL, heartAssumptionsL, heartPlainL } from "../../../lib/health-i18n-2";
import { heartMid, heartResult, type HeartLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["age", "resting", "zone"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<HeartLite>, k: Key[]) => void;
const EXAMPLE: HeartLite = { age: 35, resting: 0, zone: 1 };

const T = {
  en: { rest: "Resting heart rate (0 if unknown)", unit: "bpm", q1: "Your age and usual pulse", q2: "What kind of workout?", zone: "Intensity", h2: "Walking or easy jogging is zone 2; hard, breathless running is zones 3–4.", result: "target heart rate (middle)", target: "Target zone", max: "Max heart rate", method: "Method", k: "Karvonen", pct: "% of max", sweep: "Enter a resting rate to switch to the Karvonen formula. At 0 it uses a % of maximum.", chart: "Top of each zone", cap: "Each bar ends at the zone's upper limit.", ask: ["Heart disease, high blood pressure or beta-blockers change your targets; set them with your clinician.", "Stop at once if you feel chest pain or dizziness."], age: "age" },
  ja: { rest: "安静時心拍数（わからなければ0）", unit: "拍/分", q1: "年齢とふだんの脈拍を教えてください", q2: "どんな運動をしますか？", zone: "運動強度", h2: "ウォーキングや軽いジョギングはゾーン2、息が上がるランはゾーン3〜4です。", result: "目標心拍数（中央）", target: "目標ゾーン", max: "最大心拍数", method: "計算方法", k: "カルボーネン法", pct: "最大心拍数の%", sweep: "安静時心拍数を入れるとカルボーネン法に変わります。0なら最大心拍数の割合で計算します。", chart: "ゾーンごとの上限", cap: "棒の端が各ゾーンの上限です。", ask: ["心臓病・高血圧やβ遮断薬の服用があると目標が変わります。医師と決めてください。", "胸の痛みやめまいがあればすぐにやめてください。"], age: "年齢" },
  zh: { rest: "静息心率（不知道填0）", unit: "次/分", q1: "年龄和平时脉搏", q2: "打算做什么运动？", zone: "运动强度", h2: "散步、慢跑是2区；气喘的跑步是3~4区。", result: "目标心率（中间值）", target: "目标区间", max: "最大心率", method: "计算方式", k: "卡氏公式", pct: "最大心率百分比", sweep: "填入静息心率会改用卡氏公式；为0时按最大心率百分比计算。", chart: "各区间上限", cap: "柱子末端是各区间的上限。", ask: ["有心脏病、高血压或在服β受体阻滞剂，目标会不同，请与医生商定。", "出现胸痛或头晕请立即停止。"], age: "年龄" },
  fr: { rest: "Fréquence au repos (0 si inconnue)", unit: "bpm", q1: "Votre âge et votre pouls habituel", q2: "Quel type d'effort ?", zone: "Intensité", h2: "Marche ou footing léger : zone 2 ; course essoufflante : zones 3–4.", result: "la fréquence cible (milieu)", target: "Zone cible", max: "Fréquence max", method: "Méthode", k: "Karvonen", pct: "% du max", sweep: "Saisissez la fréquence au repos pour passer à Karvonen. À 0, on utilise un % du maximum.", chart: "Haut de chaque zone", cap: "Chaque barre s'arrête à la limite haute de la zone.", ask: ["Maladie cardiaque, hypertension ou bêtabloquants changent vos cibles : fixez-les avec votre médecin.", "Arrêtez immédiatement en cas de douleur thoracique ou de vertige."], age: "âge" },
  es: { rest: "Frecuencia en reposo (0 si no la sabes)", unit: "lpm", q1: "Tu edad y tu pulso habitual", q2: "¿Qué tipo de ejercicio?", zone: "Intensidad", h2: "Caminar o trotar suave es zona 2; correr sin aliento, zonas 3-4.", result: "la frecuencia objetivo (centro)", target: "Zona objetivo", max: "Frecuencia máxima", method: "Método", k: "Karvonen", pct: "% del máximo", sweep: "Introduce la frecuencia en reposo para pasar a Karvonen. Con 0 se usa un % del máximo.", chart: "Tope de cada zona", cap: "Cada barra termina en el límite superior de la zona.", ask: ["Una cardiopatía, la hipertensión o los betabloqueantes cambian tus objetivos: fíjalos con tu médico.", "Para de inmediato si notas dolor en el pecho o mareo."], age: "edad" },
};

export default function HeartRateWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const f = (n: number) => bpmL(n, lang);
  const assumptions = useMemo(() => heartAssumptionsL(lang), [lang]);
  const summary = useMemo(() => heartPlainL(lang), [lang]);
  const zones = HR_ZONE_L[lang].map((label, n) => ({ value: String(n), label }));
  const body = (i: HeartLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={b.age} value={i.age} onChange={(v) => edit({ age: v }, ["age"])} suffix={b.ageUnit} step={1} min={10} />
      <NumberField label={t.rest} value={i.resting} onChange={(v) => edit({ resting: v }, ["resting"])} suffix={t.unit} step={1} min={0} />
    </div>
  );
  const zone = (i: HeartLite, edit: Edit) => <ChoiceChips<string> legend={t.zone} value={String(i.zone)} options={zones} onChange={(v) => edit({ zone: Number(v) }, ["zone"])} />;
  return (
    <ScenarioTool<HeartLite, Key>
      lang={lang}
      currency="USD"
      toolId="heart-rate-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={heartMid}
      resultName={t.result}
      formatResult={f}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["age", "resting"], body: body(input, edit) },
        { title: t.q2, keys: ["zone"], body: (
          <>
            {zone(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {body(input, edit)}
          {zone(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = heartResult(i);
        return [
          { label: t.target, value: `${Math.round(r.z.from)}–${f(r.z.to)}`, tone: "primary" },
          { label: t.max, value: f(r.max) },
          { label: t.method, value: r.karvonen ? t.k : t.pct },
        ];
      }}
      sliders={["age", "resting"]}
      sweepCaption={(a) => (a.key === "resting" ? t.sweep : undefined)}
      charts={(i) => (
        <CompareBars
          title={t.chart}
          caption={t.cap}
          items={heartResult(i).zones.map((z, n) => ({ label: `${HR_ZONE_L[lang][n]} (${Math.round(z.from)}–)`, value: z.to, current: n === i.zone }))}
          format={f}
        />
      )}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = heartResult(i);
        return (
          <ResultSteps
            steps={[
              `HRmax = 220 − ${i.age} = ${f(r.max)} (Tanaka 208 − 0.7 × ${t.age} = ${f(r.tanaka)})`,
              r.karvonen ? `Karvonen: ${i.resting} + ${Math.round(r.z.lo * 100)}–${Math.round(r.z.hi * 100)}% × (${r.max} − ${i.resting})` : `HRmax × ${Math.round(r.z.lo * 100)}–${Math.round(r.z.hi * 100)}%`,
              `= ${Math.round(r.z.from)} – ${f(r.z.to)}`,
            ]}
            next={nextLinks(lang, ["tdee-calculator", "one-rep-max-calculator"])}
          />
        );
      }}
    />
  );
}
