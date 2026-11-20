// 한국 월급 실수령액 다른 언어 판(en·ja·zh·fr·es) (2026-11-20). 한국어는 KrSalaryScenario.
// 계산은 같은 엔진(lib/kr-tax-scenarios salaryBreakdown), 금액은 원화(KRW) 그대로, 문구만 언어별.
import { useMemo } from "react";
import { fixedRange, type Assumption, type BridgeStep, type TornadoBar } from "../../../lib/scenario";
import { salaryBreakdown, salaryNet, type SalaryInput } from "../../../lib/kr-tax-scenarios";
import { cash, cashExact, driverOf, type WL } from "../../../lib/world-money-i18n";
import NumberField from "../payroll/NumberField";
import ResultSteps from "../payroll/ResultSteps";
import BridgeChart from "../viz/BridgeChart";
import ScenarioTool from "../viz/ScenarioTool";

const KEYS = ["monthly", "dependents", "nonTaxable"] as const;
type Key = (typeof KEYS)[number];
const EXAMPLE: SalaryInput = { monthly: 3_000_000, dependents: 1, nonTaxable: 200_000 };
const CUR = "KRW";

const T = {
  en: {
    monthly: ["Monthly gross salary", "your monthly salary"], dependents: ["Basic deduction count", "the number of dependents"], nonTaxable: ["Non-taxable allowances", "tax-free allowances"],
    q1: "What is your monthly salary before tax?", h1: (y: string) => `If you only know your annual salary, divide it by 12 (that is ${y} a year).`,
    q2: "How many people, including you, are dependents?", f2: "You + spouse, children or parents with little income", people: "people",
    q3: "Do you get tax-free allowances such as meals?", f3: "Monthly tax-free allowance", h3: "Meal allowance is tax-free up to ₩200,000 a month, and so is a car allowance. Check the non-taxable line on your payslip.",
    result: "monthly take-home pay", net: "Monthly take-home", year: "Per year", rate: "Deducted share",
    sweep: "National pension stops rising above about ₩6.37M a month, so the curve steepens slightly at high salaries.", chart: "What comes out of your salary",
    b: ["Gross salary", "National pension", "Health + long-term care", "Employment insurance", "Income + local tax", "Paid into your account"],
    askTitle: "Good to know", ask: ["Employers withhold tax with the NTS simplified table (80/100/120%), so monthly withholding can differ from this estimate. The difference is settled at year-end tax settlement.", "Children aged 8–20 add a child tax credit that lowers tax further."],
    head: (g: string, n: string) => `Of a ${g} monthly salary, about ${n} reaches your account (estimate).`,
    r1: (a: string, b: string) => `Social insurance takes about ${a} and taxes about ${b}. Insurance is often larger than tax.`,
    r2y: (a: string) => `The tax-free allowance of ${a} carries no insurance or tax.`, r2n: "Tax-free allowances such as meals reduce what is deducted.",
    r3: "Your employer's withholding uses a lookup table, so it differs slightly from this estimate; year-end settlement evens it out.",
    s: (r: Steps) => [`Taxable pay ${r.taxable} (excluding ${r.nonTax} tax-free), ${r.annual} a year`, `Pension ${r.pension}, health ${r.health}, long-term care ${r.ltc}, employment ${r.emp}`, `Earned income deduction ${r.eid}, personal ${r.pd}, insurance ${r.ins} → tax base ${r.base}`, `Calculated tax ${r.calc} − earned income tax credit ${r.credit} = ${r.det} ÷ 12 = ${r.month} a month`, "Annual estimate, not the simplified withholding table. Child and special deductions are not included."],
  },
  ja: {
    monthly: ["月の額面給与", "月給"], dependents: ["基本控除の人数", "扶養家族の数"], nonTaxable: ["非課税手当", "非課税の手当"],
    q1: "税引き前の月給はいくらですか？", h1: (y: string) => `年収しか分からなければ12で割って入れてください（年${y}）。`,
    q2: "あなたを含めて扶養家族は何人ですか？", f2: "本人＋所得がほとんどない配偶者・子・親", people: "人",
    q3: "食事手当のような非課税手当はありますか？", f3: "月の非課税手当", h3: "食事手当は月20万ウォンまで、自家用車手当も20万ウォンまで非課税です。給与明細の非課税欄を見てください。",
    result: "月の手取り", net: "月の手取り", year: "年間", rate: "差し引かれる割合",
    sweep: "国民年金は月約637万ウォンを超えると増えないため、高い月給では曲線が少し急になります。", chart: "月給から差し引かれるもの",
    b: ["額面給与", "国民年金", "健康保険・介護保険", "雇用保険", "所得税・地方所得税", "口座に入る額"],
    askTitle: "知っておきたいこと", ask: ["会社の源泉徴収は簡易税額表（80・100・120%）を使うため、この推定と違うことがあります。差額は年末調整で精算されます。", "8〜20歳の子がいると子ども税額控除で税金がさらに減ります。"],
    head: (g: string, n: string) => `月給${g}のうち、約${n}が口座に入ります（推定）。`,
    r1: (a: string, b: string) => `社会保険で約${a}、税金で約${b}が引かれます。保険料のほうが税金より多いことがよくあります。`,
    r2y: (a: string) => `非課税手当${a}には保険料も税金もかかりません。`, r2n: "食事手当のような非課税手当があれば、その分差し引きが減ります。",
    r3: "会社の源泉徴収は税額表なので、この推定と少し違います。差は年末調整で合わせます。",
    s: (r: Steps) => [`課税給与 ${r.taxable}（非課税 ${r.nonTax} を除く）、年 ${r.annual}`, `国民年金 ${r.pension}、健康保険 ${r.health}、介護保険 ${r.ltc}、雇用保険 ${r.emp}`, `勤労所得控除 ${r.eid}、人的控除 ${r.pd}、保険料控除 ${r.ins} → 課税標準 ${r.base}`, `算出税額 ${r.calc} − 勤労所得税額控除 ${r.credit} = ${r.det} ÷ 12 = 月 ${r.month}`, "簡易税額表ではなく年間の推定額です。子ども税額控除・特別控除は含めていません。"],
  },
  zh: {
    monthly: ["月税前工资", "月薪"], dependents: ["基本扣除人数", "抚养人数"], nonTaxable: ["免税津贴", "免税津贴"],
    q1: "税前月薪是多少？", h1: (y: string) => `只知道年薪的话，请除以12填写（年薪${y}）。`,
    q2: "包括你在内，有几位受抚养人？", f2: "本人 + 几乎没有收入的配偶、子女、父母", people: "人",
    q3: "有餐补这类免税津贴吗？", f3: "每月免税津贴", h3: "餐补每月20万韩元以内免税，自驾车补贴也是20万韩元以内。请看工资单上的免税栏。",
    result: "每月实发工资", net: "每月实发", year: "一年", rate: "扣除比例",
    sweep: "国民年金在月薪约637万韩元以上不再增加，所以高薪时曲线会稍微变陡。", chart: "工资里扣掉的钱",
    b: ["税前工资", "国民年金", "健康保险·长期护理", "雇佣保险", "所得税·地方所得税", "到账金额"],
    askTitle: "需要了解", ask: ["公司按简易税额表（80%·100%·120%）代扣税款，可能与本估算不同。差额在年末结算时多退少补。", "有8至20岁子女时，子女税额抵免会让税更少。"],
    head: (g: string, n: string) => `月薪${g}中约有${n}到账（估算）。`,
    r1: (a: string, b: string) => `四大保险扣约${a}，税扣约${b}。保险费常常比税还多。`,
    r2y: (a: string) => `免税津贴${a}不缴保险也不缴税。`, r2n: "有餐补等免税津贴时，扣款会相应减少。",
    r3: "公司代扣用的是税额表，和本估算略有差异，年末结算时会调平。",
    s: (r: Steps) => [`应税工资 ${r.taxable}（不含免税 ${r.nonTax}），年 ${r.annual}`, `国民年金 ${r.pension}，健康保险 ${r.health}，长期护理 ${r.ltc}，雇佣保险 ${r.emp}`, `劳动所得扣除 ${r.eid}，人身扣除 ${r.pd}，保险费扣除 ${r.ins} → 应纳税所得 ${r.base}`, `计算税额 ${r.calc} − 劳动所得税额抵免 ${r.credit} = ${r.det} ÷ 12 = 每月 ${r.month}`, "这是年度估算，不是简易税额表。未计入子女抵免和特别扣除。"],
  },
  fr: {
    monthly: ["Salaire mensuel brut", "votre salaire mensuel"], dependents: ["Personnes à charge (abattement de base)", "le nombre de personnes à charge"], nonTaxable: ["Indemnités non imposables", "les indemnités non imposables"],
    q1: "Quel est votre salaire mensuel brut ?", h1: (y: string) => `Si vous ne connaissez que le salaire annuel, divisez-le par 12 (soit ${y} par an).`,
    q2: "Combien de personnes à charge, vous compris ?", f2: "Vous + conjoint, enfants ou parents sans revenus notables", people: "pers.",
    q3: "Recevez-vous des indemnités non imposables (repas, etc.) ?", f3: "Indemnité mensuelle non imposable", h3: "L'indemnité repas est non imposable jusqu'à 200 000 ₩ par mois, tout comme l'indemnité véhicule. Regardez la ligne non imposable de votre fiche de paie.",
    result: "le salaire net mensuel", net: "Net mensuel", year: "Par an", rate: "Part prélevée",
    sweep: "La pension nationale plafonne vers 6,37 M₩ par mois : la courbe se raidit un peu pour les hauts salaires.", chart: "Ce qui est prélevé sur le salaire",
    b: ["Salaire brut", "Pension nationale", "Santé + dépendance", "Assurance chômage", "Impôt sur le revenu + local", "Versé sur votre compte"],
    askTitle: "Bon à savoir", ask: ["L'employeur retient l'impôt selon le barème simplifié du NTS (80/100/120 %) : la retenue peut différer de cette estimation. L'écart est régularisé lors du règlement fiscal de fin d'année.", "Les enfants de 8 à 20 ans ouvrent droit à un crédit d'impôt qui réduit encore l'impôt."],
    head: (g: string, n: string) => `Sur un salaire mensuel de ${g}, environ ${n} arrive sur votre compte (estimation).`,
    r1: (a: string, b: string) => `Les assurances sociales prennent environ ${a} et les impôts environ ${b}. Les cotisations dépassent souvent l'impôt.`,
    r2y: (a: string) => `L'indemnité non imposable de ${a} n'est soumise ni aux cotisations ni à l'impôt.`, r2n: "Une indemnité non imposable (repas, etc.) réduit les prélèvements.",
    r3: "La retenue de l'employeur suit un barème, donc diffère un peu de cette estimation ; la fin d'année corrige l'écart.",
    s: (r: Steps) => [`Salaire imposable ${r.taxable} (hors ${r.nonTax} non imposable), ${r.annual} par an`, `Pension ${r.pension}, santé ${r.health}, dépendance ${r.ltc}, chômage ${r.emp}`, `Abattement sur salaire ${r.eid}, personnel ${r.pd}, cotisations ${r.ins} → base imposable ${r.base}`, `Impôt calculé ${r.calc} − crédit d'impôt salarié ${r.credit} = ${r.det} ÷ 12 = ${r.month} par mois`, "Estimation annuelle, pas le barème de retenue simplifié. Crédits enfants et déductions spéciales non inclus."],
  },
  es: {
    monthly: ["Salario mensual bruto", "tu salario mensual"], dependents: ["Personas a cargo (deducción básica)", "el número de personas a cargo"], nonTaxable: ["Pluses exentos", "los pluses exentos"],
    q1: "¿Cuál es tu salario mensual bruto?", h1: (y: string) => `Si solo sabes el salario anual, divídelo entre 12 (son ${y} al año).`,
    q2: "¿Cuántas personas a cargo, incluido tú?", f2: "Tú + cónyuge, hijos o padres sin apenas ingresos", people: "pers.",
    q3: "¿Recibes pluses exentos como el de comida?", f3: "Plus mensual exento", h3: "El plus de comida está exento hasta 200.000 ₩ al mes, igual que el de vehículo. Mira la línea exenta de tu nómina.",
    result: "el salario neto mensual", net: "Neto mensual", year: "Al año", rate: "Parte retenida",
    sweep: "La pensión nacional deja de subir a partir de unos 6,37 M₩ al mes, así que la curva se empina un poco en salarios altos.", chart: "Lo que se descuenta del salario",
    b: ["Salario bruto", "Pensión nacional", "Salud + dependencia", "Seguro de empleo", "IRPF + impuesto local", "Lo que llega a tu cuenta"],
    askTitle: "Conviene saber", ask: ["La empresa retiene con la tabla simplificada del NTS (80/100/120 %), por lo que la retención mensual puede diferir de esta estimación. La diferencia se regulariza en el ajuste de fin de año.", "Los hijos de 8 a 20 años dan derecho a una deducción por hijos que baja aún más el impuesto."],
    head: (g: string, n: string) => `De un salario mensual de ${g}, llegan a tu cuenta unos ${n} (estimación).`,
    r1: (a: string, b: string) => `Los seguros sociales se llevan unos ${a} y los impuestos unos ${b}. Las cotizaciones suelen superar al impuesto.`,
    r2y: (a: string) => `El plus exento de ${a} no paga cotizaciones ni impuestos.`, r2n: "Un plus exento (comida, etc.) reduce lo que se descuenta.",
    r3: "La retención de la empresa usa una tabla, así que difiere un poco de esta estimación; el ajuste de fin de año lo iguala.",
    s: (r: Steps) => [`Salario sujeto ${r.taxable} (sin ${r.nonTax} exentos), ${r.annual} al año`, `Pensión ${r.pension}, salud ${r.health}, dependencia ${r.ltc}, empleo ${r.emp}`, `Deducción por rendimientos del trabajo ${r.eid}, personal ${r.pd}, cotizaciones ${r.ins} → base ${r.base}`, `Cuota ${r.calc} − deducción por trabajo ${r.credit} = ${r.det} ÷ 12 = ${r.month} al mes`, "Estimación anual, no la tabla simplificada de retención. No incluye deducciones por hijos ni especiales."],
  },
};
const NEXT: Record<WL, [string, string]> = { en: ["Severance pay", "Year-end tax settlement"], ja: ["退職金", "年末調整"], zh: ["离职金", "年末结算"], fr: ["Indemnité de départ", "Régularisation fiscale annuelle"], es: ["Indemnización por cese", "Ajuste fiscal anual"] };
type Steps = Record<"taxable" | "nonTax" | "annual" | "pension" | "health" | "ltc" | "emp" | "eid" | "pd" | "ins" | "base" | "calc" | "credit" | "det" | "month", string>;

