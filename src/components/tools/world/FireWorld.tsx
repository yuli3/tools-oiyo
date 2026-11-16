// FIRE 조기 은퇴 다른 언어 판(en·ja·zh·fr·es) (2026-11-17). 한국어는 FireScenario. 계산: lib/world-money-scenarios.ts fireResult, 문구: lib/world-money-i18n.ts
import { useMemo } from "react";
import { FIRE_EXAMPLE, UNIT, WL_CURRENCY, cash, cashExact, fireAssumptions, firePlainI, fireYearsText, type WL } from "../../../lib/world-money-i18n";
import { fireResult, fireYears, type FireLite } from "../../../lib/world-money-scenarios";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import CompareBars from "../viz/CompareBars";
import ScenarioTool from "../viz/ScenarioTool";
import { nextLinks } from "./names";

const KEYS = ["age", "assets", "monthlySave", "ret", "spending", "withdraw"] as const;
type Key = (typeof KEYS)[number];
type Edit = (p: Partial<FireLite>, k: Key[]) => void;
const pctField = (v: number) => Number((v * 100).toFixed(2));

const T = {
  en: { age: "Current age", assets: "Invested so far", monthlySave: "Monthly savings", spending: "Yearly spending in retirement", ret: "Return after inflation", withdraw: "Safe withdrawal rate", q1: "How old are you, and how much have you invested?", q2: "How much do you save each month, and spend each year in retirement?", h2: "$3,000 a month is $36,000 a year.", q3: "What return should we assume?", h3: "Long-term stock-heavy portfolios: about 4–5% after inflation. Mostly cash: about 1%.", result: "the years to retirement", target: "Target", years: "Years to go", fireAge: "Retirement age", sweep: "A lower withdrawal rate is safer but raises the target, so it takes longer.", chart: "Years to retirement by spending", cap: "Everything else unchanged; only yearly spending moves.", per: (m: string) => `${m}/yr`, askTitle: "Good to know", ask: ["Taxes, health insurance and Social Security are not included.", "Returns are assumed steady. A big market drop right after retiring can delay things."], s1: "Target", s2: (r: string, s: string) => `Each year: assets × (1 + ${r}) + yearly savings ${s}`, reached: (y: number, a: number) => `Target reached in ${y} years (age ${a})`, not: "Not reached within 70 years" },
  ja: { age: "現在の年齢", assets: "今ある投資資産", monthlySave: "毎月の貯蓄額", spending: "引退後の年間生活費", ret: "物価を引いた年利回り", withdraw: "安全な取り崩し率", q1: "今の年齢と、これまでに貯めた資産は？", q2: "毎月いくら貯めて、引退後は1年にいくら使いますか？", h2: "月30万円なら年360万円です。", q3: "利回りはどのくらいと見ますか？", h3: "株式中心の長期投資なら物価を引いて4〜5%、預金中心なら1%未満です。", result: "引退までの年数", target: "目標資産", years: "かかる年数", fireAge: "引退年齢", sweep: "取り崩し率を下げると安全ですが、目標資産が大きくなり時間がかかります。", chart: "生活費ごとの引退までの年数", cap: "ほかの条件はそのままで、1年の生活費だけ変えています。", per: (m: string) => `年${m}`, askTitle: "知っておきたいこと", ask: ["税金・社会保険料・公的年金は含めていません。", "利回りは毎年一定と仮定しています。引退直後に大きく下がると時間が延びることがあります。"], s1: "目標", s2: (r: string, s: string) => `毎年: 資産 ×（1 + ${r}）+ 年間貯蓄 ${s}`, reached: (y: number, a: number) => `${y}年後（${a}歳）に目標到達`, not: "70年以内に到達しない" },
  zh: { age: "现在年龄", assets: "已有投资资产", monthlySave: "每月储蓄", spending: "退休后年支出", ret: "扣除通胀后的年化收益", withdraw: "安全提取率", q1: "你现在多大，已经攒了多少？", q2: "每月存多少，退休后每年花多少？", h2: "每月1万元就是每年12万元。", q3: "收益率按多少算？", h3: "以股票为主的长期投资，扣除通胀约4%~5%；以存款为主约1%。", result: "退休所需年数", target: "目标资产", years: "所需年数", fireAge: "退休年龄", sweep: "提取率越低越安全，但目标资产更大、需要更久。", chart: "不同生活费下的退休年数", cap: "其他条件不变，只改变一年生活费。", per: (m: string) => `每年${m}`, askTitle: "需要了解", ask: ["未计税费、社保和养老金。", "假设每年收益相同。刚退休就遇上大跌，可能需要更久。"], s1: "目标", s2: (r: string, s: string) => `每年：资产 ×（1 + ${r}）+ 年储蓄 ${s}`, reached: (y: number, a: number) => `${y}年后（${a}岁）达到目标`, not: "70年内达不到" },
  fr: { age: "Âge actuel", assets: "Déjà investi", monthlySave: "Épargne mensuelle", spending: "Dépenses annuelles à la retraite", ret: "Rendement hors inflation", withdraw: "Taux de retrait sûr", q1: "Quel âge avez-vous, et combien avez-vous déjà investi ?", q2: "Combien épargnez-vous par mois, et combien dépenserez-vous par an ?", h2: "2 500 € par mois font 30 000 € par an.", q3: "Quel rendement retenir ?", h3: "Portefeuille surtout en actions sur le long terme : 4 à 5 % hors inflation. Surtout en livrets : environ 0 à 1 %.", result: "le nombre d'années", target: "Objectif", years: "Années restantes", fireAge: "Âge de départ", sweep: "Un taux de retrait plus bas est plus sûr, mais l'objectif grossit et il faut plus de temps.", chart: "Années avant la retraite selon les dépenses", cap: "Tout le reste est identique ; seules les dépenses annuelles changent.", per: (m: string) => `${m}/an`, askTitle: "Bon à savoir", ask: ["Impôts, prélèvements sociaux et retraite publique non inclus.", "Le rendement est supposé constant. Une forte baisse juste après l'arrêt peut retarder l'objectif."], s1: "Objectif", s2: (r: string, s: string) => `Chaque année : patrimoine × (1 + ${r}) + épargne annuelle ${s}`, reached: (y: number, a: number) => `Objectif atteint dans ${y} ans (${a} ans)`, not: "Non atteint en 70 ans" },
  es: { age: "Edad actual", assets: "Invertido hasta ahora", monthlySave: "Ahorro mensual", spending: "Gasto anual en la jubilación", ret: "Rentabilidad descontada la inflación", withdraw: "Tasa de retirada segura", q1: "¿Qué edad tienes y cuánto has invertido ya?", q2: "¿Cuánto ahorras al mes y cuánto gastarás al año?", h2: "2.000 € al mes son 24.000 € al año.", q3: "¿Qué rentabilidad suponemos?", h3: "Cartera mayoritariamente en bolsa a largo plazo: 4-5 % descontada la inflación. Sobre todo depósitos: en torno al 0-1 %.", result: "los años hasta jubilarte", target: "Objetivo", years: "Años que faltan", fireAge: "Edad de jubilación", sweep: "Una tasa de retirada más baja es más segura, pero el objetivo crece y tardas más.", chart: "Años hasta jubilarte según el gasto", cap: "Todo lo demás igual; solo cambia el gasto anual.", per: (m: string) => `${m}/año`, askTitle: "Conviene saber", ask: ["No incluye impuestos, cotizaciones ni pensión pública.", "Se supone una rentabilidad constante. Una caída fuerte justo al jubilarte puede retrasarlo."], s1: "Objetivo", s2: (r: string, s: string) => `Cada año: patrimonio × (1 + ${r}) + ahorro anual ${s}`, reached: (y: number, a: number) => `Objetivo alcanzado en ${y} años (a los ${a})`, not: "No se alcanza en 70 años" },
};

