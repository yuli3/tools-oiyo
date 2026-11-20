// 보험료 대략 추정 다른 언어 판(en·ja·zh·fr·es) (2026-11-20). 한국어는 InsurancePremiumScenario.
// 계산: lib/insurance-scenarios.ts insResult(보장 금액 × 비율 배수 모형, 통화와 무관). 실제 견적 아님.
import { useMemo } from "react";
import { ageK, HEALTH, INS_TYPES, insMonthly, insResult, SMOKE, type Health, type InsLite, type InsType, type Smoke } from "../../../lib/insurance-scenarios";
import { fixedRange, type Assumption, type TornadoBar } from "../../../lib/scenario";
import { cash, cashExact, driverOf, sc, WL_CURRENCY, type WL } from "../../../lib/world-money-i18n";
import ChoiceChips from "../payroll/ChoiceChips";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["type", "age", "sex", "smoke", "health", "coverage", "term"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<InsLite>, k: Key[]) => void;

const T = {
  en: {
    types: { term: "Term life", life: "Whole life", health: "Health", auto: "Car" }, smoke: { never: "Never", former: "Quit", current: "Smoker" }, health: { excellent: "Excellent", good: "Good", average: "Average", poor: "Poor" },
    kind: "Insurance type", age: "Age", yrs: "yrs", sex: "Sex", m: "Male", f: "Female", smokeL: "Smoking", healthL: "Health", coverage: "Coverage amount", term: "Paying period", years: "years",
    q1: "What kind of insurance are you looking at?", q2: "Tell us about the insured person", q3: "How much cover, and for how long?",
    result: "monthly premium", monthly: "Monthly premium", year: "Per year", total: (n: number) => `Total over ${n} years`,
    base: "Base premium", ageA: "Age", sexA: "Sex", smokeA: "Smoking", healthA: "Health", chart: "From base premium to monthly premium",
    plainAge: "your age", plainCov: "the coverage", plainTerm: "the paying period", ageLabel: "Age at signing", covLabel: "Coverage amount", termLabel: "Paying period",
    head: (rel: number, m: string) => `With these details the premium is ${rel >= 0 ? `about ${rel}% higher` : `about ${-rel}% lower`} than the base case for the same cover. The model's monthly premium is about ${m}.`,
    big: (k: string, m: string) => `The biggest addition to the base premium is ${k} (+${m}).`,
    noBig: "Age, smoking and health are all at or below the base, so the premium is at or below the base premium.",
    r2: "Smoking adds 15–35% of the base, and age raises it in steps every 5 years from 35. For the same cover, signing earlier and after quitting is cheaper.",
    r3: "This is a teaching model of how premiums move. Real quotes can differ several-fold (term life is usually cheaper in reality), so use the ratios and check real prices with insurers or a comparison site.",
    caption: "Age rises in 5-year steps. Signing just before a step saves money.",
    askTitle: "Before you sign",
    ask: ["Compare real quotes for the same cover on a comparison site or with several insurers.", "Renewable policies can rise at every renewal. Compare their total cost with level-premium policies.", "If you do not disclose health facts honestly, claims can be refused."],
    steps: (cov: string, rate: number, base: string) => `Base = coverage ${cov} × ${rate} = ${base}`,
    step2: (a: number, s: number, h: number) => `+ base × (age ${a} − 1) + sex + smoking (${s}) + health (${h}) additions`,
    step3: (m: string, n: number, t: string) => `= ${m} × 12 × ${n} years = ${t}`,
  },
  ja: {
    types: { term: "定期保険", life: "終身保険", health: "医療保険", auto: "自動車保険" }, smoke: { never: "吸わない", former: "やめた", current: "吸う" }, health: { excellent: "とても良い", good: "良い", average: "普通", poor: "良くない" },
    kind: "保険の種類", age: "年齢", yrs: "歳", sex: "性別", m: "男性", f: "女性", smokeL: "たばこ", healthL: "健康状態", coverage: "保障額", term: "払込期間", years: "年",
    q1: "どの保険を調べていますか？", q2: "加入する人について教えてください", q3: "いくらを、何年保障しますか？",
    result: "月の保険料", monthly: "月の保険料", year: "1年", total: (n: number) => `${n}年の合計`,
    base: "基本料", ageA: "年齢", sexA: "性別", smokeA: "喫煙", healthA: "健康状態", chart: "基本料から月の保険料まで",
    plainAge: "年齢", plainCov: "保障額", plainTerm: "払込期間", ageLabel: "加入年齢", covLabel: "保障額", termLabel: "払込期間",
    head: (rel: number, m: string) => `この条件だと、同じ保障の基本条件より保険料が${rel >= 0 ? `約${rel}%高く` : `約${-rel}%安く`}なります。モデルで計算した月の保険料は約${m}です。`,
    big: (k: string, m: string) => `基本料にいちばん多く上乗せされたのは${k}（+${m}）です。`,
    noBig: "年齢・喫煙・健康状態がすべて基本以下なので、保険料は基本料以下です。",
    r2: "喫煙は基本料の15〜35%、年齢は35歳から5年ごとに段階的に上がります。同じ保障なら早めに、禁煙後に入るほど安くなります。",
    r3: "保険料の動き方を見るための学習用モデルで、実際の見積もりとは数倍違うこともあります。比率の変化だけを参考にし、金額は保険会社や比較サイトで確認してください。",
    caption: "年齢は5歳刻みの階段で上がります。階段の直前に入ると節約できます。",
    askTitle: "加入前に確認すること",
    ask: ["同じ保障で、比較サイトや複数の保険会社の実際の保険料を比べてください。", "更新型は更新のたびに保険料が上がることがあります。全期型と総額で比べてください。", "告知義務を守らないと保険金を受け取れないことがあります。"],
    steps: (cov: string, rate: number, base: string) => `基本料 = 保障額 ${cov} × ${rate} = ${base}`,
    step2: (a: number, s: number, h: number) => `+ 基本料 × (年齢 ${a} − 1) + 性別 + 喫煙(${s}) + 健康(${h}) の上乗せ`,
    step3: (m: string, n: number, t: string) => `= ${m} × 12 × ${n}年 = ${t}`,
  },
  zh: {
    types: { term: "定期寿险", life: "终身寿险", health: "健康险", auto: "车险" }, smoke: { never: "不吸烟", former: "已戒烟", current: "吸烟" }, health: { excellent: "很好", good: "良好", average: "一般", poor: "较差" },
    kind: "保险类型", age: "年龄", yrs: "岁", sex: "性别", m: "男", f: "女", smokeL: "吸烟", healthL: "健康状况", coverage: "保额", term: "缴费期", years: "年",
    q1: "想了解哪种保险？", q2: "说说被保险人的情况", q3: "保多少、保多久？",
    result: "每月保费", monthly: "每月保费", year: "每年", total: (n: number) => `${n}年合计`,
    base: "基础保费", ageA: "年龄", sexA: "性别", smokeA: "吸烟", healthA: "健康状况", chart: "从基础保费到每月保费",
    plainAge: "年龄", plainCov: "保额", plainTerm: "缴费期", ageLabel: "投保年龄", covLabel: "保额", termLabel: "缴费期",
    head: (rel: number, m: string) => `按这些条件，保费比同样保障的基础条件${rel >= 0 ? `高约${rel}%` : `低约${-rel}%`}。模型算出的每月保费约为${m}。`,
    big: (k: string, m: string) => `在基础保费上加得最多的是${k}（+${m}）。`,
    noBig: "年龄、吸烟和健康状况都不高于基础条件，所以保费不高于基础保费。",
    r2: "吸烟加基础保费的15%～35%，年龄从35岁起每5年分档上升。同样保障，越早投保、戒烟后投保越便宜。",
    r3: "这是用来理解保费变化的教学模型，与实际报价可能相差数倍。请只参考比例变化，具体金额向保险公司或比价平台确认。",
    caption: "年龄按5岁一档上升，赶在升档前投保可以省钱。",
    askTitle: "投保前要确认",
    ask: ["在比价平台或多家保险公司比较同样保障的实际报价。", "可续保产品每次续保保费都可能上涨，请和保证费率产品比较总额。", "未如实告知健康状况，可能无法获得理赔。"],
    steps: (cov: string, rate: number, base: string) => `基础保费 = 保额 ${cov} × ${rate} = ${base}`,
    step2: (a: number, s: number, h: number) => `+ 基础保费 × (年龄 ${a} − 1) + 性别 + 吸烟(${s}) + 健康(${h}) 加费`,
    step3: (m: string, n: number, t: string) => `= ${m} × 12 × ${n}年 = ${t}`,
  },
  fr: {
    types: { term: "Temporaire décès", life: "Vie entière", health: "Santé", auto: "Auto" }, smoke: { never: "Jamais", former: "Arrêté", current: "Fumeur" }, health: { excellent: "Excellente", good: "Bonne", average: "Moyenne", poor: "Mauvaise" },
    kind: "Type d'assurance", age: "Âge", yrs: "ans", sex: "Sexe", m: "Homme", f: "Femme", smokeL: "Tabac", healthL: "Santé", coverage: "Capital garanti", term: "Durée de cotisation", years: "ans",
    q1: "Quelle assurance regardez-vous ?", q2: "Parlez-nous de l'assuré", q3: "Quel capital, et pour combien de temps ?",
    result: "la prime mensuelle", monthly: "Prime mensuelle", year: "Par an", total: (n: number) => `Total sur ${n} ans`,
    base: "Prime de base", ageA: "Âge", sexA: "Sexe", smokeA: "Tabac", healthA: "Santé", chart: "De la prime de base à la prime mensuelle",
    plainAge: "votre âge", plainCov: "le capital", plainTerm: "la durée", ageLabel: "Âge à la souscription", covLabel: "Capital garanti", termLabel: "Durée de cotisation",
    head: (rel: number, m: string) => `Avec ces éléments, la prime est ${rel >= 0 ? `environ ${rel} % plus élevée` : `environ ${-rel} % plus basse`} que le cas de base pour la même garantie. La prime mensuelle du modèle est d'environ ${m}.`,
    big: (k: string, m: string) => `Le plus gros ajout à la prime de base vient de : ${k} (+${m}).`,
    noBig: "Âge, tabac et santé sont tous au niveau de base ou en dessous : la prime ne dépasse pas la prime de base.",
    r2: "Le tabac ajoute 15 à 35 % de la base, et l'âge la fait monter par paliers tous les 5 ans dès 35 ans. Pour la même garantie, souscrire tôt et après l'arrêt du tabac coûte moins cher.",
    r3: "C'est un modèle pédagogique : les vrais devis peuvent varier du simple au triple. Retenez les écarts relatifs et vérifiez les montants auprès des assureurs ou d'un comparateur.",
    caption: "L'âge monte par paliers de 5 ans : souscrire juste avant un palier fait économiser.",
    askTitle: "Avant de signer",
    ask: ["Comparez de vrais devis pour la même garantie sur un comparateur ou auprès de plusieurs assureurs.", "Une prime révisable peut augmenter à chaque échéance : comparez le coût total avec une prime fixe.", "Une fausse déclaration de santé peut entraîner un refus d'indemnisation."],
    steps: (cov: string, rate: number, base: string) => `Base = capital ${cov} × ${rate} = ${base}`,
    step2: (a: number, s: number, h: number) => `+ base × (âge ${a} − 1) + sexe + tabac (${s}) + santé (${h})`,
    step3: (m: string, n: number, t: string) => `= ${m} × 12 × ${n} ans = ${t}`,
  },
  es: {
    types: { term: "Vida temporal", life: "Vida entera", health: "Salud", auto: "Coche" }, smoke: { never: "Nunca", former: "Lo dejé", current: "Fumador" }, health: { excellent: "Excelente", good: "Buena", average: "Normal", poor: "Mala" },
    kind: "Tipo de seguro", age: "Edad", yrs: "años", sex: "Sexo", m: "Hombre", f: "Mujer", smokeL: "Tabaco", healthL: "Salud", coverage: "Capital asegurado", term: "Periodo de pago", years: "años",
    q1: "¿Qué seguro estás mirando?", q2: "Cuéntanos sobre la persona asegurada", q3: "¿Cuánto capital y durante cuánto tiempo?",
    result: "la prima mensual", monthly: "Prima mensual", year: "Al año", total: (n: number) => `Total en ${n} años`,
    base: "Prima base", ageA: "Edad", sexA: "Sexo", smokeA: "Tabaco", healthA: "Salud", chart: "De la prima base a la prima mensual",
    plainAge: "tu edad", plainCov: "el capital", plainTerm: "el periodo de pago", ageLabel: "Edad al contratar", covLabel: "Capital asegurado", termLabel: "Periodo de pago",
    head: (rel: number, m: string) => `Con estos datos la prima es ${rel >= 0 ? `un ${rel} % más alta` : `un ${-rel} % más baja`} que el caso base con la misma cobertura. La prima mensual del modelo es de unos ${m}.`,
    big: (k: string, m: string) => `Lo que más se suma a la prima base es: ${k} (+${m}).`,
    noBig: "Edad, tabaco y salud están en el nivel base o por debajo, así que la prima no supera la base.",
    r2: "El tabaco suma entre un 15 y un 35 % de la base, y la edad la sube por tramos cada 5 años desde los 35. Con la misma cobertura, contratar antes y tras dejar de fumar sale más barato.",
    r3: "Es un modelo didáctico de cómo se mueven las primas; las ofertas reales pueden variar varias veces. Fíjate en las proporciones y comprueba los importes con aseguradoras o un comparador.",
    caption: "La edad sube en tramos de 5 años: contratar justo antes de un tramo ahorra dinero.",
    askTitle: "Antes de firmar",
    ask: ["Compara ofertas reales con la misma cobertura en un comparador o con varias aseguradoras.", "Las primas renovables pueden subir en cada renovación: compara el coste total con primas niveladas.", "Si no declaras tu salud con honestidad, pueden rechazarte el siniestro."],
    steps: (cov: string, rate: number, base: string) => `Base = capital ${cov} × ${rate} = ${base}`,
    step2: (a: number, s: number, h: number) => `+ base × (edad ${a} − 1) + sexo + tabaco (${s}) + salud (${h})`,
    step3: (m: string, n: number, t: string) => `= ${m} × 12 × ${n} años = ${t}`,
  },
};