function assumptions(lang: WL): Assumption<SalaryInput>[] {
  const t = T[lang];
  return [
    { key: "monthly", label: t.monthly[0], plain: t.monthly[1], unit: "won", kind: "assumption", get: (i) => i.monthly, set: (i, v) => ({ ...i, monthly: Math.max(0, v) }), range: (a) => [0, Math.max(a * 2, 10_000_000)] },
    { key: "dependents", label: t.dependents[0], plain: t.dependents[1], unit: "people", kind: "assumption", get: (i) => i.dependents, set: (i, v) => ({ ...i, dependents: Math.max(1, Math.round(v)) }), range: fixedRange(1, 6) },
    { key: "nonTaxable", label: t.nonTaxable[0], plain: t.nonTaxable[1], unit: "won", kind: "assumption", get: (i) => i.nonTaxable, set: (i, v) => ({ ...i, nonTaxable: Math.max(0, v) }), range: fixedRange(0, 500_000), marks: [{ at: 200_000, label: "₩200k" }] },
  ];
}

export default function KrSalaryWorld({ lang }: { lang: WL }) {
  const t = T[lang];
  const m = (n: number) => cash(n, lang, CUR);
  const x = (n: number) => cashExact(n, lang, CUR);
  const list = useMemo(() => assumptions(lang), [lang]);
  const summary = (i: SalaryInput, top?: TornadoBar) => {
    const r = salaryBreakdown(i);
    return {
      headline: t.head(m(r.gross), m(r.net)),
      driver: driverOf(lang, top, t.result, m),
      reasons: [t.r1(m(r.pension + r.health + r.ltc + r.employment), m(r.incomeTax + r.localTax)), i.nonTaxable > 0 ? t.r2y(m(i.nonTaxable)) : t.r2n, t.r3],
    };
  };
  const bridge = (i: SalaryInput): BridgeStep[] => {
    const r = salaryBreakdown(i);
    return [
      { label: t.b[0], value: r.gross, kind: "total" },
      { label: t.b[1], value: -r.pension, kind: "add" },
      { label: t.b[2], value: -(r.health + r.ltc), kind: "add" },
      { label: t.b[3], value: -r.employment, kind: "add" },
      { label: t.b[4], value: -(r.incomeTax + r.localTax), kind: "add" },
      { label: t.b[5], value: r.net, kind: "total" },
    ];
  };
  return (
    <ScenarioTool<SalaryInput, Key>
      lang={lang}
      currency={CUR}
      toolId="salary-calculator"
      example={EXAMPLE}
      assumptions={list}
      keys={KEYS}
      evaluate={salaryNet}
      resultName={t.result}
      questions={({ input, edit }) => [
        {
          title: t.q1,
          keys: ["monthly"],
          body: (
            <>
              <NumberField label={t.monthly[0]} value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} suffix={CUR} step={100_000} />
              <p className="mt-2 text-xs text-muted-foreground">{t.h1(m(input.monthly * 12))}</p>
            </>
          ),
        },
        { title: t.q2, keys: ["dependents"], body: <NumberField label={t.f2} value={input.dependents} onChange={(v) => edit({ dependents: v }, ["dependents"])} suffix={t.people} step={1} min={1} /> },
        {
          title: t.q3,
          keys: ["nonTaxable"],
          body: (
            <>
              <NumberField label={t.f3} value={input.nonTaxable} onChange={(v) => edit({ nonTaxable: v }, ["nonTaxable"])} suffix={CUR} step={10_000} />
              <p className="mt-2 text-xs text-muted-foreground">{t.h3}</p>
            </>
          ),
        },
      ]}
      expert={({ input, edit }) => (
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label={t.monthly[0]} value={input.monthly} onChange={(v) => edit({ monthly: v }, ["monthly"])} suffix={CUR} step={100_000} />
          <NumberField label={t.dependents[0]} value={input.dependents} onChange={(v) => edit({ dependents: v }, ["dependents"])} suffix={t.people} step={1} min={1} />
          <NumberField label={t.nonTaxable[0]} value={input.nonTaxable} onChange={(v) => edit({ nonTaxable: v }, ["nonTaxable"])} suffix={CUR} step={10_000} />
        </div>
      )}
      summary={summary}
      metrics={(i, s) => {
        const r = salaryBreakdown(i);
        return [
          { label: t.net, value: s.money(r.net), tone: "primary" },
          { label: t.year, value: s.money(r.net * 12) },
          { label: t.rate, value: `${r.effectiveRate}%` },
        ];
      }}
      sliders={["monthly", "dependents", "nonTaxable"]}
      sweeps={["monthly", "nonTaxable", "dependents"]}
      sweepCaption={(a) => (a.key === "monthly" ? t.sweep : undefined)}
      charts={(i, s) => <BridgeChart title={t.chart} steps={bridge(i)} format={s.money} />}
      askTitle={t.askTitle}
      ask={t.ask}
      expertFooter={(i) => {
        const r = salaryBreakdown(i);
        const a = r.annual;
        return (
          <ResultSteps
            steps={t.s({ taxable: x(r.taxablePay), nonTax: x(i.nonTaxable), annual: x(a.totalPay), pension: x(r.pension), health: x(r.health), ltc: x(r.ltc), emp: x(r.employment), eid: x(a.earnedIncomeDeduction), pd: x(a.personalDeduction), ins: x(a.insuranceDeduction), base: x(a.taxBase), calc: x(a.calculatedTax), credit: x(a.taxCredit), det: x(a.determinedTax), month: x(r.incomeTax) })}
            next={[
              { href: `/${lang}/severance-calculator/`, label: NEXT[lang][0] },
              { href: `/${lang}/year-end-settlement-calculator/`, label: NEXT[lang][1] },
            ]}
          />
        );
      }}
    />
  );
}