export default function FireWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const cur = WL_CURRENCY[lang];
  const u = UNIT[lang];
  const yt = fireYearsText(lang);
  const assumptions = useMemo(() => fireAssumptions(lang, cur), [lang, cur]);
  const summary = useMemo(() => firePlainI(lang, cur), [lang, cur]);
  const step = cur === "JPY" ? 10_000 : cur === "CNY" ? 1_000 : 100;
  const m = (label: string, key: "assets" | "monthlySave" | "spending", i: FireLite, edit: Edit, k = 1) => (
    <NumberField label={label} value={i[key]} onChange={(v) => edit({ [key]: v } as Partial<FireLite>, [key])} suffix={cur} step={step * k} />
  );
  const age = (i: FireLite, edit: Edit) => <NumberField label={t.age} value={i.age} onChange={(v) => edit({ age: v }, ["age"])} suffix={u.age} step={1} min={15} />;
  const ret = (i: FireLite, edit: Edit, st = 0.5) => <NumberField label={t.ret} value={pctField(i.ret)} onChange={(v) => edit({ ret: v / 100 }, ["ret"])} suffix="%" step={st} />;
  return (
    <ScenarioTool<FireLite, Key>
      lang={lang}
      currency={cur}
      toolId="fire-retirement-calculator"
      example={FIRE_EXAMPLE[lang]}
      assumptions={assumptions}
      keys={KEYS}
      evaluate={fireYears}
      resultName={t.result}
      formatResult={yt}
      questions={({ input, edit }) => [
        { title: t.q1, keys: ["age", "assets"], body: <div className="grid gap-3 sm:grid-cols-2">{age(input, edit)}{m(t.assets, "assets", input, edit, 10)}</div> },
        { title: t.q2, keys: ["monthlySave", "spending"], body: (
          <>
            <div className="grid gap-3 sm:grid-cols-2">{m(t.monthlySave, "monthlySave", input, edit)}{m(t.spending, "spending", input, edit, 10)}</div>
            <p className="mt-2 text-xs text-muted-foreground">{t.h2}</p>
          </>
        ) },
        { title: t.q3, keys: ["ret"], body: (
          <>
            {ret(input, edit)}
            <p className="mt-2 text-xs text-muted-foreground">{t.h3}</p>
          </>
        ) },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          {age(input, edit)}
          {m(t.assets, "assets", input, edit, 10)}
          {m(t.monthlySave, "monthlySave", input, edit)}
          {m(t.spending, "spending", input, edit, 10)}
          {ret(input, edit, 0.1)}
          <NumberField label={t.withdraw} value={pctField(input.withdraw)} onChange={(v) => edit({ withdraw: v / 100 }, ["withdraw"])} suffix="%" step={0.25} />
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = fireResult(i);
        return [
          { label: t.target, value: s.money(r.target) },
          { label: t.years, value: yt(r.years), tone: "primary" },
          { label: t.fireAge, value: r.reached ? `${r.fireAge}` : "—" },
        ];
      }}
      sliders={["monthlySave", "spending", "ret", "withdraw"]}
      sweepCaption={(a) => (a.key === "withdraw" ? t.sweep : undefined)}
      charts={(i) => (
        <CompareBars
          title={t.chart}
          caption={t.cap}
          items={[0.8, 1, 1.2].map((k) => ({ label: t.per(cash(i.spending * k, lang, cur)), value: fireYears({ ...i, spending: i.spending * k }), current: k === 1 }))}
          format={yt}
        />
      )}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = fireResult(i);
        const x = (n: number) => cashExact(n, lang, cur);
        return (
          <ResultSteps
            steps={[`${t.s1} = ${x(i.spending)} ÷ ${(i.withdraw * 100).toFixed(2)}% = ${x(r.target)}`, t.s2(`${(i.ret * 100).toFixed(1)}%`, x(i.monthlySave * 12)), r.reached ? t.reached(r.years, r.fireAge) : t.not]}
            next={nextLinks(lang, ["compound-interest-calculator", "mortgage-calculator"])}
          />
        );
      }}
    />
  );
}