const NEXT: Record<WL, { href: string; label: string }[]> = {
  en: [{ href: "/en/life-planning-calculator/", label: "Life planning" }, { href: "/en/compound-interest-calculator/", label: "Compound interest" }],
  ja: [{ href: "/ja/life-planning-calculator/", label: "ライフプラン" }, { href: "/ja/compound-interest-calculator/", label: "複利" }],
  zh: [{ href: "/zh/life-planning-calculator/", label: "人生规划" }, { href: "/zh/compound-interest-calculator/", label: "复利" }],
  fr: [{ href: "/fr/life-planning-calculator/", label: "Projet de vie" }, { href: "/fr/compound-interest-calculator/", label: "Intérêts composés" }],
  es: [{ href: "/es/life-planning-calculator/", label: "Plan de vida" }, { href: "/es/compound-interest-calculator/", label: "Interés compuesto" }],
};

export default function InsuranceWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const a = (n: number) => cash(n, lang, cur);
  const x = (n: number) => cashExact(n, lang, cur);
  const example: InsLite = { type: "term", age: 35, sex: "m", smoke: "never", health: "good", coverage: 100_000 * sc(cur), term: 20 };
  const opts = <K extends string>(o: Record<K, string>) => (Object.keys(o) as K[]).map((value) => ({ value, label: o[value] }));
  const assumptions = useMemo<Assumption<InsLite>[]>(
    () => [
      { key: "age", label: t.ageLabel, plain: t.plainAge, unit: "age", kind: "assumption", get: (i) => i.age, set: (i, v) => ({ ...i, age: Math.min(80, Math.max(18, Math.round(v))) }), range: fixedRange(20, 70), marks: [{ at: 35, label: "35" }, { at: 50, label: "50" }] },
      { key: "coverage", label: t.covLabel, plain: t.plainCov, unit: "won", kind: "assumption", get: (i) => i.coverage, set: (i, v) => ({ ...i, coverage: Math.max(1_000 * sc(cur), v) }), range: (v) => [Math.max(10_000 * sc(cur), v * 0.3), v * 2] },
      { key: "term", label: t.termLabel, plain: t.plainTerm, unit: "years", kind: "assumption", get: (i) => i.term, set: (i, v) => ({ ...i, term: Math.max(1, Math.round(v)) }), range: fixedRange(5, 40) },
    ],
    [t, cur],
  );
  const summary = (i: InsLite, top?: TornadoBar) => {
    const r = insResult(i);
    const adds = [[t.ageA, r.age], [t.smokeA, r.smoke], [t.healthA, r.health], [t.sexA, r.sex]] as const;
    const big = [...adds].sort((p, q) => q[1] - p[1])[0];
    const rel = r.base > 0 ? Math.round((r.monthly / r.base - 1) * 100) : 0;
    return { headline: t.head(rel, a(r.monthly)), driver: driverOf(lang, top, t.result, a), reasons: [big[1] > 0 ? t.big(big[0], a(big[1])) : t.noBig, t.r2, t.r3] };
  };
  const kind = (input: InsLite, edit: Edit) => <ChoiceChips<InsType> legend={t.kind} value={input.type} options={opts(t.types)} onChange={(v) => edit({ type: v }, ["type"])} />;
  const me = (input: InsLite, edit: Edit) => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label={t.age} value={input.age} onChange={(v) => edit({ age: v }, ["age"])} suffix={t.yrs} step={1} min={18} />
        <ChoiceChips<"m" | "f"> legend={t.sex} value={input.sex} options={[{ value: "m", label: t.m }, { value: "f", label: t.f }]} onChange={(v) => edit({ sex: v }, ["sex"])} />
      </div>
      <ChoiceChips<Smoke> legend={t.smokeL} value={input.smoke} options={opts(t.smoke)} onChange={(v) => edit({ smoke: v }, ["smoke"])} />
      <ChoiceChips<Health> legend={t.healthL} value={input.health} options={opts(t.health)} onChange={(v) => edit({ health: v }, ["health"])} />
    </div>
  );
  const plan = (input: InsLite, edit: Edit) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberField label={t.coverage} value={input.coverage} onChange={(v) => edit({ coverage: v }, ["coverage"])} suffix={cur} step={10_000 * sc(cur)} />
      <NumberField label={t.term} value={input.term} onChange={(v) => edit({ term: v }, ["term"])} suffix={t.years} step={1} min={1} />
    </div>
  );
  return (
    <ScenarioTool<InsLite, Key>
      lang={lang}
      currency={cur}
      toolId="insurance-premium-calculator"
      example={example}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={insMonthly}
      resultName={t.result}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["type"], body: kind(input, edit) },
        { title: t.q2, keys: ["age", "sex", "smoke", "health"], body: me(input, edit) },
        { title: t.q3, keys: ["coverage", "term"], body: plan(input, edit) },
      ]}
      expert={({ input, edit }) => (
        <div className="space-y-3">
          {kind(input, edit)}
          {me(input, edit)}
          {plan(input, edit)}
        </div>
      )}
      summary={summary}
      metrics={(i) => {
        const r = insResult(i);
        return [
          { label: t.monthly, value: x(r.monthly), tone: "primary" },
          { label: t.year, value: x(r.monthly * 12) },
          { label: t.total(i.term), value: a(r.total) },
        ];
      }}
      sliders={["age", "coverage", "term"]}
      sweepCaption={(s) => (s.key === "age" ? t.caption : undefined)}
      charts={(i) => {
        const r = insResult(i);
        return (
          <BridgeChart
            title={t.chart}
            steps={[
              { label: t.base, value: r.base, kind: "total" },
              { label: t.ageA, value: r.age, kind: "add" },
              { label: t.sexA, value: r.sex, kind: "add" },
              { label: t.smokeA, value: r.smoke, kind: "add" },
              { label: t.healthA, value: r.health, kind: "add" },
              { label: t.monthly, value: r.monthly, kind: "total" },
            ]}
            format={x}
          />
        );
      }}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = insResult(i);
        return (
          <ResultSteps
            steps={[t.steps(x(i.coverage), INS_TYPES[i.type].rate, x(r.base)), t.step2(ageK(i.age), SMOKE[i.smoke].k, HEALTH[i.health].k), t.step3(x(r.monthly), i.term, x(r.total))]}
            next={NEXT[lang]}
          />
        );
      }}
    />
  );
}
