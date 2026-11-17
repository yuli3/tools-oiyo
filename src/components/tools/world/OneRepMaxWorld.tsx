// 1RM 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 OneRepMaxScenario. 문구: lib/health-i18n-2.ts
import { useMemo } from "react";
import { oneRmAssumptionsL, oneRmPlainL, repTableL } from "../../../lib/health-i18n-2";
import { kgL } from "../../../lib/health-i18n";
import { oneRmOf, oneRmResult, type OneRmLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["weight", "reps"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: OneRmLite = { weight: 60, reps: 8 };

const T = {
  en: { w: "Weight lifted", r: "Reps", rU: "reps", q: "What did you lift recently, and how many times?", h: "Use a set taken close to failure. 3–8 reps is most accurate.", avg: "1RM (average)", chart: "What you can lift for each rep count", cap: "Worked back from your 1RM. Use it to plan sets.", ask: ["Test a true 1RM only with a spotter and safety bars.", "With back or shoulder pain, fix your form before adding weight."], mean: "Average" },
  ja: { w: "挙げた重量", r: "回数", rU: "回", q: "最近、何kgを何回挙げましたか？", h: "限界まで挙げたセットの記録を入れてください。3〜8回がいちばん正確です。", avg: "1RM（平均）", chart: "回数ごとに挙げられる重量", cap: "1RMから逆算しています。メニュー作りに使ってください。", ask: ["実際の1RM測定は補助者とセーフティバーを用意して行いましょう。", "腰や肩が痛むときは、重さより先にフォームを見直してください。"], mean: "平均" },
  zh: { w: "举起的重量", r: "次数", rU: "次", q: "最近举了多少公斤、几次？", h: "填一组接近力竭的记录。3~8次最准确。", avg: "1RM（平均）", chart: "不同次数可举起的重量", cap: "由1RM倒推，可用于安排训练。", ask: ["实测1RM要有保护者和保护杠。", "腰、肩疼痛时，先检查动作再加重量。"], mean: "平均" },
  fr: { w: "Charge soulevée", r: "Répétitions", rU: "rép.", q: "Qu'avez-vous soulevé récemment, et combien de fois ?", h: "Prenez une série proche de l'échec. 3 à 8 répétitions donnent le meilleur résultat.", avg: "1RM (moyenne)", chart: "Charge possible selon les répétitions", cap: "Calculé à partir du 1RM, pour planifier vos séries.", ask: ["Ne testez un vrai 1RM qu'avec un pareur et des barres de sécurité.", "En cas de douleur au dos ou à l'épaule, corrigez la technique avant d'ajouter du poids."], mean: "Moyenne" },
  es: { w: "Peso levantado", r: "Repeticiones", rU: "rep.", q: "¿Qué peso levantaste hace poco y cuántas veces?", h: "Usa una serie cercana al fallo. 3-8 repeticiones es lo más preciso.", avg: "1RM (media)", chart: "Peso posible según repeticiones", cap: "Calculado a partir del 1RM; úsalo para planificar series.", ask: ["Mide un 1RM real solo con alguien que te asista y barras de seguridad.", "Si te duele la espalda o el hombro, corrige la técnica antes de subir peso."], mean: "Media" },
};

export default function OneRepMaxWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const kg = (n: number) => kgL(n, lang);
  const assumptions = useMemo(() => oneRmAssumptionsL(lang), [lang]);
  const summary = useMemo(() => oneRmPlainL(lang), [lang]);
  const fields = (i: OneRmLite, edit: (p: Partial<OneRmLite>, k: Key[]) => void) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.w} value={i.weight} onChange={(v) => edit({ weight: v }, ["weight"])} suffix="kg" step={2.5} min={1} />
      <NumberField label={t.r} value={i.reps} onChange={(v) => edit({ reps: v }, ["reps"])} suffix={t.rU} step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<OneRmLite, Key>
      lang={lang}
      currency="USD"
      toolId="one-rep-max-calculator"
      example={EXAMPLE}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={oneRmOf}
      resultName="1RM"
      formatResult={kg}
      questions={({ input, edit }) => [
        { title: t.q, keys: ["weight", "reps"], body: (
          <>
            {fields(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => fields(input, edit)}
      summary={summary}
      metrics={(i) => {
        const r = oneRmResult(i);
        return [
          { label: t.avg, value: kg(r.oneRm), tone: "primary" },
          { label: "Epley", value: kg(r.epley) },
          { label: "Brzycki", value: kg(r.brzycki) },
        ];
      }}
      sliders={["weight", "reps"]}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={repTableL(i, lang)} format={kg} />}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = oneRmResult(i);
        return (
          <ResultSteps
            steps={[`Epley = ${i.weight} × (1 + ${i.reps}/30) = ${kg(r.epley)}`, `Brzycki = ${i.weight} × 36 / (37 − ${i.reps}) = ${kg(r.brzycki)}`, `${t.mean} = ${kg(r.oneRm)}`]}
            next={nextLinks(lang, ["heart-rate-calculator", "macro-calculator"])}
          />
        );
      }}
    />
  );
}
