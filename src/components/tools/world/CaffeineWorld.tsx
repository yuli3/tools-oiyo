// 카페인 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 CaffeineScenario. 음료 예시는 나라별: lib/health-i18n.ts
import { useMemo } from "react";
import { CAFFEINE_DRINKS_L, caffeineAssumptionsL, caffeineCurveL, caffeinePlainL, mgL } from "../../../lib/health-i18n";
import { caffeineLeft, hoursUntil, type CaffeineLite } from "../../../lib/health2-scenarios";
import type { WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { BODY } from "./health-text";
import { nextLinks } from "./names";

const KEYS = ["amount", "gap", "halfLife"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<CaffeineLite>, k: Key[]) => void;

const T = {
  en: { q1: "What did you drink?", direct: "Caffeine (enter directly)", gap: "Hours until you sleep", h2: "Drinking at 2 pm and sleeping at 11 pm is 9 hours.", hl: "Half-life", hours: "h", result: "caffeine left at bedtime", left: "Left at bedtime", to50: "Until below 50 mg", sweep: "Half-life varies from about 3 to 7 hours between people; longer in pregnancy or on the pill.", chart: "Caffeine left over time", cap: "Amount left every 2 hours after drinking.", ask: ["If pregnant, keep it to 200 mg a day and talk to your clinician.", "If you keep sleeping badly, move caffeine to before 2 pm."], s1: "Left", s2: "Below 50 mg" },
  ja: { q1: "何を飲みましたか？", direct: "カフェイン量（直接入力）", gap: "飲んでから寝るまで", h2: "午後2時に飲んで夜11時に寝るなら9時間です。", hl: "半減期", hours: "時間", result: "寝るときのカフェイン", left: "寝るときの残量", to50: "50mgを下回るまで", sweep: "半減期は人によって3〜7時間ほど違います。妊娠中やピル服用中は長くなります。", chart: "時間とともに残るカフェイン", cap: "飲んでから2時間ごとの残量です。", ask: ["妊娠中は1日200mg程度までにして、医師に相談してください。", "眠れない日が続くなら、カフェインを午後2時より前にしてみましょう。"], s1: "残量", s2: "50mgを下回るまで" },
  zh: { q1: "喝了什么？", direct: "咖啡因量（直接填写）", gap: "喝完到睡觉的时间", h2: "下午2点喝、晚上11点睡就是9小时。", hl: "半衰期", hours: "小时", result: "睡前剩余咖啡因", left: "睡前剩余", to50: "降到50mg以下", sweep: "半衰期因人而异，约3~7小时；怀孕或服用避孕药会更长。", chart: "咖啡因随时间的剩余量", cap: "喝完后每2小时的剩余量。", ask: ["怀孕时每天控制在200mg以内，并咨询医生。", "持续失眠的话，把咖啡因提前到下午2点前。"], s1: "剩余", s2: "降到50mg以下" },
  fr: { q1: "Qu'avez-vous bu ?", direct: "Caféine (saisie directe)", gap: "Heures avant de dormir", h2: "Boire à 14 h et se coucher à 23 h, c'est 9 heures.", hl: "Demi-vie", hours: "h", result: "la caféine au coucher", left: "Restant au coucher", to50: "Avant de passer sous 50 mg", sweep: "La demi-vie varie d'environ 3 à 7 heures selon les personnes ; plus longue pendant la grossesse ou sous pilule.", chart: "Caféine restante au fil des heures", cap: "Quantité restante toutes les 2 heures.", ask: ["Pendant la grossesse, limitez-vous à 200 mg par jour et parlez-en à votre médecin.", "Si vous dormez mal, prenez votre caféine avant 14 h."], s1: "Restant", s2: "Sous 50 mg" },
  es: { q1: "¿Qué has bebido?", direct: "Cafeína (introducir)", gap: "Horas hasta dormir", h2: "Beber a las 14:00 y acostarse a las 23:00 son 9 horas.", hl: "Vida media", hours: "h", result: "la cafeína al dormir", left: "Al acostarte", to50: "Hasta bajar de 50 mg", sweep: "La vida media varía de unas 3 a 7 horas según la persona; más larga en el embarazo o con la píldora.", chart: "Cafeína restante con el tiempo", cap: "Cantidad restante cada 2 horas.", ask: ["En el embarazo, no pases de 200 mg al día y consulta a tu médico.", "Si sigues durmiendo mal, toma la cafeína antes de las 14:00."], s1: "Restante", s2: "Bajo 50 mg" },
};

export default function CaffeineWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const b = BODY[lang];
  const g = (n: number) => mgL(n, lang);
  const drinks = CAFFEINE_DRINKS_L[lang];
  const example = useMemo<CaffeineLite>(() => ({ amount: drinks[0].mg, gap: 9, halfLife: 5 }), [drinks]);
  const opts = drinks.map((d) => ({ value: String(d.mg), label: `${d.label} (${d.mg} mg)` }));
  const assumptions = useMemo(() => caffeineAssumptionsL(lang), [lang]);
  const summary = useMemo(() => caffeinePlainL(lang), [lang]);
  const amount = (i: CaffeineLite, edit: Edit) => (
    <div className="space-y-3">
      <ChoiceChips<string> legend={t.q1} value={String(i.amount)} options={opts} onChange={(v) => edit({ amount: Number(v) }, ["amount"])} />
      <NumberField label={t.direct} value={i.amount} onChange={(v) => edit({ amount: v }, ["amount"])} suffix="mg" step={10} min={0} />
    </div>
  );
  const gap = (i: CaffeineLite, edit: Edit) => <NumberField label={t.gap} value={i.gap} onChange={(v) => edit({ gap: v }, ["gap"])} suffix={t.hours} step={1} min={0} />;
  return (
    <ScenarioTool<CaffeineLite, Key>
      lang={lang}
      currency="USD"
      toolId="caffeine-calculator"
      example={example}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={caffeineLeft}
      resultName={t.result}
      formatResult={g}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["amount"], body: amount(input, edit) },
        { title: t.gap, keys: ["gap"], body: (
          <>
            {gap(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {amount(input, edit)}
          {gap(input, edit)}
          <NumberField label={t.hl} value={input.halfLife} onChange={(v) => edit({ halfLife: v }, ["halfLife"])} suffix={t.hours} step={0.5} min={2} />
        </div>
      )}
      summary={summary}
      metrics={(i) => [
        { label: t.left, value: g(caffeineLeft(i)), tone: "primary" },
        { label: t.to50, value: `${Math.ceil(hoursUntil(i, 50))} ${t.hours}` },
        { label: t.hl, value: `${i.halfLife} ${t.hours}` },
      ]}
      sliders={["amount", "gap", "halfLife"]}
      sweepCaption={(a) => (a.key === "halfLife" ? t.sweep : undefined)}
      charts={(i) => <CompareBars title={t.chart} caption={t.cap} items={caffeineCurveL(i, lang)} format={g} />}
      askTitle={b.askTitle}
      ask={t.ask}
      expertFooter={(i) => (
        <ResultSteps
          steps={[`${t.s1} = ${i.amount} × 0.5^(${i.gap} ÷ ${i.halfLife}) = ${g(caffeineLeft(i))}`, `${t.s2} = ${i.halfLife} × log₂(${i.amount} ÷ 50) ≈ ${Math.ceil(hoursUntil(i, 50))} ${t.hours}`]}
          next={nextLinks(lang, ["water-intake-calculator", "tdee-calculator"])}
        />
      )}
    />
  );
}
